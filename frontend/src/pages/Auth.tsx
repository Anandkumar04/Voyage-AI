import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plane, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store';
import { toast } from '../store/toastStore';
import { useSEO } from '../hooks/useSEO';

export default function Auth() {
  useSEO('Sign In / Register', 'Access your Voyage AI account to sync itineraries and manage saved trips.');

  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userName = isLogin ? 'Explorer' : name || 'Explorer';
    setUser({ name: userName, email });
    toast.success(isLogin ? `Welcome back, ${userName}!` : `Account created!`, 'You are now signed in.');
    navigate('/dashboard');
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-[#FAF9F6] dark:bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[18px] shadow-sm dark:shadow-lg dark:shadow-black/20 border border-[#E5E2D9] dark:border-zinc-800 overflow-hidden"
      >
        <div className="p-8 sm:p-12">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-[#1d4ed8] dark:bg-blue-800 rounded-xl flex items-center justify-center shadow-sm dark:shadow-lg dark:shadow-black/20">
              <Plane className="w-6 h-6 text-white dark:text-zinc-50" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-[#2D2D2D] dark:text-zinc-100 mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-center text-[#7D7A74] dark:text-zinc-400 text-sm mb-8">
            {isLogin ? 'Enter your details to access your trips.' : 'Start planning your dream vacations today.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A8A399] dark:text-zinc-500 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 bg-[#FAF9F6] dark:bg-zinc-950 text-sm text-[#2D2D2D] dark:text-zinc-100"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A8A399] dark:text-zinc-500 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#A8A399] dark:text-zinc-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 bg-[#FAF9F6] dark:bg-zinc-950 text-sm text-[#2D2D2D] dark:text-zinc-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A8A399] dark:text-zinc-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#A8A399] dark:text-zinc-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 bg-[#FAF9F6] dark:bg-zinc-950 text-sm text-[#2D2D2D] dark:text-zinc-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-[14px] text-white dark:text-zinc-50 bg-[#3b82f6] dark:bg-blue-600 hover:bg-[#1d4ed8] dark:bg-blue-800 transition-colors shadow-sm dark:shadow-lg dark:shadow-black/20"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold uppercase tracking-widest text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D] dark:text-zinc-100"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
