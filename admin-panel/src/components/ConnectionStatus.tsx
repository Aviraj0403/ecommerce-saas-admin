import { WifiOff, Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

export function ConnectionStatus() {
  const { connectionStatus } = useSocket();

  if (connectionStatus === 'connected') {
    return null; // Don't show anything when connected
  }

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Connecting...',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'reconnecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Reconnecting...',
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Connection lost',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Offline',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const { icon, text, className } = getStatusConfig();

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${className}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}