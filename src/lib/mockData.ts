import { Market } from '@/types/market';

export const MOCK_MARKETS: Market[] = [
  {
    id: '1',
    question: 'Will Bitcoin reach $100,000 by end of 2025?',
    description: 'This market will resolve to YES if Bitcoin (BTC) trades at or above $100,000 USD on any major exchange before December 31, 2025, 11:59 PM UTC.',
    category: 'Crypto',
    endDate: new Date('2025-12-31'),
    volume: 1250000,
    liquidity: 450000,
    yesPrice: 0.65,
    noPrice: 0.35,
    status: 'active',
    tags: ['crypto', 'bitcoin', 'price prediction'],
  },
  {
    id: '2',
    question: 'Will Trump win the 2024 US Presidential Election?',
    description: 'This market resolves to YES if Donald Trump wins the 2024 US Presidential Election and is certified as the winner.',
    category: 'Politics',
    endDate: new Date('2024-11-05'),
    volume: 5800000,
    liquidity: 2100000,
    yesPrice: 0.52,
    noPrice: 0.48,
    status: 'active',
    tags: ['politics', 'election', 'usa'],
  },
  {
    id: '3',
    question: 'Will Ethereum ETF be approved by March 2025?',
    description: 'This market resolves to YES if the SEC approves a spot Ethereum ETF before March 31, 2025.',
    category: 'Crypto',
    endDate: new Date('2025-03-31'),
    volume: 890000,
    liquidity: 320000,
    yesPrice: 0.78,
    noPrice: 0.22,
    status: 'active',
    tags: ['crypto', 'ethereum', 'etf', 'sec'],
  },
  {
    id: '4',
    question: 'Will AI surpass human performance on AGI benchmarks in 2025?',
    description: 'This market resolves to YES if any AI system demonstrates human-level or better performance across all major AGI benchmark tests by December 31, 2025.',
    category: 'Technology',
    endDate: new Date('2025-12-31'),
    volume: 670000,
    liquidity: 280000,
    yesPrice: 0.42,
    noPrice: 0.58,
    status: 'active',
    tags: ['ai', 'agi', 'technology'],
  },
  {
    id: '5',
    question: 'Will SpaceX successfully land humans on Mars by 2030?',
    description: 'This market resolves to YES if SpaceX successfully lands humans on Mars and they survive for at least 24 hours before December 31, 2030.',
    category: 'Science',
    endDate: new Date('2030-12-31'),
    volume: 1420000,
    liquidity: 580000,
    yesPrice: 0.31,
    noPrice: 0.69,
    status: 'active',
    tags: ['space', 'spacex', 'mars'],
  },
  {
    id: '6',
    question: 'Will stock market crash by >20% in 2025?',
    description: 'This market resolves to YES if the S&P 500 drops more than 20% from its peak value at any point during 2025.',
    category: 'Finance',
    endDate: new Date('2025-12-31'),
    volume: 2100000,
    liquidity: 890000,
    yesPrice: 0.28,
    noPrice: 0.72,
    status: 'active',
    tags: ['finance', 'stocks', 'crash'],
  },
  {
    id: '7',
    question: 'Will OpenAI release GPT-5 in 2025?',
    description: 'This market resolves to YES if OpenAI publicly releases a model officially named GPT-5 before December 31, 2025.',
    category: 'Technology',
    endDate: new Date('2025-12-31'),
    volume: 950000,
    liquidity: 410000,
    yesPrice: 0.61,
    noPrice: 0.39,
    status: 'active',
    tags: ['ai', 'openai', 'gpt'],
  },
  {
    id: '8',
    question: 'Will global temperature rise exceed 1.5°C by 2026?',
    description: 'This market resolves to YES if the global average temperature rises above 1.5°C compared to pre-industrial levels according to NOAA data.',
    category: 'Climate',
    endDate: new Date('2026-12-31'),
    volume: 540000,
    liquidity: 220000,
    yesPrice: 0.73,
    noPrice: 0.27,
    status: 'active',
    tags: ['climate', 'environment', 'temperature'],
  },
];

export const CATEGORIES = [
  'All',
  'Crypto',
  'Politics',
  'Technology',
  'Finance',
  'Science',
  'Climate',
  'Sports',
];

export function getMarketById(id: string): Market | undefined {
  return MOCK_MARKETS.find(market => market.id === id);
}

export function getMarketsByCategory(category: string): Market[] {
  if (category === 'All') return MOCK_MARKETS;
  return MOCK_MARKETS.filter(market => market.category === category);
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(0)}K`;
  }
  return `$${volume}`;
}

export function formatProbability(price: number): string {
  return `${(price * 100).toFixed(0)}%`;
}
