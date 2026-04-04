import { useState } from "react";
import { useTranslate } from "@/infrastructure/i18n/context";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";

interface ContactFormProps {
  initialLocale?: AvailableLanguages;
}

export default function ContactForm({ initialLocale }: ContactFormProps) {
  const t = useTranslate(initialLocale);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, this would send to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitted && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
          {t('contact.success')}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1"
        >
          {t('contact.name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-medium"
          placeholder={t('contact.namePlaceholder')}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1"
        >
          {t('contact.emailLabel')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-medium"
          placeholder={t('contact.emailPlaceholder')}
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1"
        >
          {t('contact.subject')}
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-medium"
          placeholder={t('contact.subjectPlaceholder')}
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1"
        >
          {t('contact.message')}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all h-32 resize-none text-sm font-medium"
          placeholder={t('contact.messagePlaceholder')}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary py-4! shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {isSubmitting ? t('contact.sending') : t('contact.sendMessage')}
      </button>
    </form>
  );
}
