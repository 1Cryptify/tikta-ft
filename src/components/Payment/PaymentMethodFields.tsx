import React from 'react';
import { PaymentFormData } from '../../types/payment.types';

interface PaymentMethodFieldsProps {
  paymentMethod: string;
  formData: PaymentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
  disabled: boolean;
}

export const PaymentMethodFields: React.FC<PaymentMethodFieldsProps> = ({
  paymentMethod,
  formData,
  onChange,
  errors,
  disabled,
}) => {
  // Mobile Money Fields - Just need phone number for initialization
  if (paymentMethod === 'mobile_money' || paymentMethod === 'MOBILE_MONEY') {
    return (
      <div className="payment-method-fields">
        <h4 className="field-section-title">Mobile Money Details</h4>
        <p className="field-description">
          Enter your mobile money phone number. You will receive a prompt on your phone to confirm the payment.
        </p>
        <div className={`form-group ${errors.mobileMoneyNumber ? 'error' : ''}`}>
          <label htmlFor="mobileMoneyNumber">Mobile Money Number</label>
          <input
            type="tel"
            id="mobileMoneyNumber"
            name="mobileMoneyNumber"
            value={formData.mobileMoneyNumber || ''}
            onChange={onChange}
            placeholder="+237 6XX XXX XXX"
            disabled={disabled}
            required
          />
          {errors.mobileMoneyNumber && (
            <span className="form-error">{errors.mobileMoneyNumber}</span>
          )}
        </div>
      </div>
    );
  }

  // Bank Account Fields
  if (paymentMethod === 'bank_account' || paymentMethod === 'BANK_ACCOUNT') {
    return (
      <div className="payment-method-fields">
        <h4 className="field-section-title">Bank Account Details</h4>

        <div className={`form-group ${errors.bankAccountName ? 'error' : ''}`}>
          <label htmlFor="bankAccountName">Account Holder Name</label>
          <input
            type="text"
            id="bankAccountName"
            name="bankAccountName"
            value={formData.bankAccountName || ''}
            onChange={onChange}
            placeholder="John Doe"
            disabled={disabled}
            required
          />
          {errors.bankAccountName && (
            <span className="form-error">{errors.bankAccountName}</span>
          )}
        </div>

        <div className={`form-group ${errors.bankCode ? 'error' : ''}`}>
          <label htmlFor="bankCode">Bank Code</label>
          <input
            type="text"
            id="bankCode"
            name="bankCode"
            value={formData.bankCode || ''}
            onChange={onChange}
            placeholder="e.g., 001"
            disabled={disabled}
            required
          />
          {errors.bankCode && (
            <span className="form-error">{errors.bankCode}</span>
          )}
        </div>

        <div className={`form-group ${errors.bankAccountNumber ? 'error' : ''}`}>
          <label htmlFor="bankAccountNumber">Account Number</label>
          <input
            type="text"
            id="bankAccountNumber"
            name="bankAccountNumber"
            value={formData.bankAccountNumber || ''}
            onChange={onChange}
            placeholder="0123456789"
            disabled={disabled}
            required
          />
          {errors.bankAccountNumber && (
            <span className="form-error">{errors.bankAccountNumber}</span>
          )}
        </div>
      </div>
    );
  }

  // Credit Card Fields
  if (paymentMethod === 'card' || paymentMethod === 'CC' || paymentMethod === 'credit_card') {
    return (
      <div className="payment-method-fields">
        <h4 className="field-section-title">Credit Card Details</h4>

        <div className={`form-group ${errors.cardNumber ? 'error' : ''}`}>
          <label htmlFor="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber || ''}
            onChange={onChange}
            placeholder="4532 XXXX XXXX XXXX"
            disabled={disabled}
            maxLength={19}
            required
          />
          {errors.cardNumber && (
            <span className="form-error">{errors.cardNumber}</span>
          )}
        </div>

        <div className="form-row">
          <div className={`form-group ${errors.cardExpiry ? 'error' : ''}`}>
            <label htmlFor="cardExpiry">Expiry Date</label>
            <input
              type="text"
              id="cardExpiry"
              name="cardExpiry"
              value={formData.cardExpiry || ''}
              onChange={onChange}
              placeholder="MM/YY"
              disabled={disabled}
              maxLength={5}
              required
            />
            {errors.cardExpiry && (
              <span className="form-error">{errors.cardExpiry}</span>
            )}
          </div>

          <div className={`form-group ${errors.cardCvc ? 'error' : ''}`}>
            <label htmlFor="cardCvc">CVC</label>
            <input
              type="text"
              id="cardCvc"
              name="cardCvc"
              value={formData.cardCvc || ''}
              onChange={onChange}
              placeholder="123"
              disabled={disabled}
              maxLength={4}
              required
            />
            {errors.cardCvc && (
              <span className="form-error">{errors.cardCvc}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No additional fields for PayPal, Wallet, or Bank Transfer
  return null;
};

export default PaymentMethodFields;
