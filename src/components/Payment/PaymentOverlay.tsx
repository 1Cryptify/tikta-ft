import React from 'react';
import { FiCheck } from 'react-icons/fi';
import './payment-overlay.css';

export interface PaymentOverlayProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  /** Extra content (e.g. USSD instructions) shown prominently. */
  hint?: React.ReactNode;
  /** Ordered list of steps shown under the spinner. */
  steps?: string[];
  /** Index of the currently active step (0-based). */
  activeStep?: number;
  /** Seconds elapsed since the operation started (optional live counter). */
  elapsedSeconds?: number;
  tone?: 'primary' | 'success' | 'danger';
  onCancel?: () => void;
  cancelLabel?: string;
}

/**
 * Full-screen, blocking overlay used while a payment is being initiated or
 * verified. It guarantees the user always sees clear feedback (the previous
 * inline spinner was rendered off-screen).
 */
export const PaymentOverlay: React.FC<PaymentOverlayProps> = ({
  visible,
  title,
  subtitle,
  hint,
  steps,
  activeStep = 0,
  elapsedSeconds,
  tone = 'primary',
  onCancel,
  cancelLabel = 'Annuler',
}) => {
  if (!visible) return null;

  const stateFor = (index: number): 'done' | 'active' | 'pending' => {
    if (index < activeStep) return 'done';
    if (index === activeStep) return 'active';
    return 'pending';
  };

  return (
    <div className="payment-overlay" role="dialog" aria-modal="true" aria-live="polite">
      <div className="payment-overlay__backdrop" />
      <div className={`payment-overlay__card payment-overlay__card--${tone}`}>
        <div className="payment-spinner" aria-hidden="true">
          <span className="payment-spinner__ring" />
          <span className="payment-spinner__ring payment-spinner__ring--delayed" />
          <span className="payment-spinner__core" />
        </div>

        <h2 className="payment-overlay__title">{title}</h2>
        {subtitle && <p className="payment-overlay__subtitle">{subtitle}</p>}

        {hint && <div className="payment-overlay__hint">{hint}</div>}

        {typeof elapsedSeconds === 'number' && elapsedSeconds > 0 && (
          <p className="payment-overlay__timer">En attente depuis {elapsedSeconds}s…</p>
        )}

        {steps && steps.length > 0 && (
          <ol className="payment-overlay__steps">
            {steps.map((step, index) => {
              const state = stateFor(index);
              return (
                <li key={step} className={`payment-overlay__step payment-overlay__step--${state}`}>
                  <span className="payment-overlay__step-bullet">
                    {state === 'done' ? <FiCheck aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="payment-overlay__step-label">{step}</span>
                </li>
              );
            })}
          </ol>
        )}

        {onCancel && (
          <button type="button" className="payment-overlay__cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
      </div>
    </div>
  );
};

/** Small inline spinner for buttons / fields. */
export const InlineSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`btn-spinner ${className}`.trim()} aria-hidden="true" />
);

export default PaymentOverlay;
