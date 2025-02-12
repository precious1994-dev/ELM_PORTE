'use client';

import { Toaster } from 'sonner';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import Sidebar from './components/Sidebar';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  // Show sidebar on all admin pages except login page when authenticated
  const shouldShowSidebar = pathname.startsWith('/admin') && !isLoginPage && status === 'authenticated';

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [status, isLoginPage, router]);

  return (
    <div className="flex h-screen bg-gray-50">
      {shouldShowSidebar && <Sidebar />}
      <main className={`flex-1 overflow-y-auto ${!shouldShowSidebar ? 'w-full' : ''}`}>
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </NextAuthProvider>
  );
} 