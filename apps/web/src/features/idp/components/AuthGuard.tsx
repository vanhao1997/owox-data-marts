import React, { useEffect } from 'react';
import { useAuthState } from '../hooks';
import { signIn } from '../services';
import { FullScreenLoader } from '@owox/ui/components/common/loading-spinner';
import { Button } from '@owox/ui/components/button';
import { useTranslation } from 'react-i18next';

/**
 * AuthGuard component props
 */
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Unauthenticated fallback component
 */
function UnauthenticatedFallback() {
  const { t } = useTranslation();
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <h2 className='mb-4 text-2xl font-bold text-gray-900'>
          {t('authGuard.authenticationRequired', 'Authentication required')}
        </h2>
        <p className='mb-6 text-gray-600'>
          {t('authGuard.signInRequired', 'You need to sign in to access this page.')}
        </p>
        <Button
          onClick={() => {
            signIn();
          }}
        >
          {t('authGuard.signIn', 'Sign in')}
        </Button>
      </div>
    </div>
  );
}

/**
 * AuthGuard component
 * Protects routes by checking authentication status
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoading, isAuthenticated, isUnauthenticated } = useAuthState();

  useEffect(() => {
    if (!isUnauthenticated) return;
    signIn();
  }, [isUnauthenticated]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (isUnauthenticated) {
    return <FullScreenLoader />;
  }

  return fallback ? <>{fallback}</> : <UnauthenticatedFallback />;
}
