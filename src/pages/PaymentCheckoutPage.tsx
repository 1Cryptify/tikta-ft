import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentMethodFields from '../components/Payment/PaymentMethodFields';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { paymentService, zoneService } from '../services/paymentService';
import { PaymentMethod, PaymentFormData } from '../types/payment.types';
import { usePaymentVerification } from '../hooks/usePaymentVerification';
import '../styles/payment.css';
import '../styles/payment-checkout.css';
import { API_BASE_URL } from '../services/api.ts';

const getIconForType = (type: string): string => {
  switch (type) {
    case 'card': case 'credit_card': return 'credit_card';
    case 'mobile_money': return 'phone';
    case 'bank_account': case 'bank_transfer': return 'account_balance';
    case 'wallet': case 'paypal': return 'account_balance_wallet';
    default: return 'payment';
  }
};

const formatChannel = (channel?: string): string => {
  if (!channel) return '';
  const c = channel.toLowerCase();
  const labels: Record<string, string> = {
    'mtn_momo': 'MTN MoMo',
    'orange_money': 'Orange Money',
  };
  return labels[c] || channel;
};

const formatPhoneForDisplay = (raw: string): string => {
  if (!raw) return '';
  if (raw.length <= 3) return raw;
  return raw.slice(0, 3) + ' ' + raw.slice(3).replace(/(\d{2})/g, ' $1').trim();
};

