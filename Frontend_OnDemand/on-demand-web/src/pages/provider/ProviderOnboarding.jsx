import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { FileText, Image as ImageIcon, Calendar, Save, CheckCircle, ShieldCheck, Sparkles, UserCheck, Loader2, ChevronDown, ChevronRight, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProviderOnboarding() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [formData, setFormData] = useState({
      bio: '',
      interviewDate: '',
      photoUrl: '', 
      cvUrl: ''     
  });

 
  const [files, setFiles] = useState({
      photo: null,
      cv: null
  });

  const [categories, setCategories] = useState([]); 
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); 
  const [selectedServiceIds, setSelectedServiceIds] = useState([]); 
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
        try {
            const res = await axiosClient.get('/catalog/tree');
            setCategories(res.data);
        } catch (err) {
            toast.error("Erreur chargement catalogue");
        } finally {
            setLoadingCatalog(false);
        }
    };
    fetchTree();
  }, []);

  const toggleCategory = (catId) => {
      setSelectedCategoryIds(prev => 
          prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
      );
  };

  const toggleService = (serviceId) => {
      setSelectedServiceIds(prev => 
          prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
      );
  };

 
  const uploadFileToServer = async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
          const res = await axiosClient.post('/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          return res.data.url; 
      } catch (error) {
          console.error("Upload error", error);
          toast.error("Erreur lors de l'envoi du fichier");
          return null;
      }
  };

  const handleFileChange = async (e, type) => {
      const file = e.target.files[0];
      if (file) {
       
          setFiles(prev => ({ ...prev, [type]: file }));
          
         
          const toastId = toast.loading("Envoi du fichier...");
          const serverPath = await uploadFileToServer(file);
          
          if (serverPath) {
       
              setFormData(prev => ({ 
                  ...prev, 
                  [type === 'photo' ? 'photoUrl' : 'cvUrl']: serverPath 
              }));
              toast.success(`${type === 'photo' ? 'Photo' : 'CV'} reçu !`, { id: toastId });
          } else {
              toast.dismiss(toastId);
          }
      }
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
        toast.error("Veuillez sélectionner au moins un service.");
        return;
    }

    if (!formData.cvUrl || !formData.photoUrl) {
        toast.error("La photo et le CV sont obligatoires.");
        return;
    }

    const payload = {
        bio: formData.bio,
        interviewDate: formData.interviewDate ? new Date(formData.interviewDate).toISOString() : null,
        photoUrl: formData.photoUrl,
        cvUrl: formData.cvUrl,
        selectedServiceIds: selectedServiceIds
    };

    try {
        await axiosClient.post('/provider/onboarding', payload);
        toast.custom((t) => (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-green-100 p-6 rounded-2xl shadow-2xl max-w-md pointer-events-auto">
                <div className="flex items-center gap-3 font-bold text-xl mb-2 text-green-700">
                    <CheckCircle className="fill-green-100" size={28}/> Dossier Envoyé !
                </div>
                <p className="text-gray-600 mb-4">Candidature transmise. Attente de validation.</p>
                <button onClick={() => { toast.dismiss(t.id); logout(); }} className="bg-green-600 text-white px-4 py-3 rounded-xl font-bold w-full hover:bg-green-700 transition-colors">
                    Se déconnecter
                </button>
            </motion.div>
        ), { duration: Infinity });
    } catch (error) {
        toast.error("Erreur envoi dossier.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4 lg:p-8">
      <div className="bg-white max-w-6xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">
        
        {/* Colonne Gauche - Info */}
        <div className="lg:w-4/12 bg-gradient-to-br from-blue-600 to-teal-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 translate-y-16"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold mb-6 border border-white/30">
                    <Sparkles size={14} className="text-blue-200"/> Devenir Partenaire
                </div>
                <h1 className="text-4xl font-bold mb-4 leading-tight">Bienvenue, <br/>{user?.fullName} !</h1>
                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                    Sélectionnez vos domaines d'expertise pour configurer votre profil.
                </p>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                    <p className="text-sm font-bold mb-2 text-blue-100">Votre sélection :</p>
                    <div className="text-3xl font-bold text-white">{selectedServiceIds.length}</div>
                    <p className="text-xs text-blue-100">Services sélectionnés</p>
                </div>
            </div>
        </div>

        {/* Colonne Droite - Formulaire */}
        <div className="lg:w-8/12 p-8 lg:p-12 bg-white overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuration de votre profil</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. SÉLECTION HIÉRARCHIQUE */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Sélectionnez vos catégories et services <span className="text-red-500">*</span></label>
                    
                    {loadingCatalog ? (
                        <div className="flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin"/> Chargement...</div>
                    ) : (
                        <div className="space-y-4">
                            {categories.map(cat => {
                                const isCatOpen = selectedCategoryIds.includes(cat.id);
                                const servicesCheckedInCat = cat.services.filter(s => selectedServiceIds.includes(s.id)).length;
                                
                                return (
                                    <div key={cat.id} className={`border rounded-xl transition-all duration-300 ${isCatOpen ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <div 
                                            onClick={() => toggleCategory(cat.id)}
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">{cat.icon}</div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{cat.name}</h3>
                                                    {servicesCheckedInCat > 0 && (
                                                        <span className="text-xs font-bold text-blue-600">{servicesCheckedInCat} sélectionné(s)</span>
                                                    )}
                                                </div>
                                            </div>
                                            {isCatOpen ? <ChevronDown className="text-blue-500"/> : <ChevronRight className="text-gray-400"/>}
                                        </div>

                                        <AnimatePresence>
                                            {isCatOpen && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-blue-100/50 mt-2">
                                                        {cat.services.map(srv => {
                                                            const isSelected = selectedServiceIds.includes(srv.id);
                                                            return (
                                                                <div 
                                                                    key={srv.id}
                                                                    onClick={() => toggleService(srv.id)}
                                                                    className={`cursor-pointer p-3 rounded-lg flex items-center gap-3 border transition-all duration-200 ${isSelected ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                                                                >
                                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white border-white' : 'bg-gray-100 border-gray-300'}`}>
                                                                        {isSelected && <CheckCircle size={14} className="text-blue-600"/>}
                                                                    </div>
                                                                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                                                        {srv.name}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 2. BIO */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bio / Présentation</label>
                    <textarea 
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 resize-none transition-all"
                        rows="4"
                        placeholder="Décrivez votre expérience, vos qualifications..."
                        required
                        value={formData.bio}
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                    ></textarea>
                </div>

<div className="grid sm:grid-cols-2 gap-6">

    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Photo de profil <span className="text-red-500">*</span></label>
        
   
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all hover:bg-teal-50 ${files.photo ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}>
            <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'photo')}
            />
            
            <div className={`p-3 rounded-full mb-2 ${files.photo ? 'bg-teal-200 text-teal-800' : 'bg-gray-100 text-gray-500'}`}>
                <ImageIcon size={24} />
            </div>
            
            {files.photo ? (
                <span className="text-sm font-bold text-teal-700 break-all text-center">{files.photo.name}</span>
            ) : (
                <span className="text-sm text-gray-500">Cliquez pour ajouter une photo</span>
            )}
        </label>
    </div>

    {/* CV */}
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">CV (PDF) <span className="text-red-500">*</span></label>
        
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all hover:bg-teal-50 ${files.cv ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}>
            <input 
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'cv')}
            />
            
            <div className={`p-3 rounded-full mb-2 ${files.cv ? 'bg-teal-200 text-teal-800' : 'bg-gray-100 text-gray-500'}`}>
                <FileText size={24} />
            </div>
            
            {files.cv ? (
                <span className="text-sm font-bold text-teal-700 break-all text-center">{files.cv.name}</span>
            ) : (
                <span className="text-sm text-gray-500">Cliquez pour ajouter votre CV</span>
            )}
        </label>
    </div>
</div>

                {/* 4. DATE */}
                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Disponibilité Entretien</label>
                     <input 
                        type="datetime-local"
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 transition-all"
                        required
                        value={formData.interviewDate}
                        onChange={e => setFormData({...formData, interviewDate: e.target.value})}
                    />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl shadow-lg shadow-blue-200 transition-all duration-300 transform hover:-translate-y-0.5">
                    Envoyer ma candidature complète
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}