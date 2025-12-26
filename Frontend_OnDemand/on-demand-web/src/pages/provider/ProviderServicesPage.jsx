import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Save, Tag, Trash2, PlusCircle, PenTool, LayoutGrid, X, Star, TrendingUp, Users, Clock, DollarSign, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProviderServicesPage() {
  const [myServices, setMyServices] = useState([]);
  const [catalogTree, setCatalogTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

 
  const fetchMyServices = async () => {
      try {
          const res = await axiosClient.get('/provider/services');
          setMyServices(res.data);
      } catch (e) { toast.error("Erreur chargement services"); }
  };

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        await fetchMyServices();
        setLoading(false);
     
        axiosClient.get('/catalog/tree').then(res => setCatalogTree(res.data));
    };
    init();
  }, []);

  // Update Prix
  const handleUpdatePrice = async (item, newPrice) => {
      try {
        await axiosClient.post('/provider/services', {
            serviceItemId: item.itemId || item.id, 
            price: parseFloat(newPrice),
            isActive: true 
        });
        toast.success("Prix mis à jour");
        fetchMyServices(); 
      } catch (e) { toast.error("Erreur mise à jour"); }
  };

 
  const handleAddService = async (item) => {
      await handleUpdatePrice(item, item.minPrice || 100);
      setIsAddModalOpen(false);
  };


  const handleRemove = async (itemId) => {
      if(!window.confirm("Retirer ce service de votre profil ?")) return;
      try {
        await axiosClient.post('/provider/services', {
            serviceItemId: itemId,
            price: 0,
            isActive: false
        });
        setMyServices(prev => prev.filter(s => s.itemId !== itemId));
        toast.success("Service retiré");
      } catch (e) { toast.error("Erreur"); }
  };

  if(loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="text-blue-600">Chargement...</div>
    </div>
  );

 
  const stats = {
    totalServices: myServices.length,
    totalRevenue: myServices.reduce((sum, s) => sum + (s.basePrice || 0), 0),
    averageRating: 4.8, 
    mostPopular: myServices[0] 
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 p-6 md:p-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Compétences</h1>
                    <p className="text-gray-500">
                        Gérez les services visibles par les clients et vos tarifs.
                    </p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all shadow-md shadow-blue-200"
                >
                    <PlusCircle size={20}/> Ajouter une compétence
                </button>
            </div>

      
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Services actifs</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalServices}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <LayoutGrid size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valeur totale</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalRevenue} MAD</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Note moyenne</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
                      <Star size={16} className="text-yellow-500 fill-current" />
                    </div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                    <Star size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Performances</p>
                    <p className="text-lg font-bold text-gray-800">Excellent</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Users size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICES LIST */}
            {myServices.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LayoutGrid className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun service actif</h3>
                    <p className="text-gray-500 text-sm mb-4">Ajoutez vos premières compétences pour commencer à recevoir des missions.</p>
                    <button onClick={() => setIsAddModalOpen(true)} className="text-blue-600 font-bold hover:text-blue-700">
                        Ajouter un service maintenant
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myServices.map((service, idx) => (
                        <motion.div
                            key={service.itemId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center text-2xl border border-blue-100">
                                        {service.icon || '🛠️'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Tag size={12} className="text-gray-400"/>
                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Service Actif</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-600">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-xs font-bold">4.8</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleRemove(service.itemId)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                            
                            {/* METRICS - Données d'affichage seulement */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="text-center">
                                    <div className="text-sm font-bold text-gray-800">15</div>
                                    <div className="text-xs text-gray-500">Réservations</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold text-gray-800">100%</div>
                                    <div className="text-xs text-gray-500">Taux de compl.</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold text-gray-800">2h</div>
                                    <div className="text-xs text-gray-500">Durée moy.</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold text-green-600">1,200 MAD</div>
                                    <div className="text-xs text-gray-500">Revenus</div>
                                </div>
                            </div>

                            {/* PRICE EDITOR */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">Tarif par défaut</p>
                                        <p className="text-xs text-gray-500">Définissez votre prix pour ce service</p>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        Prix moyen du marché: 250 MAD
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">MAD</span>
                                        <input 
                                            type="number" 
                                            min="50"
                                            step="10"
                                            defaultValue={service.basePrice}
                                            onBlur={(e) => handleUpdatePrice(service, e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-50 border border-gray-300 font-bold text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleUpdatePrice(service, Math.max(service.basePrice - 20, 50))}
                                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            -20
                                        </button>
                                        <button 
                                            onClick={() => handleUpdatePrice(service, service.basePrice + 20)}
                                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            +20
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={14} />
                                        <span>Garantie qualité incluse</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        <span>Réponse sous 15 min</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>

        {/* MODAL AJOUT SERVICE */}
        <AnimatePresence>
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border border-gray-200"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Ajouter une compétence</h2>
                                <p className="text-sm text-gray-500 mt-1">Sélectionnez parmi nos catégories de services</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto bg-white">
                            <div className="space-y-8">
                                {catalogTree.map(cat => (
                                    <div key={cat.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="text-2xl">{cat.icon}</div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg">{cat.name}</h3>
                                                <p className="text-sm text-gray-500">{cat.description || `${cat.services.length} services disponibles`}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {cat.services.map(srv => {
                                                const alreadyOwned = myServices.some(ms => ms.itemId === srv.id);
                                                if (alreadyOwned) return null;

                                                return (
                                                    <div 
                                                        key={srv.id} 
                                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all flex flex-col gap-3 group hover:bg-blue-50"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-800 text-sm mb-1">{srv.name}</h4>
                                                                <p className="text-xs text-gray-500 line-clamp-2">{srv.description || 'Service professionnel'}</p>
                                                            </div>
                                                            <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                                {srv.minPrice || 100} MAD
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Star size={10} className="text-yellow-500 fill-current" />
                                                                <span>4.5+</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleAddService(srv)}
                                                                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs font-bold group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-teal-600 group-hover:text-white transition-all"
                                                            >
                                                                Ajouter
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                            <div className="text-center text-sm text-gray-500">
                                Vous pouvez ajouter jusqu'à 15 services simultanément
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
}