import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useSignalR } from '../../context/SignalRContext';
import toast from 'react-hot-toast';
import {
  Play, CheckSquare, MapPin, User, Clock, AlertTriangle, ArrowLeft, Loader2, ShieldCheck, Wallet, MessageCircle, Send, X, Phone
} from 'lucide-react';
import ActiveJobTracking from '../../components/ActiveJobTracking';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti'; 
import { useWindowSize } from 'react-use'; 

// --- COMPOSANT CHAT MODERNE ---
const ChatBox = ({ jobId, clientName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const { connection } = useSignalR();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axiosClient.get(`/chat/${jobId}`);
                setMessages(res.data);
                scrollToBottom();
            } catch (error) {
                console.error("Erreur chargement chat", error);
            }
        };
        if (jobId) fetchHistory();
    }, [jobId]);

    useEffect(() => {
        if (connection) {
            const handleReceiveMessage = (msg) => {
                if (msg.jobId === jobId && msg.sender !== 'me') {
                    setMessages(prev => [...prev, { ...msg, isMe: false }]);
                    scrollToBottom();
                }
            };
            connection.on("ReceiveMessage", handleReceiveMessage);
            return () => { connection.off("ReceiveMessage", handleReceiveMessage); };
        }
    }, [connection, jobId]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if(!input.trim()) return;

        const content = input;
        setInput(""); 
        setMessages(prev => [...prev, { content, isMe: true, sentAt: new Date() }]);
        scrollToBottom();

        try {
            await axiosClient.post('/chat', { jobId, content });
        } catch (error) {
            toast.error("Erreur d'envoi");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col h-[500px]"
        >
            {/* Header Chat */}
            <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {clientName ? clientName[0] : 'C'}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm leading-tight">{clientName}</h4>
                        <p className="text-xs text-green-600 font-medium">En ligne</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition">
                    <X size={20}/>
                </button>
            </div>
            
            {/* Zone Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                        <MessageCircle size={32} className="opacity-20"/>
                        <p className="text-xs">Démarrez la conversation avec le client</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                            msg.isMe 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Zone */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input 
                    className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    placeholder="Écrivez un message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button 
                    type="submit" 
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors shadow-md disabled:opacity-50 disabled:shadow-none" 
                    disabled={!input.trim()}
                >
                    <Send size={18} />
                </button>
            </form>
        </motion.div>
    );
};

// --- PAGE PRINCIPALE ---
export default function ProviderJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  
  // States UX
  const [showConfetti, setShowConfetti] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { width, height } = useWindowSize(); 

  const fetchJob = async () => {
    try {
      const res = await axiosClient.get(`/orders/${id}`);
      setJob(res.data);
    } catch (err) {
      toast.error("Erreur chargement");
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await axiosClient.post(`/orders/${id}/status`, { status: newStatus });
      toast.success("Statut mis à jour !");
      
      if (newStatus === 'completed') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 8000); 
      }
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data || "Action impossible");
    }
  };

  if (!job)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin text-teal-600 w-10 h-10" />
      </div>
    );

  const showTracking = job.statusCode === 2 || job.statusCode === 3 || job.statusCode === 7 || job.statusCode === 4;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-800">
      
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />}

      {/* Header Premium */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 pt-10 pb-24 px-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <button
                onClick={() => navigate('/provider')}
                className="mb-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm"
            >
                <ArrowLeft size={16} /> Retour au tableau de bord
            </button>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-blue-100 font-medium mb-1">
                        <Clock size={16} /> Commande #{job.id.substring(0, 8)}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{job.serviceName}</h1>
                </div>

                {/* Bouton Chat Flottant (si fermé) */}
                {!showChat && (
                    <button 
                        onClick={() => setShowChat(true)}
                        className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <MessageCircle size={20} /> Contacter le client
                    </button>
                )}
            </div>
          </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
            <div className="p-6 md:p-8">
                
                {/* Section Adresse */}
                <div className="flex items-start gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600 border border-teal-100 shadow-sm">
                        <MapPin size={28} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Adresse d'intervention</h3>
                        <p className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{job.address}</p>
                    </div>
                </div>

                <div className="h-px bg-gray-100 w-full mb-8"></div>

                {/* Section Infos Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Carte Client */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center gap-4 group hover:border-blue-200 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm font-bold text-lg border border-gray-100">
                            <User size={20} />
                        </div>
                        <div>
                            <span className="text-gray-400 text-xs font-bold uppercase block mb-0.5">Client</span>
                            <p className="font-bold text-gray-900 text-lg">{job.clientName}</p>
                        </div>
                    </div>
                    
                    {/* Carte Revenu */}
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-5 rounded-2xl border border-teal-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm border border-teal-50">
                                <Wallet size={22} />
                            </div>
                            <div>
                                <span className="text-teal-600/70 text-xs font-bold uppercase block mb-0.5">Revenu Net</span>
                                <p className="font-bold text-teal-800 text-2xl">{job.price} <span className="text-sm">MAD</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Actions (Logique Statut) */}
                <div className="space-y-4 mb-8">
                    
                    {/* EN ATTENTE PAIEMENT (StatusCode 2) */}
                    {job.statusCode === 2 && (
                        <div className="bg-amber-50 text-amber-800 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Paiement en attente</h3>
                                <p className="text-sm opacity-90 leading-relaxed">
                                    Le client n'a pas encore réglé la prestation. Ne commencez pas le travail avant la confirmation de paiement.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* PAYÉ / CONFIRMÉ (StatusCode 7) -> Action: Démarrer */}
                    {job.statusCode === 7 && (
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                            <p className="text-blue-800 font-medium mb-4">Le client a payé. Vous pouvez vous rendre sur place.</p>
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => updateStatus('in_progress')}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all"
                            >
                                <Play size={22} fill="currentColor" /> Confirmer mon arrivée (Démarrer)
                            </motion.button>
                        </div>
                    )}

                    {/* EN COURS (StatusCode 3 ou 4) -> Action: Terminer */}
                    {(job.statusCode === 3 || job.statusCode === 4) && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-center font-bold border border-blue-100 flex items-center justify-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                                Mission en cours d'exécution...
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => updateStatus('completed')}
                                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-3 transition-all"
                            >
                                <CheckSquare size={24} /> Marquer comme terminée
                            </motion.button>
                        </div>
                    )}

                    {/* TERMINÉ (StatusCode 5) */}
                    {job.statusCode === 5 && (
                        <div className="text-center bg-green-50 text-green-800 p-8 rounded-2xl border border-green-100">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-100">
                                <ShieldCheck size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Mission Accomplie !</h3>
                            <p className="text-green-700/80">Les fonds ont été débloqués vers votre portefeuille.</p>
                        </div>
                    )}
                </div>

                {/* Section Carte Tracking */}
                {showTracking && (
                    <div className="border-t border-gray-100 pt-8 mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><MapPin size={20}/></div>
                                <h3 className="font-bold text-lg text-gray-800">Localisation & Tracking</h3>
                            </div>
                            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">GPS Actif</span>
                        </div>
                        
                        <div className="bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 h-[400px] shadow-inner relative">
                            <ActiveJobTracking job={job} isProvider={true} />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
      </div>

      {/* MODAL CHAT */}
      <AnimatePresence>
        {showChat && (
            <ChatBox 
                jobId={job.id} 
                clientName={job.clientName} 
                onClose={() => setShowChat(false)} 
            />
        )}
      </AnimatePresence>

    </div>
  );
}