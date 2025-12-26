import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, Wrench, X, Save, Tag, Users, DollarSign, Filter } from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState({ name: '', category: '', avgPrice: '' });

 
  const categories = [
      "Services à domicile",
      "Beauté et bien-être",
      "Services automobiles"
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
        // Appel à l'endpoint existant dans AdminController
        const res = await axiosClient.get('/admin/services-stats');
        setServices(res.data);
    } catch(e) { toast.error("Erreur chargement catalogue"); } 
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
      e.preventDefault();
     
      toast.success("Service sauvegardé (Simulation)");
      setIsModalOpen(false);
      fetchServices(); 
  };

  const handleDelete = (id) => {
      if(confirm("Supprimer ce service du catalogue ?")) {
      
          setServices(prev => prev.filter(s => s.id !== id));
          toast.success("Service retiré");
      }
  };

  const openModal = (service = null) => {
      setCurrentService(service || { name: '', category: categories[0], avgPrice: '' });
      setIsModalOpen(true);
  };

  const filtered = services.filter(s => 
      (s.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === 'all' || s.category === filterCategory)
  );

  return (
    <div className="pb-12 bg-gray-50 min-h-screen font-sans">
      <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Catalogue Services</h1>
        <p className="text-gray-500 mt-1">Gérez les offres disponibles et les prix de référence.</p>
      </div>

      <div className="px-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 w-full md:w-auto flex-1">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition bg-gray-50 focus:bg-white"
                        placeholder="Rechercher (ex: Plombier)..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:border-teal-500 outline-none cursor-pointer hover:bg-gray-50"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                >
                    <option value="all">Toutes catégories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-200 transition text-sm"
            >
                <Plus size={18}/> Nouveau Service
            </button>
        </div>

        {/* Grid des Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((service, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <button onClick={() => openModal(service)} className="p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg"><Edit2 size={16}/></button>
                         <button onClick={() => handleDelete(service.id)} className="p-1.5 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg"><Trash2 size={16}/></button>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100 text-teal-600 rounded-xl flex items-center justify-center text-xl shadow-sm">
                 
                            {service.icon || <Wrench size={20}/>}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 line-clamp-1">{service.name}</h3>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mt-1">
                                <Tag size={10}/> {service.category}
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 py-3 border-t border-gray-100">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1"><Users size={12}/> Prestataires</p>
                            <p className="font-bold text-gray-800">{service.providers || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1"><DollarSign size={12}/> Prix Moyen</p>
                            <p className="font-bold text-teal-600">{service.avgPrice || 0} Dhs</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Modal Ajout/Edit */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-900">{currentService.id ? 'Modifier le service' : 'Ajouter au catalogue'}</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom du service</label>
                          <input 
                            required 
                            defaultValue={currentService.name} 
                            placeholder="Ex: Plombier Sanitaire"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Catégorie</label>
                          <select 
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium bg-white"
                            defaultValue={currentService.category}
                          >
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prix de base suggéré (MAD)</label>
                          <input 
                            type="number" 
                            required 
                            defaultValue={currentService.avgPrice} 
                            placeholder="150"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                          />
                      </div>
                      <div className="pt-4 flex justify-end gap-3 border-t border-gray-50 mt-4">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold text-sm">Annuler</button>
                          <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold text-sm shadow-md shadow-teal-100 flex items-center gap-2">
                              <Save size={16}/> Enregistrer
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}