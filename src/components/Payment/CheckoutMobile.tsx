import React from 'react';
import { FiLock, FiX } from 'react-icons/fi';
import {
  CheckoutViewProps,
  EmailToggle,
  ErrorBanner,
  LocationRow,
  OrderSummary,
  PaymentMethodPicker,
  PayButton,
  PhoneField,
  TermsRow,
} from './CheckoutParts';

/**
 * Mobile checkout — single compact screen.
 * Recap + location + payment method + phone + terms, with a fixed bottom CTA.
 * Designed to fit the viewport without scrolling in the common case.
 */
export const CheckoutMobile: React.FC<CheckoutViewProps> = (p) => (
  <div className="ck ck--mobile">
    <div className="ck-topbar">
      <span className="ck-brand">
        <FiLock aria-hidden="true" />
        Paiement sécurisé
      </span>
      {p.onClose && (
        <button type="button" className="ck-close" onClick={p.onClose} aria-label="Fermer">
          <FiX />
        </button>
      )}
    </div>

    <div className="ck-body">
      <OrderSummary name={p.itemName} image={p.itemImage} priceLabel={p.priceLabel} />

      <ErrorBanner message={p.formError} />

      <section className="ck-block">
        <LocationRow
          status={p.locationStatus}
          error={p.locationError}
          zoneName={p.zoneName}
          zoneCompany={p.zoneCompany}
          searchingZone={p.searchingZone}
          onRetry={p.onRetryLocation}
          disabled={p.disabled}
        />
      </section>

      <section className="ck-block">
        <h2 className="ck-label">Moyen de paiement</h2>
        <PaymentMethodPicker
          methods={p.methods}
          selectedId={p.selectedMethodId}
          onSelect={p.onSelectMethod}
          disabled={p.disabled}
        />
        {p.showPhone && (
          <PhoneField
            value={p.phone}
            operator={p.operator}
            error={p.phoneError}
            onChange={p.onPhoneChange}
            disabled={p.disabled}
          />
        )}
      </section>

      <EmailToggle
        email={p.email}
        enabled={p.emailEnabled}
        error={p.emailError}
        onToggle={p.onEmailToggle}
        onChange={p.onEmailChange}
        disabled={p.disabled}
      />

      <TermsRow
        checked={p.acceptTerms}
        error={p.termsError}
        onChange={p.onTermsChange}
        disabled={p.disabled}
      />
    </div>

    <div className="ck-cta">
      <PayButton
        priceLabel={p.priceLabel}
        submitting={p.submitting}
        disabled={p.disabled}
        onClick={p.onSubmit}
      />
    </div>
  </div>
);

export default CheckoutMobile;
