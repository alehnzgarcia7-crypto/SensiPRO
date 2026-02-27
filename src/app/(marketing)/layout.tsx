import { LandingNavbar } from '@/components/landing/landing-navbar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      <main>{children}</main>
    </>
  );
}
