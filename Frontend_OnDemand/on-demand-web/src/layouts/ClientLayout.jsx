import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, User, Menu, LogIn, Home, Package, Bell, HelpCircle, 
  Facebook, Twitter, Instagram, Linkedin, Info, Mail 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user?.fullName || user?.email || "Utilisateur";
  const initial = displayName.charAt(0).toUpperCase();


  const navLinks = [
    { path: '/client', label: 'Accueil', icon: Home, public: true },
    { path: '/client/about', label: 'À propos', icon: Info, public: true },
    { path: '/client/orders', label: 'Mes Commandes', icon: Package, public: false },
    { path: '#contact', label: 'Contact', icon: Mail, public: true }, 
  ];

  const visibleLinks = navLinks.filter(link => link.public || user);

  const handleContactClick = () => {
    if (location.pathname === '/client') {
  
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
     
      navigate('/client#contact-section');

      setTimeout(() => {
        const contactSection = document.getElementById('contact-section');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50 flex flex-col font-sans">
      
  
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            
        
            <Link to="/client" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">OD</span>
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900 tracking-tight">OnDemand<span className="text-teal-600">App</span></div>
                <div className="text-xs text-gray-500 font-medium tracking-wider">SERVICES PROFESSIONNELS</div>
              </div>
            </Link>

            
            <nav className="hidden lg:flex items-center gap-8">
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                if (link.path === '#contact') {
                  return (
                    <button
                      key={link.label}
                      onClick={handleContactClick}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-gray-600 hover:text-teal-700 hover:bg-gray-50"
                    >
                      <Icon size={20} />
                      <span>{link.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border border-teal-200' 
                        : 'text-gray-600 hover:text-teal-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-6">
              {user ? (
                <>
              
                  <div className="hidden md:flex items-center gap-4">
                    
             
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/client/profile')}
                      className="relative group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all">
                        {initial}
                      </div>
                    </motion.div>

                 
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-all duration-300"
                      title="Se déconnecter"
                    >
                      <LogOut size={20} />
                    </motion.button>
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Menu size={24} />
                  </button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white px-8 py-3.5 rounded-xl font-bold hover:from-teal-700 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <LogIn size={20} /> Se connecter
                </motion.button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden bg-white border-t border-gray-200 py-6"
            >
              <div className="space-y-2">
                {visibleLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  
                  if (link.path === '#contact') {
                    return (
                      <button
                        key={link.label}
                        onClick={handleContactClick}
                        className="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-colors text-gray-600 hover:bg-gray-50 w-full text-left"
                      >
                        <Icon size={22} />
                        <span className="text-lg">{link.label}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-colors ${
                        isActive 
                          ? 'bg-teal-50 text-teal-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={22} />
                      <span className="text-lg">{link.label}</span>
                    </Link>
                  );
                })}
                
                {user && (
                  <div className="pt-6 border-t border-gray-200">
                    <div 
                      className="flex items-center gap-4 px-6 py-4 cursor-pointer"
                      onClick={() => { navigate('/client/profile'); setMobileMenuOpen(false); }}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                        {initial}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{displayName}</p>
                        <p className="text-sm text-gray-500">Voir mon profil</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 w-full rounded-xl"
                    >
                      <LogOut size={22} />
                      <span className="font-medium">Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">OD</span>
                </div>
                <span className="text-2xl font-bold">OnDemandApp</span>
              </div>
              <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                Plateforme de services professionnels à la demande.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <motion.a key={idx} href="#" whileHover={{ scale: 1.1 }} className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                    <Icon size={22} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-gray-800 text-center">
            <p className="text-gray-400">© 2025 OnDemandApp.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}