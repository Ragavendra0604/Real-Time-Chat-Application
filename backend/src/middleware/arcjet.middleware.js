import { isSpoofedBot } from "@arcjet/inspect";
import aj from "../lib/arcjet.js";

export const arcjetProtection = async (req, res, next) => {
  try {
    // DEV bypass: skip checks when developing locally
    if (process.env.NODE_ENV === "development" && req.headers["x-skip-arcjet"] === "true") {
      console.log("[Arcjet] dev bypass active");
      return next();
    }

    const decision = await aj.protect(req);

    // DEBUG: inspect decision object
    console.log("[Arcjet] decision:", {
      isDenied: decision.isDenied?.(),
      reason: decision.reason ? {
        isRateLimit: decision.reason.isRateLimit?.(),
        isBot: decision.reason.isBot?.()
      } : null,
      results: decision.results?.map(r => r.name || r.type || r) ?? decision.results
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Rate Limit exceeded. Please try again later." });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "Bot access denied." });
      } else {
        return res.status(403).json({ message: "Access denied by security policy." });
      }
    }

    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({
        error: "Spoofed bot detected",
        message: "Malicious bot activity detected.",
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet Protection Error:", error);
    // fail-safe: allow in development so debugging isn't blocked accidentally
    if (process.env.NODE_ENV === "development") return next();
    return res.status(500).json({ error: "Security middleware failed" });
  }
};
