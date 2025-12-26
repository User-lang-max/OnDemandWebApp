import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  Briefcase,
  DollarSign,
  BarChart3,
  Settings,
  Wrench,
  Search,
  Bell,
  ChevronRight,
  Percent 
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { section: 'Vue d\'ensemble' },
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/reports', label: 'Rapports & Analytics', icon: BarChart3 },
    
    { section: 'Gestion' },
    { path: '/admin/users', label: 'Utilisateurs', icon: Users },
    { path: '/admin/pending', label: 'Validations Pro', icon: ShieldAlert },
    
    { section: 'Plateforme' },
    { path: '/admin/jobs', label: 'Commandes', icon: Briefcase },
    { path: '/admin/payments', label: 'Finances', icon: DollarSign },
    { path: '/admin/commissions', label: 'Commissions', icon: Percent }, // AJOUT ICI
    { path: '/admin/categories', label: 'Catalogue', icon: Layers },
    { path: '/admin/services', label: 'Services', icon: Wrench },
    
    { section: 'Système' },
    { path: '/admin/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl md:shadow-none transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          
          {/* Logo Area */}
          <div className="h-20 flex items-center px-8 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    O
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">OnDemand<span className="text-teal-600">Admin</span></span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
            {menuItems.map((item, index) => {
              if (item.section) {
                return (
                    <div key={index} className="px-4 mt-6 mb-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.section}</p>
                    </div>
                );
              }

              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                    isActive 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                      <item.icon size={18} className={`${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`} />
                      {item.label}
                  </div>
                  {isActive && <ChevronRight size={14} className="text-teal-600"/>}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout Bottom */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-4 px-2">
                <img 
                    src={`https://ui-avatars.com/api/?name=${user?.fullName || 'Admin'}&background=0d9488&color=fff`} 
                    alt="Admin" 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName || 'Administrateur'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@ondemand.com'}</p>
                </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-lg transition-all text-sm font-medium shadow-sm"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 md:ml-72 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Bar Mobile Only */}
        <header className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between p-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-900">Administration</span>
          <div className="w-8 relative">
             <Bell size={20} className="text-gray-600"/>
             <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </div>
        </header>
        
        {/* Desktop Top Bar Simulation */}
        <div className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8 sticky top-0 z-20">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                <input 
                    type="text" 
                    placeholder="Rechercher (utilisateur, commande, ID...)" 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                    <Bell size={20}/>
                    <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </div>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}