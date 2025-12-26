import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Layers, Plus, ChevronRight, Edit3, Trash } from 'lucide-react';

export default function AdminCatalog() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
    axiosClient.get('/catalog/tree')
      .then(res => setCategories(res.data))
      .catch(() => toast.error("Erreur catalogue"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12">
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 pb-20 pt-10 px-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">Catalogue</h1>
        <p className="text-teal-100">Organisation des catégories et métiers.</p>
      </div>

      <div className="px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Layers className="text-teal-600"/> Structure du Catalogue
                </h2>
                <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition">
                    <Plus size={16}/> Nouvelle Catégorie
                </button>
            </div>

            <div className="space-y-4">
                {categories.map(cat => (
                    <div key={cat.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{cat.icon}</span>
                                <span className="font-bold text-gray-800">{cat.name}</span>
                                <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
                                    {cat.services?.length || 0} services
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white rounded-lg text-gray-500"><Edit3 size={16}/></button>
                            </div>
                        </div>
                        {/* Sous-services */}
                        {cat.services && cat.services.length > 0 && (
                            <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {cat.services.map(srv => (
                                    <div key={srv.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-teal-200 transition group">
                                        <span className="text-sm font-medium text-gray-700">{srv.name}</span>
                                        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                            <button className="text-blue-500 p-1"><Edit3 size={14}/></button>
                                            <button className="text-red-500 p-1"><Trash size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                                <button className="flex items-center justify-center p-3 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-teal-600 hover:border-teal-300 text-sm transition">
                                    <Plus size={16} className="mr-1"/> Ajouter un service
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}