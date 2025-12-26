// ClientOrdersPage.jsx - Version Compacte et Améliorée
'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Package, Clock, CheckCircle, XCircle, CreditCard, User,
  MapPin, AlertTriangle, ShieldCheck, Loader2, Banknote,
  Landmark, Star, MessageCircle, Filter, Search, Calendar,
  TrendingUp, ChevronRight, MoreVertical, Download, Eye,
  Repeat, Truck, Home, Wrench, Zap, Sparkles, Bell,
  ChevronDown, ExternalLink, FileText, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection } from '../../components/ui/AnimatedSection';

export default function ClientOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [processing, setProcessing] = useState(false);
  const [reviewJobId, setReviewJobId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'date_desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const statusOptions = [
    { value: 'all', label: 'Toutes', color: 'gray' },
    { value: 'pending', label: 'En attente', color: 'yellow' },
    { value: 'accepted', label: 'Acceptées', color: 'teal' },
    { value: 'paid', label: 'Payées', color: 'green' },
    { value: 'in_progress', label: 'En cours', color: 'blue' },
    { value: 'completed', label: 'Terminées', color: 'purple' },
    { value: 'cancelled', label: 'Annulées', color: 'red' }
  ];

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/orders/my');
      setOrders(res.data);
    } catch (error) {
      toast.error("Impossible de charger vos commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openPaymentModal = (order) => {
    setSelectedJob(order);
    setPaymentMethod('Stripe');
  };

  const handleConfirmPayment = async () => {
    if (!selectedJob) return;
    setProcessing(true);

    try {
      await axiosClient.post('/payments/pay', {
        jobId: selectedJob.id,
        method: paymentMethod,
        transactionId: paymentMethod === 'Cash' ? null : `TXN-${Date.now()}`
      });

      toast.success(paymentMethod === 'BankTransfer' 
        ? "Demande de virement enregistrée" 
        : "Paiement validé !"
      );

      setSelectedJob(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data || "Échec du paiement.");
    } finally {
      setProcessing(false);
    }
  };

  const submitReview = async () => {
    if (!comment.trim()) return toast.error("Merci de laisser un commentaire.");
    try {
      await axiosClient.post(`/orders/${reviewJobId}/review`, { rating, comment });
      toast.success("Avis envoyé ! Merci.");
      setReviewJobId(null);
      fetchOrders();
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'avis.");
    }
  };

  const getStatusBadge = (code, order) => {
    const getColor = (color) => {
      const colors = {
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
        teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
        green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
        red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
        gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
      };
      return colors[color] || colors.gray;
    };

    const statusMap = {
      1: { label: 'En attente', color: 'yellow', icon: Clock },
      2: { label: 'Acceptée', color: 'teal', icon: CheckCircle },
      7: { label: 'Payée', color: 'green', icon: ShieldCheck },
      3: { label: 'En cours', color: 'blue', icon: Truck },
      4: { label: 'Terminée', color: 'purple', icon: CheckCircle },
      5: { label: 'Annulée', color: 'red', icon: XCircle },
      6: { label: 'Refusée', color: 'red', icon: XCircle }
    };

    const status = statusMap[code] || statusMap[5];
    const color = getColor(status.color);
    const Icon = status.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${color.bg} ${color.text} ${color.border} border font-bold text-xs uppercase tracking-wider`}>
        <Icon size={12} />
        <span>{status.label}</span>
      </div>
    );
  };

  const getServiceIcon = (serviceName) => {
    const icons = {
      'Plomberie': Wrench,
      'Électricité': Zap,
      'Ménage': Sparkles,
      'Jardinage': Home,
      'Déménagement': Truck
    };
    
    for (const [key, Icon] of Object.entries(icons)) {
      if (serviceName?.toLowerCase().includes(key.toLowerCase())) {
        return <Icon size={18} className="text-teal-600" />;
      }
    }
    return <Package size={18} className="text-teal-600" />;
  };

  const filteredOrders = orders
    .filter(order => {
      if (filters.status !== 'all') {
        const statusMap = {
          'pending': [1],
          'accepted': [2],
          'paid': [7],
          'in_progress': [3],
          'completed': [4],
          'cancelled': [5, 6]
        };
        return statusMap[filters.status]?.includes(order.statusCode);
      }
      return true;
    })
    .filter(order => 
      order.serviceName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.providerName?.toLowerCase().includes(filters.search.toLowerCase())
    )
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_desc': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date_asc': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price_desc': return b.price - a.price;
        case 'price_asc': return a.price - b.price;
        default: return 0;
      }
    });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.statusCode === 1).length,
    inProgress: orders.filter(o => o.statusCode === 3).length,
    completed: orders.filter(o => o.statusCode === 4).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Compact */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mes Commandes</h1>
                <p className="text-teal-100/80 text-sm mt-1">Suivez l'ensemble de vos services</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/client')}
              className="px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 font-medium text-sm flex items-center gap-2"
            >
              <Sparkles size={16} />
              Nouvelle commande
            </button>
          </div>
          
          {/* Stats Compact */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { label: 'Total', value: stats.total, color: 'bg-white/10', icon: Package },
              { label: 'En attente', value: stats.pending, color: 'bg-yellow-500/20', icon: Clock },
              { label: 'En cours', value: stats.inProgress, color: 'bg-blue-500/20', icon: Truck },
              { label: 'Terminées', value: stats.completed, color: 'bg-green-500/20', icon: CheckCircle }
            ].map((stat, idx) => (
              <div key={idx} className={`px-4 py-3 rounded-lg ${stat.color} backdrop-blur-sm border border-white/10 flex items-center gap-3`}>
                <stat.icon size={18} className="text-white/90" />
                <div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-teal-100/80">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal (inchangé) */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Paiement Sécurisé</h3>
                    <p className="text-teal-100/80 text-sm">Finalisez votre commande en toute sécurité</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <XCircle size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Montant à régler
                    </p>
                    <div className="text-4xl font-black text-teal-700">
                      {selectedJob.price}
                      <span className="text-lg font-bold text-gray-500 ml-2">MAD</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Service</p>
                    <p className="text-lg font-bold text-gray-900">{selectedJob.serviceName}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-3">
                    Choisissez votre méthode de paiement
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Stripe', label: 'Carte', icon: CreditCard, color: 'from-teal-500 to-teal-600' },
                      { id: 'PayPal', label: 'PayPal', icon: CreditCard, color: 'from-blue-500 to-blue-600' },
                      { id: 'Cash', label: 'Espèces', icon: Banknote, color: 'from-green-500 to-green-600' },
                      { id: 'BankTransfer', label: 'Virement', icon: Landmark, color: 'from-gray-600 to-gray-700' }
                    ].map(method => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                          paymentMethod === method.id
                            ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-teal-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                            <method.icon size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{method.label}</p>
                            <p className="text-xs text-gray-500">
                              {method.id === 'Stripe' && 'Visa, Mastercard'}
                              {method.id === 'PayPal' && 'Compte PayPal'}
                              {method.id === 'Cash' && 'Paiement sur place'}
                              {method.id === 'BankTransfer' && 'Virement bancaire'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={20} className="text-teal-600" />
                    <p className="font-bold text-gray-900 text-sm">Paiement 100% sécurisé</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Vos informations de paiement sont cryptées et protégées.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={processing}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Traitement...
                      </span>
                    ) : (
                      `Payer ${selectedJob.price} MAD`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal Compact */}
      <AnimatePresence>
        {reviewJobId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-center mb-6 text-gray-900">
                Partagez votre expérience
              </h3>
              
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Décrivez votre expérience avec le prestataire..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-yellow-400 focus:outline-none resize-none text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setReviewJobId(null)}
                  className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={submitReview}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold shadow-md hover:shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 text-sm"
                >
                  Envoyer l'avis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section Compact */}
        <AnimatedSection>
          <div className="mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Compact */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      placeholder="Rechercher une commande..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-teal-600 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2.5 rounded-lg border-2 border-gray-200 hover:border-gray-300 bg-white flex items-center gap-2 text-sm font-medium"
                  >
                    <Filter size={16} />
                    Filtres
                    <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => setFilters({ status: 'all', search: '', sortBy: 'date_desc' })}
                    className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>

              {/* Expanded Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-100">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Statut
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => setFilters({...filters, status: option.value})}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                filters.status === option.value
                                  ? `bg-${option.color}-100 text-${option.color}-700 border border-${option.color}-200`
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Trier par
                        </label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-teal-600 focus:outline-none text-sm"
                        >
                          <option value="date_desc">Date (récent)</option>
                          <option value="date_asc">Date (ancien)</option>
                          <option value="price_desc">Prix (↓)</option>
                          <option value="price_asc">Prix (↑)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </AnimatedSection>

        {/* Orders List Compact */}
        <AnimatedSection delay={0.1}>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Package size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {orders.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                {orders.length === 0 
                  ? 'Commencez par trouver le service dont vous avez besoin'
                  : 'Ajustez vos filtres pour trouver ce que vous cherchez'
                }
              </p>
              {orders.length === 0 && (
                <button
                  onClick={() => navigate('/client')}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                >
                  Explorer les services
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -1 }}
                >
                  <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-teal-500 hover:shadow-lg transition-all duration-200 overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                        {/* Service Icon & Info */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                            {getServiceIcon(order.serviceName)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                                  {order.serviceName}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <div className="flex items-center gap-1.5">
                                    <User size={14} />
                                    <span className="font-medium">{order.providerName || 'En attente'}</span>
                                  </div>
                                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                                  <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    <span className="font-medium">
                                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {getStatusBadge(order.statusCode, order)}
                                <div className="text-2xl font-black text-gray-900 whitespace-nowrap">
                                  {order.price}
                                  <span className="text-sm font-bold text-gray-500 ml-1">MAD</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress Bar Compact */}
                            {[2, 7, 3].includes(order.statusCode) && (
                              <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Progression</span>
                                  <span>
                                    {order.statusCode === 2 ? '25%' : 
                                     order.statusCode === 7 ? '50%' : 
                                     order.statusCode === 3 ? '75%' : '100%'}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      order.statusCode === 2 ? 'w-1/4 bg-yellow-500' :
                                      order.statusCode === 7 ? 'w-1/2 bg-teal-500' :
                                      order.statusCode === 3 ? 'w-3/4 bg-blue-500' : 'w-full bg-green-500'
                                    }`}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {/* Quick Info Compact */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Référence</div>
                                <div className="font-mono font-bold text-gray-900 text-sm">#{order.id.slice(0, 8)}</div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Date</div>
                                <div className="font-bold text-gray-900 text-sm">
                                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Durée</div>
                                <div className="font-bold text-gray-900 text-sm">2-4h</div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Type</div>
                                <div className="font-bold text-gray-900 text-sm">Standard</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions Compact */}
                      <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-gray-100">
                        {/* Primary Actions */}
                        <div className="flex gap-3">
                          {/* Track/Chat Button */}
                          {order.statusCode !== 5 && order.statusCode !== 6 && (
                            <button
                              onClick={() => navigate(`/client/orders/${order.id}`)}
                              className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm"
                            >
                              <MessageCircle size={16} />
                              <span>Suivre</span>
                            </button>
                          )}

                          {/* Payment Button */}
                          {order.statusCode === 2 && (
                            <button
                              onClick={() => openPaymentModal(order)}
                              className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold shadow-md hover:shadow-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 text-sm"
                            >
                              <CreditCard size={16} />
                              <span>Payer</span>
                            </button>
                          )}

                          {/* Review Button */}
                          {order.statusCode === 4 && !order.hasReview && (
                            <button
                              onClick={() => {
                                setReviewJobId(order.id);
                                setRating(5);
                                setComment('');
                              }}
                              className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-md hover:shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 text-sm"
                            >
                              <Star size={16} fill="white" />
                              <span>Noter</span>
                            </button>
                          )}
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex gap-2 ml-auto">
                          <button 
                            onClick={() => navigate(`/client/orders/${order.id}`)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Détails"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Télécharger">
                            <Download size={16} className="text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Plus d'options">
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatedSection>

        {/* Stats & Tips Compact */}
        <AnimatedSection delay={0.2}>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tips Card */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-5 border border-teal-100">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Bell size={20} className="text-teal-600" />
                Conseils pratiques
              </h4>
              <ul className="space-y-2">
                {[
                  'Vérifiez les avis du prestataire',
                  'Communiquez clairement vos besoins',
                  'Demandez un devis détaillé',
                  'Notez après le service'
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle size={14} className="text-teal-500" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white">
              <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                <HelpCircle size={20} />
                Besoin d'aide ?
              </h4>
              <p className="text-gray-300 text-sm mb-4">Notre équipe support est disponible 7j/7</p>
              <div className="space-y-3">
                <button className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                  Contacter le support
                </button>
                <button className="w-full py-2.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-sm">
                  Consulter la FAQ
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h4>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/client')}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold hover:from-teal-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
                >
                  <Sparkles size={16} />
                  Nouvelle commande
                </button>
                <button className="w-full py-3 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm">
                  <Download size={16} />
                  Télécharger l'historique
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}