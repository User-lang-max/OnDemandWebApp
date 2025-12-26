import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Briefcase, MapPin, Calendar, CheckCircle, Clock, AlertCircle, XCircle, Search, ArrowRight, User, X, Navigation } from 'lucide-react';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  
  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    axiosClient.get('/admin/jobs').then(res => setJobs(res.data));
  }, []);

  const filtered = jobs.filter(j => 
    j.client?.name?.toLowerCase().includes(filter.toLowerCase()) || 
    j.service?.toLowerCase().includes(filter.toLowerCase())
  );

  // Helper pour la timeline
  const getSteps = (status) => {
      const steps = [
          { label: 'Créée', done: true },
          { label: 'Attribuée', done: status !== 'pending' && status !== 'cancelled' },
          { label: 'En cours', done: status === 'inprogress' || status === 'completed' },
          { label: 'Terminée', done: status === 'completed' }
      ];
      if (status === 'cancelled') return [{ label: 'Annulée', done: true, error: true }];
      return steps;
  };

  return (
    <div className="pb-12 bg-gray-50 min-h-screen font-sans">
      <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Commandes</h1>
        <p className="text-gray-500 mt-1">Supervision des missions et interventions.</p>
      </div>

      <div className="px-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between">
                <div className="relative max-w-lg w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition bg-white text-sm"
                        placeholder="Rechercher (Client, Service, ID)..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white border-b border-gray-200 text-left text-xs font-bold text-gray-400 uppercase">
                        <tr>
                            <th className="px-6 py-4">Réf.</th>
                            <th className="px-6 py-4">Détails Service</th>
                            <th className="px-6 py-4">Intervenants</th>
                            <th className="px-6 py-4">Budget</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map(job => (
                            <tr key={job.id} className="hover:bg-gray-50 transition group">
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs font-bold text-gray-500">#{job.id.substring(0,8)}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 text-sm">{job.service}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin size={12} className="text-gray-400"/> {job.address ? job.address.substring(0, 20) + '...' : 'Adresse masquée'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600" title={job.client?.name}>
                                                {job.client?.name?.[0]}
                                            </div>
                                            {job.provider ? (
                                                <div className="w-8 h-8 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-xs font-bold text-teal-600" title={job.provider?.name}>
                                                    {job.provider?.name?.[0]}
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-400">?</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900">{job.price} MAD</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                        job.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                                        job.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                        job.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            job.status === 'completed' ? 'bg-green-600' :
                                            job.status === 'cancelled' ? 'bg-red-600' :
                                            job.status === 'pending' ? 'bg-amber-600' : 'bg-blue-600'
                                        }`}></span>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setSelectedJob(job)} className="text-gray-400 hover:text-teal-600 p-2 rounded-lg hover:bg-teal-50 transition">
                                        <ArrowRight size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* MODAL DETAIL JOB */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                           <Briefcase size={20} className="text-teal-600"/> {selectedJob.service}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 font-mono">ID: {selectedJob.id}</p>
                    </div>
                    <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X size={20} className="text-gray-500"/>
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Colonne Gauche: Infos */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Timeline</h3>
                            <div className="relative pl-4 border-l-2 border-gray-100 space-y-4">
                                {getSteps(selectedJob.status).map((step, i) => (
                                    <div key={i} className="relative">
                                        <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${step.done ? 'bg-teal-500' : 'bg-gray-200'}`}></span>
                                        <p className={`text-sm font-medium ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Participants</h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Client</span>
                                <span className="text-sm font-bold text-gray-900">{selectedJob.client?.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Prestataire</span>
                                <span className={`text-sm font-bold ${selectedJob.provider ? 'text-teal-600' : 'text-amber-600 italic'}`}>
                                    {selectedJob.provider?.name || 'En recherche...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Colonne Droite: Map & Budget */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Localisation</h3>
                            <div className="h-32 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 relative overflow-hidden group">
                                <MapPin size={32} className="text-gray-300"/>
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                                    <span className="text-xs font-bold bg-white px-3 py-1 rounded-full shadow-sm">Voir sur Maps</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                                <Navigation size={12} className="mt-0.5"/> {selectedJob.address}
                            </p>
                        </div>

                         <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Finances</h3>
                            <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-2">
                                <span className="text-sm text-gray-600">Total Facturé</span>
                                <span className="text-xl font-bold text-gray-900">{selectedJob.price} MAD</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Commission (15%)</span>
                                <span>{(selectedJob.price * 0.15).toFixed(2)} MAD</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                     <button onClick={() => setSelectedJob(null)} className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-200 rounded-lg transition">
                        Fermer
                     </button>
                     {selectedJob.status === 'pending' && (
                        <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 font-bold text-sm rounded-lg hover:bg-red-100 transition">
                            Annuler la commande
                        </button>
                     )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}