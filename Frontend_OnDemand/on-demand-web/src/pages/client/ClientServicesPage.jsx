import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, User, Star, MapPin, DollarSign, Loader2, 
  SearchX, Clock, Shield, CheckCircle, Award, Zap,
  Filter, Sparkles, ChevronRight, Tag, Navigation2,
  BadgeCheck, TrendingUp, Users as UsersIcon, Crown,
  Home, Car, Heart, Scissors, Settings,
  Wrench, Droplets, Plug, Brush, Activity,
  Phone, Mail, Map, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientServicesPage() {
  const { id } = useParams(); // Category ID
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [negotiatingProvider, setNegotiatingProvider] = useState(null);
  const [offerPrice, setOfferPrice] = useState(0);


  const categoryData = [
    {
      id: 1,
      name: "Services à domicile",
      icon: "🏠",
      description: "Professionnels pour votre maison",
      color: "from-teal-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-teal-50 to-blue-50"
    },
    {
      id: 2,
      name: "Beauté et bien-être",
      icon: "💇",
      description: "Prenez soin de vous",
      color: "from-pink-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-pink-50 to-purple-50"
    },
    {
      id: 3,
      name: "Services automobiles",
      icon: "🚗",
      description: "Pour votre véhicule",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    }
  ];

  // Mapping des icônes pour les services
  const getServiceIcon = (serviceName) => {
    const iconMap = {
      'Plombier': Droplets,
      'Électricien': Zap,
      'Ménage': Home,
      'Peintre / bricoleur': Brush,
      'Jardinier': Scissors,
      'Technicien électroménager': Settings,
      'Coiffeur(se)': Scissors,
      'Esthéticien(ne)': Heart,
      'Masseur / masseuse': Activity,
      'Coach sportif': Award,
      'Nutritionniste': Activity,
      'Mécanicien à domicile': Wrench,
      'Lavage auto à domicile': Car,
      'Dépanneur / remorquage': Truck,
      'Chauffeur privé (VTC, taxi)': Car
    };
    return iconMap[serviceName] || Package;
  };

  const getServiceDescription = (serviceName) => {
    const descriptions = {
      'Plombier': 'Installation et réparation de plomberie',
      'Électricien': 'Installation électrique et dépannage',
      'Ménage': 'Nettoyage complet de votre habitation',
      'Peintre / bricoleur': 'Peinture et petits travaux',
      'Jardinier': 'Entretien de jardin et espace vert',
      'Technicien électroménager': 'Réparation d\'appareils ménagers',
      'Coiffeur(se)': 'Coupe, coloration et soins capillaires',
      'Esthéticien(ne)': 'Soins du visage, épilation, manucure',
      'Masseur / masseuse': 'Massages relaxants et thérapeutiques',
      'Coach sportif': 'Entraînement personnel et suivi sportif',
      'Nutritionniste': 'Conseils nutritionnels et diététiques',
      'Mécanicien à domicile': 'Réparation et entretien automobile',
      'Lavage auto à domicile': 'Nettoyage intérieur et extérieur',
      'Dépanneur / remorquage': 'Assistance et dépannage routier',
      'Chauffeur privé (VTC, taxi)': 'Transport avec chauffeur'
    };
    return descriptions[serviceName] || 'Service professionnel de qualité';
  };

  useEffect(() => {
    if (id) {
      // Si on a un ID, c'est qu'on est dans une catégorie spécifique
      const category = categoryData.find(cat => cat.id === parseInt(id));
      setSelectedCategory(category);
      
      // Charger les services de cette catégorie
      setLoading(true);
      axiosClient.get(`/catalog/categories/${id}/items`)
        .then(res => setServices(res.data))
        .catch(() => toast.error("Erreur chargement des services"))
        .finally(() => setLoading(false));
    } else {
      // Mode "sélection de catégorie"
      setCategories(categoryData);
      setLoading(false);
    }
  }, [id]);

  const handleSelectService = async (service) => {
    setSelectedService(service);
    setLoadingProviders(true);
    setProviders([]);

    try {
      console.log(`🔍 Recherche de prestataires pour: ${service.name}`);
      
      const res = await axiosClient.get(`/catalog/search`, {
        params: { serviceId: service.id }
      });

      console.log("✅ Prestataires trouvés:", res.data);
      setProviders(res.data);

      // Récupérer l'ID technique
      axiosClient.get(`/catalog/services/${service.id}`)
        .then(detailRes => {
          service.technicalId = detailRes.data.serviceId;
        })
        .catch(e => console.warn("ID technique non disponible", e));

    } catch (e) {
      console.error("ERREUR:", e);
      toast.error("Erreur lors de la recherche des prestataires.");
    } finally {
      setLoadingProviders(false);
    }
  };

  const openNegotiation = (provider) => {
    if (!user) {
      toast((t) => (
        <div className="flex flex-col gap-2 font-medium">
          <span>Vous devez être connecté pour commander.</span>
          <button 
            onClick={() => { toast.dismiss(t.id); navigate('/login'); }} 
            className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition"
          >
            Se connecter
          </button>
        </div>
      ), { icon: '🔒', duration: 4000 });
      return;
    }
    setNegotiatingProvider(provider);
    setOfferPrice(provider.basePrice);
  };

  const submitOrder = async () => {
    if (!negotiatingProvider || !selectedService) return;

    if (!selectedService.technicalId) {
      toast.error("Erreur technique: ID du service manquant. Veuillez réessayer.");
      return;
    }

    if (offerPrice < negotiatingProvider.basePrice * 0.5) {
      toast.error(`Offre trop basse ! Minimum : ${negotiatingProvider.basePrice * 0.5} MAD`);
      return;
    }

    const defaultPos = { lat: 33.5731, lng: -7.5898 };

    const placeOrder = async (lat, lng) => {
      try {
        await axiosClient.post('/orders', {
          serviceId: selectedService.technicalId,
          providerId: negotiatingProvider.providerId,
          price: parseFloat(offerPrice),
          address: `Position GPS (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
          lat: lat,
          lng: lng
        });
        toast.success("Commande envoyée au prestataire !");
        navigate('/client/orders');
      } catch (err) {
        toast.error(err.response?.data || "Erreur lors de la commande");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => placeOrder(pos.coords.latitude, pos.coords.longitude),
        () => {
          toast("Géolocalisation impossible, utilisation position par défaut", { icon: '📍' });
          placeOrder(defaultPos.lat, defaultPos.lng);
        }
      );
    } else {
      placeOrder(defaultPos.lat, defaultPos.lng);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-teal-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => {
                if (selectedService) {
                  setSelectedService(null);
                } else if (selectedCategory) {
                  setSelectedCategory(null);
                  navigate('/client/services');
                } else {
                  navigate('/client');
                }
              }} 
              className="group p-3 bg-white rounded-xl shadow-lg border border-gray-200/80 hover:border-teal-400 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-teal-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {!selectedCategory && (
                  <>
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20">
                      <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Catégories</span>
                    </div>
                  </>
                )}
                {selectedCategory && !selectedService && (
                  <>
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                      <span className="text-xs font-semibold text-pink-700 uppercase tracking-wider">Catégorie</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{selectedCategory.name}</span>
                  </>
                )}
                {selectedService && (
                  <>
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Service</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{selectedService.name}</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {selectedService 
                  ? selectedService.name 
                  : selectedCategory 
                    ? selectedCategory.name 
                    : "Choisissez une catégorie"}
              </h1>
              <p className="text-gray-500 mt-1">
                {selectedService 
                  ? "Sélectionnez un prestataire" 
                  : selectedCategory 
                    ? "Choisissez un service" 
                    : "Explorez nos catégories de services"}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          {!selectedService && (
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex items-center gap-2 ${!selectedCategory ? 'text-teal-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!selectedCategory ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Catégorie</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200" />
              <div className={`flex items-center gap-2 ${selectedCategory && !selectedService ? 'text-teal-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedCategory && !selectedService ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Service</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200" />
              <div className={`flex items-center gap-2 ${selectedService ? 'text-teal-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedService ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Prestataire</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Negotiation Modal */}
        <AnimatePresence>
          {negotiatingProvider && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200/80"
              >
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/80">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Proposition de prix</h3>
                      <p className="text-sm text-gray-500">Négociez avec {negotiatingProvider.name}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Prix initial</span>
                      <span className="text-lg font-bold text-teal-700">{negotiatingProvider.basePrice} MAD</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Votre offre (MAD)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        className="w-full text-4xl font-bold text-center bg-gray-50 border-2 border-gray-300 focus:border-teal-500 rounded-xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        min={negotiatingProvider.basePrice * 0.5}
                        step="10"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">MAD</span>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setOfferPrice(Math.round(negotiatingProvider.basePrice * 0.7))}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      >
                        -30%
                      </button>
                      <button
                        onClick={() => setOfferPrice(Math.round(negotiatingProvider.basePrice * 0.8))}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      >
                        -20%
                      </button>
                      <button
                        onClick={() => setOfferPrice(negotiatingProvider.basePrice)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      >
                        Prix complet
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200/50 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Protection d'achat</span>
                    </div>
                    <p className="text-xs text-amber-700">Votre paiement est sécurisé et vous pouvez annuler dans les 24h</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setNegotiatingProvider(null)}
                      className="flex-1 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={submitOrder}
                      className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-teal-700 hover:to-teal-600 transition-all"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ÉTAPE 1 : Sélection de catégorie */}
        {!selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category, idx) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <div 
                    onClick={() => navigate(`/client/category/${category.id}`, { 
                      state: { catName: category.name } 
                    })} 
                    className="relative bg-white rounded-2xl shadow-lg border border-gray-200/80 cursor-pointer overflow-hidden h-full hover:border-teal-400 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative p-6">
                      {/* Icon Container */}
                      <div className="mb-5">
                        <div className="relative w-20 h-20 mx-auto">
                          <div className={`absolute inset-0 ${category.bgColor.replace('bg-gradient-to-br', 'bg-gradient-to-br')} rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500`} />
                          <div className={`relative w-full h-full rounded-2xl ${category.bgColor} border border-gray-200 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                            {category.icon}
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-5">{category.description}</p>
                        
                        {/* Service Count */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 group-hover:bg-teal-100 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-600 group-hover:text-teal-700">
                            Voir les services
                          </span>
                          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-teal-600 group-hover:rotate-180 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ÉTAPE 2 : Sélection de service (quand catégorie choisie) */}
        {selectedCategory && !selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {services.map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group"
                  >
                    <div 
                      onClick={() => handleSelectService(service)} 
                      className="relative bg-white rounded-xl shadow-lg border border-gray-200/80 cursor-pointer overflow-hidden h-full hover:border-teal-400 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative p-5">
                        {/* Icon Container */}
                        <div className="mb-4">
                          <div className="relative w-14 h-14 mx-auto">
                            <div className={`absolute inset-0 ${selectedCategory.bgColor.replace('bg-gradient-to-br', 'bg-gradient-to-br')} rounded-xl blur-md group-hover:blur-lg transition-all duration-500`} />
                            <div className={`relative w-full h-full rounded-xl ${selectedCategory.bgColor} border border-gray-200 flex items-center justify-center text-2xl text-gray-700 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                              {service.icon}
                            </div>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2 text-sm">
                            {service.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                            {getServiceDescription(service.name)}
                          </p>
                          
                          {/* Arrow Indicator */}
                          <div className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium">
                            <span>Choisir</span>
                            <ArrowLeft className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ÉTAPE 3 : Liste des prestataires (quand service choisi) */}
        {selectedService && (
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200/80 bg-gradient-to-r from-gray-50/50 to-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">Prestataires disponibles</h2>
                      <span className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                        {providers.length}
                      </span>
                    </div>
                    <p className="text-gray-500">Sélectionnez un professionnel vérifié</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedService(null)} 
                      className="px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-teal-600" />
                    <span className="text-sm text-gray-600">Tous vérifiés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Disponible maintenant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Garantie incluse</span>
                  </div>
                </div>
              </div>
              
              {/* Providers Content */}
              <div className="p-6">
                {loadingProviders ? (
                  <div className="py-16 text-center">
                    <div className="inline-block relative">
                      <Loader2 className="animate-spin w-12 h-12 text-teal-600 mx-auto mb-6" />
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-blue-600/20 rounded-full blur-xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Recherche en cours</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Nous cherchons les meilleurs prestataires près de chez vous
                    </p>
                  </div>
                ) : providers.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="relative inline-block mb-8">
                      <SearchX className="w-20 h-20 text-gray-400" />
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full blur-xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun prestataire disponible</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                      Aucun prestataire n'est actuellement disponible pour ce service.
                      Veuillez réessayer plus tard ou choisir un autre service.
                    </p>
                    <button 
                      onClick={() => setSelectedService(null)} 
                      className="px-8 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold hover:from-teal-700 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Retour aux services
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {providers.map((p, idx) => (
                      <motion.div
                        key={p.providerId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -2 }}
                        className="group"
                      >
                        <div className="bg-white border border-gray-200/80 rounded-xl p-5 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                            {/* Provider Info */}
                            <div className="flex items-start gap-4 flex-1">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-xl blur group-hover:blur-md transition-all duration-500" />
                                <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                  <User className="w-8 h-8 text-teal-700" />
                                </div>
                                
                                {/* Verified Badge */}
                                {p.rating > 4.5 && (
                                  <div className="absolute -top-2 -right-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
                                      <Crown className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                                  <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                    <Shield className="w-3 h-3" />
                                    Vérifié
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  {/* Rating */}
                                  <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full">
                                    <Star className="w-4 h-4 fill-amber-400" />
                                    <span className="font-semibold">{p.rating}</span>
                                    <span className="text-amber-600">/5</span>
                                  </div>
                                  
                                  {/* Distance */}
                                  <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                                    <Navigation2 className="w-4 h-4" />
                                    <span className="font-semibold">{p.distanceKm} km</span>
                                  </div>
                                  
                                  {/* Reviews */}
                                  <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="font-semibold">50+ avis</span>
                                  </div>
                                </div>
                                
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                    Professionnel
                                  </span>
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                    Réponse rapide
                                  </span>
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                    Matériel inclus
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Price & Action */}
                            <div className="lg:w-48 flex flex-col gap-4">
                              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200/80">
                                <p className="text-xs text-gray-500 font-medium mb-1">À partir de</p>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-3xl font-bold text-gray-900">{p.basePrice}</span>
                                  <span className="text-gray-500 font-medium">MAD</span>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => openNegotiation(p)} 
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold hover:from-teal-700 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                              >
                                <DollarSign className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                Commander
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Info Section */}
        {!selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20" />
              </div>
              
              <div className="relative z-10">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Shield className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Garantie Satisfait</h3>
                      <p className="text-teal-100/80 text-sm">Service garanti ou remboursé sous 30 jours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Experts Vérifiés</h3>
                      <p className="text-teal-100/80 text-sm">Certifications vérifiées et expérience validée</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Zap className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Réservation Express</h3>
                      <p className="text-teal-100/80 text-sm">Service réservé en moins de 2 minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}