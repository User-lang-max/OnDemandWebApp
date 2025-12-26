import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, Key, Lock, ArrowRight, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Verify2FAPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { verify2FA, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || localStorage.getItem('temp_2fa_email');

  useEffect(() => {
    if (!email) {
        console.warn(" Aucun email trouvé pour le 2FA -> Redirection Login");
        navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      console.log("🚀 Envoi du code 2FA pour :", email);
      const success = await verify2FA(email, code);
      
      if (success) {
        toast.success("Authentification réussie !");
        localStorage.removeItem('temp_2fa_email');

        // Animation avant redirection
        setTimeout(() => {
          if (email.includes('admin')) {
              navigate('/admin');
          } else if (email.includes('provider')) {
              navigate('/provider');
          } else {
              navigate('/client');
          }
        }, 500);
        
      } else {
          toast.error("Code refusé par le serveur.");
      }
    } catch (error) {
      console.error(" Erreur 2FA:", error);
      toast.error("Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    toast.success("Nouveau code envoyé !", { icon: '🔄' });
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Colonne gauche - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-800 to-indigo-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-lg text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20 mb-8">
            <Smartphone size={16} className="text-purple-300"/> Double authentification
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Sécurité <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white">renforcée</span>
          </h1>
          <p className="text-purple-100 text-lg mb-8 leading-relaxed">
            Pour protéger votre compte, nous avons envoyé un code de vérification à votre adresse email.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lock size={24} className="text-purple-300"/>
              <ShieldCheck size={24} className="text-purple-300"/>
              <Key size={24} className="text-purple-300"/>
            </div>
            <p className="text-sm text-purple-100/80">
              Le code est valide pendant 10 minutes. Ne le partagez jamais avec qui que ce soit.
            </p>
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-100 to-indigo-100 mb-6">
              <ShieldCheck className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Vérification en 2 étapes</h2>
            <p className="text-gray-500">
              Code envoyé à <span className="font-bold text-gray-700">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Champ code */}
            <div className="relative">
              <input
                type="text"
                maxLength="6"
                className="w-full text-center text-4xl tracking-[0.5em] font-mono p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-3 focus:ring-purple-100 outline-none transition-all uppercase"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
                autoFocus
              />
              <div className="absolute -bottom-6 left-0 right-0 text-center">
                <span className="text-xs text-gray-400">Saisissez les 6 chiffres reçus</span>
              </div>
            </div>

            {/* Boutons */}
            <div className="space-y-4">
              <button 
                type="submit" 
                disabled={loading || code.length !== 6}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                  loading || code.length !== 6
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-200'
                }`}
              >
                {loading ? (
                  <>Vérification en cours...</>
                ) : (
                  <>Vérifier le code <ArrowRight size={20}/></>
                )}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                className="w-full py-3 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-600 hover:text-purple-700 transition-all font-medium"
              >
                Renvoyer le code
              </button>
            </div>

            {/* Lien retour */}
            <div className="text-center pt-6 border-t border-gray-100">
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium hover:underline transition-colors"
              >
                ← Retour à la connexion
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}