import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { PricingPlan } from "@domain/entities";
import { useTranslate } from "@/infrastructure/i18n/context";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";
import { Icon } from "../shared/Icon";

interface CheckoutButtonProps {
  plan: PricingPlan;
  initialLocale?: AvailableLanguages;
}

interface CustomerDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  initialLocale?: AvailableLanguages;
  acceptanceData?: {
    acceptanceToken: string;
    acceptanceText: string;
    dataPrivacyToken: string;
    dataPrivacyText: string;
  };
}

function CustomerDataModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  initialLocale,
  acceptanceData,
}: CustomerDataModalProps) {
  const t = useTranslate(initialLocale);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    legalId: "",
    legalIdType: "CC",
    addressLine1: "",
    city: "",
    region: "",
    cardHolder: "",
    cardNumber: "",
    cvv: "",
    expiryMonth: "",
    expiryYear: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep(1);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      if (!formData.acceptTerms || !formData.acceptPrivacy) {
        alert("Debes aceptar los términos y el tratamiento de datos para continuar.");
        return;
      }
      onSubmit(formData);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#06080f]/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative bg-[#0b0e14]/95 border border-white/10 rounded-[2.5rem] shadow-2xl max-w-md w-full flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-linear-to-r from-transparent via-cyan-500/50 to-transparent"></div>

        <div className="shrink-0 p-8 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
              {step === 1
                ? t("billing.customerDataTitle")
                : step === 2 
                  ? "Dirección de Facturación"
                  : "Método de Pago"}
            </h2>
            <p className="text-slate-400 text-sm">
              {step === 1
                ? t("billing.customerDataSubtitle")
                : step === 2
                  ? "Completa tus datos de envío y facturación"
                  : "Ingresa los datos de tu tarjeta"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-500 hover:text-white transition-all"
          >
            <Icon name="X" size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-8 flex gap-2 mb-2">
          <div
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-cyan-500" : "bg-white/5"}`}
          />
          <div
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-cyan-500" : "bg-white/5"}`}
          />
          <div
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? "bg-cyan-500" : "bg-white/5"}`}
          />
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          <div className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                    {t("billing.phoneNumber")}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <Icon name="MessageSquare" size={16} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="3001234567"
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-950/40 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                      {t("billing.legalIdType")}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.legalIdType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            legalIdType: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-3.5 bg-slate-950/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        {[
                          "CC",
                          "CE",
                          "NIT",
                          "PP",
                          "TI",
                          "DNI",
                          "RG",
                          "CPF",
                        ].map((type) => (
                          <option
                            key={type}
                            value={type}
                            className="bg-[#0b0e14]"
                          >
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <Icon name="ChevronDown" size={12} />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                      {t("billing.legalId")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <Icon name="CreditCard" size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.legalId}
                        onChange={(e) =>
                          setFormData({ ...formData, legalId: e.target.value })
                        }
                        placeholder="123456789"
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-950/40 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : step === 2 ? (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                    Dirección
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <Icon name="MapPin" size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.addressLine1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          addressLine1: e.target.value,
                        })
                      }
                      placeholder="Calle 123 # 45-67"
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-950/40 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                      Ciudad
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="Bogotá"
                        className="w-full px-5 py-3.5 bg-slate-950/40 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                      Departamento
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.region}
                        onChange={(e) =>
                          setFormData({ ...formData, region: e.target.value })
                        }
                        placeholder="Cundinamarca"
                        className="w-full px-5 py-3.5 bg-slate-950/40 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">
                    Titular de la Tarjeta
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cardHolder}
                    onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-white text-sm focus:border-cyan-500/50 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">
                    Número de Tarjeta
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4242 4242 4242 4242"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      // Allow digits and spaces
                      const val = e.target.value.replace(/[^\d\s]/g, "");
                      // Auto-format with spaces every 4 digits
                      const formatted = val.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
                      setFormData({ ...formData, cardNumber: formatted });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-white text-sm focus:border-cyan-500/50 transition-all shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-white text-sm focus:border-cyan-500/50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">
                        Mes
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        placeholder="MM"
                        value={formData.expiryMonth}
                        onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value.replace(/\D/g, "") })}
                        className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-white text-sm focus:border-cyan-500/50 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">
                        Año
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="YY"
                        value={formData.expiryYear}
                        onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value.replace(/\D/g, "") })}
                        className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-white text-sm focus:border-cyan-500/50 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {acceptanceData && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        id="acceptTerms" 
                        required
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                        className="mt-1 accent-cyan-500"
                      />
                      <label htmlFor="acceptTerms" className="text-[10px] text-slate-400">
                        Acepto los <a href={acceptanceData.acceptanceText} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Términos y Condiciones</a> del servicio.
                      </label>
                    </div>
                    <div className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        id="acceptPrivacy" 
                        required
                        checked={formData.acceptPrivacy}
                        onChange={(e) => setFormData({ ...formData, acceptPrivacy: e.target.checked })}
                        className="mt-1 accent-cyan-500"
                      />
                      <label htmlFor="acceptPrivacy" className="text-[10px] text-slate-400">
                        Acepto el <a href={acceptanceData.dataPrivacyText} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Tratamiento de Datos Personales</a>.
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="flex-1 py-3.5 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
              >
                Volver
              </button>
            )}
            {step < 3 ? (
              <>
                {step === 1 && (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3.5 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                  >
                    {t("billing.close")}
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-2 bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-2xl transition shadow-lg shadow-cyan-500/20"
                >
                  Siguiente
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-2 bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-2xl transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    {t("billing.processing")}
                  </span>
                ) : (
                  "Pagar Ahora"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default function CheckoutButton({
  plan,
  initialLocale,
}: CheckoutButtonProps) {
  const t = useTranslate(initialLocale);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptanceData, setAcceptanceData] = useState<any>(null);
  const [initData, setInitData] = useState<any>(null);

  const handleCheckoutClick = async () => {
    setLoading(true);
    try {
      // Check if user is logged in
      const userResponse = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!userResponse.ok) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      // If it's a paid plan, show the modal
      if (plan.price_usd > 0) {
        // Pre-fetch acceptance info and init payment
        const checkoutResponse = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planSlug: plan.slug,
          }),
        });

        const result = await checkoutResponse.json();
        if (checkoutResponse.ok) {
          setInitData(result.data);
          setAcceptanceData(result.data.acceptance);
        }

        setIsModalOpen(true);
        setLoading(false);
        return;
      }

      // For free plans
      window.location.href = "/spaces";
    } catch (error: any) {
      console.error("[Checkout Error]:", error);
      alert(error.message || t("billing.paymentError"));
      setLoading(false);
    }
  };

  const proceedToCheckout = async (formData: any) => {
    setLoading(true);
    try {
      let data = initData;

      // If we don't have init data (maybe it failed during opening), try again
      if (!data) {
        const checkoutResponse = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planSlug: plan.slug,
            phoneNumber: formData.phoneNumber,
            phoneNumberPrefix: "+57",
            legalId: formData.legalId,
            legalIdType: formData.legalIdType,
            addressLine1: formData.addressLine1,
            city: formData.city,
            region: formData.region,
          }),
        });

        const result = await checkoutResponse.json();
        if (!checkoutResponse.ok) {
          throw new Error(result.error || t("billing.failedInitialize"));
        }
        data = result.data;
      }

      // 1. Tokenize card with Wompi Direct API
      const isProd = !data.publicKey.startsWith("pub_test_");
      const tokenBaseUrl = isProd 
        ? "https://production.wompi.co/v1" 
        : "https://sandbox.wompi.co/v1";

      const cleanNumber = formData.cardNumber.replace(/\s+/g, "").replace(/\D/g, "");
      const cleanCvc = formData.cvv.replace(/\D/g, "");
      const cleanMonth = formData.expiryMonth.replace(/\D/g, "").padStart(2, "0");
      const cleanYear = formData.expiryYear.replace(/\D/g, "").slice(-2);

      // Simple Luhn Algorithm Check
      const isLuhnValid = (num: string) => {
        let sum = 0;
        for (let i = 0; i < num.length; i++) {
          let digit = parseInt(num[num.length - 1 - i]);
          if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
        }
        return sum % 10 === 0;
      };

      console.log("[Wompi Debug] Payload Preview:", {
        numberPrefix: cleanNumber.substring(0, 4),
        length: cleanNumber.length,
        luhnLocal: isLuhnValid(cleanNumber),
        publicKey: data.publicKey.substring(0, 15) + "...",
        env: data.publicKey.startsWith("pub_test") ? "SANDBOX" : "PROD"
      });

      if (cleanNumber.length < 15 || cleanNumber.length > 16) {
        throw new Error(`El número de tarjeta debe tener 15 o 16 dígitos (tienes ${cleanNumber.length}).`);
      }

      if (!isLuhnValid(cleanNumber)) {
        throw new Error("El número de tarjeta no pasa la validación de Luhn (algoritmo de tarjeta inválido). Revisa que lo hayas copiado bien.");
      }

      const tokenizeResponse = await fetch(`${tokenBaseUrl}/tokens/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${data.publicKey}`,
        },
        body: JSON.stringify({
          number: cleanNumber,
          cvc: cleanCvc,
          exp_month: cleanMonth,
          exp_year: cleanYear,
          card_holder: formData.cardHolder.trim(),
        }),
      });

      const tokenResult = await tokenizeResponse.json();
      if (!tokenizeResponse.ok) {
        console.error("[Tokenization Failed Full Result]:", tokenResult);
        
        const errorMapping: Record<string, string> = {
          'invalid_card_data': 'Los datos de la tarjeta son inválidos.',
          'invalid_request_error': 'Error en la petición de pago.',
          'card_not_supported': 'La tarjeta no es soportada.',
          'network_error': 'Error de red al procesar la tarjeta.',
          'not_found': 'Recurso no encontrado.',
          'internal_server_error': 'Error interno del servidor de pagos.',
        };

        let errorMessage = errorMapping[tokenResult.error?.reason] || tokenResult.error?.reason || "Error al tokenizar la tarjeta.";
        
        if (tokenResult.error?.messages) {
          const detailedMessages = Object.entries(tokenResult.error.messages)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join(". ");
          if (detailedMessages) {
            errorMessage = `${errorMessage} Detalle: ${detailedMessages}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const cardToken = tokenResult.data.id;

      // 2. Confirm payment on backend
      const confirmResponse = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: cardToken,
          acceptance_token: data.acceptance.acceptanceToken,
          personal_data_auth_token: data.acceptance.dataPrivacyToken,
          reference: data.transaction.reference,
          amountInCents: data.amountInCents,
          currency: data.currency,
          customerData: {
            ...data.customer,
            phoneNumber: formData.phoneNumber,
            phoneNumberPrefix: data.customer.phoneNumberPrefix || "+57",
            legalId: formData.legalId,
            legalIdType: formData.legalIdType,
          },
          shippingAddress: {
            addressLine1: formData.addressLine1,
            city: formData.city,
            phoneNumber: formData.phoneNumber,
            region: formData.region,
            country: "CO",
          },
        }),
      });

      const confirmResult = await confirmResponse.json();
      if (!confirmResponse.ok) {
        throw new Error(confirmResult.error || "Error al procesar el pago.");
      }

      const transaction = confirmResult.data;
      if (transaction.status === "APPROVED") {
        window.location.href = `/payment-result?status=success&id=${transaction.id}`;
      } else if (transaction.status === "PENDING") {
        window.location.href = `/payment-result?status=pending&id=${transaction.id}`;
      } else {
        window.location.href = `/payment-result?status=error&id=${transaction.id}`;
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error("[Checkout Error]:", error);
      alert(error.message || t("billing.paymentError"));
    } finally {
      setLoading(false);
    }
  };

  // Paid plans
  return (
    <div className="space-y-2 mb-6">
      <button
        onClick={handleCheckoutClick}
        disabled={loading}
        className={`w-full bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? t("billing.processing") : t("auth.getStarted")}
      </button>

      <CustomerDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={proceedToCheckout}
        loading={loading}
        initialLocale={initialLocale}
        acceptanceData={acceptanceData}
      />
    </div>
  );
}
