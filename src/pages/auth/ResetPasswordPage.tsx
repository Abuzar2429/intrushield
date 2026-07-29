import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../utils/schemas';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (_data: ResetPasswordFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Set New Operator Password
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Cryptographic token validated. Enter your new password.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                {...register('newPassword')}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {errors.newPassword && (
                <p className="text-[11px] font-mono text-red-400">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Confirm New Password</span>
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Update Password & Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400">
            <Link to="/login" className="text-blue-400 hover:underline">
              Cancel & Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
