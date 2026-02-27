import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Navbar } from '@/components/layout/navbar';

export default function DevicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-0">{children}</main>
      <MobileNav />
      <div className="hidden md:block"><Footer /></div>
    </>
  );
}
