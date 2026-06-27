import { motion } from 'motion/react';
import { AlertCircle, WifiOff, Server, Video, MessageSquare, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface ErrorStateProps {
  title: string;
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
  children?: React.ReactNode;
}

export function ErrorState({
  title,
  message,
  icon: Icon = AlertCircle,
  onRetry,
  onGoBack,
  onGoHome,
  showRetry = true,
  showGoBack = false,
  showGoHome = false,
  children
}: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full">
          <Icon className="w-10 h-10 text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#0D0D0D]">{title}</h2>
          <p className="text-[#6B7280]">{message}</p>
        </div>

        {children}

        <div className="flex flex-wrap gap-3 justify-center">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="bg-emerald-500 hover:bg-emerald-600 text-[#0D0D0D] font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          {showGoBack && (
            <button
              onClick={onGoBack || (() => navigate(-1))}
              className="bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#0D0D0D] font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          )}

          {showGoHome && (
            <button
              onClick={onGoHome || (() => navigate('/dashboard'))}
              className="bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#0D0D0D] font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Network Connection Failed"
      message="Unable to connect to the server. Please check your internet connection and try again."
      icon={WifiOff}
      onRetry={onRetry}
      showGoHome
    >
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="text-sm text-yellow-100">
          <strong>Troubleshooting:</strong>
          <ul className="mt-2 space-y-1 text-left text-yellow-200/80">
            <li>• Check your Wi-Fi or cellular connection</li>
            <li>• Verify you're connected to the internet</li>
            <li>• Try disabling VPN if enabled</li>
          </ul>
        </div>
      </div>
    </ErrorState>
  );
}

export function APIError({ onRetry, errorCode }: { onRetry?: () => void; errorCode?: number }) {
  return (
    <ErrorState
      title="Service Unavailable"
      message="We're experiencing technical difficulties. Our team has been notified and is working on a fix."
      icon={Server}
      onRetry={onRetry}
      showGoHome
    >
      {errorCode && (
        <div className="text-sm text-[#6B7280]">
          Error Code: <span className="font-mono text-red-400">{errorCode}</span>
        </div>
      )}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="text-sm text-blue-100">
          <strong>What you can do:</strong>
          <ul className="mt-2 space-y-1 text-left text-blue-200/80">
            <li>• Wait a few minutes and try again</li>
            <li>• Check the status page for updates</li>
            <li>• Contact support if the issue persists</li>
          </ul>
        </div>
      </div>
    </ErrorState>
  );
}

export function LivestreamError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Livestream Unavailable"
      message="Unable to connect to the live stream. The service may be temporarily offline or experiencing high traffic."
      icon={Video}
      onRetry={onRetry}
      showGoBack
    >
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="text-sm text-purple-100">
          <strong>Alternative options:</strong>
          <ul className="mt-2 space-y-1 text-left text-purple-200/80">
            <li>• Check the Live Gospel Feed for updates</li>
            <li>• View recent sermon recordings</li>
            <li>• Refresh the page in a few moments</li>
          </ul>
        </div>
      </div>
    </ErrorState>
  );
}

export function DeliveryTrackingError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Tracking Unavailable"
      message="Unable to load delivery tracking information. The tracking service may be temporarily unavailable."
      icon={AlertCircle}
      onRetry={onRetry}
      showGoBack
    >
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="text-sm text-yellow-100">
          <strong>Next steps:</strong>
          <ul className="mt-2 space-y-1 text-left text-yellow-200/80">
            <li>• Your delivery is still in progress</li>
            <li>• Check your order history for status</li>
            <li>• Contact the vendor for updates</li>
          </ul>
        </div>
      </div>
    </ErrorState>
  );
}

export function AIAssistantError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="AI Assistant Unavailable"
      message="The AI assistant is currently unavailable. Please try again in a few moments."
      icon={MessageSquare}
      onRetry={onRetry}
      showGoBack
    >
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="text-sm text-blue-100">
          <strong>While you wait:</strong>
          <ul className="mt-2 space-y-1 text-left text-blue-200/80">
            <li>• Browse the FAQ section</li>
            <li>• Check recent announcements</li>
            <li>• Use the search feature</li>
          </ul>
        </div>
      </div>
    </ErrorState>
  );
}

export function GenericError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <ErrorState
      title="Something Went Wrong"
      message={message || "An unexpected error occurred. Please try again."}
      onRetry={onRetry}
      showGoHome
      showGoBack
    />
  );
}

// Error Boundary Component
import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F8F9FF] text-[#0D0D0D] p-8">
          <GenericError
            message={this.state.error?.message}
            onRetry={() => this.setState({ hasError: false, error: null })}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline Error Message Component
export function InlineError({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-center gap-3"
    >
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      <div className="text-sm text-red-100">{message}</div>
    </motion.div>
  );
}

// Toast Error Notification
export function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed bottom-4 right-4 bg-red-500/20 border border-red-500/50 rounded-xl px-6 py-4 backdrop-blur-lg shadow-lg shadow-red-500/20 max-w-md"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-red-100 mb-1">Error</div>
          <div className="text-sm text-red-200/80">{message}</div>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// Loading Error State (for failed lazy loads)
export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0D0D0D] flex items-center justify-center p-8">
      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Failed to Load</h2>
          <p className="text-[#6B7280]">Unable to load this page. Please try refreshing.</p>
        </div>

        <button
          onClick={onRetry}
          className="bg-emerald-500 hover:bg-emerald-600 text-[#0D0D0D] font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
        </button>
      </div>
    </div>
  );
}
