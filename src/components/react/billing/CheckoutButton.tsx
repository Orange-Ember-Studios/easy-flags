import { useState } from "react";
import type { PricingPlan } from "@domain/entities";
import { useTranslate } from "@/infrastructure/i18n/context";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";

interface CheckoutButtonProps {
  plan: PricingPlan;
  initialLocale?: AvailableLanguages;
}

export default function CheckoutButton({ plan, initialLocale }: CheckoutButtonProps) {
  const t = useTranslate(initialLocale);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Check if user is logged in
      const userResponse = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!userResponse.ok) {
        window.location.href = "/login";
        return;
      }

      // TODO: Implement payment processing
      alert(t('billing.planSelected', { name: plan.name }));
    } finally {
      setLoading(false);
    }
  };

  // Free tier - direct navigation
  if (plan.price === 0) {
    return (
      <div className="space-y-2 mb-6">
        <a
          href="/spaces"
          className="block w-full bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
        >
          {t('auth.getStarted')}
        </a>
      </div>
    );
  }

  // Paid plans - coming soon
  return (
    <div className="space-y-2 mb-6">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? t('billing.processing') : t('auth.getStarted')}
      </button>
      <p className="text-sm text-slate-400 text-center">
        {t('billing.paymentComingSoon')}
      </p>
    </div>
  );
}