export const PaymentCheckoutPage: React.FC = () => {
  const { groupId, productId, offerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isBuyingGroup = location.pathname.endsWith('/buy') && groupId;

  const [item, setItem] = useState<any>(null);
  const [groupContext, setGroupContext] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [contactEmail, setContactEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSms, setSendSms] = useState(true);
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('');

  // Localisation + consentement (obligatoire dans l'app Tikta)
  const [geoPos, setGeoPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied' | 'error'>('idle');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [detectedZone, setDetectedZone] = useState<{ id: string; name: string; color: string; company_name?: string; mode?: string; distance_m?: number | null } | null>(null);

  const [formData, setFormData] = useState<PaymentFormData>({
    email: '', firstName: '', lastName: '', address: '', city: '',
    country: '', postalCode: '', paymentMethod: '', acceptTerms: false,
    sendSms: true, sendEmail: false, smsPhoneNumber: '',
  });

  const { status: verificationStatus, isVerifying, verificationMessage, verificationResult, startVerification, stopVerification } = usePaymentVerification();

  const isFormDisabled = dataLoading || isVerifying;

  const saveMobileMoneyToCookie = (phoneNumber: string) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `lastMobileMoneyNumber=${encodeURIComponent(phoneNumber)};expires=${expires.toUTCString()};path=/`;
  };

  const getSavedMobileMoneyFromCookie = (): string => {
    const name = 'lastMobileMoneyNumber=';
    const decodedCookie = decodeURIComponent(document.cookie);
    for (let cookie of decodedCookie.split(';')) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) return cookie.substring(name.length);
    }
    return '';
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts((prev) => {
      const filtered = prev.filter(t => !(t.type === type && t.message === message));
      const newToast: ToastMessage = { id: Date.now().toString(), message, type, duration: 2500 };
      return [...filtered, newToast].slice(-2);
    });
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const activateLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('error');
      addToast('Votre navigateur ne supporte pas la géolocalisation', 'error');
      return;
    }
    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGeoPos({ lat: latitude, lng: longitude });
        setLocationStatus('granted');
        try {
          const res = await zoneService.nearestZone(latitude, longitude);
          if (res.mode !== 'none' && res.zone) {
            setDetectedZone({ ...res.zone, mode: res.mode, distance_m: res.distance_m });
          } else {
            setDetectedZone(null);
          }
        } catch {
          setDetectedZone(null);
        }
      },
      (err) => {
        setLocationStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
        addToast(
          err.code === err.PERMISSION_DENIED
            ? 'Vous devez accepter le partage de votre localisation pour payer avec Tikta'
            : 'Impossible de récupérer votre position',
          'error'
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const methodsResponse = await paymentService.listPaymentMethods();
        if (methodsResponse.status === 'success' && methodsResponse.payment_methods) {
          const mappedMethods = methodsResponse.payment_methods.map((pm: any) => ({
            id: pm.id, name: pm.name, type: pm.type,
            icon: getIconForType(pm.type), channel: pm.channel,
            country: pm.country, logo: pm.logo, is_active: pm.is_active,
          }));
          setPaymentMethods(mappedMethods);
          if (mappedMethods.length > 0) {
            const savedPhone = getSavedMobileMoneyFromCookie();
            setFormData((prev) => ({
              ...prev,
              mobileMoneyNumber: savedPhone || prev.mobileMoneyNumber,
            }));
          }
        }

        if (isBuyingGroup && groupId) {
          const groupData = await paymentService.getOfferGroup(groupId);
          if (groupData.status === 'success' && groupData) {
            if (!groupData.is_package) setErrorMessage('This group is not available for purchase as a package');
            else {
              setItem({ id: groupData.id, name: groupData.name, description: groupData.description, price: parseFloat(groupData.price) || 0, currency: groupData.currency?.code || groupData.currency || 'XAF', image: groupData.image, type: 'group_package' });
              setGroupContext(groupData);
            }
          } else setErrorMessage('Group not found or unavailable');
        } else if (offerId) {
          const offerData = await paymentService.getOffer(offerId);
          if (offerData.status === 'success' && offerData.offer) setItem(offerData.offer);
          else setErrorMessage('Offer not found or unavailable');
        } else if (productId) {
          const productData = await paymentService.getProduct(productId);
          if (productData.status === 'success' && productData.product) setItem(productData.product);
          else setErrorMessage('Product not found or unavailable');
        }

        if (groupId && !isBuyingGroup) {
          try {
            const gd = await paymentService.getOfferGroup(groupId);
            if (gd.status === 'success' && gd) setGroupContext(gd);
          } catch { console.log('Group not found'); }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setErrorMessage('Failed to load payment data.');
      } finally { setLoading(false); }
    };
    fetchData();
  }, [offerId, productId, groupId, isBuyingGroup]);

  useEffect(() => {
    if (!verificationResult) return;
    if (verificationStatus === 'completed') {
      const storedPayment = localStorage.getItem('pendingPayment');
      const successData: any = storedPayment ? JSON.parse(storedPayment) : {};
      if (verificationResult.ticket) {
        successData.tickets = [verificationResult.ticket];
        successData.offerName = verificationResult.offerName;
        successData.offerType = verificationResult.offerType;
      } else if (verificationResult.tickets) {
        successData.tickets = verificationResult.tickets;
        successData.offerName = verificationResult.groupName;
        successData.offerType = 'package';
      }
      if (verificationResult.adminContactMessage) successData.adminContactMessage = verificationResult.adminContactMessage;
      if (verificationResult.ticketAvailable !== undefined) successData.ticketAvailable = verificationResult.ticketAvailable;
      if (verificationResult.allTicketsAvailable !== undefined) successData.allTicketsAvailable = verificationResult.allTicketsAvailable;
      if (verificationResult.offersWithoutTickets) successData.offersWithoutTickets = verificationResult.offersWithoutTickets;
      if (verificationResult.callbackUrl) successData.callbackUrl = verificationResult.callbackUrl;
      localStorage.setItem('pendingPayment', JSON.stringify(successData));
      navigate('/pay/success', { state: { paymentData: successData } });
    } else if (verificationStatus === 'failed') {
      navigate('/pay/failed', { state: { errorMessage: verificationResult.message } });
    } else if (verificationStatus === 'timeout') {
      const storedPayment = localStorage.getItem('pendingPayment');
      const successData: any = storedPayment ? JSON.parse(storedPayment) : {};
      navigate('/pay/success', { state: { paymentData: successData, timeout: true } });
    }
  }, [verificationStatus, verificationResult, groupId, navigate]);

  if (loading) {
    return <div className="payment-checkout"><ToastContainer toasts={toasts} onRemove={removeToast} /><div className="checkout-container"><LoadingSpinner /></div></div>;
  }

  if (errorMessage) {
    return (
      <div className="payment-checkout">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="checkout-container">
          <div className="checkout-header"><h1>Error</h1><p style={{ color: 'var(--color-error)' }}>{errorMessage}</p></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="payment-checkout">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="checkout-container">
          <div className="checkout-header"><h1>Item not found</h1></div>
        </div>
      </div>
    );
  }

  const price = item?.price || 0;
  const total = price;
  const itemName = item?.name || 'Unknown Item';
  const itemImage = item?.image ? API_BASE_URL + item.image : '';
  const currency = item?.currency?.code || item?.currency || 'XAF';
  const selectedPaymentMethod = paymentMethods.find(m => m.id === formData.paymentMethod);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (locationStatus !== 'granted' || !geoPos) {
      newErrors.location = 'Activez votre localisation pour payer (obligatoire)';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Veuillez accepter les conditions d utilisation et le partage de votre localisation';
    }

    if (sendEmail && (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Veuillez choisir un moyen de paiement';
    }

    if (selectedPaymentMethod?.type === 'mobile_money') {
      if (!formData.mobileMoneyNumber || formData.mobileMoneyNumber.replace(/\D/g, '').length < 9) {
        newErrors.mobileMoneyNumber = 'Veuillez entrer un numero valide (9 chiffres)';
      }
    }

    if (!sendSms && !sendEmail) {
      newErrors.delivery = 'Choisissez au moins un moyen de reception';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const newValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    if (name === 'email') {
      setContactEmail(value);
    } else if (name === 'mobileMoneyNumber' || name === 'smsPhoneNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 9);
      if (name === 'smsPhoneNumber') setSmsPhoneNumber(digits);
      else setFormData((prev) => ({ ...prev, mobileMoneyNumber: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }

    if (errors[name]) { const n = { ...errors }; delete n[name]; setErrors(n); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setDataLoading(true);
    try {
      const channel = selectedPaymentMethod?.channel;
      const smsPhone = sendSms ? (smsPhoneNumber || formData.mobileMoneyNumber || '') : '';

      let payload: any = {
        email: contactEmail,
        phone: selectedPaymentMethod?.type === 'mobile_money' ? (formData.mobileMoneyNumber || '') : '',
        payment_method_id: formData.paymentMethod,
        channel: channel, client_ip: '',
        send_sms: sendSms, send_email: sendEmail, sms_phone: smsPhone,
        // Géolocalisation + consentement : chaque paiement est attribué à une zone
        latitude: geoPos?.lat,
        longitude: geoPos?.lng,
        location_shared: true,
        terms_accepted: true,
        zone_id: detectedZone?.id,
      };

      let response; let paymentType: 'offer' | 'product' | 'group';

      if (isBuyingGroup && groupId) {
        payload.group_id = groupId; response = await paymentService.initiateGroupPayment(payload); paymentType = 'group';
      } else if (offerId) {
        payload.offer_id = offerId; response = await paymentService.initiateOfferPayment(payload); paymentType = 'offer';
      } else if (productId) {
        payload.product_id = productId; response = await paymentService.initiateProductPayment(payload); paymentType = 'product';
      } else throw new Error('No item specified');

      if (response.status === 'success') {
        if (formData.mobileMoneyNumber) saveMobileMoneyToCookie(formData.mobileMoneyNumber);

        const successData: any = {
          paymentInfo: {
            paymentId: response.payment_id, transactionId: response.transaction_id,
            reference: response.reference, gatewayReference: response.gateway_reference,
            amount: response.amount, currency: response.currency,
          },
          paymentType, offerId, productId, groupId,
        };
        localStorage.setItem('pendingPayment', JSON.stringify(successData));

        startVerification({ reference: response.reference, gatewayReference: response.gateway_reference, paymentType, offerId, productId, groupId });
      } else {
        addToast(response.message || 'Echec du paiement', 'error');
        navigate('/pay/failed', { state: { errorMessage: response.message } });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      addToast(error.message || 'Une erreur est survenue', 'error');
      navigate('/pay/failed', { state: { errorMessage: error.message } });
    } finally { setDataLoading(false); }
  };

  const formatPrice = (amount: number, curr: string = currency): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: curr }).format(amount);
  };

  const LogoImg: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    try { const u = new URL(src); return <img src={u.href} alt={alt} className="pm-card-logo" />; } catch { return <img src={API_BASE_URL + src} alt={alt} className="pm-card-logo" />; }
  };

  return (
    <div className="payment-checkout">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="checkout-container">
        {/* Compact header */}
        <div className="checkout-header">
          <h1>{itemName}</h1>
          <span className="checkout-price">{formatPrice(total)}</span>
        </div>

        <div className="checkout-wrapper">
          <form id="main-checkout-form" onSubmit={handleSubmit} className="checkout-form-section">
            {isVerifying && (
              <div className="verification-status verification-status-top">
                <LoadingSpinner />
                <p className="verify-title">Confirmez le paiement sur votre telephone</p>
                <p className="verify-sub">
                  Une demande de paiement {selectedPaymentMethod?.type === 'mobile_money' ? `(MTN MoMo / Orange Money)` : ''} a ete envoyee sur votre numero.
                  Saisissez votre code PIN pour valider. Vous pouvez fermer cette page : le paiement sera confirme automatiquement.
                </p>
                <button type="button" className="btn-secondary" onClick={stopVerification}>Annuler</button>
              </div>
            )}

            {/* Step 0: Localisation + CGU (obligatoire) */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">0</span>
                Localisation &amp; conditions
              </h3>
              <p className="field-hint" style={{ marginBottom: 'var(--space-md)' }}>
                Tikta attribue votre paiement à la zone la plus proche de vous (carte, réseau).
                Vous devez activer votre localisation et accepter de la partager.
              </p>

              <div className={`geo-box ${locationStatus === 'granted' && geoPos ? 'geo-box-active' : ''}`}>
                <div className="geo-row">
                  <span className="geo-icon">📍</span>
                  {locationStatus === 'granted' && geoPos ? (
                    <span className="geo-text">Localisation activée (précision ~5m)</span>
                  ) : (
                    <span className="geo-text">
                      {locationStatus === 'locating' ? 'Recherche de votre position…' : 'Votre localisation est requise pour payer'}
                    </span>
                  )}
                  <button type="button" className="btn-secondary geo-btn" onClick={activateLocation} disabled={isFormDisabled || locationStatus === 'locating'}>
                    {locationStatus === 'granted' && geoPos ? 'Rafraîchir' : 'Activer ma localisation'}
                  </button>
                </div>

                {locationStatus === 'denied' && (
                  <div className="form-error" style={{ marginTop: 'var(--space-sm)' }}>
                    Accès refusé. Autorisez la géolocalisation dans votre navigateur puis réessayez.
                  </div>
                )}

                {detectedZone && (
                  <div className="zone-banner" style={{ borderColor: detectedZone.color || 'var(--color-primary)' }}>
                    <span className="zone-dot" style={{ background: detectedZone.color || 'var(--color-primary)' }} />
                    <span className="zone-banner-text">
                      Paiement attribué à la zone : <strong>{detectedZone.name}</strong>
                      {detectedZone.company_name ? ` — ${detectedZone.company_name}` : ''}
                    </span>
                  </div>
                )}
                {locationStatus === 'granted' && geoPos && !detectedZone && (
                  <div className="form-error" style={{ marginTop: 'var(--space-sm)' }}>
                    Aucune zone ne couvre encore votre position ; le paiement reste possible.
                  </div>
                )}
              </div>

              <label className="terms-row">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms) { const n = { ...errors }; delete n.terms; setErrors(n); }
                  }}
                  className="checkbox-input"
                  disabled={isFormDisabled}
                />
                <span className="terms-label">
                  J'active ma localisation et j'accepte son partage, ainsi que les{' '}
                  <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>conditions d'utilisation</span>{' '}
                  (mon paiement sera attribué à la zone la plus proche de moi).
                </span>
              </label>

              {(errors.location || errors.terms) && (
                <div className="form-error" style={{ marginTop: 'var(--space-sm)' }}>
                  {errors.location || errors.terms}
                </div>
              )}
            </div>

            {/* Step 1: ALL payment methods visible as cards */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">1</span>
                Choisissez comment payer
              </h3>

              <div className="pm-card-grid">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    className={`pm-card ${formData.paymentMethod === pm.id ? 'active' : ''}`}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, paymentMethod: pm.id }));
                      if (errors.paymentMethod) { const n = { ...errors }; delete n.paymentMethod; setErrors(n); }
                      if (pm.type === 'mobile_money') {
                        setSendSms(true);
                        setSendEmail(false);
                      }
                    }}
                    disabled={isFormDisabled}
                  >
                    <div className="pm-card-icon">
                      {pm.logo ? <LogoImg src={pm.logo} alt={pm.name} /> :
                        pm.type === 'mobile_money' ? <span className="pm-emoji">📱</span> :
                        pm.channel?.includes('mtn') ? <span className="pm-emoji">🟡</span> :
                        pm.channel?.includes('orange') ? <span className="pm-emoji">🟠</span> :
                        pm.type === 'card' ? <span className="pm-emoji">💳</span> :
                        <span className="pm-emoji">💰</span>}
                    </div>
                    <div className="pm-card-label">{pm.name}</div>
                    <div className="pm-card-channel">{formatChannel(pm.channel)}</div>
                    {formData.paymentMethod === pm.id && <div className="pm-card-check">&#10003;</div>}
                  </button>
                ))}
              </div>

              {errors.paymentMethod && <span className="form-error">{errors.paymentMethod}</span>}

              {/* Phone field for mobile money (CamPay: MTN MoMo / Orange Money) */}
              {formData.paymentMethod && selectedPaymentMethod?.type === 'mobile_money' && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <PaymentMethodFields
                    paymentMethod={selectedPaymentMethod.type}
                    formData={formData}
                    onChange={handleChange}
                    errors={errors}
                    disabled={isFormDisabled}
                  />
                </div>
              )}
            </div>

            {/* Step 2: Delivery options */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">2</span>
                Reception des identifiants
              </h3>

              {errors.delivery && <div className="form-error" style={{ marginBottom: 'var(--space-md)' }}>{errors.delivery}</div>}

              <div className={`delivery-option ${sendSms ? 'active' : ''}`}>
                <label className="delivery-checkbox-label">
                  <input type="checkbox" checked={sendSms} onChange={(e) => setSendSms(e.target.checked)} className="checkbox-input" disabled={isFormDisabled} />
                  <span className="delivery-checkbox-text">Recevoir par SMS</span>
                </label>
                {sendSms && (
                  <div className="delivery-sub">
                    <input
                      type="tel" name="smsPhoneNumber"
                      value={formatPhoneForDisplay(smsPhoneNumber || formData.mobileMoneyNumber || '')}
                      onChange={handleChange} placeholder="670 40 68 90"
                      disabled={isFormDisabled} className="big-input"
                    />
                    <small className="field-hint">Par defaut, votre numero de paiement</small>
                  </div>
                )}
              </div>

              <div className={`delivery-option ${sendEmail ? 'active' : ''}`}>
                <label className="delivery-checkbox-label">
                  <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="checkbox-input" disabled={isFormDisabled} />
                  <span className="delivery-checkbox-text">Recevoir par Email</span>
                </label>
                {sendEmail && (
                  <div className="delivery-sub">
                    <input type="email" name="email" value={contactEmail} onChange={handleChange} placeholder="exemple@email.com" disabled={isFormDisabled} className="big-input" />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop submit */}
            {!dataLoading && !isVerifying && (
              <button type="submit" className="checkout-submit desktop-only" disabled={isFormDisabled}>
                Payer {formatPrice(total)}
              </button>
            )}

            {dataLoading && <LoadingSpinner />}

            <div className="security-info">
              <strong>Paiement securise via Mobile Money</strong> — MTN MoMo et Orange Money (CamPay).
            </div>
          </form>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="checkout-bottom-bar">
        <div className="bottom-bar-info">
          <span className="bottom-bar-name">{itemName}</span>
          <span className="bottom-bar-price">{formatPrice(total)}</span>
        </div>
        <button type="submit" className="checkout-submit" form="main-checkout-form" disabled={isFormDisabled || isVerifying}>
          {isVerifying ? 'Verification...' : `Payer ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentCheckoutPage;
