import { useState } from 'react';
import { Save, Lock, CreditCard, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    setLoading(true);

    setTimeout(() => {
        setLoading(false);
        toast.success("Configuration mise à jour !");
    }, 800);
  };

  return (
    <div className="pb-12 bg-gray-50 min-h-screen font-sans">
      <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Paramètres</h1>
        <p className="text-gray-500 mt-1">Configuration globale de la plateforme.</p>
      </div>

      <div className="px-8 relative z-20 max-w-4xl">
        
        {/* Section Commission */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="text-teal-600" size={20}/> Modèle Économique
                </h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Commission standard (%)</label>
                    <div className="relative">
                        <input type="number" defaultValue={15} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900"/>
                        <span className="absolute right-4 top-3 text-gray-400 font-bold">%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Prélevée sur chaque transaction réalisée.</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Frais de service fixes (MAD)</label>
                    <div className="relative">
                        <input type="number" defaultValue={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900"/>
                        <span className="absolute right-4 top-3 text-gray-400 font-bold">MAD</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Frais additionnels payés par le client.</p>
                </div>
            </div>
        </div>

        {/* Section Sécurité / Maintenance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Lock className="text-teal-600" size={20}/> Système
                </h2>
            </div>
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <p className="font-bold text-gray-900">Inscriptions Prestataires</p>
                        <p className="text-sm text-gray-500">Autoriser les nouvelles demandes d'inscription</p>
                    </div>
                    <button className="text-teal-600"><ToggleRight size={32}/></button>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-xl border transition ${maintenanceMode ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
                    <div>
                        <p className={`font-bold flex items-center gap-2 ${maintenanceMode ? 'text-orange-800' : 'text-gray-900'}`}>
                            {maintenanceMode && <AlertTriangle size={16}/>} Mode Maintenance
                        </p>
                        <p className="text-sm text-gray-500">Bloque l'accès à l'application pour tous les utilisateurs</p>
                    </div>
                    <button 
                        onClick={() => setMaintenanceMode(!maintenanceMode)} 
                        className={maintenanceMode ? "text-orange-500" : "text-gray-300"}
                    >
                        {maintenanceMode ? <ToggleRight size={32}/> : <ToggleLeft size={32}/>}
                    </button>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end">
            <button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 font-bold shadow-lg shadow-gray-200 transition disabled:opacity-70"
            >
                <Save size={18}/> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
        </div>

      </div>
    </div>
  );
}