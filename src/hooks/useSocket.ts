import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketClient } from '@/lib/socket';
import { useAuthStore } from '@/store';

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated && token) {
      socketClient.connect(token);
      setIsConnected(socketClient.isConnected());
      setConnectionStatus(socketClient.getConnectionStatus());

      // Update connection status
      const handleConnect = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
      };
      
      const handleDisconnect = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      };

      const handleReconnecting = () => {
        setConnectionStatus('reconnecting');
      };

      socketClient.on('connect', handleConnect);
      socketClient.on('disconnect', handleDisconnect);
      socketClient.on('reconnect_attempt', handleReconnecting);

      // Setup data synchronization on reconnection
      const handleDataSync = () => {
        console.log('Syncing admin data after reconnection...');
        
        // Invalidate and refetch critical admin queries
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['salesReport'] });
        queryClient.invalidateQueries({ queryKey: ['productReport'] });
        queryClient.invalidateQueries({ queryKey: ['customerReport'] });
        
        // Refetch immediately for critical admin data
        queryClient.refetchQueries({ queryKey: ['dashboard'], type: 'active' });
        queryClient.refetchQueries({ queryKey: ['orders'], type: 'active' });
      };

      socketClient.onReconnect(handleDataSync);

      return () => {
        socketClient.off('connect', handleConnect);
        socketClient.off('disconnect', handleDisconnect);
        socketClient.off('reconnect_attempt', handleReconnecting);
        socketClient.offReconnect(handleDataSync);
      };
    } else {
      socketClient.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  }, [isAuthenticated, token, queryClient]);

  const emit = useCallback((event: string, ...args: any[]) => {
    socketClient.emit(event, ...args);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketClient.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    socketClient.off(event, callback);
  }, []);

  const joinRoom = useCallback((room: string) => {
    socketClient.joinRoom(room);
  }, []);

  const leaveRoom = useCallback((room: string) => {
    socketClient.leaveRoom(room);
  }, []);

  return {
    isConnected,
    connectionStatus,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    socket: socketClient.getSocket(),
  };
}

export function useSocketEvent<T = any>(
  event: string,
  callback: (data: T) => void,
  deps: any[] = []
) {
  const { on, off } = useSocket();

  useEffect(() => {
    const handler = (data: T) => {
      callback(data);
    };

    on(event, handler);

    return () => {
      off(event, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, on, off, ...deps]);
}

// Hook for real-time order updates (admin-specific)
export function useOrderUpdates() {
  const queryClient = useQueryClient();

  useSocketEvent('order:created', (data: any) => {
    // Invalidate orders list and dashboard to show new order
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    
    // Update dashboard metrics immediately
    queryClient.invalidateQueries({ queryKey: ['salesReport'] });
  });

  useSocketEvent('order:updated', (data: any) => {
    // Update specific order in cache
    queryClient.setQueryData(['order', data.id], data);
    
    // Invalidate orders list to refresh
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });

  useSocketEvent('order:cancelled', (data: any) => {
    // Update specific order in cache
    queryClient.setQueryData(['order', data.id], data);
    
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });
}

// Hook for real-time product updates
export function useProductUpdates() {
  const queryClient = useQueryClient();

  useSocketEvent('product:low_stock', (data: any) => {
    // Update product in cache
    queryClient.setQueryData(['product', data.id], (old: any) => 
      old ? { ...old, stock: data.stock } : undefined
    );
    
    // Invalidate products list
    queryClient.invalidateQueries({ queryKey: ['products'] });
  });

  useSocketEvent('product:out_of_stock', (data: any) => {
    // Update product in cache
    queryClient.setQueryData(['product', data.id], (old: any) => 
      old ? { ...old, stock: 0 } : undefined
    );
    
    // Invalidate products list
    queryClient.invalidateQueries({ queryKey: ['products'] });
  });
}

// Hook for real-time customer updates
export function useCustomerUpdates() {
  const queryClient = useQueryClient();

  useSocketEvent('customer:registered', (data: any) => {
    // Invalidate customers list and dashboard
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['customerReport'] });
  });
}

// Hook for real-time dashboard metrics
export function useDashboardUpdates() {
  const queryClient = useQueryClient();

  useSocketEvent('system:metrics_updated', (data: any) => {
    // Update dashboard metrics
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });
}

// Hook for real-time notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useSocketEvent('notification', (data: any) => {
    setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50 notifications
  });

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    clearNotifications,
  };
}
