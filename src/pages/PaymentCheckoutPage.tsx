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

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
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
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
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
            <div className="form-row">
              <div className={`form-group ${errors.firstName ? 'error' : ''}`}>
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  disabled={loading}
                />
                {errors.firstName && (
                  <span className="form-error">{errors.firstName}</span>
                )}
              </div>
              <div className={`form-group ${errors.lastName ? 'error' : ''}`}>
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={loading}
                />
                {errors.lastName && (
                  <span className="form-error">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className={`form-group ${errors.email ? 'error' : ''}`}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                disabled={loading}
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            {/* Address Section */}
            <h3 className="form-section-title">Delivery Address</h3>
            <div className={`form-group ${errors.address ? 'error' : ''}`}>
              <label>Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street"
                disabled={loading}
              />
              {errors.address && (
                <span className="form-error">{errors.address}</span>
              )}
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.city ? 'error' : ''}`}>
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  disabled={loading}
                />
                {errors.city && (
                  <span className="form-error">{errors.city}</span>
                )}
              </div>
              <div className={`form-group ${errors.postalCode ? 'error' : ''}`}>
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="10001"
                  disabled={loading}
                />
                {errors.postalCode && (
                  <span className="form-error">{errors.postalCode}</span>
                )}
              </div>
            </div>

            <div className={`form-group ${errors.country ? 'error' : ''}`}>
              <label>Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select a country</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Other">Other</option>
              </select>
              {errors.country && (
                <span className="form-error">{errors.country}</span>
              )}
            </div>

            {/* Payment Method Section */}
            <h3 className="form-section-title">Payment Method</h3>
            <div
              className={`payment-methods ${
                errors.paymentMethod ? 'error' : ''
              }`}
            >
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`payment-method-option ${
                    formData.paymentMethod === method.id ? 'active' : ''
                  }`}
                >
                  <div className="payment-method-radio" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleChange}
                    disabled={loading}
                    style={{ display: 'none' }}
                  />
                  <span className="payment-method-label">{method.name}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <span className="form-error">{errors.paymentMethod}</span>
            )}

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
