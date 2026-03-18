'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/auth';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Redirect to onboarding if user is authenticated but not onboarded
  React.useEffect(() => {
    if (isAuthenticated && user && user.isOnboarded === false) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Skip to main content link */}
      <a href="#main-content" className="skip-nav sr-only focus:not-sr-only">
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar (Sheet overlay) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={true}
          className="w-[280px] p-0"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setMobileOpen((prev) => !prev)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          role="main"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* Toast notification container */}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
          },
        }}
      />

      {/* Live region for screen readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="live-announcements"
      />
    </div>
  );
}
