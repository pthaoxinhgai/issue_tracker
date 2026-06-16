import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/auth.service';
import { Hexagon, Loader2 } from 'lucide-react';

export const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            let res;
            if (isLogin) {
                res = await login(email, password);
                if (res.token) {
                    loginUser(res.token);
                    navigate('/');
                }
            } else {
                res = await register(name, email, password);
                if (res && !res.token) {
                    setSuccessMsg('Registration successful! You can now sign in.');
                    setIsLogin(true); // Switch to login tab
                    setPassword(''); // Clear password field
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <Hexagon className="mx-auto h-12 w-12 text-primary fill-primary/20" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <button 
                            onClick={() => setIsLogin(!isLogin)} 
                            className="font-medium text-primary hover:text-[#4338ca] transition-colors"
                        >
                            {isLogin ? 'register a new account' : 'sign in to your existing account'}
                        </button>
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    
                    {successMsg && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-100">
                            {successMsg}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-2.5 flex justify-center items-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isLogin ? 'Sign in' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};
