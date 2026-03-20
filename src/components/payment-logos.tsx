/**
 * SVG logos para métodos de pago.
 * Todos usan viewBox 60×38 (proporción estándar de tarjeta), bordes rx=4.
 * Centrados horizontal y verticalmente con textAnchor + dominantBaseline.
 */

interface LogoProps {
  className?: string;
}

export function VisaLogo({ className = 'h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="4" fill="white" />
      <text x="30" y="20" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="16" letterSpacing="1.5" fill="#1A1F71">VISA</text>
    </svg>
  );
}

export function MastercardLogo({ className = 'h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="4" fill="#1A1F36" />
      <circle cx="24" cy="19" r="12" fill="#EB001B" />
      <circle cx="36" cy="19" r="12" fill="#F79E1B" />
      <path d="M30 10.06a12 12 0 0 1 0 17.88 12 12 0 0 1 0-17.88z" fill="#FF5F00" />
    </svg>
  );
}

export function OxxoLogo({ className = 'h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="4" fill="#FFCC00" />
      <text x="30" y="20" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="16" fill="#CC0000">OXXO</text>
    </svg>
  );
}

export function MercadoPagoLogo({ className = 'h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="4" fill="#00B1EA" />
      <text x="30" y="20" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="18" fill="white">MP</text>
    </svg>
  );
}

export function CardLogos({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center -space-x-1 ${className}`}>
      <VisaLogo className="h-[14px]" />
      <MastercardLogo className="h-[14px]" />
    </div>
  );
}
