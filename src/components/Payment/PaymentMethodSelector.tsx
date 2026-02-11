import React, { useState, useRef, useEffect } from 'react';
import { FiCreditCard, FiDollarSign, FiTrendingUp, FiChevronDown, FiSmartphone, FiGlobe } from 'react-icons/fi';
import { PaymentMethod } from '../../types/payment.types';
import './payment-method-selector.css';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selected: string;
  onChange: (methodId: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  methods,
  selected,
  onChange,
  disabled = false,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getIcon = (method: PaymentMethod) => {
    // Use logo if available
    if (method.logo) {
      return (
        <img
          src={method.logo}
          alt={method.name}
          className="payment-icon-logo"
          style={{ width: '24px', height: '24px', objectFit: 'contain' }}
        />
      );
    }

    // Fall back to icon type
    switch (method.icon) {
      case 'credit_card':
      case 'card':
        return <FiCreditCard className="payment-icon" />;
      case 'paypal':
      case 'wallet':
        return <FiDollarSign className="payment-icon" />;
      case 'bank':
      case 'account_balance':
        return <FiTrendingUp className="payment-icon" />;
      case 'phone':
      case 'mobile_money':
        return <FiSmartphone className="payment-icon" />;
      default:
        // Choose icon based on type
        if (method.type === 'mobile_money') {
          return <FiSmartphone className="payment-icon" />;
        }
        if (method.type === 'card' || method.type === 'credit_card') {
          return <FiCreditCard className="payment-icon" />;
        }
        if (method.type === 'bank_account' || method.type === 'bank_transfer') {
          return <FiTrendingUp className="payment-icon" />;
        }
        return <FiGlobe className="payment-icon" />;
    }
  };

  // Format channel for display (e.g., "cm.mtn" -> "MTN Cameroon")
  const formatChannel = (channel?: string): string => {
    if (!channel) return '';
    const parts = channel.split('.');
    if (parts.length >= 2) {
      const provider = parts[1].toUpperCase();
      const country = parts[0].toUpperCase();
      return `${provider} ${country}`;
    }
    return channel.toUpperCase();
  };

  // Format country code to flag or name
  const getCountryDisplay = (country?: string): string => {
    if (!country) return '';
    const countryMap: Record<string, string> = {
      'CM': '🇨🇲',
      'GA': '🇬🇦',
      'CI': '🇨🇮',
      'SN': '🇸🇳',
      'NG': '🇳🇬',
      'GH': '🇬🇭',
      'KE': '🇰🇪',
      'TZ': '🇹🇿',
      'UG': '🇺🇬',
      'RW': '🇷🇼',
    };
    return countryMap[country.toUpperCase()] || country.toUpperCase();
  };

  const selectedMethod = methods.find((m) => m.id === selected);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (methodId: string) => {
    onChange(methodId);
    setIsOpen(false);
  };

  return (
    <div className={`payment-method-selector ${error ? 'error' : ''}`}>
      <div
        className={`custom-select-wrapper ${isOpen ? 'open' : ''}`}
        ref={wrapperRef}
      >
        <div
          className="custom-select-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          {selectedMethod ? (
            <>
              <div className="trigger-icon-wrapper">
                {getIcon(selectedMethod)}
              </div>
              <div className="trigger-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="trigger-text">{selectedMethod.name}</span>
                {(selectedMethod.channel || selectedMethod.country) && (
                  <span className="trigger-subtext" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {formatChannel(selectedMethod.channel)} {getCountryDisplay(selectedMethod.country)}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="trigger-placeholder">Select a payment method</span>
          )}
          <FiChevronDown className={`trigger-chevron ${isOpen ? 'open' : ''}`} />
        </div>

        <div className={`custom-select-dropdown ${isOpen ? 'open' : ''}`}>
          {methods.map((method) => (
            <button
              key={method.id}
              type="button"
              className={`dropdown-option ${selected === method.id ? 'active' : ''}`}
              onClick={() => handleOptionClick(method.id)}
              disabled={disabled}
            >
              <div className="option-icon-wrapper">
                {getIcon(method)}
              </div>
              <div className="option-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="option-text">{method.name}</span>
                {(method.channel || method.country) && (
                  <span className="option-subtext" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {formatChannel(method.channel)} {getCountryDisplay(method.country)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
