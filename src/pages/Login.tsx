import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { CustomCursor } from '@/components/CustomCursor';
import { useAuth } from '@/contexts/AuthContext';
import { PreLoader } from '@/components/ui/PreLoader';
import axios from 'axios';


type User = {
  id: string;
  name: string;
  email: string;
  type?: string;
  userType?: string;
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

 
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoggingIn(true);

      try {
        const response = await fetch('https://edumallug.com/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        const data: { token: string; user: User } = await response.json();

        // Save token in localStorage (optional because login should do this too)
        localStorage.setItem('token', data.token);

        // Call login with user AND token
        login(
          {
            ...data.user,
            type: data.user.type as 'individual' | 'institution' | 'guest',
            firstName: '',
            phone: ''
          },
          data.token
        );

        navigate('/categories');
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
      } finally {
        setIsLoggingIn(false);
      }
    };




    const handleGoogleLogin = async () => {
      setIsLoggingIn(true);
      setTimeout(() => {
        const userData = {
          id: '2',
          name: 'Google User',
          email: 'user@gmail.com',
          type: 'individual' as const,
          userType: 'Parent',
          firstName: '',
          phone: ''
        };
        const fakeToken = 'google-oauth-fake-token';
        login(userData, fakeToken);
        setIsLoggingIn(false);
        navigate('/dashboard');
      }, 2000);
    };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <CustomCursor />
      <PreLoader isLoading={isLoggingIn} message="Signing you in..." type="auth" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="glass-strong rounded-3xl p-8">
          <div className="text-center mb-8">
            {/* Clickable Logo */}
            <Link to="/" className="inline-block mb-6 hover:scale-105 transition-transform">
              <img 
                src="/img/logo.png" 
                alt="Edumall" 
                className="h-12 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">

                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-500">
                Forgot password?
              </Link>
            </div>

            <EdumallButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </EdumallButton>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <EdumallButton
              variant="ghost"
              size="lg"
              className="w-full mt-4 border border-gray-300"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
              Google
            </EdumallButton>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 hover:text-teal-500 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
