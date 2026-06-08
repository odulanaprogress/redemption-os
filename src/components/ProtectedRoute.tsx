import { Navigate } from 'react-router';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types';
import { useEffect, useState } from 'react';
import { AccessDenied } from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { isAuthenticated, userProfile, isLoading } = useAuthStore();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    console.log('[ProtectedRoute] 🛡️ Checking access', {
      isAuthenticated,
      isLoading,
      userRole: userProfile?.role,
      allowedRoles,
    });

    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn('[ProtectedRoute] ⏱️ Loading timeout reached');
        setLoadingTimeout(true);
      }, 8000); // Increased to 8 seconds
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading, isAuthenticated, userProfile, allowedRoles]);

  if (isLoading && !loadingTimeout) {
    console.log('[ProtectedRoute] ⏳ Loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Loading...</p>
          <p className="text-white/40 text-sm">Checking authentication</p>
        </div>
      </div>
    );
  }

  if (loadingTimeout || !isAuthenticated || !userProfile) {
    console.log('[ProtectedRoute] ❌ Not authenticated, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && userProfile.role && !allowedRoles.includes(userProfile.role)) {
    console.log('[ProtectedRoute] 🚫 Access denied - insufficient permissions');
    return <AccessDenied requiredRoles={allowedRoles} currentRole={userProfile.role} />;
  }

  console.log('[ProtectedRoute] ✅ Access granted');
  return <>{children}</>;
};
