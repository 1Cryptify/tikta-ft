import React, { useState } from 'react';
import {
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiCreditCard,
  FiGlobe,
  FiLoader,
  FiMail,
  FiMapPin,
  FiRefreshCw,
  FiSmartphone,
  FiTag,
} from 'react-icons/fi';
import { MobileOperator, PaymentMethod, formatLocalPhone } from '../../types/payment.types';
import { getMediaUrl } from '../../services/api';
import { OfferVisual } from '../OfferVisual';
import { InlineSpinner } from './PaymentOverlay';
import './checkout.css';

export type LocationState = 'idle' | 'locating' | 'granted' | 'denied' | 'error' | 'unsupported';

export interface CheckoutViewProps {
  itemName: string;
  itemImage?: string;
  itemIcon?: string | null;
  itemIconBackground?: string | null;
  priceLabel: string;
  formError?: string | null;

  /** Location is only required when the offer's company has active zones. */
  requiresLocation: boolean;
  locationStatus: LocationState;
  locationError?: string;
  zoneName?: string | null;
  zoneCompany?: string | null;
  searchingZone: boolean;
  onRetryLocation: () => void;

  methods: PaymentMethod[];
  selectedMethodId: string;
  onSelectMethod: (method: PaymentMethod) => void;

  showPhone: boolean;
  phone: string;
  operator: MobileOperator;
  phoneError?: string;
  onPhoneChange: (raw: string) => void;

  email: string;
  emailEnabled: boolean;
  emailError?: string;
  onEmailToggle: (enabled: boolean) => void;
  onEmailChange: (value: string) => void;

  acceptTerms: boolean;
  termsError?: string;
  onTermsChange: (checked: boolean) => void;
  onOpenTerms?: () => void;

  submitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
  onClose?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Order summary                                                      */
/* ------------------------------------------------------------------ */

export const OrderSummary: React.FC<{
  name: string;
  image?: string;
  icon?: string | null;
  iconBackground?: string | null;
  priceLabel: string;
}> = ({ name, image, icon, iconBackground, priceLabel }) => (
  <div className="ck-order">
    <div className="ck-order__thumb">
      <OfferVisual
        image={image}
        icon={icon}
        background={iconBackground}
        alt={name}
        iconSize={24}
        style={{ borderRadius: 'inherit' }}
        placeholder={<FiTag />}
      />
    </div>
    <div className="ck-order__info">
      <span className="ck-order__name">{name}</span>
      <span className="ck-order__hint">Accès immédiat après paiement</span>
    </div>
    <span className="ck-order__price">{priceLabel}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Global error banner                                                */
/* ------------------------------------------------------------------ */

export const ErrorBanner: React.FC<{ message?: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="ck-error" role="alert">
      <FiAlertTriangle aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Location row                                                       */
/* ------------------------------------------------------------------ */

interface LocationRowProps {
  status: LocationState;
  error?: string;
  zoneName?: string | null;
  zoneCompany?: string | null;
  searchingZone: boolean;
  onRetry: () => void;
  disabled?: boolean;
}

const locationCopy = (status: LocationState): string => {
  switch (status) {
    case 'locating': return 'Localisation en cours…';
    case 'granted': return 'Position confirmée';
    case 'denied': return 'Localisation refusée';
    case 'error': return 'Position introuvable';
    case 'unsupported': return 'Non supporté par le navigateur';
    default: return 'Localisation en attente';
  }
};

export const LocationRow: React.FC<LocationRowProps> = ({
  status,
  error,
  zoneName,
  zoneCompany,
  searchingZone,
  onRetry,
  disabled,
}) => {
  const ok = status === 'granted';
  const bad = status === 'denied' || status === 'error' || status === 'unsupported';

  return (
    <div className="ck-loc-wrap">
    <div className={`ck-loc ${ok ? 'is-ok' : ''} ${bad ? 'is-bad' : ''}`}>
      <span className="ck-loc__icon" aria-hidden="true">
        {status === 'locating' ? (
          <FiLoader className="ck-spin" />
        ) : ok ? (
          <FiCheckCircle />
        ) : bad ? (
          <FiAlertTriangle />
        ) : (
          <FiMapPin />
        )}
      </span>

      <div className="ck-loc__text">
        <span className="ck-loc__title">{locationCopy(status)}</span>
        {ok && (
          <span className="ck-loc__sub">
            {searchingZone
              ? 'Recherche de la zone…'
              : zoneName
                ? `Zone : ${zoneName}${zoneCompany ? ` — ${zoneCompany}` : ''}`
                : 'Paiement non rattaché à une zone'}
          </span>
        )}
        {status === 'denied' && (
          <span className="ck-loc__sub">
            Autorisez la localisation dans le navigateur (icône cadenas, barre d'adresse).
          </span>
        )}
      </div>

      {!ok && (
        <button type="button" className="ck-loc__retry" onClick={onRetry} disabled={disabled}>
          <FiRefreshCw aria-hidden="true" />
          <span>Réessayer</span>
        </button>
      )}
    </div>
    {error && <span className="ck-field-error">{error}</span>}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Payment method picker                                              */
/* ------------------------------------------------------------------ */

function methodIcon(method: PaymentMethod): React.ReactNode {
  if (method.type === 'mobile_money') return <FiSmartphone />;
  if (method.type === 'card' || method.type === 'credit_card') return <FiCreditCard />;
  return <FiGlobe />;
}

const PaymentMethodLogo: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const [failed, setFailed] = useState(false);
  if (method.logo && !failed) {
    return (
      <img
        src={getMediaUrl(method.logo)}
        alt={method.name}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return <span className="ck-method__fallback">{methodIcon(method)}</span>;
};

export const PaymentMethodPicker: React.FC<{
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}> = ({ methods, selectedId, onSelect, disabled }) => (
  <div className="ck-methods" role="radiogroup" aria-label="Moyen de paiement">
    {methods.map((method) => {
      const active = method.id === selectedId;
      return (
        <button
          key={method.id}
          type="button"
          role="radio"
          aria-checked={active}
          className={`ck-method ${active ? 'is-active' : ''}`}
          onClick={() => onSelect(method)}
          disabled={disabled}
        >
          <span className="ck-method__logo" aria-hidden="true">
            <PaymentMethodLogo method={method} />
          </span>
          <span className="ck-method__name">{method.name}</span>
          {active && (
            <span className="ck-method__check" aria-hidden="true">
              <FiCheck />
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Phone field                                                        */
/* ------------------------------------------------------------------ */

const OPERATOR_LABEL: Record<MobileOperator, string> = {
  mtn: 'MTN Mobile Money',
  orange: 'Orange Money',
  unknown: '',
};

export const PhoneField: React.FC<{
  value: string;
  operator: MobileOperator;
  error?: string;
  onChange: (raw: string) => void;
  disabled?: boolean;
}> = ({ value, operator, error, onChange, disabled }) => (
  <div className="ck-phone">
    <label htmlFor="ck-phone">Numéro de paiement</label>
    <div className={`ck-phone__wrap ${error ? 'is-error' : ''}`}>
      <FiSmartphone className="ck-phone__icon" aria-hidden="true" />
      <input
        id="ck-phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="6 70 00 00 00"
        value={formatLocalPhone(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
    {operator !== 'unknown' && !error && (
      <span className={`ck-phone__detected is-${operator}`}>
        {OPERATOR_LABEL[operator]} détecté
      </span>
    )}
    {error && <span className="ck-field-error">{error}</span>}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Optional email                                                     */
/* ------------------------------------------------------------------ */

export const EmailToggle: React.FC<{
  email: string;
  enabled: boolean;
  error?: string;
  onToggle: (enabled: boolean) => void;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ email, enabled, error, onToggle, onChange, disabled }) => (
  <div className="ck-email">
    {!enabled ? (
      <button
        type="button"
        className="ck-link"
        onClick={() => onToggle(true)}
        disabled={disabled}
      >
        <FiMail aria-hidden="true" />
        <span>Recevoir aussi par email (optionnel)</span>
      </button>
    ) : (
      <div className="ck-email__open">
        <div className={`ck-phone__wrap ${error ? 'is-error' : ''}`}>
          <FiMail className="ck-phone__icon" aria-hidden="true" />
          <input
            type="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </div>
        {error && <span className="ck-field-error">{error}</span>}
        <button type="button" className="ck-link ck-link--muted" onClick={() => onToggle(false)} disabled={disabled}>
          Retirer l'email
        </button>
      </div>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Terms                                                              */
/* ------------------------------------------------------------------ */

export const TermsRow: React.FC<{
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
  onOpenTerms?: () => void;
  requireLocation?: boolean;
  disabled?: boolean;
}> = ({ checked, error, onChange, onOpenTerms, requireLocation = true, disabled }) => (
  <div className={`ck-terms ${error ? 'is-error' : ''}`}>
    <label className="ck-terms__label">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span>
        J'accepte{requireLocation ? ' le partage de ma localisation et' : ''} les{' '}
        <button
          type="button"
          className="ck-terms__link"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenTerms?.();
          }}
        >
          conditions d'utilisation
        </button>
        .
      </span>
    </label>
    {error && <span className="ck-field-error">{error}</span>}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Pay button                                                         */
/* ------------------------------------------------------------------ */

export const PayButton: React.FC<{
  priceLabel: string;
  submitting: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'submit' | 'button';
  form?: string;
}> = ({ priceLabel, submitting, disabled, onClick, type = 'button', form }) => (
  <button type={type} form={form} className="ck-pay" onClick={onClick} disabled={disabled || submitting}>
    {submitting ? (
      <>
        <InlineSpinner />
        <span>Traitement…</span>
      </>
    ) : (
      <span>Payer {priceLabel}</span>
    )}
  </button>
);
