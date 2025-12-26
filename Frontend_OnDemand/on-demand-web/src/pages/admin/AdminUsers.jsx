import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Trash2, User, Search, Shield, Edit, X, Check, Mail, Calendar, Phone } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
 
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
      try {
          const res = await axiosClient.get('/admin/users');
          setUsers(res.data);
      } catch(e) { toast.error("Erreur chargement"); }
      finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(confirm("Supprimer cet utilisateur définitivement ?")) {
        try {
            await axiosClient.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            toast.success("Utilisateur supprimé");
            setIsModalOpen(false);
        } catch(e) { toast.error("Erreur suppression"); }
    }
  };

  const handleUpdateUser = async (e) => {
      e.preventDefault();
  
      toast.success("Profil mis à jour !");
      setIsModalOpen(false);
  };

  const openModal = (user) => {
      setSelectedUser(user);
      setIsModalOpen(true);
  };

  const filtered = users.filter(u => 
    (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterRole === 'all' || u.role.toLowerCase() === filterRole)
  );

  return (
    <div className="pb-12 bg-gray-50 min-h-screen font-sans">
      <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Utilisateurs</h1>
        <p className="text-gray-500 mt-1">Gestion des comptes clients, prestataires et administrateurs.</p>
      </div>

      <div className="px-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white transition"
                        placeholder="Rechercher (nom, email)..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    {['all', 'client', 'provider', 'admin'].map(role => (
                        <button 
                            key={role}
                            onClick={() => setFilterRole(role)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                                filterRole === role 
                                ? 'bg-teal-600 text-white shadow-sm' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {role === 'all' ? 'Tous' : role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Identité</th>
                            <th className="px-6 py-4">Rôle</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4">Date Inscription</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map(user => (
                            <tr key={user.id} className="hover:bg-teal-50/20 transition group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                                            {user.fullName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{user.fullName}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                                        user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' :
                                        user.role === 'provider' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {user.role === 'admin' && <Shield size={10}/>}
                                        {user.role === 'provider' && <User size={10}/>}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                        <span className="text-xs font-medium text-gray-700 capitalize">{user.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openModal(user)} className="text-teal-600 hover:text-teal-800 font-medium text-xs border border-teal-100 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition">
                                        Gérer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* MODAL USER DETAILS */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header Modal */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-teal-600 shadow-lg">
                             {selectedUser.fullName?.[0]}
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-bold">{selectedUser.fullName}</h2>
                            <p className="text-teal-100 text-sm">ID: {selectedUser.id.substring(0,8)}...</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1">
                        <X size={24}/>
                    </button>
                </div>

                {/* Body Modal */}
                <div className="p-6">
                    <form onSubmit={handleUpdateUser}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                             <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                <div className="flex items-center gap-2 text-gray-800 font-medium mt-1 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    <Mail size={16} className="text-gray-400"/> {selectedUser.email}
                                </div>
                             </div>
                             
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Rôle</label>
                                <select className="w-full mt-1 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none font-medium" defaultValue={selectedUser.role}>
                                    <option value="client">Client</option>
                                    <option value="provider">Prestataire</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                             </div>

                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Statut</label>
                                <select className="w-full mt-1 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none font-medium" defaultValue={selectedUser.status}>
                                    <option value="active">Actif</option>
                                    <option value="suspended">Suspendu</option>
                                    <option value="pending">En attente</option>
                                </select>
                             </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => handleDelete(selectedUser.id)} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition">
                                <Trash2 size={16}/> Supprimer
                            </button>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-lg transition">
                                    Annuler
                                </button>
                                <button type="submit" className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-teal-200 transition flex items-center gap-2">
                                    <Check size={16}/> Enregistrer
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}