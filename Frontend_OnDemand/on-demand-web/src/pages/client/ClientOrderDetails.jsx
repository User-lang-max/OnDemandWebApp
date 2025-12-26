
'use client';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MapPin, User, CheckCircle, Clock, Loader2,
  ShieldCheck, Phone, MessageCircle, Calendar, FileText,
  CreditCard, Truck, Home, Wrench, Zap, Sparkles, AlertCircle,
  Star, Download, Share2, Navigation, 
  Award, Settings, XCircle, Banknote, Landmark,
  MoreVertical, CreditCard as CreditCardIcon , Package , Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection } from '../../components/ui/AnimatedSection';

// --- IMPORT DU COMPOSANT CARTE ---
import ActiveJobTracking from '../../components/ActiveJobTracking';

export default function ClientOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [timeline, setTimeline] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [processing, setProcessing] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await axiosClient.get(`/orders/${id}`);
      setJob(res.data);
      generateTimeline(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger la commande");
      navigate('/client/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    try {
      await axiosClient.post(`/orders/${id}/messages`, { content: newMessage });
      setNewMessage('');
      fetchJob(); 
      toast.success("Message envoyé");
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDownloadInvoice = async () => {
    const loadingToast = toast.loading("Génération de la facture...");
    try {
      const response = await axiosClient.get(`/orders/${id}/invoice`, {
        responseType: 'blob' 
      });
      
   
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Facture-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Facture téléchargée", { id: loadingToast });
    } catch (error) {
      console.error("Erreur download:", error);
      
      let errorMsg = "Facture indisponible pour le moment";

    
      if (error.response && error.response.data instanceof Blob) {
          try {
              const text = await error.response.data.text(); 
              console.error("CONTENU DE L'ERREUR SERVEUR :", text); 
              
           
              const json = JSON.parse(text);
              if (json.details) errorMsg = `Erreur: ${json.details}`;
              else if (json.message) errorMsg = json.message;
              else errorMsg = text; 
          } catch (e) {
            
              errorMsg = "Erreur serveur interne (500)";
          }
      }

      toast.error(errorMsg, { id: loadingToast, duration: 5000 });
    }
  };

  const handleConfirmPayment = async () => {
    if (!job) return;
    setProcessing(true);
    try {
      const fakeTransactionId = paymentMethod === 'Cash' ? null : `TXN-${Date.now()}`;
      await axiosClient.post('/payments/pay', {
        jobId: job.id,
        method: paymentMethod,
        transactionId: fakeTransactionId
      });

      if (paymentMethod === 'BankTransfer') {
        toast.success("Demande de virement enregistrée.");
      } else {
        toast.success("Paiement validé !");
      }
      setShowPaymentModal(false);
      fetchJob();
    } catch (error) {
      toast.error(error.response?.data || "Échec du paiement.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCallProvider = () => {
    if (job?.providerPhone) {
        window.location.href = `tel:${job.providerPhone}`;
    } else {
        toast.error("Numéro de téléphone non disponible");
    }
  };

  const handleOpenMap = () => {
    if (job?.address) {
        const encodedAddress = encodeURIComponent(job.address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    } else {
        toast.error("Adresse non disponible");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Commande ${job.serviceName}`,
                text: `Suivi de ma commande ${job.serviceName} sur OnDemandApp`,
                url: window.location.href,
            });
        } catch (error) {
            console.log('Partage annulé');
        }
    } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié !");
    }
  };

  const generateTimeline = (order) => {
    const timelineSteps = [
      { status: 1, title: 'Commande créée', description: 'Votre demande a été envoyée', icon: Package, color: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
      { status: 2, title: 'Acceptée', description: 'Un prestataire a accepté', icon: CheckCircle, color: 'bg-gradient-to-r from-teal-500 to-emerald-500' },
      { status: 7, title: 'Payée', description: 'Paiement confirmé', icon: CreditCardIcon, color: 'bg-gradient-to-r from-green-500 to-lime-500' },
      { status: 3, title: 'En cours', description: 'Intervention en cours', icon: Truck, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
      { status: 4, title: 'Terminée', description: 'Service réalisé', icon: Award, color: 'bg-gradient-to-r from-purple-500 to-pink-500' }
    ];

    const currentTimeline = [];
    const isCancelled = order.statusCode === 5 || order.statusCode === 6;

    if (isCancelled) {
         setTimeline([{ status: 5, title: 'Annulée', description: 'Commande annulée/refusée', icon: AlertCircle, color: 'bg-gradient-to-r from-red-500 to-rose-500', completed: true, current: true }]);
    } else {
        timelineSteps.forEach(step => {
            currentTimeline.push({
                ...step,
                completed: order.statusCode >= step.status,
                current: order.statusCode === step.status
            });
        });
        setTimeline(currentTimeline);
    }
  };

  const getServiceIcon = (serviceName) => {
    const icons = { 'Plomberie': Wrench, 'Électricité': Zap, 'Ménage': Sparkles, 'Jardinage': Home, 'Déménagement': Truck };
    for (const [key, Icon] of Object.entries(icons)) {
      if (serviceName?.toLowerCase().includes(key.toLowerCase())) return <Icon className="w-8 h-8 text-teal-600" />;
    }
    return <Package className="w-8 h-8 text-teal-600" />;
  };

  const getStatusInfo = (statusCode) => {
    const statusMap = {
      1: { label: 'En attente', color: 'bg-gradient-to-r from-yellow-100 to-amber-50 text-yellow-800 border-yellow-200', icon: Clock },
      2: { label: 'Acceptée', color: 'bg-gradient-to-r from-teal-100 to-emerald-50 text-teal-800 border-teal-200', icon: CheckCircle },
      7: { label: 'Payée', color: 'bg-gradient-to-r from-green-100 to-lime-50 text-green-800 border-green-200', icon: ShieldCheck },
      3: { label: 'En cours', color: 'bg-gradient-to-r from-blue-100 to-cyan-50 text-blue-800 border-blue-200', icon: Truck },
      4: { label: 'Terminée', color: 'bg-gradient-to-r from-purple-100 to-pink-50 text-purple-800 border-purple-200', icon: Award },
      5: { label: 'Annulée', color: 'bg-gradient-to-r from-red-100 to-rose-50 text-red-800 border-red-200', icon: AlertCircle },
      6: { label: 'Refusée', color: 'bg-gradient-to-r from-red-100 to-rose-50 text-red-800 border-red-200', icon: AlertCircle }
    };
    return statusMap[statusCode] || statusMap[1];
  };

  // On affiche le tracking si Accepté, Payé ou En Cours
  const showTracking = [2, 7, 3].includes(job?.statusCode);

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="animate-spin w-12 h-12 text-teal-600 mx-auto mb-6" />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-blue-600/20 rounded-full blur-xl" />
          </div>
          <p className="text-gray-600 font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(job.statusCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/client/orders')}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                      <span className="text-xs font-semibold">Commande #{id.slice(0, 8)}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${statusInfo.color} border`}>
                      <span className="text-xs font-semibold flex items-center gap-1.5">
                        <statusInfo.icon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {job.serviceName}
                  </h1>
                  <p className="text-teal-100/80 text-sm mt-1">Suivi détaillé de votre service</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleShare}
                  className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
                <button 
                  onClick={handleDownloadInvoice}
                  className="px-5 py-2.5 rounded-xl bg-white text-teal-700 font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Facture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Service Card */}
            <AnimatedSection>
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div className="flex items-start gap-5">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-2xl blur-lg" />
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                          {getServiceIcon(job.serviceName)}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {job.serviceName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.color} border font-semibold`}>
                            <statusInfo.icon className="w-4 h-4" />
                            <span className="text-sm">{statusInfo.label}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">
                              {new Date(job.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                        Montant total
                      </div>
                      <div className="text-4xl font-black text-teal-700">
                        {job.price}
                        <span className="text-xl font-bold text-gray-500 ml-1">MAD</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200/80">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                          <User className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            Prestataire
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {job.providerName || 'En attente'}
                          </div>
                        </div>
                      </div>
                      {job.providerName && (
                        <button 
                          onClick={() => setActiveTab('messages')}
                          className="w-full py-2.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Contacter
                        </button>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200/80">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            Adresse
                          </div>
                          <div className="text-sm font-bold text-gray-900 line-clamp-2" title={job.address}>
                            {job.address}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={handleOpenMap}
                        className="w-full py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        Itinéraire
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200/80">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                          <Settings className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            Détails
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {job.categoryName || 'Service'}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Référence:</span>
                          <span className="font-mono font-semibold">#{id.slice(0, 6)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <span className="font-semibold">{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 mb-6" id="tabs-section">
                    <div className="flex gap-6">
                      {['details', 'documents', 'messages'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`pb-3 px-1 text-sm font-semibold transition-colors relative ${
                            activeTab === tab
                              ? 'text-teal-700'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {tab === 'details' && 'Détails'}
                          {tab === 'documents' && 'Documents'}
                          {tab === 'messages' && 'Messages'}
                          {activeTab === tab && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    {activeTab === 'details' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-3">Description du service</h4>
                          <p className="text-gray-600 leading-relaxed text-sm">
                            {job.description || 'Service standard selon la catégorie sélectionnée.'}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-5 rounded-xl">
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                              Garanties incluses
                            </div>
                            <ul className="space-y-3">
                              {['Satisfaction 100%', 'Prestataires vérifiés', 'Support 24/7'].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                  <CheckCircle className="w-4 h-4 text-teal-500" />
                                  <span className="text-gray-700 text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-gray-50 p-5 rounded-xl">
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                              Informations pratiques
                            </div>
                            <ul className="space-y-3 text-sm">
                              <li className="flex items-center justify-between">
                                <span className="text-gray-600">Date création:</span>
                                <span className="font-semibold">{new Date(job.createdAt).toLocaleDateString()}</span>
                              </li>
                              {job.completedAt && (
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-600">Terminé le:</span>
                                    <span className="font-semibold">{new Date(job.completedAt).toLocaleDateString()}</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'documents' && (
                      <div className="space-y-3">
                        {job.documents && job.documents.length > 0 ? (
                            job.documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{doc.name || 'Document'}</div>
                                            <div className="text-xs text-gray-500">Document attaché</div>
                                        </div>
                                    </div>
                                    <button onClick={handleDownloadInvoice} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                                        <Download className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg flex flex-col items-center gap-3">
                                <FileText className="w-10 h-10 text-gray-300"/>
                                Aucun document attaché pour le moment.
                            </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'messages' && (
                      <div className="space-y-4">
                        {job.messages && job.messages.length > 0 ? (
                            job.messages.map((msg, idx) => (
                                <div key={idx} className={`p-4 rounded-xl ${
                                    msg.isMe
                                    ? 'bg-teal-50 border border-teal-100 ml-8' 
                                    : 'bg-gray-50 border border-gray-200 mr-8'
                                }`}>
                                    <div className="flex justify-between items-center mb-2">
                                    <div className="font-semibold text-gray-900">{msg.senderName}</div>
                                    <div className="text-xs text-gray-500">{new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                    <p className="text-gray-700 text-sm">{msg.content}</p>
                                </div>
                            ))
                        ) : (
                             <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
                                Aucune conversation. Écrivez un message ci-dessous pour démarrer.
                            </div>
                        )}
                        
                        <div className="flex gap-3 pt-4">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Écrivez votre message..."
                            disabled={sendingMsg}
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                          />
                          <button 
                            onClick={handleSendMessage}
                            disabled={sendingMsg}
                            className="px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {sendingMsg ? <Loader2 className="animate-spin w-5 h-5"/> : 'Envoyer'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Tracking Section Intégrée */}
            {showTracking && (
              <AnimatedSection delay={0.1}>
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Truck className="w-6 h-6 text-teal-600" />
                    Suivi en temps réel
                  </h3>
                  
                  {/* COMPOSANT CARTE INTERACTIF */}
                  <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
                      <ActiveJobTracking job={job} isProvider={false} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">Distance</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {job.distanceKm ? `${job.distanceKm.toFixed(1)} km` : '--'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-200/50">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">Statut GPS</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 animate-pulse">Actif</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <AnimatedSection delay={0.2}>
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Progression</h3>
                  <button 
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      {idx < timeline.length - 1 && (
                        <div className={`absolute left-5 top-10 w-0.5 h-12 ${
                          step.completed ? 'bg-gradient-to-b from-teal-500 to-blue-500' : 'bg-gray-200'
                        }`} />
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color} ${
                          step.completed
                            ? step.current
                              ? 'shadow-lg'
                              : 'opacity-80'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <step.icon className="w-5 h-5 text-white" />
                        </div>
                        
                        <div>
                          <div className={`font-semibold mb-1 ${
                            step.current ? 'text-teal-700' : step.completed ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.title}
                          </div>
                          <p className="text-xs text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Provider Rating */}
            {job.providerName && (
              <AnimatedSection delay={0.3}>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                  
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-6">Prestataire assigné</h3>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <User className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-2">{job.providerName}</div>
                        <div className="flex items-center gap-3">
                          <div className="flex">
                          {[...Array(5)].map((_, i) => (
  <Star
    key={i}
    className={`w-4 h-4 ${i < (job.providerRating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
  />
))}
                          </div>
                          <span className="text-gray-300 text-sm">{job.providerRating ? job.providerRating.toFixed(1) : '5.0'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={handleCallProvider}
                        className="py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Phone className="w-4 h-4"/> Appeler
                      </button>
                      <button 
                        onClick={() => setActiveTab('messages')}
                        className="py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <MessageCircle className="w-4 h-4"/> Message
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Quick Actions */}
            <AnimatedSection delay={0.4}>
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Actions rapides</h3>
                
                <div className="space-y-3">
                  {/* PAIEMENT */}
                  {job.statusCode === 2 && (
                    <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full py-3.5 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                        <CreditCard className="w-5 h-5" />
                        Payer {job.price} MAD
                    </button>
                  )}

                  <button 
                    onClick={handleDownloadInvoice}
                    className="w-full py-3 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 text-sm"
                  >
                    <FileText className="w-5 h-5" />
                    Télécharger la facture
                  </button>

                  <button 
                    onClick={() => window.open('mailto:support@ondemandapp.com?subject=Aide Commande', '_blank')}
                    className="w-full py-3 rounded-lg border-2 border-blue-200 text-blue-700 font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3 text-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contacter le support
                  </button>
                  
                  {job.statusCode === 4 && !job.hasReview && (
                    <button
                      onClick={() => navigate(`/client/orders/${id}/review`)}
                      className="w-full py-3 rounded-lg border-2 border-amber-200 text-amber-700 font-semibold hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 flex items-center justify-center gap-3 text-sm"
                    >
                      <Star className="w-5 h-5 fill-amber-400" />
                      Noter le service
                    </button>
                  )}
                  
                  <button 
                    onClick={() => window.open('mailto:support@ondemandapp.com?subject=Problème Commande', '_blank')}
                    className="w-full py-3 rounded-lg border-2 border-red-200 text-red-700 font-semibold hover:border-red-300 hover:bg-red-50 transition-all duration-300 text-sm"
                  >
                    Signaler un problème
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Stats Footer */}
        <AnimatedSection delay={0.6}>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Statut', value: statusInfo.label, icon: Clock, color: 'text-blue-600 bg-blue-50' },
              { label: 'Garantie', value: '30 jours', icon: ShieldCheck, color: 'text-green-600 bg-green-50' },
              { label: 'Support', value: '24/7', icon: Users, color: 'text-teal-600 bg-teal-50' },
              { label: 'Sécurité', value: '100%', icon: Award, color: 'text-purple-600 bg-purple-50' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && job && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200/80"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Paiement Sécurisé</h3>
                    <p className="text-teal-100/80 text-sm">Finalisez votre commande en toute sécurité</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/80">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Montant à régler
                    </p>
                    <div className="text-4xl font-black text-teal-700">
                      {job.price}
                      <span className="text-xl font-bold text-gray-500 ml-1">MAD</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Service</p>
                    <p className="text-base font-semibold text-gray-900">{job.serviceName}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-4">
                    Choisissez votre méthode de paiement
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Stripe', label: 'Carte Bancaire', icon: CreditCard, color: 'from-teal-500 to-teal-600' },
                      { id: 'PayPal', label: 'PayPal', icon: CreditCard, color: 'from-blue-500 to-blue-600' },
                      { id: 'Cash', label: 'Espèces', icon: Banknote, color: 'from-green-500 to-green-600' },
                      { id: 'BankTransfer', label: 'Virement', icon: Landmark, color: 'from-gray-600 to-gray-700' }
                    ].map(method => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                          paymentMethod === method.id
                            ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-teal-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                            <method.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{method.label}</p>
                            <p className="text-xs text-gray-500">
                              {method.id === 'Stripe' && 'Visa, Mastercard'}
                              {method.id === 'PayPal' && 'PayPal requis'}
                              {method.id === 'Cash' && 'Paiement sur place'}
                              {method.id === 'BankTransfer' && 'RIB disponible'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200/50 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">Paiement sécurisé</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Vos informations sont cryptées et protégées. Aucune donnée bancaire n'est stockée sur nos serveurs.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={processing}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" />
                        Traitement...
                      </span>
                    ) : (
                      `Payer ${job.price} MAD`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}