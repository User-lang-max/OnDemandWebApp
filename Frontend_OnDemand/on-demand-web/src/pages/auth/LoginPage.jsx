import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail, AlertTriangle, ArrowRight, User, Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
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
      
      if (response && response.requires2FA) {
          toast("Code 2FA envoyé !", { icon: '📧' });
          navigate('/verify-2fa', { state: { email } });
          return;
      }
      
      if (response.role === 'provider_pending_onboarding') {
          toast("Bienvenue ! Complétez votre profil.", { icon: '📝' });
          navigate('/provider/onboarding');
          return;
      }
      
      toast.success("Connexion réussie !");
      const role = response.role?.toLowerCase() || '';
      if (role === 'admin') navigate('/admin');
      else if (role === 'provider') navigate('/provider');
      else navigate('/client');

    } catch (error) {
      console.error(error);
      const errData = error.response?.data;
      
      if (errData?.error === 'CompteEnAttente') {
          toast.custom((t) => (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 text-orange-900 p-6 rounded-2xl shadow-2xl max-w-md flex flex-col gap-3 backdrop-blur-sm`}
            >
                <div className="flex items-center gap-3 font-bold text-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle size={24} className="text-orange-600"/>
                    </div>
                    Compte en attente de validation
                </div>
                <p className="text-sm text-gray-700">
                   Votre dossier a bien été reçu. Un administrateur doit valider votre profil avant que vous ne puissiez accéder aux missions.
                </p>
                <p className="text-xs text-orange-600 mt-1 italic font-medium">
                    Surveillez vos emails pour la validation.
                </p>
            </motion.div>
          ), { duration: 6000, position: 'top-center' });
      } 
      else if (errData?.error === 'EmailNonVerifie') {
          toast.custom((t) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertTriangle size={20} className="text-blue-600"/>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email non vérifié</p>
                  <p className="text-sm text-gray-600">Veuillez vérifier votre email</p>
                </div>
              </div>
              <button 
                onClick={() => { 
                  toast.dismiss(t.id); 
                  navigate('/verify-email', {state:{email}}); 
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                Saisir code
              </button>
            </motion.div>
          ), { duration: 5000 });
      }
      else {
          toast.error("Email ou mot de passe incorrect.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Colonne gauche - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-800 to-cyan-700 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-lg text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20 mb-8">
            <LogIn size={16} className="text-blue-300"/> Retrouvez votre compte
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Bienvenue <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">à nouveau</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Accédez à votre espace personnel pour gérer vos projets, missions et paramètres.
          </p>
          
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <User size={24} className="text-blue-300"/>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Accès sécurisé</h3>
                  <p className="text-sm text-blue-100/80">Vos données sont protégées par chiffrement</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6">
              <div className="h-px flex-1 bg-white/20"></div>
              <span className="text-sm text-blue-200/60">Plateforme de confiance</span>
              <div className="h-px flex-1 bg-white/20"></div>
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
          {/* Guest access */}
          <button 
            onClick={() => navigate('/client')} 
            className="absolute top-6 right-6 lg:static lg:mb-8 lg:w-full lg:flex lg:items-center lg:justify-center lg:gap-2 lg:py-3 lg:rounded-xl lg:border-2 lg:border-gray-200 lg:hover:border-blue-300 lg:hover:bg-blue-50 lg:text-gray-600 lg:hover:text-blue-700 lg:transition-all lg:font-medium"
          >
            <span className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1 transition">
              Continuer en invité <ArrowRight size={12}/>
            </span>
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-100 to-cyan-100 mb-6">
              <LogIn className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-500">Accédez à votre compte</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-gray-600">Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-blue-200'
              }`}
            >
              {loading ? (
                <>Connexion en cours...</>
              ) : (
                <>Se connecter <ArrowRight size={20}/></>
              )}
            </button>

            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-gray-500">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">
                  S'inscrire
                </Link>
              </p>
              <Link 
                to="/admin/login" 
                className="inline-flex items-center gap-2 mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                <User size={16}/> Accès administrateur
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}