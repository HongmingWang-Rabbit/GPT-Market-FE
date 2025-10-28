"use client";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyPayment } from "../actions";
import { PaymentRequirements, PaymentPayload } from "x402/types";
import { preparePaymentHeader } from "x402/client";
import { getNetworkId } from "x402/shared";
import { exact } from "x402/schemes";
import { useAccount, useSignTypedData } from "wagmi";

function PaymentForm({
  paymentRequirements,
}: {
  paymentRequirements: PaymentRequirements;
}) {
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const { isError, isSuccess, signTypedDataAsync } = useSignTypedData();

  if (!address || !isConnected) {
    return (
      <div className="text-center space-y-4">
        <Wallet />
        <p className="text-gray-400">
          Please connect your wallet to proceed with payment.
        </p>
      </div>
    );
  }

  const unSignedPaymentHeader = preparePaymentHeader(
    address,
    1,
    paymentRequirements
  );

  const eip712Data = {
    types: {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    },
    domain: {
      name: paymentRequirements.extra?.name,
      version: paymentRequirements.extra?.version,
      chainId: getNetworkId(paymentRequirements.network),
      verifyingContract: paymentRequirements.asset as `0x${string}`,
    },
    primaryType: "TransferWithAuthorization" as const,
    message: unSignedPaymentHeader.payload.authorization,
  };

  async function handlePayment() {
    setIsProcessing(true);
    const signature = await signTypedDataAsync(eip712Data);

    const paymentPayload: PaymentPayload = {
      ...unSignedPaymentHeader,
      payload: {
        ...unSignedPaymentHeader.payload,
        signature,
      },
    };

    const payment: string = exact.evm.encodePayment(paymentPayload);

    const verifyPaymentWithPayment = verifyPayment.bind(null, payment, paymentRequirements.maxAmountRequired);
    const result = await verifyPaymentWithPayment();
    console.log("result", result);
    setIsProcessing(false);
  }

  const usdcAmount = (
    parseInt(paymentRequirements.maxAmountRequired) / 1_000_000
  ).toFixed(2);

  const gameTokens = (parseFloat(usdcAmount) * 100).toFixed(0);
  const isMarketPurchase = paymentRequirements.description.includes('tokens for Market');

  return (
    <div className="space-y-6">
      <Wallet />

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
          Payment Details
        </h3>
        <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
          <p>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Amount:
            </span>{" "}
            ${usdcAmount} USDC
          </p>
          {!isMarketPurchase && (
            <p>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                You will receive:
              </span>{" "}
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                {gameTokens} GAME$
              </span>
            </p>
          )}
          <p>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              To:
            </span>{" "}
            <span className="font-mono text-sm break-all">
              {paymentRequirements.payTo}
            </span>
          </p>
          <p>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              For:
            </span>{" "}
            {paymentRequirements.description}
          </p>
        </div>
      </div>

      <button
        disabled={!isConnected || isProcessing}
        onClick={handlePayment}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors"
      >
        {isProcessing ? "Processing..." : "Pay with x402"}
      </button>

      {isProcessing && (
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          Signing payment...
        </p>
      )}
      {isSuccess && !isProcessing && (
        <p className="text-center text-green-600 dark:text-green-400">
          Signed successfully! Verifying...
        </p>
      )}
      {isError && (
        <p className="text-center text-red-600 dark:text-red-400">
          Payment failed
        </p>
      )}
    </div>
  );
}

function PaywallContent() {
  const searchParams = useSearchParams();
  const amountParam = searchParams.get('amount');
  const marketId = searchParams.get('marketId');
  const outcome = searchParams.get('outcome') as 'yes' | 'no' | null;
  const [paymentRequirements, setPaymentRequirements] = useState<PaymentRequirements | null>(null);

  useEffect(() => {
    const usdcAmount = amountParam ? parseFloat(amountParam) : 1;
    const amountInSmallestUnit = Math.floor(usdcAmount * 1_000_000).toString(); // Convert to 6 decimals

    // Create description based on market or general purchase
    let description = "GAME$ Token Purchase";
    if (marketId && outcome) {
      description = `${outcome.toUpperCase()} tokens for Market #${marketId}`;
    }

    const requirements: PaymentRequirements = {
      scheme: "exact",
      network: "base-sepolia",
      maxAmountRequired: amountInSmallestUnit,
      resource: "https://example.com",
      description,
      mimeType: "application/json",
      payTo:
        process.env.NEXT_PUBLIC_X402_PAYMENT_ADDRESS ||
        "0x2f2a4eeef6e03854595419adad319740b56a7441",
      maxTimeoutSeconds: 600,
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
      outputSchema: undefined,
      extra: {
        name: "USDC",
        version: "2",
      },
    };

    setPaymentRequirements(requirements);
  }, [amountParam, marketId, outcome]);

  if (!paymentRequirements) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
        <div className="text-neutral-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  const gameTokens = amountParam ? (parseFloat(amountParam) * 100).toFixed(0) : '100';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          {marketId && outcome ? (
            <>
              <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
                Buy {outcome === 'yes' ? 'Yes' : 'No'} Tokens
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Purchase prediction market tokens using x402 protocol
              </p>
              <div className={`rounded-xl p-4 inline-block border-2 ${
                outcome === 'yes'
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                  : 'bg-red-100 dark:bg-red-900/30 border-red-500'
              }`}>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">You are purchasing</p>
                <p className={`text-3xl font-bold ${
                  outcome === 'yes' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {amountParam} USDC worth of {outcome?.toUpperCase()} tokens
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
                Buy GAME$ Tokens
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Purchase tokens using x402 protocol to access games and lucky draws
              </p>
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-xl p-4 inline-block">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">You are purchasing</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {gameTokens} GAME$
                </p>
              </div>
            </>
          )}
        </div>

        <PaymentForm paymentRequirements={paymentRequirements} />
      </div>
    </div>
  );
}

export default function Paywall() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
          <div className="text-neutral-500 dark:text-neutral-400">Loading...</div>
        </div>
      }
    >
      <PaywallContent />
    </Suspense>
  );
}
