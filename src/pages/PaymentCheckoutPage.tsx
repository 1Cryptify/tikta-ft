import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentMethodSelector from '../components/Payment/PaymentMethodSelector';
import PaymentMethodFields from '../components/Payment/PaymentMethodFields';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { paymentService } from '../services/paymentService';
import { PaymentMethod, PaymentFormData } from '../types/payment.types';
import { usePaymentVerification } from '../hooks/usePaymentVerification';
import '../styles/payment.css';
import '../styles/payment-checkout.css';

export const PaymentCheckoutPage: React.FC = () => {
  const { groupId, productId, offerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if we're buying the group itself (package)
  const isBuyingGroup = location.pathname.endsWith('/buy') && groupId;

  // State for data loading
  const [item, setItem] = useState<any>(null);
  const [groupContext, setGroupContext] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Contact info only requires email and phone
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Form data
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

  // Payment verification hook
  const {
    status: verificationStatus,
    isVerifying,
    verificationMessage,
    verificationResult,
    startVerification,
    stopVerification,
  } = usePaymentVerification();

  // Determine if form should be disabled
  const isFormDisabled = dataLoading || isVerifying;

  // Toast helper functions
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      message,
      type,
      duration: 5000,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch payment methods and item data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        // Fetch payment methods from API
        const methodsResponse = await paymentService.listPaymentMethods();
        if (methodsResponse.status === 'success' && methodsResponse.payment_methods) {
          // Map backend payment methods to frontend format
          const mappedMethods = methodsResponse.payment_methods.map((pm: any) => ({
            id: pm.id,
            name: pm.name,
            type: pm.type,
            icon: getIconForType(pm.type),
            channel: pm.channel,
            country: pm.country,
            logo: pm.logo,
            is_active: pm.is_active,
          }));
          setPaymentMethods(mappedMethods);
        }

        // Fetch the specific item being purchased
        if (isBuyingGroup && groupId) {
          // Buying the group as a package
          const groupData = await paymentService.getOfferGroup(groupId);
          if (groupData.status === 'success' && groupData) {
            // Check if group is a payable package
            if (!groupData.is_package) {
              setErrorMessage('This group is not available for purchase as a package');
            } else {
              // Map group data to item format
              setItem({
                id: groupData.id,
                name: groupData.name,
                description: groupData.description,
                price: parseFloat(groupData.price) || 0,
                currency: groupData.currency?.code || groupData.currency || 'XAF',
                image: groupData.image,
                type: 'group_package',
              });
              setGroupContext(groupData);
            }
          } else {
            setErrorMessage('Group not found or unavailable');
          }
        } else if (offerId) {
          const offerData = await paymentService.getOffer(offerId);
          if (offerData.status === 'success' && offerData.offer) {
            setItem(offerData.offer);
          } else {
            setErrorMessage('Offer not found or unavailable');
          }
        } else if (productId) {
          const productData = await paymentService.getProduct(productId);
          if (productData.status === 'success' && productData.product) {
            setItem(productData.product);
          } else {
            setErrorMessage('Product not found or unavailable');
          }
        }

        // Fetch group context if groupId is provided and not already fetched
        if (groupId && !isBuyingGroup) {
          try {
            const groupData = await paymentService.getOfferGroup(groupId);
            if (groupData.status === 'success' && groupData) {
              setGroupContext(groupData);
            }
          } catch (err) {
            console.log('Group not found, continuing without group context');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load payment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [offerId, productId, groupId, isBuyingGroup]);

  // Handle verification status changes
  useEffect(() => {
    if (!verificationResult) return;

    if (verificationStatus === 'completed') {
      // Payment completed successfully
      const storedPayment = localStorage.getItem('pendingPayment');
      const successData: any = storedPayment ? JSON.parse(storedPayment) : {};
      
      // Add ticket data from verification result
      if (verificationResult.ticket) {
        // Single ticket
        successData.tickets = [verificationResult.ticket];
        successData.offerName = verificationResult.offerName;
        successData.offerType = verificationResult.offerType;
      } else if (verificationResult.tickets) {
        // Multiple tickets (package)
        successData.tickets = verificationResult.tickets;
        successData.offerName = verificationResult.groupName;
        successData.offerType = 'package';
      }
      
      // Update localStorage with complete data
      localStorage.setItem('pendingPayment', JSON.stringify(successData));

      // Show success message
      addToast('Payment completed successfully!', 'success');

      // Navigate to success page
      if (groupId) {
        navigate(`/pay/${groupId}/success`);
      } else {
        navigate('/pay/success');
      }
    } else if (verificationStatus === 'failed') {
      // Payment failed
      addToast(verificationResult.message || 'Payment failed. Please try again.', 'error');
      if (groupId) {
        navigate(`/pay/${groupId}/failed`);
      } else {
        navigate('/pay/failed');
      }
    } else if (verificationStatus === 'timeout') {
      // Payment verification timed out
      addToast(
        'Payment verification is taking longer than expected. Please check your payment status in your account.',
        'info'
      );
      // Navigate to a pending/success page with info about checking later
      if (groupId) {
        navigate(`/pay/${groupId}/success`);
      } else {
        navigate('/pay/success');
      }
    }
  }, [verificationStatus, verificationResult, groupId, navigate, addToast]);

  // Helper to map payment method types to icons
  const getIconForType = (type: string): string => {
    switch (type) {
      case 'card':
      case 'credit_card':
        return 'credit_card';
      case 'mobile_money':
        return 'phone';
      case 'bank_account':
      case 'bank_transfer':
        return 'account_balance';
      case 'wallet':
      case 'paypal':
        return 'account_balance_wallet';
      default:
        return 'payment';
    }
  };

  // If still loading, show spinner
  if (loading) {
    return (
      <div className="payment-checkout">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="checkout-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // If error occurred
  if (errorMessage) {
    return (
      <div className="payment-checkout">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Error</h1>
            <p style={{ color: 'var(--color-error)' }}>{errorMessage}</p>
            <button
              className="btn-secondary"
              onClick={() => groupId ? navigate(`/pay/${groupId}`) : navigate('/')}
              style={{ marginTop: '20px' }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If item not found
  if (!item) {
    return (
      <div className="payment-checkout">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Item not found</h1>
            <button
              className="btn-secondary"
              onClick={() => groupId ? navigate(`/pay/${groupId}`) : navigate('/')}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate pricing
  const price = item?.price || 0;
  const subtotal = price;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Get item details for display
  const itemName = item?.name || 'Unknown Item';
  const itemDesc = item?.description || '';
  const itemImage = item?.image || '';
  const currency = item?.currency?.code || item?.currency || 'XAF';

  // Get selected payment method
  const selectedPaymentMethod = paymentMethods.find(m => m.id === formData.paymentMethod);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.email = 'Valid email is required';
    }

    if (!contactPhone || contactPhone.length < 8) {
      newErrors.phone = 'Valid phone number is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    // Validate payment method specific fields
    if (selectedPaymentMethod?.type === 'mobile_money') {
      if (!formData.mobileMoneyNumber || !/^[\d\+\-\(\)]+$/.test(formData.mobileMoneyNumber)) {
        newErrors.mobileMoneyNumber = 'Valid mobile money number is required';
      }
    } else if (selectedPaymentMethod?.type === 'bank_account') {
      if (!formData.bankAccountName) {
        newErrors.bankAccountName = 'Account holder name is required';
      }
      if (!formData.bankCode) {
        newErrors.bankCode = 'Bank code is required';
      }
      if (!formData.bankAccountNumber || !/^\d+$/.test(formData.bankAccountNumber)) {
        newErrors.bankAccountNumber = 'Valid account number is required';
      }
    } else if (selectedPaymentMethod?.type === 'card') {
      if (!formData.cardNumber || !/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Valid card number is required';
      }
      if (!formData.cardExpiry || !/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = 'Valid expiry date (MM/YY) is required';
      }
      if (!formData.cardCvc || !/^\d{3,4}$/.test(formData.cardCvc)) {
        newErrors.cardCvc = 'Valid CVC is required';
      }
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
    } else if (name === 'phone') {
      setContactPhone(value);
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

    setDataLoading(true);
    try {
      // Get the selected payment method's channel
      const channel = selectedPaymentMethod?.channel;

      // Prepare payload based on what's being purchased
      let payload: any = {
        email: contactEmail,
        phone: contactPhone || formData.mobileMoneyNumber || '',
        payment_method_id: formData.paymentMethod,
        channel: channel,
        client_ip: '', // Can be filled from request if needed
      };

      let response;
      let paymentType: 'offer' | 'product' | 'group';

      if (isBuyingGroup && groupId) {
        // Paying for a group package
        payload.group_id = groupId;
        response = await paymentService.initiateGroupPayment(payload);
        paymentType = 'group';
      } else if (offerId) {
        payload.offer_id = offerId;
        response = await paymentService.initiateOfferPayment(payload);
        paymentType = 'offer';
      } else if (productId) {
        payload.product_id = productId;
        response = await paymentService.initiateProductPayment(payload);
        paymentType = 'product';
      } else {
        throw new Error('No item specified for purchase');
      }

      if (response.status === 'success') {
        // Show success toast with message from response
        addToast(response.message || 'Payment initiated successfully!', 'success');
        
        // Start the payment verification polling
        startVerification({
          reference: response.reference,
          gatewayReference: response.gateway_reference,
          paymentType: paymentType,
          offerId,
          productId,
          groupId,
        });

        // Store initial payment info in localStorage
        const successData: any = {
          paymentInfo: {
            paymentId: response.payment_id,
            transactionId: response.transaction_id,
            reference: response.reference,
            gatewayReference: response.gateway_reference,
            amount: response.amount,
            currency: response.currency,
          }
        };
        localStorage.setItem('pendingPayment', JSON.stringify(successData));
      } else {
        // Show error toast with message from response
        addToast(response.message || 'Payment failed. Please try again.', 'error');
        if (groupId) {
          navigate(`/pay/${groupId}/failed`);
        } else {
          navigate('/pay/failed');
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      // Show error toast with error message
      addToast(error.message || 'An error occurred during payment. Please try again.', 'error');
      if (groupId) {
        navigate(`/pay/${groupId}/failed`);
      } else {
        navigate('/pay/failed');
      }
    } finally {
      setDataLoading(false);
    }
  };

  const getItemType = (): string => {
    if (isBuyingGroup) return 'Bundle Package';
    if (productId) return 'Product';
    if (offerId) return 'Offer';
    return 'Item';
  };

  const formatPrice = (amount: number, curr: string = currency): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  return (
    <div className="payment-checkout">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
                disabled={isFormDisabled}
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            <div className={`form-group ${errors.phone ? 'error' : ''}`}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={contactPhone}
                onChange={handleChange}
                placeholder="+237 6XX XXX XXX"
                disabled={isFormDisabled}
              />
              {errors.phone && (
                <span className="form-error">{errors.phone}</span>
              )}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '-8px', marginBottom: 'var(--space-lg)' }}>
              The product details will be sent to this email address.
            </p>

            {/* Payment Method Section */}
            <h3 className="form-section-title">Payment Method</h3>
            <div className={`form-group ${errors.paymentMethod ? 'error' : ''}`}>
              <PaymentMethodSelector
                methods={paymentMethods}
                selected={formData.paymentMethod}
                onChange={(methodId) => {
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: methodId,
                  }));
                  if (errors.paymentMethod) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.paymentMethod;
                      return newErrors;
                    });
                  }
                }}
                disabled={isFormDisabled}
                error={!!errors.paymentMethod}
              />
              {errors.paymentMethod && (
                <span className="form-error" style={{ marginTop: 'var(--space-md)' }}>
                  {errors.paymentMethod}
                </span>
              )}
            </div>

            {/* Payment Method Specific Fields */}
            {formData.paymentMethod && (
              <PaymentMethodFields
                paymentMethod={selectedPaymentMethod?.type || ''}
                formData={formData}
                onChange={handleChange}
                errors={errors}
                disabled={isFormDisabled}
              />
            )}

            {/* Submit Button */}
            {dataLoading && <LoadingSpinner />}
            {!dataLoading && !isVerifying && (
              <button
                type="submit"
                className="checkout-submit"
                disabled={isFormDisabled}
              >
                Complete Purchase
              </button>
            )}

            {/* Verification Status */}
            {isVerifying && (
              <div className="verification-status" style={{
                marginTop: 'var(--space-lg)',
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}>
                <LoadingSpinner />
                <p style={{
                  marginTop: 'var(--space-md)',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                }}>
                  {verificationMessage}
                </p>
                <p style={{
                  marginTop: 'var(--space-sm)',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                }}>
                  Please complete the payment on your mobile device if prompted.
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={stopVerification}
                  style={{
                    marginTop: 'var(--space-md)',
                    padding: 'var(--space-sm) var(--space-md)',
                    fontSize: '14px',
                  }}
                >
                  Cancel Verification
                </button>
              </div>
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
