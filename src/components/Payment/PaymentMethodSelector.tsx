import React from 'react';
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

  return (
    <div className={`payment-method-selector ${error ? 'error' : ''}`}>
      <div className="custom-select-wrapper">
        <div className="custom-select-trigger">
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
          <FiChevronDown className="trigger-chevron" />
        </div>

        <div className="custom-select-dropdown">
          {methods.map((method) => (
            <button
              key={method.id}
              type="button"
              className={`dropdown-option ${selected === method.id ? 'active' : ''}`}
              onClick={() => onChange(method.id)}
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
