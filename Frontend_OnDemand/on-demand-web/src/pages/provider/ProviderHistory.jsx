import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { CheckCircle, XCircle, Calendar, Clock, Loader2, History, Filter, MapPin, User, Star, CreditCard, ChevronRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProviderHistory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  useEffect(() => {
   
    axiosClient.get('/orders/provider-history')
      .then(res => {
        setJobs(res.data);
        calculateStats(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const calculateStats = (jobsList) => {
    const completed = jobsList.filter(j => j.statusCode === 4).length;
    const cancelled = jobsList.filter(j => j.statusCode === 7).length;
    const totalRevenue = jobsList
      .filter(j => j.statusCode === 4)
      .reduce((sum, job) => sum + (parseFloat(job.price) || 0), 0);

    setStats({
      total: jobsList.length,
      completed,
      cancelled,
      totalRevenue: Math.round(totalRevenue)
    });
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'completed') return job.statusCode === 4;
    if (filter === 'cancelled') return job.statusCode === 7;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <History className="text-blue-600" /> Historique des missions
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-9">Retrouvez toutes vos missions terminées ou annulées.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm">
            <Download size={18} /> Exporter
          </button>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total missions</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <History size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <CheckCircle size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Annulées</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <XCircle size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenus totaux</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRevenue} MAD</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <CreditCard size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex gap-2 mb-6 bg-white p-3 rounded-xl border border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Toutes ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'completed' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Terminées ({stats.completed})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'cancelled' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Annulées ({stats.cancelled})
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
          <History className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">Aucune mission trouvée dans l'historique.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex items-start gap-5 flex-1">
                  {/* Icône selon statut */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${job.statusCode === 4 ? 'bg-green-50 text-green-600 border-green-200' : job.statusCode === 7 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                    {job.statusCode === 4 ? <CheckCircle size={24} /> : job.statusCode === 7 ? <XCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">{job.serviceName}</h3>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${job.statusCode === 4 ? 'bg-green-100 text-green-700' : job.statusCode === 7 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {job.status}
                      </span>
                      {job.rating && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-bold">{job.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Client</p>
                          <p className="font-medium text-gray-800">{job.clientName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Adresse</p>
                          <p className="font-medium text-gray-800 text-sm truncate max-w-[200px]">{job.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-medium text-gray-800">
                            {new Date(job.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {job.clientNote && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-bold">Note du client :</span> {job.clientNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-700">{job.price} <span className="text-sm text-blue-500 font-medium">MAD</span></div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition text-sm flex items-center gap-2">
                      <ChevronRight size={16} /> Détails
                    </button>
                    {job.statusCode === 4 && job.invoiceId && (
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-sm">
                        Facture
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {filteredJobs.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-200">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Précédent</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">1</button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">2</button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">3</button>
            <span className="px-2 text-gray-400">...</span>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}