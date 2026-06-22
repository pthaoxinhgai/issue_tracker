import React, { useState, useEffect } from 'react';
import { getAllUsers, changeUserRole, createUser, updateUser } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, ShieldCheck, ShieldHalf, Users } from 'lucide-react';

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'SUPPORT_STAFF' });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await changeUserRole(userId, newRole);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to update role', error);
            alert('Failed to update role: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleOpenModal = (mode, u = null) => {
        setModalMode(mode);
        setSelectedUser(u);
        if (mode === 'edit' && u) {
            setFormData({ name: u.name, email: u.email, password: '', role: u.role });
        } else {
            setFormData({ name: '', email: '', password: '', role: 'SUPPORT_STAFF' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await createUser(formData);
            } else {
                await updateUser(selectedUser.id, formData);
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to save user', error);
            alert('Error: ' + (error.response?.data?.message || 'Failed to save user'));
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN': return <ShieldAlert className="h-4 w-4 text-red-600" />;
            case 'ENGINEERING_MANAGER':
            case 'PRODUCT_OWNER': return <ShieldHalf className="h-4 w-4 text-purple-600" />;
            case 'DEVELOPER': return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
            case 'QA': return <ShieldCheck className="h-4 w-4 text-blue-600" />;
            case 'SUPPORT_STAFF': return <ShieldHalf className="h-4 w-4 text-amber-600" />;
            default: return <Shield className="h-4 w-4 text-gray-400" />;
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
            case 'ENGINEERING_MANAGER':
            case 'PRODUCT_OWNER': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'DEVELOPER': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'QA': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SUPPORT_STAFF': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        User Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage system accounts and their permission roles.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary">
                    + Create User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Role
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                                    {u.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                                <div className="text-sm text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(u.role)}`}>
                                            {getRoleIcon(u.role)}
                                            {u.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            {u.id !== user.id ? (
                                                <select
                                                    className="input-field py-1.5 text-sm w-40"
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                >
                                                    <option value="SUPPORT_STAFF">SUPPORT_STAFF</option>
                                                    <option value="PRODUCT_OWNER">PRODUCT_OWNER</option>
                                                    <option value="ENGINEERING_MANAGER">ENGINEERING_MANAGER</option>
                                                    <option value="DEVELOPER">DEVELOPER</option>
                                                    <option value="QA">QA</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs w-40 inline-block">Cannot change own role</span>
                                            )}
                                            <button 
                                                onClick={() => handleOpenModal('edit', u)}
                                                className="text-primary hover:text-primary/80 font-medium text-sm underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95">
                        <h2 className="text-xl font-bold mb-4">{modalMode === 'create' ? 'Create New User' : 'Edit User'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" required className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {modalMode === 'edit' && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                                </label>
                                <input type="password" required={modalMode === 'create'} className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="SUPPORT_STAFF">SUPPORT_STAFF</option>
                                    <option value="PRODUCT_OWNER">PRODUCT_OWNER</option>
                                    <option value="ENGINEERING_MANAGER">ENGINEERING_MANAGER</option>
                                    <option value="DEVELOPER">DEVELOPER</option>
                                    <option value="QA">QA</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">{modalMode === 'create' ? 'Create' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
