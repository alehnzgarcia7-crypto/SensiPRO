/**
 * SVG logos simplificados para métodos de pago.
 * Usados en el paywall modal en lugar de iconos genéricos de Lucide.
 */

interface LogoProps {
  className?: string;
}

export function VisaLogo({ className = 'h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="15" letterSpacing="-0.5" fill="#1A1F71">V</text>
      <text x="9" y="13" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="15" letterSpacing="-0.5" fill="#1A1F71">I</text>
      <text x="15" y="13" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="15" letterSpacing="-0.5" fill="#1A1F71">S</text>
      <text x="24" y="13" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="15" letterSpacing="-0.5" fill="#1A1F71">A</text>
    </svg>
  );
}

export function MastercardLogo({ className = 'h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="10" r="9" fill="#EB001B" />
      <circle cx="21" cy="10" r="9" fill="#F79E1B" />
      <path d="M16 3.13a9 9 0 0 1 0 13.74 9 9 0 0 1 0-13.74z" fill="#FF5F00" />
    </svg>
  );
}

export function OxxoLogo({ className = 'h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 56 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="20" rx="3" fill="#FFCC00" />
      <text x="6" y="15" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" fill="#CC0000">OXXO</text>
    </svg>
  );
}

export function MercadoPagoLogo({ className = 'h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="20" rx="4" fill="#009EE3" />
      <text x="5" y="14" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fill="#fff">MP</text>
    </svg>
  );
}

export function CardLogos({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <VisaLogo className="h-4" />
      <MastercardLogo className="h-4" />
    </div>
  );
}
