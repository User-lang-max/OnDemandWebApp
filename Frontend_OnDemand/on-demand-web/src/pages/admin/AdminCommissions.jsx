import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
    DollarSign, 
    PieChart, 
    Download, 
    Search, 
    Filter, 
    ArrowUpRight,
    Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCommissions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats calculées
  const [stats, setStats] = useState({ total: 0, average: 0, count: 0 });

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
        // On demande 15% de commission
        const res = await axiosClient.get('/admin/commissions?rate=0.15');
        console.log("Données reçues:", res.data); // Pour le débogage (F12)
        setData(res.data);
        
        // Calculs sécurisés
        const total = res.data.reduce((acc, curr) => acc + (curr.platformFee || 0), 0);
        const count = res.data.length;
        
        setStats({
            total: total,
            count: count,
            average: count > 0 ? (total / count).toFixed(2) : 0
        });

    } catch(e) { 
        console.error(e);
        toast.error("Erreur chargement commissions"); 
    } finally { 
        setLoading(false); 
    }
  };

  // Filtrage insensible à la casse et sécurisé
  const filtered = data.filter(item => {
    const providerName = item.provider || item.Provider || ''; // Supporte minuscules et majuscules
    const serviceName = item.service || item.Service || '';
    const term = searchTerm.toLowerCase();

    return providerName.toLowerCase().includes(term) ||
           serviceName.toLowerCase().includes(term);
  });

  return (
    <div className="pb-12 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Commissions</h1>
                <p className="text-gray-500 mt-1">Suivi des revenus nets de la plateforme (15%).</p>
            </div>
            <div className="flex gap-3">
                 <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-gray-800 transition">
                    <Download size={18}/> Exporter Rapport
                 </button>
            </div>
        </div>
      </div>

      <div className="px-8 relative z-20 space-y-8">
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <DollarSign size={24} className="text-white"/>
                    </div>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                        <ArrowUpRight size={12}/> Net
                    </span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold">{stats.total.toLocaleString()} MAD</h3>
                    <p className="text-emerald-100 text-sm font-medium mt-1">Gains cumulés</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Briefcase size={24}/>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.count}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Prestations commissionnées</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                        <PieChart size={24}/>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.average} MAD</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Gain moyen par job</p>
                </div>
            </div>
        </div>

        {/* TABLEAU */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition bg-white text-sm"
                        placeholder="Rechercher par prestataire ou service..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-lg">
                    <Filter size={16}/>
                    <span className="font-bold">Taux actuel: 15%</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white border-b border-gray-200 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Date & ID</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Prestataire</th>
                            <th className="px-6 py-4 text-right bg-gray-50/50">Montant Job</th>
                            <th className="px-6 py-4 text-right bg-teal-50/30 text-teal-700">Commission (15%)</th>
                            <th className="px-6 py-4 text-right">Net Prestataire</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10">Chargement...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <div className="p-4 bg-gray-50 rounded-full mb-3">
                                            <Search size={24} />
                                        </div>
                                        <p className="font-medium">Aucune donnée trouvée.</p>
                                        <p className="text-xs mt-1">Vérifiez que vous avez des commandes avec le statut "Completed".</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item, idx) => {
                                // Extraction sécurisée des propriétés (supporte provider OU Provider)
                                const pName = item.provider || item.Provider || 'Inconnu';
                                const sName = item.service || item.Service || 'Service';
                                const dateVal = item.date || item.Date || new Date().toISOString();
                                const jobId = item.jobId || item.JobId || '???';
                                const price = item.totalPrice ?? 0;
                                const fee = item.platformFee ?? 0;
                                const net = item.providerNet ?? 0;

                                return (
                                    <tr key={idx} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 text-xs">{new Date(dateVal).toLocaleDateString()}</p>
                                            <p className="font-mono text-[10px] text-gray-400">#{jobId.toString().substring(0,8)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-700">{sName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase">
                                                    {pName[0]}
                                                </div>
                                                <span className="text-sm text-gray-600">{pName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right bg-gray-50/30">
                                            <span className="font-medium text-gray-500">{price} MAD</span>
                                        </td>
                                        <td className="px-6 py-4 text-right bg-teal-50/20">
                                            <span className="font-bold text-teal-600 text-lg">+{fee} MAD</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-medium text-gray-900">{net} MAD</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}