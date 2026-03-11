import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import { CommandCenterSidebar } from './components/sidebar';

const ADMIN_EMAIL = 'alehnzgarcia7@gmail.com';

export const metadata = {
  title: 'Command Center | SensiPRO',
  robots: { index: false, follow: false },
};

export default async function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  if (session.user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-[#080810]">
      <CommandCenterSidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
