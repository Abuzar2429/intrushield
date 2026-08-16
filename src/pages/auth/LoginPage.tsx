import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldAlert, Lock, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { loginSchema, type LoginFormData } from '../../utils/schemas';
import { authApi } from '../../services/apiClient';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authApi.login({ email: data.email, password: data.password });
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setErrorMessage('Google authentication did not return a valid credential.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authApi.googleLogin(credentialResponse.credential);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Google Sign-In failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Intru<span className="text-blue-500">Shield</span> Security Gateway
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Authenticate to access live eBPF stream & network threat controls
          </p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Primary Google Sign-In */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMessage('Google Sign-In was cancelled or failed.')}
                theme="filled_blue"
                shape="pill"
                text="continue_with"
              />
            </div>
            
            <div className="w-full flex items-center space-x-3 my-2">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-[11px] font-mono text-slate-500 uppercase">or sign in with password</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Email</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {errors.email && (
                <p className="text-[11px] font-mono text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
              </div>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {errors.password && (
                <p className="text-[11px] font-mono text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Don't have an account?</span>
            <Link to="/register" className="text-blue-400 hover:underline font-semibold">
              Create Client Account
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] font-mono text-slate-500 flex items-center justify-center space-x-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>FIPS 140-3 & Google OAuth 2.0 Security Enforced</span>
        </div>
      </div>
    </div>
  );
};
