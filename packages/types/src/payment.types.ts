import type { CodeType, PaymentProvider, UserTier } from '@prisma/client';

export interface CheckoutRequest {
  codeType: CodeType;
  provider: PaymentProvider;
}

export interface CheckoutResult {
  checkoutUrl: string;
  externalId: string;
  provider: PaymentProvider;
}

export interface ActivationResult {
  success: boolean;
  tier: UserTier;
  expiresAt: Date;
  daysAdded: number;
}

export interface CodeInfo {
  code: string;
  type: CodeType;
  status: string;
  createdAt: Date;
  usedAt: Date | null;
}
