import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ListTodo, User, LogOut, History, MapPin, Wallet, ChevronRight } from 'lucide-react';

export default function ProviderLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/provider', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
    { path: '/provider/services', label: 'Mes Services', icon: <ListTodo size={20} /> },
    { path: '/provider/wallet', label: 'Portefeuille', icon: <Wallet size={20} /> },
    { path: '/provider/history', label: 'Historique', icon: <History size={20} /> },
    { path: '/provider/profile', label: 'Mon Profil', icon: <User size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex bg-white w-72 border-r border-gray-100 flex-col sticky top-0 h-screen shadow-lg">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-xl text-white">
            <MapPin size={24}/>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg tracking-tight">Espace Prestataire</h1>
            <p className="text-xs text-gray-500">v2.0 • Professionnel</p>
          </div>
        </div>

        <div className="p-4 mt-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Navigation</div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/provider' && location.pathname === '/provider/');
              return (
                <Link key={item.path} to={item.path} 
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg shadow-blue-200 transform -translate-y-0.5' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                  }`}
                >
                  <div className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {item.icon}
                  </div>
                  {item.label}
                  {isActive && <ChevronRight size={16} className="ml-auto opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 bg-gradient-to-t from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              {user?.fullName?.charAt(0) || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{user?.fullName || 'Prestataire'}</p>
              <p className="text-xs text-gray-500 truncate">En ligne</p>
            </div>
          </div>
          
          <button 
            onClick={() => { logout(); navigate('/login'); }} 
            className="flex items-center gap-2 w-full px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition font-medium border border-gray-200 hover:border-red-200"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20 md:mb-0">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Menu */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl flex justify-around p-4 z-40 backdrop-blur-sm bg-white/95">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/provider' && location.pathname === '/provider/');
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center gap-1 transition-all ${isActive 
                ? 'text-blue-600 transform -translate-y-2' 
                : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <div className={`p-2.5 rounded-full ${isActive 
                ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                : 'bg-gray-100'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}