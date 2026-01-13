
export interface WalletData {
  address: string;
  balance: number;
  currency: string;
  tokens: { name: string; symbol: string; amount: number; valueUsd: number }[];
}

export interface AIInsight {
  id: string;
  timestamp: string;
  content: string;
  type: 'market' | 'security' | 'strategy';
}

export interface GravityObject {
  id: string;
  width: number;
  height: number;
  initialX: number;
  initialY: number;
}
