'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Shield, UserCog, Users, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(true);

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
        <Loader2 className="size-8 animate-spin" style={{ color: 'var(--accent-primary)' }} aria-label="Checking authentication" />
      </div>
    );
  }

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    setLoginError(null);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-[900px] flex flex-col lg:flex-row gap-6 items-start">
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
                aria-hidden="true"
              />
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
                <div
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
              TechJays -- The AI Reimagination Company
            </p>
          </CardContent>
        </Card>

        {/* Test Credentials Panel */}
        <Card
          className="w-full lg:w-[420px] shrink-0 border-0 ring-0"
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
              {showTestPanel ? (
                <ChevronUp className="size-4" style={{ color: 'var(--text-tertiary)' }} />
              ) : (
                <ChevronDown className="size-4" style={{ color: 'var(--text-tertiary)' }} />
              )}
            </button>

            {showTestPanel && (
              <div className="mt-4 space-y-3">
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Click any role to auto-fill login credentials. All passwords: <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)' }}>JaysDeck2024!</code>
                </p>

                {TEST_CREDENTIALS.map((cred) => {
                  const Icon = cred.icon;
                  return (
                    <button
                      key={cred.role}
                      onClick={() => fillCredentials(cred.email, cred.password)}
                      className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all hover:scale-[0.99] active:scale-[0.97] min-h-[44px]"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = cred.color;
                        e.currentTarget.style.boxShadow = `0 0 12px ${cred.color}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
