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
 * Desktop checkout — a single compact, centered card.
 * Same information as mobile but laid out as a contained dialog rather than a
 * full-height page, so it stays short and centered.
 */
export const CheckoutDesktop: React.FC<CheckoutViewProps> = (p) => (
  <div className="ck ck--desktop">
    <div className="ck-card">
      <div className="ck-card__head">
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

      <OrderSummary name={p.itemName} image={p.itemImage} priceLabel={p.priceLabel} />

      <ErrorBanner message={p.formError} />

      <LocationRow
        status={p.locationStatus}
        error={p.locationError}
        zoneName={p.zoneName}
        zoneCompany={p.zoneCompany}
        searchingZone={p.searchingZone}
        onRetry={p.onRetryLocation}
        disabled={p.disabled}
      />

      <div className="ck-field">
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
      </div>

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

      <PayButton
        priceLabel={p.priceLabel}
        submitting={p.submitting}
        disabled={p.disabled}
        onClick={p.onSubmit}
      />
    </div>
  </div>
);

export default CheckoutDesktop;
