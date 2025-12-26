import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Check, X, Eye, FileText, Download, UserCheck, MapPin, Calendar, Trash2 } from 'lucide-react';

export default function AdminPendingProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axiosClient.get('/admin/pending-providers');
      setProviders(res.data);
    } catch (err) {
      toast.error("Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    if (!window.confirm("Confirmer la validation de ce prestataire ?")) return;
    try {
      await axiosClient.post(`/admin/validate-provider/${id}`);
      toast.success("Prestataire validé !");
      setProviders(prev => prev.filter(p => p.id !== id));
      setSelectedProvider(null);
    } catch (err) {
      toast.error("Erreur validation");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Rejeter et supprimer cette candidature ?")) return;
    try {
      await axiosClient.post(`/admin/reject-provider/${id}`);
      toast.success("Candidature rejetée.");
      setProviders(prev => prev.filter(p => p.id !== id));
      setSelectedProvider(null);
    } catch (err) {
      toast.error("Erreur rejet");
    }
  };

  return (
    <div className="pb-12 bg-gray-50 min-h-screen font-sans">
      <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Validations</h1>
        <p className="text-gray-500 mt-1">Examiner les candidatures des nouveaux prestataires.</p>
      </div>

      <div className="px-8 relative z-20">
        {loading ? (
             <div className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-600 border-t-transparent mx-auto"></div></div>
        ) : providers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <UserCheck size={32}/>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Tout est à jour</h3>
                <p className="text-gray-500">Aucune candidature en attente pour le moment.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {providers.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <img 
                                    src={p.photoUrl || `https://ui-avatars.com/api/?name=${p.fullName}&background=random`} 
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                    alt=""
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{p.fullName}</h3>
                                    <p className="text-xs text-gray-500 truncate mb-2">{p.email}</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.emailConfirmed ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                        {p.emailConfirmed ? 'Email Vérifié' : 'Email Non Vérifié'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    <MapPin size={16} className="text-teal-600"/>
                                    <span className="font-medium truncate">{p.requestedZone || 'Non définie'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    <FileText size={16} className="text-blue-600"/>
                                    <span className="font-medium truncate">{p.cvUrl ? 'CV Disponible' : 'CV Manquant'}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button 
                                    onClick={() => setSelectedProvider(p)}
                                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
                                >
                                    <Eye size={16}/> Examiner
                                </button>
                                <button 
                                    onClick={() => handleValidate(p.id)}
                                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold transition shadow-md shadow-teal-100 flex items-center justify-center gap-2"
                                >
                                    <Check size={16}/> Valider
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Dossier Candidature</h2>
                    <button onClick={() => setSelectedProvider(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20}/></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Bio */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Présentation</h3>
                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 italic border border-gray-100">
                            "{selectedProvider.bio || "Aucune description fournie par le candidat."}"
                        </div>
                    </div>

                    {/* Infos Pratiques */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Zone d'intervention</h3>
                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                <MapPin size={16} className="text-teal-600"/> {selectedProvider.requestedZone}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Entretien</h3>
                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                <Calendar size={16} className="text-purple-600"/> 
                                {selectedProvider.interviewDate ? new Date(selectedProvider.interviewDate).toLocaleDateString() : 'Non planifié'}
                            </p>
                        </div>
                    </div>

                    {/* CV */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Pièces jointes</h3>
                        {selectedProvider.cvUrl ? (
                            <a href={selectedProvider.cvUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 transition group">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-white"><FileText size={20}/></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Curriculum Vitae.pdf</p>
                                    <p className="text-xs text-teal-600 font-medium">Cliquer pour télécharger</p>
                                </div>
                                <Download size={16} className="ml-auto text-gray-400 group-hover:text-teal-600"/>
                            </a>
                        ) : (
                            <p className="text-sm text-red-500 font-medium flex items-center gap-2"><X size={16}/> Aucun CV fourni</p>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between gap-3">
                    <button 
                        onClick={() => handleReject(selectedProvider.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition flex items-center gap-2 border border-transparent hover:border-red-100"
                    >
                        <Trash2 size={16}/> Rejeter
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setSelectedProvider(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-bold transition">
                            Fermer
                        </button>
                        <button onClick={() => handleValidate(selectedProvider.id)} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-teal-100">
                            Valider le compte
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}