import React, { useState, useEffect } from 'react';
import { getAllUsers, changeUserRole } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, ShieldCheck, ShieldHalf, Users } from 'lucide-react';

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

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

    const getRoleIcon = (role) => {
        switch (role) {
            case 'MAINTAINER': return <ShieldAlert className="h-4 w-4 text-red-600" />;
            case 'DEVELOPER': return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
            case 'REPORTER': return <ShieldHalf className="h-4 w-4 text-amber-600" />;
            default: return <Shield className="h-4 w-4 text-gray-400" />;
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'MAINTAINER': return 'bg-red-100 text-red-800 border-red-200';
            case 'DEVELOPER': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'REPORTER': return 'bg-amber-100 text-amber-800 border-amber-200';
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
                                        {u.id !== user.id ? (
                                            <select
                                                className="input-field py-1.5 text-sm"
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            >
                                                <option value="GUEST">GUEST</option>
                                                <option value="REPORTER">REPORTER</option>
                                                <option value="DEVELOPER">DEVELOPER</option>
                                                <option value="MAINTAINER">MAINTAINER</option>
                                            </select>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Cannot change own role</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
