'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { PersistenceProvider } from '@/components/PersistenceProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PersistenceProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </PersistenceProvider>
    </QueryClientProvider>
  );
}
