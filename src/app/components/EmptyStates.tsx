import { motion } from 'motion/react';
import { Bell, Package, AlertTriangle, ShoppingBag, Flag, MapPin, Users, FileText, MessageSquare, Video } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  suggestions?: string[];
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  suggestions
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-full">
          <Icon className="w-10 h-10 text-white/40" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/60">{message}</p>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left">
            <div className="font-semibold mb-3 text-white">Suggestions:</div>
            <ul className="space-y-2 text-sm text-white/60">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function NoAlertsEmpty({ onCreateAlert }: { onCreateAlert?: () => void }) {
  return (
    <EmptyState
      icon={Bell}
      title="No Active Alerts"
      message="All systems are operating normally. There are no emergency alerts or notifications at this time."
      suggestions={[
        'Emergency alerts will appear here when activated',
        'Check the Emergency Response module for more options',
        'Configure alert preferences in your settings'
      ]}
    />
  );
}

export function NoDeliveriesEmpty({ onBrowseMarketplace }: { onBrowseMarketplace?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No Active Deliveries"
      message="You don't have any deliveries in progress. Browse the marketplace to order products from verified vendors."
      actionLabel="Browse Marketplace"
      onAction={onBrowseMarketplace}
      suggestions={[
        'Order from verified vendors for fast delivery',
        'Track your orders in real-time',
        'View delivery history in your profile'
      ]}
    />
  );
}

export function NoReportsEmpty({ onCreateReport }: { onCreateReport?: () => void }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="No Community Reports"
      message="There are no active community signal reports in your area. Help keep the community safe by reporting incidents."
      actionLabel="Report Incident"
      onAction={onCreateReport}
      suggestions={[
        'Report safety concerns or incidents',
        'Help improve community awareness',
        'View incident resolution status'
      ]}
    />
  );
}

export function NoProductsEmpty({ onAddProduct }: { onAddProduct?: () => void }) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="No Products Found"
      message="No products match your current filters. Try adjusting your search criteria or browse all categories."
      suggestions={[
        'Try different search terms',
        'Remove some filters to see more results',
        'Browse popular categories instead'
      ]}
    />
  );
}

export function NoIncidentsEmpty() {
  return (
    <EmptyState
      icon={Flag}
      title="No Active Incidents"
      message="Great news! There are no active incidents or emergencies reported at this time."
      suggestions={[
        'All emergency systems are operational',
        'Continue monitoring for updates',
        'Review past incidents in the archive'
      ]}
    />
  );
}

export function NoLocationDataEmpty() {
  return (
    <EmptyState
      icon={MapPin}
      title="Location Data Unavailable"
      message="Unable to access location information. Please enable location services to use navigation features."
      suggestions={[
        'Check your browser location permissions',
        'Enable GPS on your device',
        'Manually enter your location if needed'
      ]}
    />
  );
}

export function NoMessagesEmpty({ onStartConversation }: { onStartConversation?: () => void }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No Messages Yet"
      message="Your inbox is empty. Start a conversation with the AI Assistant or check back later for updates."
      actionLabel="Ask AI Assistant"
      onAction={onStartConversation}
      suggestions={[
        'Get help with navigation and services',
        'Ask questions about upcoming events',
        'Request information and support'
      ]}
    />
  );
}

export function NoEventsEmpty({ onViewCalendar }: { onViewCalendar?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No Upcoming Events"
      message="There are no events scheduled at this time. Check back later for service times and special events."
      suggestions={[
        'View the calendar for future events',
        'Subscribe to event notifications',
        'Check recent announcements'
      ]}
    />
  );
}

export function NoAttendanceDataEmpty() {
  return (
    <EmptyState
      icon={Users}
      title="No Attendance Data"
      message="Attendance tracking data is not available yet. Data will appear as it's collected during services."
      suggestions={[
        'Data is collected during live services',
        'Check back after service times',
        'Review historical trends in analytics'
      ]}
    />
  );
}

export function NoLivestreamEmpty({ onCheckSchedule }: { onCheckSchedule?: () => void }) {
  return (
    <EmptyState
      icon={Video}
      title="No Active Livestream"
      message="There is no livestream currently active. Check the schedule for upcoming services and events."
      actionLabel="View Schedule"
      onAction={onCheckSchedule}
      suggestions={[
        'Livestreams are available during service times',
        'Watch previous recordings in the archive',
        'Enable notifications for live events'
      ]}
    />
  );
}

export function NoOrdersEmpty({ onBrowseMarketplace }: { onBrowseMarketplace?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No Orders Yet"
      message="You haven't placed any orders yet. Explore the verified marketplace to discover products from trusted vendors."
      actionLabel="Browse Products"
      onAction={onBrowseMarketplace}
      suggestions={[
        'Shop from verified vendors only',
        'Get fast delivery within campus',
        'Track orders in real-time'
      ]}
    />
  );
}

export function NoVendorsEmpty() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="No Vendors Available"
      message="There are no verified vendors in this category yet. Check back later or browse other categories."
      suggestions={[
        'Vendors are verified by administrators',
        'More vendors are added regularly',
        'Browse all categories for more options'
      ]}
    />
  );
}

export function SearchEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={FileText}
      title="No Results Found"
      message={`No results found for "${query}". Try different keywords or browse categories instead.`}
      suggestions={[
        'Check your spelling',
        'Try more general search terms',
        'Browse by category instead'
      ]}
    />
  );
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon={Bell}
      title="All Caught Up"
      message="You're all caught up! There are no new notifications at this time."
      suggestions={[
        'Notifications will appear here when you receive them',
        'Configure notification preferences in settings',
        'Check back later for updates'
      ]}
    />
  );
}

// Generic Empty State with Custom Content
export function CustomEmpty({
  title,
  message,
  iconType = 'default',
  children
}: {
  title: string;
  message: string;
  iconType?: 'default' | 'success' | 'info';
  children?: React.ReactNode;
}) {
  const icons = {
    default: FileText,
    success: Bell,
    info: AlertTriangle
  };

  const Icon = icons[iconType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-full">
          <Icon className="w-10 h-10 text-white/40" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/60">{message}</p>
        </div>

        {children}
      </div>
    </motion.div>
  );
}
