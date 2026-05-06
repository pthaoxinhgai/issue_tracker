import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let data;
      if (isRegister) {
        data = await authService.register(formData.name, formData.email, formData.password);
      } else {
        data = await authService.login(formData.email, formData.password);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full btn-primary font-medium py-3 mt-4">
            {isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-primary hover:underline font-medium">
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
