import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../utils/schemas';

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (_data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
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
            Reset SOC Credentials
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Receive a cryptographically signed reset token via email
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs font-mono text-slate-400">
                If the email exists in our SOC user directory, an encrypted password reset token has been sent.
              </p>
              <Link to="/login">
                <Button variant="secondary" size="md" className="mt-2 w-full">
                  Return to Gateway Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Enterprise Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="analyst@intrushield.internal"
                  {...register('email')}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {errors.email && (
                  <p className="text-[11px] font-mono text-red-400">{errors.email.message}</p>
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
                Send Reset Token
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400">
            <Link to="/login" className="text-blue-400 hover:underline">
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
