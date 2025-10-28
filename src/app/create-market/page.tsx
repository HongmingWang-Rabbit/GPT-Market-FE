'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { CATEGORIES } from '@/lib/mockData';

export default function CreateMarketPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const [formData, setFormData] = useState({
    question: '',
    description: '',
    category: 'Crypto',
    endDate: '',
    initialLiquidity: '100',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    } else if (formData.question.length < 10) {
      newErrors.question = 'Question must be at least 10 characters';
    } else if (formData.question.length > 200) {
      newErrors.question = 'Question must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else {
      const selectedDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.endDate = 'End date must be in the future';
      }
    }

    const liquidity = parseFloat(formData.initialLiquidity);
    if (isNaN(liquidity) || liquidity < 10) {
      newErrors.initialLiquidity = 'Initial liquidity must be at least 10 USDC';
    } else if (liquidity > 10000) {
      newErrors.initialLiquidity = 'Initial liquidity cannot exceed 10,000 USDC';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    // TODO: Implement actual market creation with contract
    console.log('Creating market with data:', formData);

    // For now, redirect to paywall with the liquidity amount
    // In production, this would create the market on-chain
    router.push(`/paywall?amount=${formData.initialLiquidity}&type=create-market`);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                402Market
              </h1>
            </Link>

            <div className="wallet-container">
              <Wallet>
                <ConnectWallet>
                  <Avatar className="h-6 w-6" />
                  <Name />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownLink
                    icon="wallet"
                    href="https://keys.coinbase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Wallet
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6"
        >
          ← Back to markets
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Create New Market
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Create a prediction market and provide initial liquidity using x402 protocol
          </p>
        </div>

        {/* Wallet Connection Notice */}
        {!isConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Please connect your wallet to create a market
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <label className="block text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
              Market Question *
            </label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              placeholder="e.g., Will Bitcoin reach $100,000 by end of 2025?"
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border ${
                errors.question
                  ? 'border-red-500'
                  : 'border-neutral-300 dark:border-neutral-700'
              } rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.question && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.question}
              </p>
            )}
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              {formData.question.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <label className="block text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide clear resolution criteria. What conditions must be met for this market to resolve as YES?"
              rows={4}
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border ${
                errors.description
                  ? 'border-red-500'
                  : 'border-neutral-300 dark:border-neutral-700'
              } rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.description && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.description}
              </p>
            )}
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Be specific about how and when the market will be resolved
            </p>
          </div>

          {/* Category and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <label className="block text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.filter((cat) => cat !== 'All').map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* End Date */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <label className="block text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={minDateString}
                className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border ${
                  errors.endDate
                    ? 'border-red-500'
                    : 'border-neutral-300 dark:border-neutral-700'
                } rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.endDate && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Initial Liquidity */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <label className="block text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
              Initial Liquidity (USDC) *
            </label>
            <input
              type="number"
              name="initialLiquidity"
              value={formData.initialLiquidity}
              onChange={handleInputChange}
              min="10"
              max="10000"
              step="1"
              placeholder="100"
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border ${
                errors.initialLiquidity
                  ? 'border-red-500'
                  : 'border-neutral-300 dark:border-neutral-700'
              } rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.initialLiquidity && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.initialLiquidity}
              </p>
            )}
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Minimum: 10 USDC | Maximum: 10,000 USDC
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• You'll be redirected to pay the initial liquidity via x402 protocol</li>
              <li>• Your market will be created on-chain (once contracts are deployed)</li>
              <li>• Users can immediately start trading on your market</li>
              <li>• You'll earn fees from trading activity</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 font-bold py-4 px-6 rounded-lg text-center transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isConnected}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-neutral-400 disabled:to-neutral-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              {isConnected ? 'Create Market' : 'Connect Wallet First'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
