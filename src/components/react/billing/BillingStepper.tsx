import React from "react";

interface BillingStepperProps {
  currentStep: number;
  totalSteps: number;
}

export const BillingStepper: React.FC<BillingStepperProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="px-8 flex gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            currentStep >= i + 1 ? "bg-cyan-500" : "bg-white/5"
          }`}
        />
      ))}
    </div>
  );
};
