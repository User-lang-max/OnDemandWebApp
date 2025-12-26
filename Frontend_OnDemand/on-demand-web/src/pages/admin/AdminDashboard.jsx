import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Users, Briefcase, CreditCard, Activity, TrendingUp, Map as MapIcon, Star, DollarSign, Calendar } from 'lucide-react';
import LineChart from '../../components/Charts/LineChart.jsx';
import BarChart from '../../components/Charts/BarChart.jsx';
import AdminLiveMap from '../../components/AdminLiveMap.jsx'; 

const StatCard = ({ title, value, icon: Icon, color, trend, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} opacity-5 transition-transform group-hover:scale-150`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight group-hover:text-teal-600 transition-colors">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all text-gray-700`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between text-sm relative z-10">
      <div className="flex items-center">
        <span className="text-emerald-600 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <TrendingUp size={14} className="mr-1" /> {trend}
        </span>
        <span className="text-gray-400 ml-2 text-xs">vs mois dernier</span>
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, providers: 0, jobs: 0, payments: 0 });
  const [topProviders, setTopProviders] = useState([]);
  const [mapProviders, setMapProviders] = useState([]); // Ajout état pour la carte
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({ line: [], bar: [], barLabels: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
       
        const [overview, jobs, payments, users, activity, mapData] = await Promise.all([
            axiosClient.get('/admin/overview'),
            axiosClient.get('/admin/jobs'),
            axiosClient.get('/admin/payments'),
            axiosClient.get('/admin/users'),
            axiosClient.get('/admin/activity'),
            axiosClient.get('/admin/map/providers') 
        ]);

        setStats(overview.data);
        setRecentActivity(activity.data);
        setMapProviders(mapData.data); 

   
        const providers = users.data
            .filter(u => u.role === 'provider')
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5);
        setTopProviders(providers);

     
        const monthlyData = new Array(12).fill(0);
        
        jobs.data.forEach(j => {
        
            const dateString = j.date || j.Date || j.createdAt;
            const d = new Date(dateString);
            
            if(!isNaN(d.getTime())) {
                monthlyData[d.getMonth()]++;
            }
        });

    
        const revenueByService = {};
        payments.data.forEach(p => {
            if(p.status === 'captured' || p.status === 'paid') {
                const s = p.service || 'Autre';
                revenueByService[s] = (revenueByService[s] || 0) + p.amount;
            }
        });
        const sortedRevenue = Object.entries(revenueByService).sort((a,b) => b[1] - a[1]).slice(0,5);

        setChartData({
            line: monthlyData,
            bar: sortedRevenue.map(i => i[1]),
            barLabels: sortedRevenue.map(i => i[0])
        });

      } catch (e) {
        console.error("Dashboard error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mb-4"></div>
            <p className="text-gray-500 font-medium">Chargement des données...</p>
        </div>
    </div>
  );

  return (
    <div className="pb-12 bg-gray-50 min-h-screen font-sans">
      {/* Header Modernisé */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de Bord</h1>
                <p className="text-gray-500 mt-1">Bienvenue sur votre espace d'administration.</p>
            </div>
            <div className="flex gap-3">
                 <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-teal-100">
                    <Calendar size={16}/> {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                 </div>
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-gray-200 transition text-sm font-medium flex items-center gap-2">
                    <DollarSign size={16} /> Rapport financier
                </button>
            </div>
        </div>
      </div>

      <div className="px-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Utilisateurs" value={stats.users} icon={Users} color="bg-blue-500 text-blue-600" />
            <StatCard title="Prestataires" value={stats.providers} icon={Briefcase} color="bg-violet-500 text-violet-600" />
            <StatCard title="Commandes" value={stats.jobs} icon={Activity} color="bg-amber-500 text-amber-600"  />
            <StatCard title="Revenus" value={`${stats.payments.toLocaleString()} MAD`} icon={CreditCard} color="bg-emerald-500 text-emerald-600" />
        </div>

        {/* Section Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Évolution des Commandes</h3>
                        <p className="text-xs text-gray-500">Volume de missions sur l'année</p>
                    </div>
                </div>
                <div className="h-72 w-full">
             
                    <LineChart data={chartData.line} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Revenus par Service</h3>
                <p className="text-xs text-gray-500 mb-6">Top 5 des catégories les plus rentables</p>
                <div className="h-72 w-full">
                    <BarChart data={chartData.bar} categories={chartData.barLabels} />
                </div>
            </div>
        </div>

        {/* Section Carte Live & Top Prestataires */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Carte (Passage des props providers) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[550px]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                            <MapIcon size={20}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">Activité en Temps Réel</h3>
                            <p className="text-xs text-gray-500">{mapProviders.length} prestataires connectés</p>
                        </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                    </span>
                </div>
                <div className="flex-1 relative bg-gray-100">
                    {/* On passe les données GPS au composant carte */}
                    <AdminLiveMap providers={mapProviders} />
                </div>
            </div>

            {/* Top Prestataires */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-0 overflow-hidden flex flex-col h-[550px]">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Star className="text-amber-400 fill-amber-400" size={20}/> Top Performances
                    </h3>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {topProviders.map((provider, i) => (
                        <div key={i} className="flex items-center p-3 rounded-xl hover:bg-teal-50/50 transition border border-gray-100 group">
                            <div className="relative flex-shrink-0">
                                <img 
                                    src={provider.photoUrl || `https://ui-avatars.com/api/?name=${provider.fullName}&background=random`} 
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" 
                                    alt=""
                                />
                                <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-br from-amber-300 to-amber-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                    {i+1}
                                </div>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-teal-700">{provider.fullName}</p>
                                <p className="text-xs text-gray-500 truncate">{provider.email}</p>
                            </div>
                            <div className="text-right bg-gray-50 px-2 py-1 rounded-lg group-hover:bg-white">
                                <p className="text-sm font-bold text-gray-900">{provider.rating || '5.0'}</p>
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_,k) => <Star key={k} size={8} fill="currentColor" />)}
                                </div>
                            </div>
                        </div>
                    ))}
                    {topProviders.length === 0 && (
                        <p className="text-center text-gray-400 py-10 text-sm">Aucun prestataire classé pour le moment.</p>
                    )}
                </div>
                <div className="p-4 border-t border-gray-100">
                     <button className="w-full py-2.5 text-sm text-gray-700 font-bold hover:bg-gray-50 border border-gray-200 rounded-xl transition">
                        Voir tout le classement
                    </button>
                </div>
            </div>
        </div>

        {/* Activité Récente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="text-blue-500" size={20}/> Flux d'activité
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentActivity.slice(0, 6).map((act, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all">
                        <div className={`p-2.5 rounded-full mt-1 flex-shrink-0 ${
                            act.type === 'payment' ? 'bg-emerald-100 text-emerald-600' : 
                            act.type === 'job' ? 'bg-blue-100 text-blue-600' :
                            'bg-violet-100 text-violet-600'
                        }`}>
                            {act.type === 'payment' ? <DollarSign size={16}/> : act.type === 'job' ? <Briefcase size={16}/> : <Users size={16}/>}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-2">{act.message}</p>
                            <p className="text-[11px] font-semibold text-gray-400 mt-1 uppercase tracking-wide">
                                {new Date(act.date).toLocaleDateString()} • {new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}