import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- AUTH ---
import LoginPage from '../pages/auth/LoginPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import Verify2FAPage from '../pages/auth/Verify2FAPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';

// --- LAYOUTS ---
import ClientLayout from '../layouts/ClientLayout';
import ProviderLayout from '../layouts/ProviderLayout';

// --- CLIENT ---
import ClientHome from '../pages/client/ClientHome';
import ClientServicesPage from '../pages/client/ClientServicesPage';
import ClientOrdersPage from '../pages/client/ClientOrdersPage';
import PaymentPage from '../pages/client/PaymentPage';
import ClientOrderDetails from '../pages/client/ClientOrderDetails';
import About from '../pages/client/About';

// --- PROVIDER ---
import ProviderDashboard from '../pages/provider/ProviderDashboard';
import ProviderServicesPage from '../pages/provider/ProviderServicesPage';
import ProviderJobDetails from '../pages/provider/ProviderJobDetails';
import ProviderHistory from '../pages/provider/ProviderHistory';
import WalletPage from '../pages/provider/WalletPage';
import ProviderOnboarding from '../pages/provider/ProviderOnboarding';

// --- SHARED ---
import ProfilePage from '../pages/shared/ProfilePage';

// --- ADMIN ---
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminPendingProviders from '../pages/admin/AdminPendingProviders';
import AdminJobs from '../pages/admin/AdminJobs';
import AdminReports from '../pages/admin/AdminReports';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminServices from '../pages/admin/AdminServices';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminCommissions from '../pages/admin/AdminCommissions'; // AJOUT IMPORT


// --- COMPOSANT DE PROTECTION INTÉGRÉ ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>;
  
  // Si pas connecté, redirection vers login
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles) {
      const userRoleStr = String(user.role).toLowerCase();
      const roleMap = { 0: 'client', 1: 'provider', 2: 'admin' };
      const currentRole = roleMap[user.role] || userRoleStr;
      
      const hasAccess = allowedRoles.some(r => String(r).toLowerCase() === currentRole);
      
      if (!hasAccess) {
          return <Navigate to="/" replace />;
      }
  }

  return children;
};

export default function AppRouter() {
  return (
    <Routes>
      {/* AUTHENTIFICATION PUBLIQUE */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-2fa" element={<Verify2FAPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* --- ESPACE CLIENT (Navigation Mixte) --- */}
      <Route path="/client" element={<ClientLayout />}>
          <Route path="about" element={<About />} />
          
          {/* 🟢 ROUTES PUBLIQUES (Accessibles sans login) */}
          <Route index element={<ClientHome />} />
          <Route path="category/:id" element={<ClientServicesPage />} />
          
          
          {/* 🔒 ROUTES PROTÉGÉES (Connexion requise) */}
          <Route path="payment" element={<ProtectedRoute allowedRoles={['client']}><PaymentPage /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute allowedRoles={['client']}><ClientOrdersPage /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute allowedRoles={['client']}><ClientOrderDetails /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute allowedRoles={['client']}><ProfilePage /></ProtectedRoute>} />
          <Route path="wallet" element={<ProtectedRoute allowedRoles={['client']}><WalletPage /></ProtectedRoute>} />
          
      </Route>

      {/* --- ESPACE PRESTATAIRE (Protégé) --- */}
      <Route path="/provider/onboarding" element={
        <ProtectedRoute allowedRoles={['provider', 'provider_pending_onboarding']}>
            <ProviderOnboarding />
        </ProtectedRoute>
      } />

      <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderLayout /></ProtectedRoute>}>
          <Route index element={<ProviderDashboard />} />
          <Route path="services" element={<ProviderServicesPage />} />
          <Route path="history" element={<ProviderHistory />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="wallet" element={<WalletPage />} />
      </Route>
      <Route path="/provider/job/:id" element={<ProtectedRoute allowedRoles={['provider']}><ProviderJobDetails /></ProtectedRoute>} />

      {/* --- ESPACE ADMIN (Protégé) --- */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="pending" element={<AdminPendingProviders />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="commissions" element={<AdminCommissions />} /> {/* AJOUT ROUTE */}
      </Route>
      
      {/* Redirections */}
      <Route path="/" element={<Navigate to="/client" replace />} />
      <Route path="*" element={<Navigate to="/client" replace />} />
    </Routes>
  );
}