import { randomBytes } from 'crypto';

// Caracteres sin ambiguedad (sin O/0/I/1/l)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCharIndex(): number {
  const byte = randomBytes(1).readUInt8(0);
  return byte % CODE_CHARS.length;
}

export function generateActivationCode(): string {
  const segments: string[] = [];
  for (let s = 0; s < 3; s++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      segment += CODE_CHARS.charAt(randomCharIndex());
    }
    segments.push(segment);
  }
  return `ARES-${segments.join('-')}`;
}

export function generateReferralCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS.charAt(randomCharIndex());
  }
  return code;
}
