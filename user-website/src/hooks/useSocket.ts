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
        console.log('Syncing data after reconnection...');
        
        // Invalidate and refetch critical queries
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        
        // Refetch immediately for critical data
        queryClient.refetchQueries({ queryKey: ['orders'], type: 'active' });
        queryClient.refetchQueries({ queryKey: ['cart'], type: 'active' });
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

// Hook for real-time order updates
export function useOrderUpdates() {
  const queryClient = useQueryClient();

  useSocketEvent('order:updated', (data: any) => {
    // Update specific order in cache
    queryClient.setQueryData(['order', data.id], data);
    
    // Invalidate orders list to refresh
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  });

  useSocketEvent('order:created', (data: any) => {
    // Invalidate orders list to show new order
    queryClient.invalidateQueries({ queryKey: ['orders'] });
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
