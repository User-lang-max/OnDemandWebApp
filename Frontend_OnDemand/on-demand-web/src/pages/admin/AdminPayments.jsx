import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { DollarSign, Search, Download, Eye, CheckCircle, XCircle, Clock, CreditCard, X, Printer, ArrowUpRight } from 'lucide-react';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axiosClient.get('/admin/payments');
      setPayments(res.data);
    } catch (error) {
      toast.error("Impossible de charger les paiements.");
    } finally {
      setLoading(false);
    }
  };

  // Stats rapides
  const totalRevenue = payments.filter(p => p.status === 'captured' || p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const successCount = payments.filter(p => p.status === 'captured' || p.status === 'paid').length;

  const filtered = payments.filter(p => 
    p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-12 bg-gray-50 min-h-screen font-sans">
      <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Paiements</h1>
         <div className="flex gap-6 mt-6">
             <div className="bg-teal-50 border border-teal-100 px-4 py-3 rounded-xl flex items-center gap-3">
                 <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><DollarSign size={20}/></div>
                 <div>
                     <p className="text-xs font-bold text-gray-500 uppercase">Total Revenu</p>
                     <p className="text-xl font-bold text-gray-900">{totalRevenue.toLocaleString()} MAD</p>
                 </div>
             </div>
             <div className="bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl flex items-center gap-3">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CheckCircle size={20}/></div>
                 <div>
                     <p className="text-xs font-bold text-gray-500 uppercase">Transactions</p>
                     <p className="text-xl font-bold text-gray-900">{successCount}</p>
                 </div>
             </div>
         </div>
      </div>

      <div className="px-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher une transaction..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-bold hover:bg-gray-50 transition shadow-sm">
                    <Download size={16}/> Exporter CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white border-b border-gray-200 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Transaction</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Montant</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Détails</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(payment => (
                            <tr key={payment.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-gray-100 rounded text-gray-500"><CreditCard size={14}/></div>
                                        <span className="font-mono text-xs text-gray-600">{payment.transactionId || payment.id.substring(0,8)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 text-sm">{payment.client?.name}</div>
                                    <div className="text-xs text-gray-500">{payment.service}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900">{payment.amount} <span className="text-gray-400 text-xs">MAD</span></span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                                        (payment.status === 'captured' || payment.status === 'paid') ? 'bg-green-50 text-green-700 border-green-100' :
                                        payment.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                    }`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                    {new Date(payment.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setSelectedPayment(payment)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition">
                                        <Eye size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* MODAL RECU */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                <button onClick={() => setSelectedPayment(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24}/>
                </button>

                <div className="p-8 text-center border-b border-gray-100 border-dashed">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={24}/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPayment.amount}.00 MAD</h2>
                    <p className="text-gray-500 text-sm mt-1">Payé avec succès</p>
                    <p className="text-xs text-gray-400 mt-2 font-mono">{selectedPayment.transactionId}</p>
                </div>

                <div className="p-6 space-y-4 bg-gray-50/50">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Client</span>
                        <span className="font-bold text-gray-900">{selectedPayment.client?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Service</span>
                        <span className="font-bold text-gray-900">{selectedPayment.service}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="font-bold text-gray-900">{new Date(selectedPayment.date).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Méthode</span>
                        <span className="font-bold text-gray-900 uppercase flex items-center gap-1">
                            <CreditCard size={14}/> {selectedPayment.method || 'Carte'}
                        </span>
                    </div>
                </div>

                <div className="p-4 flex gap-3">
                     <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                        <Printer size={16}/> Imprimer
                     </button>
                     <button className="flex-1 py-2.5 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition">
                        Télécharger PDF
                     </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}