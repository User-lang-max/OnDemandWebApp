import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useSignalR } from '../../context/SignalRContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
    Power, MapPin, Clock, Loader2, Sparkles, Briefcase, ChevronRight, Bell, Calendar, X,
    TrendingUp, Users, Star, CreditCard, Target, CheckCircle, AlertCircle, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENTS ---
const StatusBadge = ({ status }) => {
    const styles = {
        1: { label: 'En Attente', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        2: { label: 'Accepté', color: 'bg-teal-50 text-teal-700 border-teal-200' },
        3: { label: 'En Route', color: 'bg-orange-50 text-orange-700 border-orange-200' },
        4: { label: 'En Cours', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        5: { label: 'Terminé', color: 'bg-gray-50 text-gray-700 border-gray-200' },
        6: { label: 'Annulé', color: 'bg-red-50 text-red-700 border-red-200' },
        7: { label: 'Refusé', color: 'bg-red-50 text-red-600 border-red-100' }
    };
    const current = styles[status] || { label: 'Inconnu', color: 'bg-gray-100 text-gray-500' };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${current.color} flex items-center gap-1 w-fit`}>
            {current.label}
        </span>
    );
};

const DashboardSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 mt-8 animate-pulse">
         <div className="bg-white rounded-2xl p-6 h-32 mb-8"></div>
         <div className="space-y-4">
            <div className="h-40 bg-white rounded-xl"></div>
            <div className="h-40 bg-white rounded-xl"></div>
         </div>
    </div>
);

// --- STATS CARDS COMPONENT (DYNAMIQUE) ---
const StatsCards = ({ profile }) => {
    // Utilisation des vraies données venant de 'profile'
    const stats = [
        {
            title: "Revenus du mois",
            value: `${profile?.caMoisCourant || 0} MAD`,
            change: "+12%", // Pourrait être calculé si on avait le mois précédent
            icon: <TrendingUp size={20} className="text-green-600" />,
            color: "bg-green-50 border-green-100",
            trend: "positive"
        },
        {
            title: "Missions terminées",
            value: `${profile?.completedJobsMonth || 0}`,
            change: "+3",
            icon: <CheckCircle size={20} className="text-blue-600" />,
            color: "bg-blue-50 border-blue-100",
            trend: "positive"
        },
        {
            title: "Note moyenne",
            value: profile?.rating ? profile.rating.toFixed(1) : "5.0",
            change: "+0.0",
            icon: <Star size={20} className="text-yellow-600" />,
            color: "bg-yellow-50 border-yellow-100",
            trend: "positive"
        },
        {
            title: "Taux d'acceptation",
            value: `${profile?.acceptanceRate || 100}%`,
            change: "+0%",
            icon: <Target size={20} className="text-purple-600" />,
            color: "bg-purple-50 border-purple-100",
            trend: "positive"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${stat.color} rounded-xl p-5 border shadow-sm hover:shadow-md transition-all duration-300`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white border">
                            {stat.icon}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${stat.trend === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                        </span>
                        <span className="text-xs text-gray-500">vs mois dernier</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// --- QUICK ACTIONS COMPONENT ---
const QuickActions = ({ onToggleAvailability, isAvailable, navigate }) => {
    const actions = [
        {
            title: "Mettre à jour disponibilité",
            description: "Modifier vos horaires de travail",
            icon: <Calendar size={20} className="text-blue-600" />,
            action: () => toast("Utilisez le bouton calendrier en haut"),
            color: "bg-blue-50 border-blue-100 hover:bg-blue-100"
        },
        {
            title: "Voir mes revenus",
            description: "Consulter votre portefeuille",
            icon: <DollarSign size={20} className="text-green-600" />,
            action: () => navigate('/wallet'), // Correction navigation
            color: "bg-green-50 border-green-100 hover:bg-green-100"
        },
        {
            title: "Gérer mes services",
            description: "Ajouter/modifier vos services",
            icon: <Briefcase size={20} className="text-purple-600" />,
            action: () => navigate('/provider/services'), // Correction navigation
            color: "bg-purple-50 border-purple-100 hover:bg-purple-100"
        }
    ];

    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-blue-500" />
                Actions rapides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions.map((action, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={action.action}
                        className={`${action.color} p-4 rounded-xl border text-left transition-all duration-300`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-white border">
                                {action.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{action.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

// --- PERFORMANCE METRICS COMPONENT (DYNAMIQUE) ---
const PerformanceMetrics = ({ profile }) => {
    
    const metrics = [
        { label: "Temps de réponse moyen", value: "Instant", target: "≤5 min", status: "good" },
        { label: "Rayon d'action", value: `${profile?.rayonKm || 10} km`, target: "≤20 km", status: "good" },
        { label: "Satisfaction client", value: profile?.rating ? `${(profile.rating * 20).toFixed(0)}%` : "100%", target: "≥95%", status: "good" },
        { label: "Annulations", value: "0%", target: "≤3%", status: "good" }
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target size={20} className="text-blue-500" />
                Mes indicateurs de performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-500">{metric.label}</span>
                            {metric.status === "good" ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <AlertCircle size={16} className="text-yellow-500" />
                            )}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-800">{metric.value}</span>
                            <span className="text-sm text-gray-400">Obj: {metric.target}</span>
                        </div>
                        <div className="mt-3">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${metric.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`}
                                    style={{ width: metric.status === 'good' ? '95%' : '70%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function ProviderDashboard() {
  const { connection } = useSignalR();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [notifications] = useState([
      { id: 1, text: "Bienvenue sur votre tableau de bord !", time: "À l'instant", type: "info" }
  ]);

  const fetchDashboardData = async () => {
    try {
      const [pRes, jRes] = await Promise.all([
        axiosClient.get('/provider/me').catch(() => ({ data: null })),
        axiosClient.get('/provider/jobs/assigned').catch(() => ({ data: [] }))
      ]);
      
      if (pRes.data) setProfile(pRes.data);
      if (jRes.data) setJobs(jRes.data);

    } catch (err) {
      console.error("Erreur Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (connection) {
      connection.off("JobAssigned");
      connection.on("JobAssigned", (data) => {
        toast.success(`Nouvelle Mission : ${data.price} MAD !`);
        fetchDashboardData();
      });
    }
  }, [connection]);

  const toggleAvailability = async () => {
    if (!profile) return;
    const newState = !profile.isAvailable;
    
    try {
        await axiosClient.put('/provider/availability', { 
            isAvailable: newState,
            lat: 33.5731, lng: -7.5898 // Pourrait être dynamique avec navigator.geolocation
        });
        setProfile(prev => ({ ...prev, isAvailable: newState }));
        toast.success(newState ? "Vous êtes EN LIGNE" : "Vous êtes HORS LIGNE");
    } catch (error) {
        toast.error("Erreur statut");
    }
  };

  const handleResponse = async (jobId, accepted) => {
      try {
          await axiosClient.post(`/orders/${jobId}/respond`, { accepted });
          toast.success(accepted ? "Mission acceptée !" : "Mission refusée");
          fetchDashboardData(); 
      } catch (error) {
          toast.error("Erreur lors de la réponse");
      }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
         <div className="h-48 bg-gradient-to-r from-blue-600 to-teal-600 w-full animate-pulse"></div>
         <DashboardSkeleton />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 pb-12">
        
        {/* HEADER SECTION */}
        <div className="relative bg-gradient-to-r from-blue-600 to-teal-600 pb-20 pt-10 px-4 shadow-lg overflow-hidden">
             <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
             <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="text-white flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold">
                            <Briefcase size={14} /> Espace Prestataire
                        </div>
                        <div className="text-sm bg-white/10 px-3 py-1 rounded-full">
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-1">Bonjour, {profile?.providerName}</h1>
                    <p className="text-blue-100 flex items-center gap-2">
                        <MapPin size={16} /> Casablanca • {profile?.isAvailable ? "Prêt à travailler" : "En pause"}
                        <span className="ml-4 flex items-center gap-1">
                            <Star size={14} fill="currentColor" />
                            <span>{profile?.rating ? profile.rating.toFixed(1) : "5.0"}</span>
                        </span>
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* NOTIFICATION BELL */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 transition-colors relative"
                        >
                            <Bell size={20} />
                            {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full"></span>}
                        </button>
                        
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                                >
                                    <div className="p-3 border-b border-gray-100 font-bold text-gray-800 text-sm">Notifications</div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.map(n => (
                                            <div key={n.id} className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                                <p className="text-sm text-gray-800">{n.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button 
                        onClick={() => setShowScheduleModal(true)}
                        className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 transition-colors"
                    >
                        <Calendar size={20} />
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleAvailability}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all duration-300 shadow-xl border ${profile?.isAvailable ? 'bg-white text-blue-700 border-white hover:bg-blue-50' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'}`}
                    >
                        <div className={`p-1.5 rounded-full ${profile?.isAvailable ? 'bg-blue-100' : 'bg-gray-700'}`}>
                            <Power size={18} className={profile?.isAvailable ? 'text-blue-600' : 'text-gray-400'} />
                        </div>
                        {profile?.isAvailable ? "EN LIGNE" : "HORS LIGNE"}
                    </motion.button>
                </div>
             </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
            {/* STATS CARDS (Inject profile data) */}
            <StatsCards profile={profile} />
            
            {/* QUICK ACTIONS */}
            <QuickActions onToggleAvailability={toggleAvailability} isAvailable={profile?.isAvailable} navigate={navigate} />
            
            {/* PERFORMANCE METRICS (Inject profile data) */}
            <PerformanceMetrics profile={profile} />
            
            {/* MISSIONS ASSIGNÉES */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="text-blue-500" size={20}/>
                        Missions Assignées 
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs ml-2">{jobs.length}</span>
                    </h2>
                </div>
                
                {jobs.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Briefcase className="text-gray-400 mx-auto mb-4" size={24}/>
                        <h3 className="text-lg font-bold text-gray-900">Aucune mission pour le moment</h3>
                        <p className="text-gray-500 text-sm mt-1">Restez en ligne pour recevoir de nouvelles demandes.</p>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {jobs.map((job, idx) => (
                            <motion.div 
                                key={job.id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={job.status} />
                                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                <Clock size={12}/> {new Date(job.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{job.address}</h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                                <p className="text-gray-500 text-sm flex items-center gap-2">
                                                    <MapPin size={14} className="text-blue-500"/>
                                                    {job.distanceKm?.toFixed(1)} km
                                                </p>
                                                <p className="text-gray-500 text-sm flex items-center gap-2">
                                                    <Users size={14} className="text-gray-400"/>
                                                    {job.clientName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                                                {job.price} <span className="text-sm text-gray-500 font-medium">MAD</span>
                                            </div>
                                        </div>
                                        
                                        {job.status === 1 ? (
                                            <div className="flex gap-3 w-full md:w-auto">
                                                <button 
                                                    onClick={() => handleResponse(job.id, false)}
                                                    className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold text-sm transition-colors"
                                                >
                                                    <X size={16} /> Refuser
                                                </button>
                                                <button 
                                                    onClick={() => handleResponse(job.id, true)}
                                                    className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 shadow-md font-bold text-sm transition-all"
                                                >
                                                    <CheckCircle size={16} /> Accepter
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => navigate(`/provider/job/${job.id}`)}
                                                className="w-full md:w-auto px-5 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-2"
                                            >
                                                Voir les détails <ChevronRight size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* MODAL PLANNING (GARDÉ TEL QUEL) */}
        <AnimatePresence>
            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="text-blue-600" />
                                Mon Planning Type
                            </h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => (
                                <div key={day} className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700 w-24">{day}</span>
                                    <div className="flex gap-2">
                                        <select className="bg-gray-50 border border-gray-200 rounded-lg text-sm p-2"><option>09:00</option></select>
                                        <span className="text-gray-400 self-center">-</span>
                                        <select className="bg-gray-50 border border-gray-200 rounded-lg text-sm p-2"><option>18:00</option></select>
                                    </div>
                                    <input type="checkbox" defaultChecked className="toggle" />
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Annuler</button>
                            <button onClick={() => {toast.success('Planning sauvegardé'); setShowScheduleModal(false)}} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Enregistrer</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
}