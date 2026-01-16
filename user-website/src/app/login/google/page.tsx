'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function GoogleLoginPage() {
  const router = useRouter();
  const { firebaseAuth, isAuthenticatingWithFirebase } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleGoogleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const { idToken } = await signInWithGoogle();

      // Exchange Firebase token for backend JWT
      firebaseAuth({
        idToken,
        provider: 'google',
      });
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/login"
                  className="block w-full text-center py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <LoadingSpinner size="lg" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isAuthenticatingWithFirebase
                  ? 'Completing sign in...'
                  : 'Signing in with Google'}
              </h2>
              <p className="text-gray-600">
                {isAuthenticatingWithFirebase
                  ? 'Please wait while we set up your account'
                  : 'Please wait while we redirect you to Google'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
