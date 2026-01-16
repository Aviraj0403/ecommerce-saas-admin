import { useEffect, useCallback, useState } from 'react';
import { socketClient } from '@/lib/socket';
import { useAuthStore } from '@/store';

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketClient.connect(token);
      setIsConnected(socketClient.isConnected());

      // Update connection status
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      socketClient.on('connect', handleConnect);
      socketClient.on('disconnect', handleDisconnect);

      return () => {
        socketClient.off('connect', handleConnect);
        socketClient.off('disconnect', handleDisconnect);
      };
    } else {
      socketClient.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, token]);

  const emit = useCallback((event: string, ...args: any[]) => {
    socketClient.emit(event, ...args);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketClient.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    socketClient.off(event, callback);
  }, []);

  return {
    isConnected,
    emit,
    on,
    off,
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
