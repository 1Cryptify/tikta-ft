import React, { useState, useRef, useEffect } from 'react';
import { FiCreditCard, FiDollarSign, FiTrendingUp, FiChevronDown } from 'react-icons/fi';
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

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'credit_card':
        return <FiCreditCard className="payment-icon" />;
      case 'paypal':
        return <FiDollarSign className="payment-icon" />;
      case 'bank':
        return <FiTrendingUp className="payment-icon" />;
      default:
        return null;
    }
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
                {getIcon(selectedMethod.icon || '')}
              </div>
              <span className="trigger-text">{selectedMethod.name}</span>
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
                {getIcon(method.icon || '')}
              </div>
              <span className="option-text">{method.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
