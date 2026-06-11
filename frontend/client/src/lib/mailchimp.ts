/**
 * Mailchimp JSONP Subscription Utility
 *
 * Uses Mailchimp's JSONP endpoint — no backend required, works from static sites.
 * The JSONP approach converts /post? to /post-json? and injects a <script> tag
 * with a callback function that Mailchimp calls with the result.
 *
 * Homebuyers list: u=78d73687dd90474d0a8460e27, id=55d21946c8, f_id=000f8fe4f0
 * Agents list:     u=78d73687dd90474d0a8460e27, id=21d1735c37, f_id=000d8fe4f0 (separate audience)
 */

export interface MailchimpResult {
  success: boolean;
  message: string;
}

export interface SubscribeOptions {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;  // maps to COMPANY (homebuyers) or MMERGE5 (agents)
}

// Homebuyers audience
const HOMEBUYERS_URL =
  "https://realitycents.us19.list-manage.com/subscribe/post-json?u=78d73687dd90474d0a8460e27&id=55d21946c8&f_id=000f8fe4f0";

// Agents audience (separate Mailchimp audience — different id and honeypot)
const AGENTS_URL =
  "https://space.us19.list-manage.com/subscribe/post-json?u=78d73687dd90474d0a8460e27&id=21d1735c37&f_id=000d8fe4f0";

// Honeypot field names — each audience has its own
const HOMEBUYERS_HONEYPOT = "b_78d73687dd90474d0a8460e27_55d21946c8";
const AGENTS_HONEYPOT = "b_78d73687dd90474d0a8460e27_21d1735c37";

export const MAILCHIMP_CONFIG = {
  homebuyers: {
    actionUrl: HOMEBUYERS_URL,
    honeypotName: HOMEBUYERS_HONEYPOT,
    companyField: "COMPANY",
    successMessage: "Check your email! Your free Oahu Homebuyer's Guide is on its way.",
    alreadySubscribedMessage: "You're already on our list — check your inbox for the guide!",
  },
  agents: {
    actionUrl: AGENTS_URL,
    honeypotName: AGENTS_HONEYPOT,
    companyField: "MMERGE5",
    successMessage: "Thank you for partnering with RealityCents!",
    alreadySubscribedMessage: "You're already in our partner network — welcome back!",
  },
} as const;

export type AudienceKey = keyof typeof MAILCHIMP_CONFIG;

/**
 * Subscribe to a Mailchimp audience using JSONP.
 * Supports optional PHONE and COMPANY merge fields for the Agents list.
 */
export function subscribeToMailchimp(
  audience: AudienceKey,
  options: SubscribeOptions
): Promise<MailchimpResult> {
  return new Promise((resolve) => {
    const config = MAILCHIMP_CONFIG[audience];
    const { firstName, lastName, email, phone, company } = options;

    // Build a unique JSONP callback name to avoid collisions
    const callbackName = `mc_callback_${Date.now()}`;

    // Build the subscription URL with all required Mailchimp fields
    const params = new URLSearchParams({
      EMAIL: email,
      FNAME: firstName,
      LNAME: lastName,
      c: callbackName,
    });

    if (phone) params.append("PHONE", phone);
    // Company field name differs per audience (COMPANY for homebuyers, MMERGE5 for agents)
    if (company) params.append(config.companyField, company);

    // Append honeypot field (must be empty — bots fill it, humans don't)
    params.append(config.honeypotName, "");

    const url = `${config.actionUrl}&${params.toString()}`;

    // Timeout safety — 10s should be more than enough
    const timeout = setTimeout(() => {
      cleanup();
      resolve({
        success: false,
        message: "Request timed out. Please try again or contact Jay directly at (808) 429-0811.",
      });
    }, 10000);

    function cleanup() {
      clearTimeout(timeout);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      const script = document.getElementById(callbackName);
      if (script) script.remove();
    }

    // Register the JSONP callback — Mailchimp will call this with { result, msg }
    (window as unknown as Record<string, unknown>)[callbackName] = (data: {
      result: string;
      msg: string;
    }) => {
      cleanup();
      if (data.result === "success") {
        resolve({ success: true, message: config.successMessage });
      } else {
        const msg = data.msg || "";
        if (msg.toLowerCase().includes("already subscribed")) {
          resolve({ success: true, message: config.alreadySubscribedMessage });
        } else {
          resolve({
            success: false,
            message: msg.replace(/^\d+ - /, "") || "Something went wrong. Please try again.",
          });
        }
      }
    };

    // Inject the JSONP script tag
    const script = document.createElement("script");
    script.id = callbackName;
    script.src = url;
    script.onerror = () => {
      cleanup();
      resolve({
        success: false,
        message: "Could not reach Mailchimp. Please check your connection and try again.",
      });
    };
    document.body.appendChild(script);
  });
}
