/**
 * Map upstream Anthropic / runtime errors to user-facing copy + HTTP status.
 * Never leak raw API payloads to the client.
 */
export interface MappedError {
  status: number;
  message: string;
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

/** True when the failure is almost certainly billing / credits. */
function isBillingError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes("credit") ||
    lower.includes("billing") ||
    lower.includes("spend limit") ||
    lower.includes("balance is too low") ||
    lower.includes("payment") ||
    lower.includes("402") ||
    // Anthropic returns HTTP 400 for credit_balance_too_low
    (lower.includes("400") &&
      (lower.includes("invalid_request") ||
        lower.includes("credit_balance") ||
        lower.includes("anthropic")))
  );
}

/**
 * Convert a caught error into a friendly message + status for the client.
 * `context` picks the generic fallback when we can't classify the failure.
 */
export function mapUpstreamError(
  error: unknown,
  context: "detect" | "generate",
): MappedError {
  const msg = errorText(error);
  const lower = msg.toLowerCase();

  if (isBillingError(msg)) {
    return {
      status: 402,
      message:
        "We're temporarily out of AI credits. Add funds in the Anthropic console, then try again.",
    };
  }

  if (lower.includes("401") || lower.includes("authentication")) {
    return {
      status: 401,
      message:
        "AI service authentication failed. Check that the API key is set correctly.",
    };
  }

  if (lower.includes("429") || lower.includes("rate_limit")) {
    return {
      status: 429,
      message: "Too many requests right now. Wait a moment and try again.",
    };
  }

  if (lower.includes("404") || lower.includes("not_found")) {
    return {
      status: 502,
      message: "The AI model isn't available right now. Please try again later.",
    };
  }

  if (lower.includes("529") || lower.includes("overloaded")) {
    return {
      status: 503,
      message: "The AI is busy right now. Please try again in a moment.",
    };
  }

  if (context === "detect") {
    return {
      status: 500,
      message:
        "We couldn't identify ingredients in that photo. Try another shot with clearer lighting.",
    };
  }

  return {
    status: 500,
    message: "We couldn't generate recipes right now. Please try again.",
  };
}

/**
 * @deprecated Prefer mapUpstreamError — kept for existing call sites/tests.
 * Map a caught error to an HTTP status code.
 */
export function statusFromError(error: unknown): number {
  return mapUpstreamError(error, "detect").status;
}
