import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from 'next-themes';
import { OfflineProvider } from './components/OfflineMode';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { OfflineDetector } from '../components/OfflineDetector';
import { useAuthInit } from '../hooks/useAuth';

// Initializes the auth listener at the top level so isLoading resolves
// before any ProtectedRoute tries to check it.
function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthInit();
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <CartProvider>
          <OfflineProvider>
            <AuthInitializer>
              <OfflineDetector />
              <RouterProvider router={router} />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#0f0f0f',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  },
                }}
              />
            </AuthInitializer>
          </OfflineProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
