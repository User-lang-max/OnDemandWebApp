import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Wallet, TrendingUp, Clock, ArrowDownLeft, AlertCircle, ArrowUpRight, DollarSign, PieChart, Activity, CheckCircle, CreditCard, Calendar, History, Filter, ChevronRight, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';


const SimpleRevenueChart = ({ data }) => {

    const chartData = data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0];
    const max = Math.max(...chartData, 100);
    const points = chartData.map((val, i) => {
        const x = (i / (chartData.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-40 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,100 ${points} 100,100`} fill="url(#gradient)" />
                <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={points} vectorEffect="non-scaling-stroke" />
                {chartData.map((val, i) => (
                    <circle key={i} cx={(i / (chartData.length - 1)) * 100} cy={100 - (val / max) * 100} r="2" fill="#fff" stroke="#2563eb" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                ))}
            </svg>
            <div className="flex justify-between text-xs text-gray-400 mt-4 px-2">
                <span>M-5</span>
                <span>M-4</span>
                <span>M-3</span>
                <span>M-2</span>
                <span>M-1</span>
                <span>Actuel</span>
            </div>
        </div>
    );
};

// Composant pour la barre de progression
const ProgressBar = ({ value, max, label, color }) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-bold text-gray-900">{value} MAD</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
                <span>0 MAD</span>
                <span>{max} MAD</span>
            </div>
        </div>
    );
};

// Composant pour les objectifs
const GoalCard = ({ title, current, target, icon, color }) => {
    const percentage = Math.min(Math.round((current / target) * 100), 100);
    
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${color} text-white`}>
                        {icon}
                    </div>
                    <span className="font-medium text-gray-700">{title}</span>
                </div>
                <span className={`text-sm font-bold ${percentage >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                    {percentage}%
                </span>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{current}<span className="text-sm text-gray-500"> MAD</span></p>
                <p className="text-xs text-gray-500">Objectif: {target} MAD</p>
            </div>
        </div>
    );
};

const WalletSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
    </div>
);

export default function WalletPage() {
  const [data, setData] = useState({ 
      balance: 0, 
      pending: 0, 
      transactions: [],
      chartData: [],
      stats: {
          monthlyEarnings: 0,
          weeklyGrowth: 0,
          completedJobs: 0,
          averagePerJob: 0,
          bestMonth: 0,
          pendingWithdrawals: 0
      }
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await axiosClient.get('/wallet');
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger le portefeuille");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (data.balance < 100) {
      toast.error("Le montant minimum de retrait est de 100 MAD");
      return;
    }
    
    try {
      await axiosClient.post('/wallet/withdraw', { amount: data.balance });
      toast.success("Demande de retrait envoyée");
      fetchWallet();
    } catch (error) {
      toast.error("Erreur lors du retrait");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Objectifs dynamiques basés sur la performance actuelle
  const goals = [
    { 
        title: "Objectif Mensuel", 
        current: data.stats?.monthlyEarnings || 0, 
        target: 5000, 
        icon: <TrendingUp size={18} />, 
        color: 'bg-gradient-to-r from-blue-500 to-blue-600' 
    },
    { 
        title: "Objectif Global", 
        current: data.balance || 0, 
        target: 15000, 
        icon: <Calendar size={18} />, 
        color: 'bg-gradient-to-r from-teal-500 to-teal-600' 
    }
  ];

  if (loading) return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto"><WalletSkeleton /></div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg text-blue-600 border border-blue-100">
                  <Wallet size={24} /> 
                </div>
                Mon Portefeuille
              </h1>
              <p className="text-gray-500 mt-2 ml-12">Gérez vos revenus et suivez vos transactions.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                <Download size={18} /> Exporter
              </button>
              <button 
                onClick={handleWithdraw}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-2"
              >
                <CreditCard size={18} /> Retirer
              </button>
            </div>
          </div>
        </header>

        {/* FILTRES TEMPORELS */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl border border-gray-200 w-fit">
          {['all', 'week', 'month', 'year'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition capitalize ${filter === f ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {f === 'all' ? 'Tout' : f === 'week' ? 'Semaine' : f === 'month' ? 'Mois' : 'Année'}
              </button>
          ))}
        </div>

        {/* CARTES PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Solde Disponible */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-xl shadow-blue-900/20 border border-blue-500"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-lg" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold">
                  <TrendingUp size={16}/> Disponible immédiatement
                </div>
                <button 
                  onClick={handleWithdraw}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition border border-white/30 text-sm font-bold"
                >
                  Retirer
                </button>
              </div>
              
              <div className="mb-8">
                <p className="text-blue-100 text-sm mb-2 font-medium">Solde total disponible</p>
                <div className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
                  {data.balance.toFixed(2)} <span className="text-3xl text-blue-200 font-normal">MAD</span>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight size={16} className="text-green-300" />
                    <span className="text-green-300 text-sm font-bold">+{data.stats.weeklyGrowth}% ce mois</span>
                  </div>
                  <div className="text-blue-200 text-sm">
                    {data.stats.completedJobs} missions terminées
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <ProgressBar 
                  value={data.stats.monthlyEarnings} 
                  max={5000} 
                  label="Objectif mensuel" 
                  color="bg-gradient-to-r from-green-400 to-emerald-500" 
                />
                <ProgressBar 
                  value={data.pending} 
                  max={2000} 
                  label="En attente de validation (Missions en cours)" 
                  color="bg-gradient-to-r from-yellow-400 to-orange-500" 
                />
              </div>
            </div>
          </motion.div>

          {/* Statistiques Dynamiques */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 relative overflow-hidden"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-blue-500" size={20} />
                Statistiques
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Revenus ce mois</p>
                    <p className="text-xl font-bold text-gray-800">{data.stats.monthlyEarnings} MAD</p>
                  </div>
                  <div className="text-green-600 font-bold flex items-center gap-1">
                    <TrendingUp size={16} /> +{data.stats.weeklyGrowth}%
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Moyenne par mission</p>
                    <p className="text-xl font-bold text-gray-800">{data.stats.averagePerJob} MAD</p>
                  </div>
                  <div className="text-blue-600">
                    <DollarSign size={20} />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Prochain paiement</p>
                    <p className="text-xl font-bold text-gray-800">5 du mois</p>
                  </div>
                  <div className="text-purple-600">
                    <Calendar size={20} />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Meilleur mois</p>
                    <p className="text-xl font-bold text-gray-800">{data.stats.bestMonth} MAD</p>
                  </div>
                  <div className="text-yellow-600">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Retraits en attente</span>
                <span className="font-bold text-gray-800">{data.stats.pendingWithdrawals} MAD</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* GRAPHIQUES ET OBJECTIFS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={20} />
                Évolution des revenus (6 derniers mois)
              </h3>
            </div>
            
            {/* Graphique avec données API */}
            <SimpleRevenueChart data={data.chartData} />
            
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <PieChart className="text-blue-500" size={20} />
                Mes Objectifs
              </h3>
            </div>
            
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <GoalCard 
                  key={index}
                  title={goal.title}
                  current={goal.current}
                  target={goal.target}
                  icon={goal.icon}
                  color={goal.color}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* HISTORIQUE DES TRANSACTIONS */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <History className="text-blue-500" size={20} />
                Historique des transactions
              </h2>
              <p className="text-sm text-gray-500 mt-1">Dernières opérations terminées</p>
            </div>
          </div>
          
          <div className="divide-y divide-gray-50">
            {data.transactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                  <AlertCircle className="text-gray-300" size={24}/>
                </div>
                <p className="text-gray-500 font-medium">Aucune transaction terminée pour le moment.</p>
                <p className="text-gray-400 text-sm mt-2">Validez des missions pour commencer à gagner.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 text-sm font-bold text-gray-600">Description</th>
                      <th className="text-left p-4 text-sm font-bold text-gray-600">Client</th>
                      <th className="text-left p-4 text-sm font-bold text-gray-600">Date</th>
                      <th className="text-left p-4 text-sm font-bold text-gray-600">Statut</th>
                      <th className="text-left p-4 text-sm font-bold text-gray-600">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((t, idx) => (
                      <motion.tr 
                        key={t.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                              <ArrowDownLeft size={18}/>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{t.description}</p>
                              <p className="text-xs text-gray-500">ID: {t.id.toString().substring(0,8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-800">{t.clientName}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-800">{formatDate(t.date)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle size={12} /> Succès
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-green-600 text-lg">+{t.amount} MAD</p>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}