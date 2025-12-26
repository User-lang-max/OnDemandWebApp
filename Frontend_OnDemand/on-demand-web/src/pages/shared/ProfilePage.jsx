import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { 
  User, Shield, Mail, Phone, Calendar, CheckCircle, 
  XCircle, Hash, Briefcase, Activity 
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
        try {
         
            const res = await axiosClient.get('/auth/me'); 
            setProfileData(res.data);
            setIs2FAEnabled(res.data.twoFactorEnabled);
        } catch (error) {
            console.error(error);
       
            if (user) {
                setProfileData(user);
                setIs2FAEnabled(user.twoFactorEnabled);
            }
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, [user]);

  const toggle2FA = async () => {
    try {
        const res = await axiosClient.post('/auth/toggle-2fa');
        setIs2FAEnabled(res.data.enabled); 
        toast.success(res.data.enabled ? "Sécurité renforcée activée" : "Sécurité standard activée");
    } catch (error) {
        console.error(error);
        toast.error("Erreur technique lors du changement 2FA");
    }
  };

  const getRoleLabel = (role) => {
      // 0 = Client, 1 = Provider, 2 = Admin
      if (role === 1) return "Prestataire de services";
      if (role === 2) return "Administrateur";
      return "Client / Demandeur";
  };

  const getStatusLabel = (status) => {
      // Suppose que 1 = Actif, 0 = Inactif/En attente
      return status === 1 ? "Compte Actif" : "En attente de validation";
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-gray-400 font-medium">Chargement des données...</div>
    </div>
  );

  if (!profileData) return <div className="p-8 text-center text-red-500">Impossible de charger le profil.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* En-tête Textuel */}
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mon Espace Personnel</h1>
            <p className="text-gray-500 mt-2">Gérez vos informations et vos paramètres de sécurité.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            
      
            <div className="md:col-span-2 space-y-8">
                
                {/* Carte Identité */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="text-teal-600" size={24}/> Identité & Coordonnées
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nom Complet</label>
                            <p className="text-lg font-bold text-gray-900">{profileData.fullName}</p>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-medium text-gray-900">{profileData.email}</p>
                                {profileData.emailConfirmed && (
                                    <CheckCircle size={18} className="text-teal-500" title="Email vérifié" />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Téléphone</label>
                            <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <Phone size={16} className="text-gray-400"/>
                                {profileData.phoneNumber || "Non renseigné"}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date d'inscription</label>
                            <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400"/>
                                {new Date(profileData.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Carte Statut Compte */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Briefcase className="text-blue-600" size={24}/> Détails du Compte
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <span className="text-gray-600 font-medium">Type de compte</span>
                            <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                {getRoleLabel(profileData.role)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <span className="text-gray-600 font-medium">État du compte</span>
                            <span className={`font-bold px-3 py-1 rounded-lg flex items-center gap-2 ${
                                profileData.status === 1 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                            }`}>
                                <Activity size={16} />
                                {getStatusLabel(profileData.status)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">Identifiant Unique (ID)</span>
                            <span className="font-mono text-sm text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                {profileData.id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLONNE 2 : SÉCURITÉ (Étroite) */}
            <div className="space-y-8">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Shield className="text-teal-400" size={24}/> Sécurité
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm uppercase tracking-wider text-gray-400">Double Authentification</span>
                                {is2FAEnabled 
                                    ? <CheckCircle className="text-teal-400" size={20} />
                                    : <XCircle className="text-red-400" size={20} />
                                }
                            </div>
                            
                            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                                {is2FAEnabled 
                                    ? "Votre compte est protégé. Un code vous sera demandé à chaque connexion." 
                                    : "Renforcez la sécurité de votre compte en activant la validation par email."}
                            </p>

                            <button 
                                onClick={toggle2FA}
                                className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                                    is2FAEnabled 
                                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30' 
                                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg'
                                }`}
                            >
                                {is2FAEnabled ? "Désactiver la protection" : "Activer la protection 2FA"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-2">Besoin d'assistance ?</h3>
                    <p className="text-sm text-blue-700 mb-4">
                        Si vous souhaitez modifier des informations sensibles (Email, Nom) ou supprimer votre compte, veuillez contacter le support.
                    </p>
                    <button className="text-sm font-bold text-blue-600 hover:underline">
                        Contacter le support &rarr;
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}