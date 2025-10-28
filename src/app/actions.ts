"use server";
import { facilitator } from "@coinbase/x402";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { useFacilitator } from "x402/verify";
import { PaymentRequirements } from "x402/types";
import { exact } from "x402/schemes";

export async function verifyPayment(payload: string, amountInSmallestUnit: string): Promise<string> {
  // Calculate GAME$ tokens (1 USDC = 100 GAME$)
  const usdcAmount = (parseInt(amountInSmallestUnit) / 1_000_000).toFixed(2);
  const gameTokens = (parseFloat(usdcAmount) * 100).toFixed(0);

  // Define payment requirements (should match the paywall page)
  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: amountInSmallestUnit,
    resource: "https://example.com",
    description: "GAME$ Token Purchase",
    mimeType: "application/json",
    payTo:
      process.env.NEXT_PUBLIC_X402_PAYMENT_ADDRESS ||
      "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
    maxTimeoutSeconds: 600,
    asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    outputSchema: undefined,
    extra: {
      name: "USDC",
      version: "2",
    },
  };

  // Use default facilitator (https://x402.org/facilitator)
  const { verify, settle } = useFacilitator(facilitator);

  let payment;
  let settleResponse;

  try {
    payment = exact.evm.decodePayment(payload);
    console.log("[Server] Payment decoded:", payment);

    const valid = await verify(payment, paymentRequirements);
    if (!valid.isValid) {
      console.error("[Server] Verification failed:", valid.invalidReason);
      throw new Error(valid.invalidReason);
    }

    console.log("[Server] Payment verified successfully");

    // Attempt settlement with facilitator
    console.log("[Server] Attempting settlement with facilitator...");
    settleResponse = await settle(payment, paymentRequirements);

    if (!settleResponse.success) {
      console.error("[Server] Settlement failed:", settleResponse.errorReason);
      throw new Error(settleResponse.errorReason);
    }

    console.log("[Server] Payment settled on-chain successfully!");
    console.log("\n✅ PAYMENT SUCCESSFUL!");
    console.log("===================================");
    if ('authorization' in payment.payload) {
      console.log("User Address:", payment.payload.authorization.from);
      console.log("Recipient:", payment.payload.authorization.to);
    }
    console.log("Amount Paid: $" + usdcAmount + " USDC");
    console.log("Tokens Purchased: " + gameTokens + " GAME$");
    console.log("Transaction:", settleResponse.transaction);
    console.log("===================================\n");
  } catch (error) {
    console.error("[Server] Error:", error);
    return `Error: ${error}`;
  }

  const cookieStore = await cookies();
  // This should be a JWT signed by the server following best practices for a session token
  // See: https://nextjs.org/docs/app/guides/authentication#stateless-sessions
  cookieStore.set("payment-session", payload);

  // Store transaction hash for display on success page
  if (settleResponse?.transaction) {
    cookieStore.set("payment-tx", settleResponse.transaction);
  }

  redirect("/protected");
}

export async function verifyLuckyDrawPayment(payload: string): Promise<{ success: boolean; prize?: string; error?: string }> {
  const PRIZES = ["100 GAME$", "10 USDC", "Black Myth Wukong"];

  // Define payment requirements for lucky draw (always 1 USDC)
  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: "1000000", // $1 USDC
    resource: "https://example.com/lucky-draw",
    description: "Lucky Draw Entry - Win prizes!",
    mimeType: "application/json",
    payTo:
      process.env.NEXT_PUBLIC_X402_PAYMENT_ADDRESS ||
      "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
    maxTimeoutSeconds: 600,
    asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    outputSchema: undefined,
    extra: {
      name: "USDC",
      version: "2",
    },
  };

  // Use default facilitator (https://x402.org/facilitator)
  const { verify, settle } = useFacilitator(facilitator);

  let payment;
  let settleResponse;

  try {
    payment = exact.evm.decodePayment(payload);
    console.log("[Server] Lucky Draw Payment decoded:", payment);

    const valid = await verify(payment, paymentRequirements);
    if (!valid.isValid) {
      console.error("[Server] Lucky Draw Verification failed:", valid.invalidReason);
      return { success: false, error: valid.invalidReason };
    }

    console.log("[Server] Lucky Draw Payment verified successfully");

    // Attempt settlement with facilitator
    console.log("[Server] Attempting settlement with facilitator...");
    settleResponse = await settle(payment, paymentRequirements);

    if (!settleResponse.success) {
      console.error("[Server] Settlement failed:", settleResponse.errorReason);
      return { success: false, error: settleResponse.errorReason };
    }

    // Randomly select a prize
    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];

    console.log("[Server] Lucky Draw Payment settled on-chain successfully!");
    console.log("\n🎰 LUCKY DRAW SUCCESS!");
    console.log("===================================");
    if ('authorization' in payment.payload) {
      console.log("User Address:", payment.payload.authorization.from);
    }
    console.log("Amount Paid: $1 USDC");
    console.log("Prize Won: " + randomPrize);
    if ('authorization' in payment.payload) {
      console.log("Recipient:", payment.payload.authorization.to);
    }
    console.log("Transaction:", settleResponse.transaction);
    console.log("===================================\n");

    return { success: true, prize: randomPrize };
  } catch (error) {
    console.error("[Server] Lucky Draw Error:", error);
    return { success: false, error: String(error) };
  }
}
