import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Briefcase, ArrowRight, Sparkles, CheckCircle, Shield, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ 
      fullName: '', email: '', password: '', role: 0 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(
          formData.email, 
          formData.fullName, 
          formData.password, 
          formData.role
      );
      
      toast.success("Compte créé avec succès !");
      
      setTimeout(() => {
        navigate('/verify-email', { state: { email: formData.email } });
      }, 500);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Erreur lors de l'inscription.";
      toast.error(msg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-teal-50 to-blue-50">
      
      {/* COLONNE GAUCHE */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-700 to-blue-800 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-lg text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20 mb-8">
                <Sparkles size={16} className="text-teal-300"/> Lancez-vous
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
                Rejoignez <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white">l'aventure</span>
            </h1>
            <p className="text-teal-100 text-lg mb-8 leading-relaxed">
                Des milliers de professionnels et clients nous font déjà confiance. 
                Commencez votre parcours dès aujourd'hui.
            </p>

            <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <CheckCircle size={24} className="text-teal-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Sécurité maximale</h3>
                            <p className="text-sm text-teal-100/80">Vos données sont chiffrées et protégées</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                        <User size={24} className="mx-auto mb-2 text-teal-300"/>
                        <p className="text-sm font-medium">Clients</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                        <Briefcase size={24} className="mx-auto mb-2 text-teal-300"/>
                        <p className="text-sm font-medium">Prestataires</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* COLONNE DROITE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-teal-100 to-blue-100 mb-6">
                    <Shield className="w-10 h-10 text-teal-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h2>
                <p className="text-gray-500">Commencez l'aventure dès maintenant</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
            
                {/* SÉLECTION DU RÔLE */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">Je souhaite m'inscrire en tant que :</label>
                    <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                            type="button" 
                            onClick={() => setFormData({...formData, role: 0})}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                                formData.role === 0 
                                ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/30 shadow-lg shadow-teal-100' 
                                : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 text-gray-600 hover:text-teal-700'
                            }`}
                        >
                            <User size={28} className={formData.role === 0 ? 'text-teal-600' : 'text-gray-400'}/> 
                            <div>
                                <span className="font-bold text-base block">Client</span>
                                <span className="text-xs text-gray-500 mt-1">Je cherche un service</span>
                            </div>
                        </motion.button>
                        
                        <motion.button 
                            type="button" 
                            onClick={() => setFormData({...formData, role: 1})}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                                formData.role === 1 
                                ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/30 shadow-lg shadow-blue-100' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-600 hover:text-blue-700'
                            }`}
                        >
                            <Briefcase size={28} className={formData.role === 1 ? 'text-blue-600' : 'text-gray-400'}/> 
                            <div>
                                <span className="font-bold text-base block">Prestataire</span>
                                <span className="text-xs text-gray-500 mt-1">Je propose mes services</span>
                            </div>
                        </motion.button>
                    </div>
                </div>

                {/* CHAMPS DE SAISIE */}
                <div className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Nom complet" 
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-3 focus:ring-teal-100 outline-none transition-all font-medium text-gray-700"
                            required
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})} 
                        />
                    </div>
                    
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="email" 
                            placeholder="Adresse email" 
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-3 focus:ring-teal-100 outline-none transition-all font-medium text-gray-700"
                            required
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                    </div>
                    
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Mot de passe" 
                            className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-3 focus:ring-teal-100 outline-none transition-all font-medium text-gray-700"
                            required
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})} 
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

                {/* CONDITIONS */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <input 
                        type="checkbox" 
                        id="conditions" 
                        className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500" 
                        required 
                    />
                    <label htmlFor="conditions" className="text-sm text-gray-600">
                        J'accepte les <a href="#" className="text-teal-600 hover:underline font-medium">Conditions d'utilisation</a> 
                        et la <a href="#" className="text-teal-600 hover:underline font-medium">Politique de confidentialité</a>
                    </label>
                </div>

                {/* BOUTON SUBMIT */}
                <motion.button 
                    type="submit" 
                    disabled={loading} 
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform flex items-center justify-center gap-2 ${
                        loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-gray-200 active:scale-95'
                    }`}
                >
                    {loading ? (
                        <>Création en cours...</>
                    ) : (
                        <>S'inscrire <ArrowRight size={20}/></>
                    )}
                </motion.button>

                {/* FOOTER LIENS */}
                <div className="text-center pt-6 border-t border-gray-100">
                    <p className="text-gray-500 text-sm">
                        Vous avez déjà un compte ?{' '}
                        <Link to="/login" className="text-teal-600 font-bold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                        En vous inscrivant, vous acceptez notre politique de protection des données.
                    </p>
                </div>
            </form>
        </motion.div>
      </div>
    </div>
  );
}