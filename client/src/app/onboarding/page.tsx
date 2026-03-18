'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, Check, LayoutDashboard, Ticket, Monitor } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const DEPARTMENTS = ['Engineering', 'Design', 'Operations', 'Sales', 'HR', 'Finance', 'QA'];

const FEATURE_CARDS = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'See your devices, tickets, and team at a glance',
    color: '#6366f1',
  },
  {
    icon: Ticket,
    title: 'Service Hub',
    description: 'Raise IT tickets for hardware, software, or access issues',
    color: '#f59e0b',
  },
  {
    icon: Monitor,
    title: 'Asset Vault',
    description: 'View all devices assigned to you',
    color: '#22c55e',
  },
];

const pageVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    department: '',
    designation: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
    if (!authLoading && isAuthenticated && user?.isOnboarded) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="size-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.put('/auth/onboard', form);
      setUser({ ...user, ...data.data, isOnboarded: true });
      toast.success('Welcome aboard! Your profile is set up.');
      router.replace('/');
    } catch {
      toast.error('Failed to complete setup. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: step === i ? 32 : 12,
                background: step >= i ? 'var(--accent-primary)' : 'var(--border-primary)',
              }}
            />
          ))}
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: 'var(--bg-glass-border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <AnimatePresence mode="wait">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <motion.div
                key="welcome"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Welcome to JAYS DECK, {user.firstName}!
                  </h1>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Your IT Command Center is ready.
                  </p>
                </div>
                <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-tertiary)' }}>
                  Manage your IT assets, raise support tickets, and stay connected with your team
                  -- all from one powerful dashboard. Let&apos;s get you set up in just a few steps.
                </p>
                <Button
                  onClick={() => setStep(1)}
                  className="gap-2 px-8 min-h-[44px]"
                  style={{ background: 'var(--accent-primary)', color: '#fff' }}
                >
                  Let&apos;s get you set up
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 1: Feature Tour */}
            {step === 1 && (
              <motion.div
                key="tour"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Quick Tour
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
                  Here&apos;s what you can do with JAYS DECK
                </p>

                <div className="space-y-3 mb-8">
                  {FEATURE_CARDS.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 rounded-xl border p-4"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                      >
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${card.color}15`, color: card.color }}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {card.title}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                            {card.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(0)}
                    className="gap-1 min-h-[44px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    className="gap-2 px-6 min-h-[44px]"
                    style={{ background: 'var(--accent-primary)', color: '#fff' }}
                  >
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Profile Setup */}
            {step === 2 && (
              <motion.div
                key="profile"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Complete Your Profile
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
                  Just a few details to personalize your experience
                </p>

                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <Label
                      htmlFor="onboard-phone"
                      className="text-xs uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="onboard-phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="h-11"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="onboard-dept"
                      className="text-xs uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Department
                    </Label>
                    <select
                      id="onboard-dept"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="h-11 w-full rounded-lg border px-3 text-sm"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="onboard-title"
                      className="text-xs uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Designation / Title
                    </Label>
                    <Input
                      id="onboard-title"
                      placeholder="e.g. Senior Engineer, Product Designer"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      className="h-11"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="gap-1 min-h-[44px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="gap-2 px-6 min-h-[44px]"
                    style={{ background: 'var(--accent-primary)', color: '#fff' }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Check className="size-4" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
