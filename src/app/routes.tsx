import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";
import { PreRegistrationPage } from "./pages/pre-registration-page";
import { OtpVerification } from "./pages/otp-verification";
import { RoleSelection } from "./pages/role-selection";
import { AttendeeDashboard } from "./pages/attendee-dashboard";
import { AIAssistant } from "./pages/ai-assistant";
import { LiveGospelFeed } from "./pages/live-gospel-feed";
import { CommunitySignal } from "./pages/community-signal";
import { SmartNavigation } from "./pages/smart-navigation";
import { EmergencyResponse } from "./pages/emergency-response";
import { CommunicationCenter } from "./pages/communication-center";
import { SmartLogistics } from "./pages/smart-logistics";
import { AdminDashboard } from "./pages/admin-dashboard";
import { OperationsCenter } from "./pages/operations-center";
import { CrowdManagementDashboard } from "./pages/crowd-management";
import { SettingsProfile } from "./pages/settings-profile";
import { MarketplacePage } from "./pages/marketplace-page";
import { ProductDetailPage } from "./pages/product-detail-page";
import { VendorDashboardPage } from "./pages/vendor-dashboard-page";
import { AdminMarketplacePage } from "./pages/admin-marketplace-page";
import { DeliveryTrackingPage } from "./pages/delivery-tracking-page";
import { QRIdentityPage } from "./pages/qr-identity-page";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/pre-register",
    element: <PreRegistrationPage />,
  },
  {
    path: "/verify",
    element: <OtpVerification />,
  },
  {
    path: "/role-selection",
    element: <RoleSelection />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AttendeeDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ai-assistant",
    element: (
      <ProtectedRoute>
        <AIAssistant />
      </ProtectedRoute>
    ),
  },
  {
    path: "/gospel-feed",
    element: (
      <ProtectedRoute>
        <LiveGospelFeed />
      </ProtectedRoute>
    ),
  },
  {
    path: "/community-signal",
    element: (
      <ProtectedRoute>
        <CommunitySignal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/navigation",
    element: (
      <ProtectedRoute>
        <SmartNavigation />
      </ProtectedRoute>
    ),
  },
  {
    path: "/emergency",
    element: (
      <ProtectedRoute>
        <EmergencyResponse />
      </ProtectedRoute>
    ),
  },
  {
    path: "/communications",
    element: (
      <ProtectedRoute>
        <CommunicationCenter />
      </ProtectedRoute>
    ),
  },
  {
    path: "/logistics",
    element: (
      <ProtectedRoute allowedRoles={['delivery_personnel', 'admin']}>
        <SmartLogistics />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/operations",
    element: (
      <ProtectedRoute allowedRoles={['security', 'admin']}>
        <OperationsCenter />
      </ProtectedRoute>
    ),
  },
  {
    path: "/crowd-management",
    element: (
      <ProtectedRoute allowedRoles={['security', 'admin']}>
        <CrowdManagementDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SettingsProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/marketplace",
    element: (
      <ProtectedRoute>
        <MarketplacePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/marketplace/product/:id",
    element: (
      <ProtectedRoute>
        <ProductDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/marketplace/vendor",
    element: (
      <ProtectedRoute allowedRoles={['vendor', 'admin']}>
        <VendorDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/marketplace/admin",
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminMarketplacePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/delivery/:id",
    element: (
      <ProtectedRoute>
        <DeliveryTrackingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/qr-identity",
    element: (
      <ProtectedRoute allowedRoles={['parent', 'admin', 'security']}>
        <QRIdentityPage />
      </ProtectedRoute>
    ),
  },
]);
