import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { registerSchema, type RegisterFormData } from '../../utils/schemas';

import { authApi } from '../../services/apiClient';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        name: data.fullName,
        role: 'SOC Analyst'
      });
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Registration failed.');
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Request SOC Clearance
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Register your operator credentials for IntruShield access
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              ⚠️ {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Ashraf"
                {...register('fullName')}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {errors.fullName && (
                <p className="text-[11px] font-mono text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Organizational Email</span>
              </label>
              <input
                type="email"
                placeholder="ashraf@soc.internal"
                {...register('email')}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {errors.email && (
                <p className="text-[11px] font-mono text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Badge ID / Clearance Code</span>
              </label>
              <input
                type="text"
                placeholder="SOC-ENG-8902"
                {...register('badgeId')}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {errors.badgeId && (
                <p className="text-[11px] font-mono text-red-400">{errors.badgeId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {errors.password && (
                <p className="text-[11px] font-mono text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {errors.confirmPassword && (
                <p className="text-[11px] font-mono text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start space-x-2 pt-1">
              <input
                type="checkbox"
                id="agreeToTerms"
                {...register('agreeToTerms')}
                className="mt-0.5 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500/40"
              />
              <label htmlFor="agreeToTerms" className="text-xs text-slate-400 font-mono">
                I accept SOC operational security rules & audit logging standards.
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-[11px] font-mono text-red-400">{errors.agreeToTerms.message}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Clearance Request
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Already have an operator account?</span>
            <Link to="/login" className="text-blue-400 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
