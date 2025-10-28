'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getMarketById, formatVolume, formatProbability } from '@/lib/mockData';
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
import Link from 'next/link';

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const market = getMarketById(params.id as string);

  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
  const [usdcAmount, setUsdcAmount] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Market not found
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to markets
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilEnd = Math.ceil(
    (market.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleBuyClick = (outcome: 'yes' | 'no') => {
    setSelectedOutcome(outcome);
    setShowBuyModal(true);
  };

  const handleConfirmPurchase = () => {
    const amount = parseFloat(usdcAmount);
    if (amount > 0 && selectedOutcome) {
      // Redirect to paywall with market info
      router.push(`/paywall?amount=${amount}&marketId=${market.id}&outcome=${selectedOutcome}`);
    }
  };

  const calculateShares = () => {
    const amount = parseFloat(usdcAmount) || 0;
    const price = selectedOutcome === 'yes' ? market.yesPrice : market.noPrice;
    return (amount / price).toFixed(2);
  };

  const potentialReturn = () => {
    const amount = parseFloat(usdcAmount) || 0;
    const shares = parseFloat(calculateShares());
    return shares.toFixed(2);
  };

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

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6"
        >
          ← Back to markets
        </Link>

        {/* Market Header */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                  {market.category}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {daysUntilEnd > 0 ? `Closes in ${daysUntilEnd} days` : 'Closed'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                {market.question}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {market.description}
              </p>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                Volume
              </div>
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatVolume(market.volume)}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                Liquidity
              </div>
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatVolume(market.liquidity)}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                Traders
              </div>
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {Math.floor(market.volume / 1000)}
              </div>
            </div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Yes Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                Yes
              </h3>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {formatProbability(market.yesPrice)}
                </div>
                <div className="text-sm text-green-600/70 dark:text-green-400/70">
                  ${market.yesPrice.toFixed(2)} per share
                </div>
              </div>
            </div>
            <button
              onClick={() => handleBuyClick('yes')}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Buy Yes
            </button>
          </div>

          {/* No Card */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">
                No
              </h3>
              <div className="text-right">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                  {formatProbability(market.noPrice)}
                </div>
                <div className="text-sm text-red-600/70 dark:text-red-400/70">
                  ${market.noPrice.toFixed(2)} per share
                </div>
              </div>
            </div>
            <button
              onClick={() => handleBuyClick('no')}
              className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Buy No
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            About this market
          </h3>
          <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
            <p>
              <strong>Category:</strong> {market.category}
            </p>
            <p>
              <strong>End Date:</strong> {market.endDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p>
              <strong>Status:</strong> {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
            </p>
          </div>
        </div>
      </main>

      {/* Buy Modal */}
      {showBuyModal && selectedOutcome && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">
              Buy {selectedOutcome === 'yes' ? 'Yes' : 'No'} Tokens
            </h2>

            <div className="space-y-6">
              {/* Market Info */}
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Market
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                  {market.question}
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-semibold">
                  Enter USDC Amount
                </label>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[5, 10, 25, 50].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setUsdcAmount(amount.toString())}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                        usdcAmount === amount.toString()
                          ? selectedOutcome === 'yes'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-neutral-900 dark:text-neutral-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                  Minimum: 1 USDC
                </p>
              </div>

              {/* Calculation */}
              {usdcAmount && parseFloat(usdcAmount) > 0 && (
                <div className={`rounded-xl p-4 ${
                  selectedOutcome === 'yes'
                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                    : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                }`}>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 dark:text-neutral-300">
                        Price per share:
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        ${selectedOutcome === 'yes' ? market.yesPrice.toFixed(2) : market.noPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 dark:text-neutral-300">
                        Shares you'll get:
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {calculateShares()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-current/20">
                      <span className="text-neutral-700 dark:text-neutral-300">
                        Potential return:
                      </span>
                      <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        ${potentialReturn()} USDC
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBuyModal(false);
                    setUsdcAmount('');
                    setSelectedOutcome(null);
                  }}
                  className="flex-1 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={!usdcAmount || parseFloat(usdcAmount) < 1}
                  className={`flex-1 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedOutcome === 'yes'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Continue with x402
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
