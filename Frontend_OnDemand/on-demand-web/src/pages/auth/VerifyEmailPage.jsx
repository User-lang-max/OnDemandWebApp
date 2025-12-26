import { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MailCheck, Mail, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      await axiosClient.post('/auth/verify-email', { email, code });
      toast.success("Email vérifié avec succès !");
      
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await axiosClient.post('/auth/resend-verification', { email });
      toast.success("Nouveau code envoyé !");
    } catch (err) {
      toast.error("Erreur lors de l'envoi du code");
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="text-red-600" size={32}/>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Email manquant</h2>
          <p className="text-gray-500 mb-6">Aucun email fourni pour la vérification</p>
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Retour à l'inscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Colonne gauche - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-700 to-teal-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-lg text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20 mb-8">
            <Shield size={16} className="text-emerald-300"/> Vérification requise
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Confirmez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">identité</span>
          </h1>
          <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
            Nous avons envoyé un code de confirmation à votre adresse email pour vérifier votre identité.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail size={24} className="text-emerald-300"/>
              <MailCheck size={24} className="text-emerald-300"/>
            </div>
            <p className="text-sm text-emerald-100/80">
              Ce code est nécessaire pour sécuriser votre compte et vous protéger contre les accès non autorisés.
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-100 to-teal-100 mb-6">
              <MailCheck className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Vérifiez votre email</h2>
            <p className="text-gray-500">
              Code envoyé à <span className="font-bold text-gray-700">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            {/* Champ code */}
            <div className="relative">
              <input
                type="text"
                maxLength="6"
                className="w-full text-center text-4xl tracking-[0.5em] font-mono p-5 bg-white border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 outline-none transition-all uppercase shadow-sm"
                placeholder="ABCDEF"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                autoFocus
              />
              <div className="absolute -bottom-6 left-0 right-0 text-center">
                <span className="text-xs text-gray-400">Saisissez les 6 caractères reçus</span>
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
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200'
                }`}
              >
                {loading ? (
                  <>Vérification en cours...</>
                ) : (
                  <>Vérifier l'email <ArrowRight size={20}/></>
                )}
              </button>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-all font-medium"
                >
                  Renvoyer le code
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-700 transition-all font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>

            {/* Informations */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Si vous ne recevez pas d'email, vérifiez votre dossier spam ou 
                <button 
                  onClick={handleResendCode}
                  className="ml-1 text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  cliquez ici pour renvoyer
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}