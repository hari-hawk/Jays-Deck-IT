'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Shield, UserCog, Users, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TEST_CREDENTIALS = [
  {
    role: 'Super Admin',
    icon: Shield,
    color: '#EF4444',
    email: 'hari.sv@techjays.com',
    password: 'JaysDeck2024!',
    name: 'Hari Verman',
    dept: 'Engineering',
    location: 'USA',
    empId: 'TJ-EMP-0001',
    access: 'Full system access — manage users, assets, tickets, settings, audit logs',
  },
  {
    role: 'IT Admin',
    icon: UserCog,
    color: '#3B82F6',
    email: 'priya.sharma@techjays.com',
    password: 'JaysDeck2024!',
    name: 'Priya Sharma',
    dept: 'Engineering',
    location: 'India',
    empId: 'TJ-EMP-0002',
    access: 'Manage assets, tickets, knowledge base, view audit logs',
  },
  {
    role: 'Manager',
    icon: Users,
    color: '#F59E0B',
    email: 'emily.rodriguez@techjays.com',
    password: 'JaysDeck2024!',
    name: 'Emily Rodriguez',
    dept: 'Engineering',
    location: 'USA',
    empId: 'TJ-EMP-0013',
    access: 'View team assets, approve requests, manage team tickets',
  },
  {
    role: 'Employee',
    icon: User,
    color: '#22C55E',
    email: 'kamal.miah@techjays.com',
    password: 'JaysDeck2024!',
    name: 'Kamal Miah',
    dept: 'Sales',
    location: 'Bangladesh',
    empId: 'TJ-EMP-0100',
    access: 'View own assets, create tickets, view knowledge base',
  },
];

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const credCardStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const credCardItem = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="size-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(true);
  const [ssoLoading, setSsoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle SSO callback — token or error from OAuth redirect
  const handleSsoCallback = useCallback(async () => {
    const ssoToken = searchParams.get('sso_token');
    const ssoError = searchParams.get('sso_error');

    if (ssoError) {
      setLoginError(ssoError);
      // Clean URL without reloading
      window.history.replaceState({}, '', '/login');
      return;
    }

    if (ssoToken) {
      setSsoLoading(true);
      localStorage.setItem('accessToken', ssoToken);
      // Clean URL
      window.history.replaceState({}, '', '/login');
      // Fetch user profile with the new token
      await fetchProfile();
      router.replace('/');
    }
  }, [searchParams, fetchProfile, router]);

  useEffect(() => {
    handleSsoCallback();
  }, [handleSsoCallback]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && !ssoLoading) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router, ssoLoading]);

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
        <Loader2 className="size-8 animate-spin" style={{ color: 'var(--accent-primary)' }} aria-label="Checking authentication" />
      </div>
    );
  }

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    setLoginError(null);
  };

  const quickLogin = async (email: string, password: string) => {
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
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

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Animated gradient orbs background */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-[900px] flex flex-col lg:flex-row gap-6 items-start">
        {/* Login Card - fade in + scale up */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
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
                  <span className="logo-glow" style={{ color: 'var(--accent-primary)' }}>DECK</span>
                </h1>
                <p
                  className="mt-2 font-mono text-xs uppercase tracking-[0.25em]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  IT Command Center
                </p>
                <div
                  className="mx-auto mt-4 w-12 accent-gradient-line"
                  aria-hidden="true"
                />
              </div>

              {/* SSO Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  disabled={ssoLoading}
                  onClick={() => {
                    setSsoLoading(true);
                    window.location.href = '/api/auth/google';
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all hover:brightness-95 active:scale-[0.98] min-h-[44px] disabled:opacity-60"
                  style={{
                    background: '#ffffff',
                    borderColor: '#dadce0',
                    color: '#3c4043',
                  }}
                >
                  {ssoLoading ? (
                    <Loader2 className="size-4 animate-spin" style={{ color: '#4285F4' }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Sign in with Google
                </button>
                <button
                  type="button"
                  disabled={ssoLoading}
                  onClick={() => {
                    setSsoLoading(true);
                    window.location.href = '/api/auth/microsoft';
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all hover:brightness-95 active:scale-[0.98] min-h-[44px] disabled:opacity-60"
                  style={{
                    background: '#ffffff',
                    borderColor: '#dadce0',
                    color: '#3c4043',
                  }}
                >
                  {ssoLoading ? (
                    <Loader2 className="size-4 animate-spin" style={{ color: '#00A4EF' }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
                      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                    </svg>
                  )}
                  Sign in with Microsoft
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border-primary)' }} />
                </div>
                <div className="relative flex justify-center">
                  <span
                    className="px-3 text-xs uppercase tracking-wider"
                    style={{ background: 'var(--bg-glass)', color: 'var(--text-tertiary)' }}
                  >
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="h-11 rounded-lg border px-3 text-sm transition-colors focus-visible:ring-2"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: errors.email ? 'var(--danger)' : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs" style={{ color: 'var(--danger)' }} role="alert">
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
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : undefined}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-3"
                      style={{ color: 'var(--text-tertiary)' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-xs" style={{ color: 'var(--danger)' }} role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="size-4 rounded border accent-[var(--accent-primary)]"
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
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-md px-3 py-2 text-center text-sm"
                    style={{
                      background: 'var(--danger-subtle)',
                      color: 'var(--danger)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                    role="alert"
                    aria-live="assertive"
                  >
                    {loginError}
                  </motion.div>
                )}

                {/* Submit Button with shimmer */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-shimmer h-11 w-full cursor-pointer text-sm font-semibold tracking-wide transition-all hover:brightness-90 active:scale-[0.98]"
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
                TechJays -- The AI Reimagination Company
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Credentials Panel */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          className="w-full lg:w-[420px] shrink-0"
        >
          <Card
            className="border-0 ring-0"
            style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--bg-glass-border)',
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <CardContent className="px-6 py-5">
              <button
                onClick={() => setShowTestPanel(!showTestPanel)}
                className="flex w-full items-center justify-between min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex size-6 items-center justify-center rounded-md"
                    style={{ background: 'var(--accent-primary-subtle)' }}
                  >
                    <Shield className="size-3.5" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Test Credentials
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-mono uppercase"
                    style={{
                      background: 'var(--warning-subtle)',
                      color: 'var(--warning)',
                    }}
                  >
                    Dev Mode
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: showTestPanel ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="size-4" style={{ color: 'var(--text-tertiary)' }} />
                </motion.div>
              </button>

              {showTestPanel && (
                <motion.div
                  variants={credCardStagger}
                  initial="hidden"
                  animate="show"
                  className="mt-4 space-y-3"
                >
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Click any role to instantly sign in. All passwords: <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)' }}>JaysDeck2024!</code>
                  </p>

                  {TEST_CREDENTIALS.map((cred) => {
                    const Icon = cred.icon;
                    return (
                      <motion.button
                        key={cred.role}
                        variants={credCardItem}
                        disabled={isSubmitting}
                        onClick={() => quickLogin(cred.email, cred.password)}
                        className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all min-h-[44px] disabled:opacity-60"
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                        }}
                        whileHover={{
                          scale: 0.99,
                          borderColor: cred.color,
                          boxShadow: `0 0 16px ${cred.color}20`,
                        }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div
                          className="flex size-9 shrink-0 items-center justify-center rounded-md mt-0.5"
                          style={{ background: `${cred.color}15`, color: cred.color }}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {cred.role}
                            </span>
                            <span
                              className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                              style={{ background: `${cred.color}15`, color: cred.color }}
                            >
                              {cred.empId}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {cred.name} &middot; {cred.dept} &middot; {cred.location}
                          </p>
                          <p className="font-mono text-[11px] mt-1 truncate" style={{ color: 'var(--text-tertiary)' }}>
                            {cred.email}
                          </p>
                          <p className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                            {cred.access}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
