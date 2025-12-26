import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertTriangle, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await login(email, password);
      
      if (response?.success) {
        if (response.role === 'admin') {
            toast.success("Authentification administrateur réussie");
            
            setTimeout(() => {
              navigate('/admin');
            }, 500);
            
        } else {
            toast.error("Accès refusé : Privilèges administrateur requis");
            localStorage.removeItem('token');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
        }
      } 
      else if (response?.requires2FA) {
          navigate('/verify-2fa', { state: { email } });
      }

    } catch (error) {
      console.error(error);
      toast.error("Identifiants incorrects ou erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Colonne gauche - Sécurité */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-red-900 to-rose-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20 mb-8 text-white">
            <Server size={16} className="text-red-300"/> Zone Administrateur
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-white">Panneau</span> de contrôle
          </h1>
          <p className="text-red-100 text-lg mb-8 leading-relaxed">
            Accès restreint aux administrateurs certifiés. Toutes les activités sont surveillées et enregistrées.
          </p>
          
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <AlertTriangle size={24} className="text-red-300"/>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg text-white">Accès protégé</h3>
                  <p className="text-sm text-red-100/80">Tentative d'accès non autorisé sera signalée</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-red-200/60">
              <p>• Surveillance 24h/24, 7j/7</p>
              <p>• Chiffrement de bout en bout</p>
              <p>• Journalisation complète des activités</p>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-red-100 to-rose-100 mb-6 border-2 border-red-200">
              <ShieldCheck className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Administration</h2>
            <p className="text-gray-300">Connexion sécurisée</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Email Administrateur</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="admin@ondemand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900" 
                />
                <span className="text-gray-300">Se souvenir de moi</span>
              </label>
              <button 
                type="button" 
                className="text-red-400 hover:text-red-300 font-medium hover:underline text-sm"
              >
                Code perdu ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${
                loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-xl shadow-red-900/30'
              }`}
            >
              {loading ? 'Authentification en cours...' : 'Accéder au panneau'}
            </button>

            <div className="text-center pt-6 border-t border-gray-800">
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-gray-200 text-sm font-medium hover:underline transition-colors"
              >
                ← Retour au portail utilisateur
              </button>
            </div>

            {/* Avertissement */}
            <div className="p-4 bg-red-900/20 border border-red-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-200/80">
                  Cette zone est strictement réservée aux administrateurs autorisés. 
                  Toute tentative d'accès non autorisée fera l'objet de poursuites.
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}