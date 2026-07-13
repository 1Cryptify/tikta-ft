import React from 'react';
import { PaymentFormData } from '../../types/payment.types';

interface PaymentMethodFieldsProps {
  paymentMethod: string;
  formData: PaymentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
  disabled: boolean;
}

const formatPhoneForDisplay = (raw: string): string => {
  if (!raw) return '';
  if (raw.length <= 3) return raw;
  return raw.slice(0, 3) + ' ' + raw.slice(3).replace(/(\d{2})/g, ' $1').trim();
};

export const PaymentMethodFields: React.FC<PaymentMethodFieldsProps> = ({
  paymentMethod,
  formData,
  onChange,
  errors,
  disabled,
}) => {
  if (paymentMethod === 'mobile_money' || paymentMethod === 'MOBILE_MONEY') {
    return (
      <div className="pm-field-phone">
        <div className={`form-group ${errors.mobileMoneyNumber ? 'error' : ''}`}>
          <label htmlFor="mobileMoneyNumber">Numero de telephone</label>
          <input
            type="tel"
            id="mobileMoneyNumber"
            name="mobileMoneyNumber"
            value={formatPhoneForDisplay(formData.mobileMoneyNumber || '')}
            onChange={onChange}
            placeholder="670 40 68 90"
            disabled={disabled}
            required
            className="big-input"
          />
          {errors.mobileMoneyNumber && (
            <span className="form-error">{errors.mobileMoneyNumber}</span>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentMethodFields;
