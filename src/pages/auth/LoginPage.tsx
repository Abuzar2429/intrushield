import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, Lock, Mail, UserCheck, KeyRound, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { loginSchema, type LoginFormData } from '../../utils/schemas';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'analyst@intrushield.internal',
      password: 'Password123!',
      rememberMe: true,
    },
  });

  const onSubmit = (_data: LoginFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 800);
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
            Intru<span className="text-blue-500">Shield</span> SOC Gateway
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Authenticate to access live eBPF stream & threat model controls
          </p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>SOC Operator Role</span>
              </label>
              <select
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option>SOC Analyst (Level 3)</option>
                <option>Security Operations Engineer</option>
                <option>CISO / Executive Viewer</option>
                <option>Threat Hunter / Incident Responder</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Enterprise Email</span>
              </label>
              <input
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
                <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <Link to="/forgot-password" className="text-xs font-mono text-blue-400 hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
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
              Sign In to SOC Session
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Don't have SOC credentials?</span>
            <Link to="/register" className="text-blue-400 hover:underline font-semibold">
              Request Operator Access
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] font-mono text-slate-500 flex items-center justify-center space-x-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>FIPS 140-3 & Hardware Security Module Enforced</span>
        </div>
      </div>
    </div>
  );
};
