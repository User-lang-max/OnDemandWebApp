'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { 
  Search, MapPin, Star, ArrowRight, Sparkles, Quote, X, 
  ChevronRight, CheckCircle, User, Shield, Clock, Award, 
  Phone, Mail, Map, Facebook, Twitter, Instagram, Linkedin,
  Heart, ArrowUpRight, Users, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../../components/ui/AnimatedSection';

export default function ClientHome() {
  const navigate = useNavigate();
  
  // Données
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [catRes, recRes, revRes] = await Promise.all([
          axiosClient.get('/catalog/categories').catch(() => ({ data: [] })),
          axiosClient.get('/recommendations').catch(() => ({ data: [] })),
          axiosClient.get('/recommendations/reviews').catch(() => ({ data: [] }))
        ]);

        setCategories(catRes.data);
        setRecommendations(recRes.data);
        setReviews(revRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axiosClient.get(`/catalog/search-items?q=${searchQuery}`);
      setSearchResults(res.data);
      if (res.data.length === 0) toast("Aucun service trouvé pour cette recherche.");
    } catch (error) {
      toast.error("Erreur recherche");
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const goToService = (categoryId, item) => {
    navigate(`/client/category/${categoryId}`, { state: { catName: item.categoryName } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* HERO SECTION - Taille réduite */}
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0 bg-grid-white/5 bg-[size:16px_16px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <AnimatedSection>
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                  <Sparkles size={14} className="text-teal-200" />
                  <span className="text-xs font-medium text-teal-100">Service à la demande</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  Des prestations{' '}
                  <span className="relative">
                    <span className="relative z-10 bg-gradient-to-r from-teal-200 to-white bg-clip-text text-transparent">d'excellence</span>
                    <span className="absolute bottom-1 left-0 w-full h-2 bg-teal-400/30 -rotate-1 z-0" />
                  </span>
                  {' '}à portée de main
                </h1>
                
                <p className="text-lg text-teal-100/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Trouvez le professionnel parfait pour chaque projet. Simple, rapide et sécurisé.
                </p>
              </motion.div>

              {/* Search Bar - Taille réduite */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative max-w-2xl mx-auto"
              >
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Que recherchez-vous ? (ex: Plombier, Électricien, Ménage...)"
                    className="w-full pl-12 pr-10 py-4 rounded-xl bg-white/95 text-gray-800 text-base outline-none focus:ring-3 focus:ring-teal-500/30 shadow-xl font-medium border border-white/30"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </form>
                
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {['Plombier', 'Électricien', 'Ménage', 'Jardinage', 'Déménagement'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-xs font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* STATS SECTION - Plus compacte */}
      <div className="relative -mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: '250+', label: 'Prestataires experts', icon: Users, color: 'from-teal-500 to-teal-600' },
                { value: '80+', label: 'Services disponibles', icon: Award, color: 'from-blue-500 to-blue-600' },
                { value: '3500+', label: 'Clients satisfaits', icon: Heart, color: 'from-purple-500 to-purple-600' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 relative z-10">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon size={22} className="text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* RÉSULTATS DE RECHERCHE - Plus compact */}
        {isSearching && (
          <AnimatedSection>
            <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Résultats de recherche</h2>
                    <p className="text-gray-600 text-sm mt-1">{searchResults.length} service(s) trouvé(s) pour "{searchQuery}"</p>
                  </div>
                  <button 
                    onClick={clearSearch}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                      <p className="text-gray-600 text-sm">Essayez avec d'autres termes de recherche</p>
                    </div>
                  ) : (
                    searchResults.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.01, x: 3 }}
                        className="group"
                      >
                        <div 
                          onClick={() => goToService(item.categoryId, item)}
                          className="p-4 rounded-lg border border-gray-100 bg-white hover:border-teal-500 hover:shadow-lg transition-all duration-300 flex items-center gap-4 cursor-pointer"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-2xl text-teal-700 group-hover:scale-105 transition-transform duration-300 shadow">
                              {item.icon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-bold text-gray-900 truncate">{item.name}</h3>
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-full flex-shrink-0">
                                <ArrowUpRight size={12} /> Détails
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {item.description || 'Service professionnel de qualité'}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700">
                                {item.categoryName}
                              </span>
                              {item.rating && (
                                <span className="inline-flex items-center text-gray-700 text-sm">
                                  <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1" />
                                  <span className="font-bold">{item.rating}</span>
                                  <span className="text-gray-500 ml-0.5">/5</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* CATÉGORIES - Grille plus dense */}
        {!isSearching && (
          <AnimatedSection delay={0.1}>
            <div className="mb-16">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-block mb-6"
                >
                  <div className="relative">
                    <div className="absolute -inset-3 bg-gradient-to-r from-teal-500/20 to-blue-500/20 blur-2xl rounded-full" />
                    <div className="relative px-4 py-2 bg-white rounded-full border border-gray-200 shadow">
                      <span className="text-xs font-medium text-gray-700">Sélectionnez votre besoin</span>
                    </div>
                  </div>
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Des solutions pour{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10">chaque projet</span>
                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8">
                      <path 
                        d="M0,4 Q50,0 100,4 T200,4" 
                        fill="none" 
                        stroke="url(#gradient)" 
                        strokeWidth="2"
                        className="animate-draw"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0d9488" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h2>
                <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
                  Trouvez l'expert parfait pour transformer vos idées en réalité
                </p>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-64" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat, idx) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: idx * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      whileHover={{ 
                        y: -8,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 400, damping: 25 }
                      }}
                    >
                      <div
                        onClick={() => navigate(`/client/category/${cat.id}`, { state: { catName: cat.name } })}
                        className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
                      >
                        <div className="p-6">
                          {/* Icon */}
                          <div className="mb-6">
                            <div className="relative w-16 h-16">
                              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                              <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100 flex items-center justify-center text-2xl text-teal-700 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
                                {cat.icon || '🏠'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-1">
                                {cat.name}
                              </h3>
                              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                {cat.description || 'Service professionnel avec garantie de satisfaction'}
                              </p>
                            </div>
                            
                            {/* Features */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-teal-50 flex items-center justify-center">
                                  <Check size={12} className="text-teal-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Experts vérifiés</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
                                  <Shield size={12} className="text-blue-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Garantie incluse</span>
                              </div>
                            </div>
                            
                            {/* Stats & CTA */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="text-center">
                                  <div className="text-base font-bold text-gray-900">{cat.providerCount || '15+'}</div>
                                  <div className="text-xs text-gray-500">Experts</div>
                                </div>
                                <div className="w-px h-6 bg-gray-200" />
                                <div className="text-center">
                                  <div className="text-base font-bold text-gray-900">{cat.itemCount || '50+'}</div>
                                  <div className="text-xs text-gray-500">Services</div>
                                </div>
                              </div>
                              
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                                <div className="relative w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-blue-600 flex items-center justify-center transition-all duration-300">
                                  <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* CTA Section - Plus petite */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mt-12"
              >
                <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-100 shadow">
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Vous ne trouvez pas votre service ?</h3>
                    <p className="text-gray-600 text-sm">Notre équipe peut vous aider à trouver la solution parfaite</p>
                  </div>
                  <button 
                    onClick={() => navigate('/client/contact')}
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-300 shadow hover:shadow-md whitespace-nowrap text-sm"
                  >
                    Demander un devis
                  </button>
                </div>
              </motion.div>
            </div>
          </AnimatedSection>
        )}

        {/* SERVICES POPULAIRES - Plus compact */}
        {!isSearching && (
          <AnimatedSection delay={0.2}>
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700 text-sm font-medium mb-3">
                    <Star size={14} fill="currentColor" /> Tendance
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Services les Plus Demandés</h2>
                  <p className="text-gray-600 mt-2">Découvrez les services préférés de notre communauté</p>
                </div>
                <button 
                  onClick={() => navigate('/client/services')}
                  className="hidden lg:flex items-center gap-2 px-5 py-3 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all duration-300 shadow hover:shadow-lg text-sm"
                >
                  Voir tous les services
                  <ArrowRight size={16} />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.length === 0 ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
                  ))
                ) : (
                  recommendations.slice(0, 6).map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, y: -3 }}
                    >
                      <div 
                        onClick={() => goToService(item.categoryId, item)}
                        className="group p-5 rounded-xl border border-gray-100 bg-white hover:border-teal-400 hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-xl text-teal-700 group-hover:scale-105 transition-transform duration-300">
                            {item.icon}
                          </div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-white uppercase tracking-wider shadow">
                            POPULAIRE
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.description || 'Service professionnel de haute qualité avec des prestataires vérifiés.'}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                            {item.categoryName}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-gray-50 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                              <ArrowRight size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="text-center mt-8 lg:hidden">
                <button 
                  onClick={() => navigate('/client/services')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all duration-300 shadow hover:shadow-lg text-sm"
                >
                  Découvrir tous les services
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* COMMENT ÇA MARCHE - Plus compact */}
        {!isSearching && (
          <AnimatedSection delay={0.3}>
            <div className="mb-16">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm font-medium mb-4">
                  <Check size={14} /> Simple & Rapide
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Comment Ça Marche ?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  En 4 étapes simples, obtenez le service dont vous avez besoin
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: '01',
                    title: 'Recherchez',
                    description: 'Trouvez le service qui correspond à vos besoins',
                    icon: Search,
                    color: 'from-teal-500 to-teal-600'
                  },
                  {
                    step: '02',
                    title: 'Comparez',
                    description: 'Consultez les profils et avis des prestataires',
                    icon: Users,
                    color: 'from-blue-500 to-blue-600'
                  },
                  {
                    step: '03',
                    title: 'Réservez',
                    description: 'Choisissez le prestataire et réservez en ligne',
                    icon: CheckCircle,
                    color: 'from-purple-500 to-purple-600'
                  },
                  {
                    step: '04',
                    title: 'Profitez',
                    description: 'Recevez un service de qualité et donnez votre avis',
                    icon: Award,
                    color: 'from-pink-500 to-pink-600'
                  }
                ].map((step, idx) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    className="relative"
                  >
                    <div className="bg-white rounded-xl p-5 shadow border border-gray-100 h-full">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-center mb-4`}>
                        <step.icon size={22} className="text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* AVIS CLIENTS - Plus compact */}
        {!isSearching && (
          <AnimatedSection delay={0.4}>
            <div className="relative overflow-hidden rounded-2xl mb-16">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
              <div className="relative p-8 lg:p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-4">
                    <Quote size={14} /> Témoignages
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Ce Que Disent Nos Clients</h2>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Découvrez les expériences de ceux qui nous font confiance
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.length === 0 ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-64 animate-pulse" />
                    ))
                  ) : (
                    reviews.slice(0, 3).map((rev, idx) => (
                      <motion.div
                        key={rev.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, y: -3 }}
                      >
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 h-full hover:bg-white/15 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  size={16}
                                  className={i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-400 text-gray-400'}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-300 font-medium">
                              {new Date(rev.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          <p className="text-white/90 text-sm italic mb-6 leading-relaxed line-clamp-4">
                            "{rev.comment}"
                          </p>
                          
                          <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                              <User size={18} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-sm truncate">{rev.clientName}</p>
                              <p className="text-xs text-gray-300 truncate">{rev.serviceName}</p>
                            </div>
                            <CheckCircle size={16} className="text-teal-300" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                <div className="text-center mt-8">
                  <button 
                    onClick={() => navigate('/client/reviews')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                  >
                    Lire tous les avis
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* ABOUT US SECTION - Plus compact */}
        {!isSearching && (
          <AnimatedSection delay={0.5}>
            <div className="mb-16">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700 text-sm font-medium mb-4">
                    <Sparkles size={14} /> À propos de nous
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Votre Partenaire de Confiance pour Tous Vos Services
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Depuis 2020, nous connectons particuliers et entreprises avec des prestataires qualifiés et vérifiés. 
                    Notre mission est de simplifier l'accès aux services professionnels tout en garantissant qualité et sécurité.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {[
                      { icon: Shield, title: 'Garantie Satisfaction', desc: 'Service 100% satisfait ou remboursé' },
                      { icon: Users, title: 'Prestataires Vérifiés', desc: 'Tous nos experts sont certifiés' },
                      { icon: Clock, title: 'Disponible 24/7', desc: 'Support client toujours disponible' },
                      { icon: Award, title: 'Prix Transparents', desc: 'Pas de frais cachés' }
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <feature.icon size={20} className="text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h4>
                          <p className="text-xs text-gray-600">{feature.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => navigate('/client/about')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 shadow hover:shadow-lg text-sm"
                  >
                    En savoir plus sur nous
                    <ArrowRight size={16} />
                  </button>
                </div>
                
                <div className="relative">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-3">
                      <div className="h-32 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 p-4 flex flex-col justify-end">
                        <Shield size={24} className="text-white mb-2" />
                        <p className="text-white font-bold text-sm">Sécurité Maximale</p>
                      </div>
                      <div className="h-32 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 flex flex-col justify-end">
                        <Users size={24} className="text-white mb-2" />
                        <p className="text-white font-bold text-sm">Communauté Active</p>
                      </div>
                    </div>
                    <div className="space-y-3 mt-6">
                      <div className="h-32 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 flex flex-col justify-end">
                        <Award size={24} className="text-white mb-2" />
                        <p className="text-white font-bold text-sm">Qualité Certifiée</p>
                      </div>
                      <div className="h-32 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-4 flex flex-col justify-end">
                        <Heart size={24} className="text-white mb-2" />
                        <p className="text-white font-bold text-sm">Satisfaction Garantie</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* GET IN TOUCH - Plus compact */}
        {!isSearching && (
          <AnimatedSection delay={0.6}>
            <div className="relative overflow-hidden rounded-2xl mb-16">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800" />
              <div className="relative p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-4">
                      <Phone size={14} /> Contactez-nous
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Besoin d'Aide ?</h2>
                    <p className="text-teal-100/90 mb-6 leading-relaxed">
                      Notre équipe est là pour vous accompagner à chaque étape. 
                      N'hésitez pas à nous contacter pour toute question ou assistance.
                    </p>
                    
                    <div className="space-y-4">
                      {[
                        { icon: Phone, text: '+212 5 00 00 00 00', label: 'Téléphone' },
                        { icon: Mail, text: 'contact@ondemand.ma', label: 'Email' },
                        { icon: Map, text: 'Casablanca, Maroc', label: 'Adresse' }
                      ].map((contact, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <contact.icon size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-teal-200">{contact.label}</p>
                            <p className="text-sm font-bold text-white">{contact.text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Envoyez-nous un message</h3>
                    <form className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-teal-100 mb-1">Nom complet</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-teal-200/50 outline-none focus:ring-1 focus:ring-white/30 text-sm"
                            placeholder="Votre nom"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-teal-100 mb-1">Email</label>
                          <input 
                            type="email" 
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-teal-200/50 outline-none focus:ring-1 focus:ring-white/30 text-sm"
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-teal-100 mb-1">Message</label>
                        <textarea 
                          rows="3"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-teal-200/50 outline-none focus:ring-1 focus:ring-white/30 resize-none text-sm"
                          placeholder="Votre message..."
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 rounded-lg bg-white text-teal-700 font-bold hover:bg-gray-50 transition-all duration-300 shadow hover:shadow-md text-sm"
                      >
                        Envoyer le message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>

      {/* FOOTER - Plus compact */}
      {!isSearching && (
        <footer className="bg-gray-900 text-white pt-12 pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <span className="text-lg font-bold">OnDemand</span>
                </div>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Votre plateforme de confiance pour tous les services à la demande. 
                  Qualité, sécurité et satisfaction garanties.
                </p>
                <div className="flex gap-2">
                  {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                    <motion.a
                      key={idx}
                      href="#"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="w-8 h-8 rounded-md bg-gray-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
                    >
                      <Icon size={16} />
                    </motion.a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold mb-4">Services</h4>
                <ul className="space-y-2">
                  {['Plomberie', 'Électricité', 'Ménage', 'Jardinage', 'Déménagement', 'Tous les services'].map((service) => (
                    <li key={service}>
                      <a href="#" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{service}</a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold mb-4">Entreprise</h4>
                <ul className="space-y-2">
                  {['À propos', 'Carrières', 'Blog', 'Presse', 'Partenaires', 'Devenir prestataire'].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold mb-4">Légal</h4>
                <ul className="space-y-2">
                  {['CGU', 'Politique de confidentialité', 'Cookies', 'Mentions légales', 'Conditions de vente'].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-400 text-xs">
                  © {new Date().getFullYear()} OnDemand. Tous droits réservés.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-gray-400 hover:text-teal-400 text-xs transition-colors">Sitemap</a>
                  <a href="#" className="text-gray-400 hover:text-teal-400 text-xs transition-colors">FAQ</a>
                  <a href="#" className="text-gray-400 hover:text-teal-400 text-xs transition-colors">Support</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}