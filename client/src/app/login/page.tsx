'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const onSubmit = async (formData: LoginFormData) => {
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      router.replace('/');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setLoginError(
        axiosError.response?.data?.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render login form if still checking auth or already authenticated
  if (authLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="size-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-[420px]">
        <Card
          className="border-0 py-0 ring-0"
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--bg-glass-border)',
            boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <CardContent className="px-8 py-10">
            {/* Branding */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                JAYS{' '}
                <span style={{ color: 'var(--accent-primary)' }}>DECK</span>
              </h1>
              <p
                className="mt-2 font-mono text-xs uppercase tracking-[0.25em]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                IT Command Center
              </p>
              <div
                className="mx-auto mt-4 h-px w-12"
                style={{ background: 'var(--border-secondary)' }}
              />
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@techjays.com"
                  autoComplete="email"
                  className="h-11 rounded-lg border px-3 text-sm transition-colors focus-visible:ring-2"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: errors.email ? 'var(--danger)' : 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs" style={{ color: 'var(--danger)' }}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-11 rounded-lg border px-3 pr-10 text-sm transition-colors focus-visible:ring-2"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: errors.password ? 'var(--danger)' : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs" style={{ color: 'var(--danger)' }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="size-3.5 rounded border accent-[var(--accent-primary)]"
                  style={{ borderColor: 'var(--border-secondary)' }}
                />
                <label
                  htmlFor="remember"
                  className="cursor-pointer text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Remember me
                </label>
              </div>

              {/* Error Message */}
              {loginError && (
                <div
                  className="rounded-md px-3 py-2 text-center text-sm"
                  style={{
                    background: 'var(--danger-subtle)',
                    color: 'var(--danger)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {loginError}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full cursor-pointer text-sm font-semibold tracking-wide transition-all hover:brightness-90 active:scale-[0.98]"
                style={{
                  background: isSubmitting ? 'var(--accent-primary-hover)' : 'var(--accent-primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Footer */}
            <p
              className="mt-8 text-center text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              TechJays — The AI Reimagination Company
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
