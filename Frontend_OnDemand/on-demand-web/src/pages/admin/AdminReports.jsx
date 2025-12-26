import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { TrendingUp, Users, Activity, DollarSign, Download, Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';
import LineChart from '../../components/Charts/LineChart.jsx';

const ReportCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
            <TrendingUp size={12} className="mr-1"/> +{Math.floor(Math.random() * 20)}%
        </span>
    </div>
    <div>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-xs text-gray-400 mt-2">{subValue}</p>
    </div>
  </div>
);

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    completionRate: 0,
    averageBasket: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [jobsRes, paymentsRes] = await Promise.all([
            axiosClient.get('/admin/jobs'),
            axiosClient.get('/admin/payments')
        ]);

        const jobs = jobsRes.data;
        const payments = paymentsRes.data;

        // --- 1. Calculs Statistiques Globaux ---
        
        // Revenu Total (Somme des paiements validés)
        const revenue = payments
            .filter(p => p.status === 'captured' || p.status === 'paid')
            .reduce((acc, curr) => acc + curr.amount, 0);

        // Nombre de commandes
        const ordersCount = jobs.length;

        // Taux de complétion (Jobs terminés / Total Jobs)
        const completedJobs = jobs.filter(j => j.status === 'completed').length;
        const rate = ordersCount > 0 ? ((completedJobs / ordersCount) * 100).toFixed(1) : 0;

        // Panier Moyen
        const avgBasket = ordersCount > 0 ? (revenue / ordersCount).toFixed(0) : 0;

        setStats({
            totalRevenue: revenue,
            totalOrders: ordersCount,
            completionRate: rate,
            averageBasket: avgBasket
        });

      
        const monthlyRevenue = new Array(12).fill(0);
        payments.forEach(p => {
            if (p.status === 'captured' || p.status === 'paid') {
                const date = new Date(p.date || p.createdAt); // Supporte les deux formats
                if (!isNaN(date)) {
                    monthlyRevenue[date.getMonth()] += p.amount;
                }
            }
        });
        setChartData(monthlyRevenue);

        // --- 3. Dernières Transactions (Tableau) ---
        setRecentTransactions(payments.slice(0, 5)); // Les 5 dernières

      } catch (error) {
        console.error("Erreur chargement rapports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      
      {/* Header avec action */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Rapports Financiers</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                   <Activity size={16}/> Analyse détaillée de la performance
                </p>
            </div>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-teal-200 transition text-sm font-bold flex items-center gap-2">
                <Download size={18}/> Exporter CSV
            </button>
        </div>
      </div>

      <div className="px-8 space-y-8">
        
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportCard 
                title="Chiffre d'Affaires" 
                value={`${stats.totalRevenue.toLocaleString()} MAD`} 
                subValue="Total encaissé cette année"
                icon={DollarSign} 
                color="bg-emerald-500" 
            />
            <ReportCard 
                title="Total Commandes" 
                value={stats.totalOrders} 
                subValue="Missions créées"
                icon={FileText} 
                color="bg-blue-500" 
            />
             <ReportCard 
                title="Panier Moyen" 
                value={`${stats.averageBasket} MAD`} 
                subValue="Revenu par commande"
                icon={Users} 
                color="bg-violet-500" 
            />
            <ReportCard 
                title="Taux de Complétion" 
                value={`${stats.completionRate}%`} 
                subValue="Missions terminées avec succès"
                icon={CheckCircle} 
                color="bg-amber-500" 
            />
        </div>

        {/* Section Graphique & Analyse */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Grand Graphique */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Croissance des Revenus</h2>
                        <p className="text-xs text-gray-500">Évolution mensuelle du CA (MAD)</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                        <Calendar size={14}/> Année 2025
                    </div>
                </div>
                <div className="h-80 w-full">
                    <LineChart data={chartData} />
                </div>
            </div>

            {/* Résumé / Transactions Récentes */}
            <div className="bg-white p-0 rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Dernières Transactions</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {recentTransactions.length === 0 ? (
                        <p className="text-center text-gray-400 py-10 text-sm">Aucune transaction récente</p>
                    ) : (
                        recentTransactions.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${t.status === 'captured' || t.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {t.status === 'captured' || t.status === 'paid' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{t.amount} MAD</p>
                                        <p className="text-xs text-gray-500">{t.service || 'Service'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-gray-600">{new Date(t.date).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-gray-400 uppercase">{t.method || 'Carte'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                    <button className="w-full text-center text-sm font-bold text-teal-600 hover:text-teal-700 transition">
                        Voir tout l'historique
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}