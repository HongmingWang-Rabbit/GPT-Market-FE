export interface Market {
  id: string;
  question: string;
  description: string;
  category: string;
  endDate: Date;
  volume: number; // in USD
  liquidity: number; // in USD
  yesPrice: number; // 0-1 probability
  noPrice: number; // 0-1 probability
  imageUrl?: string;
  status: 'active' | 'closed' | 'resolved';
  resolvedOutcome?: 'yes' | 'no';
  tags: string[];
}

export interface MarketOrder {
  marketId: string;
  outcome: 'yes' | 'no';
  amount: number; // in USDC
  shares: number; // calculated based on price
  price: number; // price per share at time of purchase
}

export interface UserPosition {
  marketId: string;
  yesShares: number;
  noShares: number;
  avgYesPrice: number;
  avgNoPrice: number;
  invested: number; // total USDC invested
}
