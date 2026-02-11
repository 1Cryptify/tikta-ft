import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  getProductById,
  getOfferById,
  getOfferGroupById,
  getPaymentMethods,
  formatPrice,
  calculatePaymentTotal,
} from '../mocks/paymentData';
import { PaymentFormData } from '../types/payment.types';
import '../styles/payment.css';
import '../styles/payment-checkout.css';

export const PaymentCheckoutPage: React.FC = () => {
  const { groupId, productId, offerId } = useParams();
  const navigate = useNavigate();
  
  // Get the group context
  const groupContext = groupId ? getOfferGroupById(groupId) : null;

  // Determine what we're purchasing
  const product = productId ? getProductById(productId) : null;
  const offer = offerId ? getOfferById(offerId) : null;
  
  // For /buy route, user is buying the group itself
  const isBuyingGroup = !productId && !offerId && groupContext?.purchasable;
  const group = isBuyingGroup ? groupContext : null;

  const item = product || offer || group;
  
  if (!item || !groupContext) {
    return (
      <div className="payment-checkout">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Item not found</h1>
            <button className="btn-secondary" onClick={() => groupId ? navigate(`/pay/${groupId}`) : navigate('/')}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const paymentMethods = getPaymentMethods();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PaymentFormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    paymentMethod: '',
    acceptTerms: false,
  });

  // Contact info only requires email
  const [contactEmail, setContactEmail] = useState('');

  // Calculate pricing
  const price = 'price' in item ? item.price : 0;
  const subtotal = price;
  const tax = subtotal * 0.1;
  const total = calculatePaymentTotal(subtotal, 0.1, 0);

  // Get item details for display
  const itemName =
    'name' in item ? item.name : 'Unknown Item';
  const itemDesc =
    'description' in item ? item.description : '';
  const itemImage = 'image' in item ? item.image : '';

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (name === 'email') {
      setContactEmail(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate(`/pay/${groupId}/success`);
    } catch (error) {
      navigate(`/pay/${groupId}/failed`);
    } finally {
      setLoading(false);
    }
  };

  const getItemType = (): string => {
    if (product) return 'Product';
    if (offer) return 'Offer';
    if (group) return 'Bundle';
    return 'Item';
  };

  return (
    <div className="payment-checkout">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="breadcrumb">
            Payment › {getItemType()} › Confirmation
          </div>
        </div>

        <div className="checkout-wrapper">
          {/* Main Form */}
          <form onSubmit={handleSubmit} className="checkout-form-section">
            {/* Contact Section */}
            <h3 className="form-section-title">Contact Information</h3>
            <div className={`form-group ${errors.email ? 'error' : ''}`}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={contactEmail}
                onChange={handleChange}
                placeholder="john@example.com"
                disabled={loading}
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '-8px', marginBottom: 'var(--space-lg)' }}>
              The product will be sent to this email address.
            </p>

            {/* Payment Method Section */}
            <h3 className="form-section-title">Payment Method</h3>
            <div className={`form-group ${errors.paymentMethod ? 'error' : ''}`}>
              <label>Select Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Choose a payment method</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && (
                <span className="form-error">{errors.paymentMethod}</span>
              )}
            </div>

            {/* Terms Section */}
            <div className={`form-group ${errors.acceptTerms ? 'error' : ''}`}>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="terms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  disabled={loading}
                  className="checkbox-input"
                />
                <label htmlFor="terms" className="checkbox-label">
                  I agree to the{' '}
                  <a href="#terms" onClick={(e) => e.preventDefault()}>
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#privacy" onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            {loading && <LoadingSpinner />}
            {!loading && (
              <button
                type="submit"
                className="checkout-submit"
                disabled={loading}
              >
                Complete Purchase
              </button>
            )}
          </form>

          {/* Order Summary Sidebar */}
          <aside className="order-summary">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-item">
              {itemImage && (
                <div className="summary-item-image">
                  <img src={itemImage} alt={itemName} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div className="summary-item-name">{itemName}</div>
                <div className="summary-item-price">{formatPrice(price)}</div>
              </div>
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span className="total-label">Subtotal</span>
                <span className="total-value">{formatPrice(subtotal)}</span>
              </div>
              <div className="total-row">
                <span className="total-label">Tax (10%)</span>
                <span className="total-value">{formatPrice(tax)}</span>
              </div>
              <div className="total-row final">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="security-info">
              <p>
                <strong>Secure Payment</strong>
                <br />
                Your payment information is encrypted and secure. We never
                store your full card details.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutPage;
