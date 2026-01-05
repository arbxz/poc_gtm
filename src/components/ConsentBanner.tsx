import { useState, useEffect } from "react";
import "./ConsentBanner.css";

// Extend Window interface for GTM
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

const GTM_ID = "GTM-M9LBFSHN";
const GA_ID = "G-SQHS74Y1M9";

export const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consentGranted = localStorage.getItem("consentGranted");
    const consentDenied = localStorage.getItem("consentDenied");

    if (consentGranted === "true") {
      // User already granted consent, load GTM
      loadGTM();
    } else if (!consentDenied) {
      // No consent decision made yet, show banner
      setShowBanner(true);
    }
  }, []);

  const loadGTM = () => {
    // Update consent to granted
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args as unknown as Record<string, unknown>);
    }

    gtag("consent", "update", {
      ad_user_data: "granted",
      ad_personalization: "granted",
      ad_storage: "granted",
      analytics_storage: "granted",
    });

    // Load Google Tag Manager script
    const gtmScript = document.createElement("script");
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode?.insertBefore(gtmScript, firstScript);

    // Load Google Analytics script
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    firstScript.parentNode?.insertBefore(gaScript, firstScript);

    // Configure GA
    function gtagConfig(...args: unknown[]) {
      window.dataLayer.push(args as unknown as Record<string, unknown>);
    }
    gtagConfig("js", new Date());
    gtagConfig("config", GA_ID);

    // Add GTM noscript iframe
    const noscript = document.createElement("noscript");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    noscript.appendChild(iframe);
    document.body.appendChild(noscript);
  };

  const handleGrantConsent = () => {
    // Save consent decision
    localStorage.setItem("consentGranted", "true");
    localStorage.removeItem("consentDenied");

    // Push event to data layer
    window.dataLayer.push({
      event: "consent_granted",
      consent_type: "all",
      timestamp: new Date().toISOString(),
    });

    // Load GTM
    loadGTM();

    // Hide banner
    setShowBanner(false);
  };

  const handleDenyConsent = () => {
    // Save consent decision
    localStorage.setItem("consentDenied", "true");
    localStorage.removeItem("consentGranted");

    // Push event to data layer
    window.dataLayer.push({
      event: "consent_denied",
      consent_type: "all",
      timestamp: new Date().toISOString(),
    });

    // Hide banner
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="consent-banner">
      <div className="consent-banner__content">
        <div className="consent-banner__text">
          <h3>Cookie Consent</h3>
          <p>
            We use cookies and similar technologies to improve your experience,
            analyze site traffic, and personalize content. By clicking "Accept
            All", you consent to our use of cookies.
          </p>
        </div>
        <div className="consent-banner__buttons">
          <button
            id="consent-deny-button"
            className="consent-banner__button consent-banner__button--deny"
            onClick={handleDenyConsent}
          >
            Deny
          </button>
          <button
            id="consent-grant-button"
            className="consent-banner__button consent-banner__button--grant"
            onClick={handleGrantConsent}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
