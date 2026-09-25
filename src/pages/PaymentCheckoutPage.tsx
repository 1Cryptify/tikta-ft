import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentOverlay from '../components/Payment/PaymentOverlay';
import TermsModal from '../components/Payment/TermsModal';
import LocationModal from '../components/Payment/LocationModal';
import CheckoutMobile from '../components/Payment/CheckoutMobile';
import CheckoutDesktop from '../components/Payment/CheckoutDesktop';
import { CheckoutViewProps, LocationState } from '../components/Payment/CheckoutParts';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { paymentService, zoneService, PaymentApiError } from '../services/paymentService';
import { getMediaUrl } from '../services/api';
import { closePaymentTab } from '../utils/closeTab';
import {
  MobileOperator,
  PaymentItem,
  PaymentMethod,
  detectOperator,
  isValidMobileNumber,
  normalizeLocalPhone,
  operatorFromChannel,
} from '../types/payment.types';
import { usePaymentVerification } from '../hooks/usePaymentVerification';
import { useMediaQuery } from '../hooks/useMediaQuery';
import '../styles/payment.css';

type GeoPermissionState = 'unknown' | 'prompt' | 'granted' | 'denied';

export const PaymentCheckoutPage: React.FC = () => {
  const { groupId, productId, offerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const isBuyingGroup = location.pathname.endsWith('/buy') && Boolean(groupId);

  const [item, setItem] = useState<PaymentItem | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const [geoPos, setGeoPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationState>('idle');
  const [searchingZone, setSearchingZone] = useState(false);
  const [zone, setZone] = useState<{ name: string; company_name?: string } | null>(null);
  const [requiresLocation, setRequiresLocation] = useState(true);
  const [permissionState, setPermissionState] = useState<GeoPermissionState>('unknown');
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const locationRequested = useRef(false);

  const {
    status: verificationStatus,
    isVerifying,
    verificationResult,
    startVerification,
    stopVerification,
  } = usePaymentVerification();

  const isFormDisabled = submitting || isVerifying;
  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);
  const isMobileMoney = selectedMethod?.type === 'mobile_money';
  const operator: MobileOperator = isMobileMoney ? detectOperator(phone) : 'unknown';
  const price = item?.price ?? 0;
  const currency = item?.currency || 'XAF';

  // Opérateur effectif (numéro prioritaire, sinon le moyen choisi).
  const methodOperator: MobileOperator = selectedMethod
    ? operatorFromChannel(selectedMethod.channel, selectedMethod.name)
    : 'unknown';
  const effectiveOperator: MobileOperator = operator !== 'unknown' ? operator : methodOperator;

  // Codes USSD à composer si l'invite n'apparaît pas automatiquement.
  const ussdHint = isMobileMoney && effectiveOperator !== 'unknown'
    ? (effectiveOperator === 'mtn'
        ? { code: '*126#', operator: 'MTN Mobile Money', action: 'valider la transaction' }
        : { code: '#150*50#', operator: 'Orange Money', action: 'continuer le paiement' })
    : null;

  // Page des offres d'origine (pour « Retour aux offres » après échec).
  const offersPath: string | null =
    (location.state as any)?.from ||
    (groupId && !isBuyingGroup ? `/pay/g/${groupId}` : null);

  const formatPrice = useCallback((amount: number, curr: string = currency): string => {
    try {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: curr }).format(amount);
    } catch {
      return `${new Intl.NumberFormat('fr-FR').format(amount)} ${curr}`;
    }
  }, [currency]);
  const priceLabel = formatPrice(price, currency);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts((prev) => {
      const filtered = prev.filter((t) => !(t.type === type && t.message === message));
      return [...filtered, { id: Date.now().toString(), message, type, duration: 4500 }].slice(-2);
    });
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  /* ---------------- Localisation automatique ---------------- */

  const handleLocationSuccess = useCallback(async (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setGeoPos({ lat: latitude, lng: longitude });
    setLocationStatus('granted');
    setPermissionState('granted');
    setLocationModalOpen(false);
    setSearchingZone(true);
    try {
      const res = await zoneService.nearestZone(latitude, longitude);
      if (res.mode !== 'none' && res.zone) {
        setZone({ name: res.zone.name, company_name: res.zone.company_name });
      } else {
        setZone(null);
      }
    } finally {
      setSearchingZone(false);
    }
  }, []);

  const handleLocationError = useCallback((err: GeolocationPositionError) => {
    if (err.code === err.PERMISSION_DENIED) {
      setLocationStatus('denied');
      setPermissionState('denied');
      // Ouvre directement notre popup d'activation (le navigateur, lui, ne
      // réaffichera plus son prompt une fois le refus mémorisé).
      setLocationModalOpen(true);
      addToast('Localisation bloquée. Autorisez-la pour continuer.', 'error');
    } else {
      setLocationStatus('error');
      addToast('Impossible de récupérer votre position.', 'error');
    }
  }, [addToast]);

  const attemptLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('unsupported');
      setLocationModalOpen(true);
      return;
    }

    // Reflète l'état réel de la permission pour adapter le message du popup.
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => setPermissionState(status.state))
        .catch(() => {});
    }

    setLocationStatus('locating');
    // Si l'état est encore « prompt », l'appel ci-dessous affiche le popup natif.
    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    });
  }, [handleLocationSuccess, handleLocationError]);

  // Surveille les changements d'autorisation : dès que l'utilisateur l'active
  // dans le navigateur, on relance automatiquement (sans qu'il revienne).
  useEffect(() => {
    if (!requiresLocation) return;
    if (!navigator.permissions?.query) return;
    let status: PermissionStatus | null = null;
    let cancelled = false;

    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        if (cancelled) return;
        status = result;
        setPermissionState(result.state);
        result.onchange = () => {
          setPermissionState(result.state);
          if (result.state === 'granted') attemptLocation();
        };
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (status) status.onchange = null;
    };
  }, [requiresLocation, attemptLocation]);

  // Demande la localisation automatiquement, uniquement si l'entreprise a des zones.
  useEffect(() => {
    if (loading || !requiresLocation) return;
    if (locationRequested.current) return;
    locationRequested.current = true;
    attemptLocation();
  }, [loading, requiresLocation, attemptLocation]);

  /* ---------------- Données ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFatalError(null);

        const methodsResponse = await paymentService.listPaymentMethods();
        const methods = (methodsResponse.payment_methods || [])
          .filter((pm) => pm.is_active !== false)
          .map((pm) => ({
            id: pm.id, name: pm.name, type: pm.type,
            channel: pm.channel, country: pm.country, logo: pm.logo, is_active: pm.is_active,
          }));
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedMethodId((prev) => prev || methods[0].id);
        }

        if (isBuyingGroup && groupId) {
          const g = await paymentService.getOfferGroup(groupId);
          if (g.status === 'success' && g?.is_package) {
            setRequiresLocation(g.company_has_zones !== false);
            setItem({
              id: g.id, name: g.name, description: g.description,
              price: parseFloat(g.price) || 0,
              currency: g.currency?.code || g.currency || 'XAF',
              image: g.image, type: 'group_package',
            });
          } else {
            setFatalError("Ce pack n'est pas disponible à l'achat.");
          }
        } else if (offerId) {
          const d = await paymentService.getOffer(offerId);
          if (d.status === 'success' && d.offer) {
            const o = d.offer;
            setRequiresLocation(o.company_has_zones !== false);
            setItem({
              id: o.id, name: o.name, description: o.description,
              // Prix effectif (réduction appliquée), sinon prix de base.
              price: parseFloat(o.final_price ?? o.price) || 0,
              currency: o.currency?.code || o.currency || 'XAF',
              image: o.image, type: 'offer',
              icon: o.icon, icon_background: o.icon_background,
            });
          } else {
            setFatalError("Offre introuvable ou indisponible.");
          }
        } else if (productId) {
          const d = await paymentService.getProduct(productId);
          if (d.status === 'success' && d.product) {
            const p = d.product;
            setRequiresLocation(p.company_has_zones !== false);
            setItem({
              id: p.id, name: p.name, description: p.description,
              price: parseFloat(p.price) || 0,
              currency: p.currency?.code || p.currency || 'XAF',
              image: p.image, type: 'product',
            });
          } else {
            setFatalError("Produit introuvable ou indisponible.");
          }
        } else {
          setFatalError('Aucun article à payer.');
        }
      } catch (error) {
        setFatalError(
          error instanceof PaymentApiError
            ? error.message
            : 'Impossible de charger les informations de paiement.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId, productId, groupId, isBuyingGroup]);

  /* ---------------- Fin de vérification ---------------- */

  useEffect(() => {
    if (!verificationResult) return;
    if (verificationStatus === 'completed') {
      const stored = localStorage.getItem('pendingPayment');
      const successData: any = stored ? JSON.parse(stored) : {};
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
      navigate('/pay/failed', {
        state: {
          errorMessage: verificationResult.message,
          returnTo: location.pathname,
          offersPath,
        },
      });
    } else if (verificationStatus === 'timeout') {
      const stored = localStorage.getItem('pendingPayment');
      const successData: any = stored ? JSON.parse(stored) : {};
      navigate('/pay/success', { state: { paymentData: successData, timeout: true } });
    }
  }, [verificationStatus, verificationResult, navigate, location.pathname]);

  useEffect(() => {
    if (!isVerifying) {
      setElapsedSeconds(0);
      return;
    }
    setElapsedSeconds(0);
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isVerifying]);

  /* ---------------- Validation & submit ---------------- */

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (requiresLocation && (locationStatus !== 'granted' || !geoPos)) {
      next.location = 'Activez la localisation pour payer.';
    }
    if (!acceptTerms) next.terms = 'Veuillez accepter les conditions.';
    if (!selectedMethodId) next.paymentMethod = 'Choisissez un moyen de paiement.';
    if (isMobileMoney) {
      if (!isValidMobileNumber(phone)) {
        next.phone = 'Numéro mobile invalide (9 chiffres, ex. 6 70 00 00 00).';
      } else {
        const detected = detectOperator(phone);
        const methodOp = selectedMethod
          ? operatorFromChannel(selectedMethod.channel, selectedMethod.name)
          : 'unknown';
        if (detected !== 'unknown' && methodOp !== 'unknown' && detected !== methodOp) {
          next.phone = "Ce numéro ne correspond pas à l'opérateur sélectionné.";
        }
      }
    }
    if (emailEnabled && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      next.email = 'Adresse email invalide.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) addToast('Veuillez corriger les champs en rouge.', 'error');
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        email: emailEnabled ? email : '',
        phone: isMobileMoney ? normalizeLocalPhone(phone) : '',
        payment_method_id: selectedMethodId,
        channel: selectedMethod?.channel,
        client_ip: '',
        send_sms: isMobileMoney,
        send_email: emailEnabled,
        sms_phone: isMobileMoney ? normalizeLocalPhone(phone) : '',
        // Localisation envoyée uniquement si l'entreprise a des zones définies.
        latitude: requiresLocation ? geoPos?.lat : undefined,
        longitude: requiresLocation ? geoPos?.lng : undefined,
        location_shared: requiresLocation && locationStatus === 'granted',
        terms_accepted: true,
      };

      let response;
      let paymentType: 'offer' | 'product' | 'group';
      if (isBuyingGroup && groupId) {
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
        throw new Error('Article non spécifié.');
      }

      const successData: any = {
        paymentInfo: {
          paymentId: response.payment_id,
          transactionId: response.transaction_id,
          reference: response.reference,
          gatewayReference: response.gateway_reference,
          amount: response.amount,
          currency: response.currency,
        },
        paymentType, offerId, productId, groupId,
      };
      localStorage.setItem('pendingPayment', JSON.stringify(successData));

      startVerification({
        reference: response.reference || '',
        gatewayReference: response.gateway_reference || '',
        paymentId: response.payment_id,
        paymentType, offerId, productId, groupId,
      });
    } catch (error: any) {
      let message = 'Une erreur est survenue. Veuillez réessayer.';
      if (error instanceof PaymentApiError) {
        message = error.message;
        if (productId && (error.status === 404 || error.kind === 'json')) {
          message = "Le paiement en ligne de ce produit n'est pas encore disponible.";
        }
      } else if (error?.message) {
        message = error.message;
      }
      setFormError(message);
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- États ---------------- */

  if (loading) {
    return (
      <div className="payment-state">
        <LoadingSpinner />
      </div>
    );
  }

  if (fatalError || !item) {
    return (
      <div className="payment-state">
        <div className="payment-state__card">
          <div className="payment-state__icon"><FiAlertTriangle /></div>
          <h1>Paiement indisponible</h1>
          <p>{fatalError || 'Article introuvable.'}</p>
          <button type="button" className="payment-state__btn" onClick={closePaymentTab}>
            <FiX /> Sortir
          </button>
        </div>
      </div>
    );
  }

  const viewProps: CheckoutViewProps = {
    itemName: item.name,
    itemImage: item.image ? getMediaUrl(item.image) : undefined,
    itemIcon: item.icon,
    itemIconBackground: item.icon_background,
    priceLabel,
    formError,
    requiresLocation,
    locationStatus,
    locationError: errors.location,
    zoneName: zone?.name,
    zoneCompany: zone?.company_name,
    searchingZone,
    onRetryLocation: () => {
      // Refus mémorisé ou navigateur incompatible : on présente le popup guidé.
      if (permissionState === 'denied' || locationStatus === 'unsupported') {
        setLocationModalOpen(true);
      } else {
        attemptLocation();
      }
    },
    methods: paymentMethods,
    selectedMethodId,
    onSelectMethod: (m) => {
      setSelectedMethodId(m.id);
      clearError('paymentMethod');
      clearError('phone');
    },
    showPhone: isMobileMoney,
    phone,
    operator,
    phoneError: errors.phone,
    onPhoneChange: (raw) => {
      const digits = normalizeLocalPhone(raw);
      setPhone(digits);
      clearError('phone');

      // Bascule automatique vers l'opérateur détecté depuis le numéro.
      const detected = detectOperator(digits);
      if (detected !== 'unknown') {
        const matched = paymentMethods.find((m) => operatorFromChannel(m.channel, m.name) === detected);
        if (matched && matched.id !== selectedMethodId) {
          setSelectedMethodId(matched.id);
        }
      }
    },
    email,
    emailEnabled,
    emailError: errors.email,
    onEmailToggle: (enabled) => {
      setEmailEnabled(enabled);
      if (!enabled) clearError('email');
    },
    onEmailChange: (value) => {
      setEmail(value);
      clearError('email');
    },
    acceptTerms,
    termsError: errors.terms,
    onTermsChange: (checked) => {
      setAcceptTerms(checked);
      clearError('terms');
    },
    onOpenTerms: () => setTermsOpen(true),
    submitting,
    disabled: isFormDisabled,
    onSubmit: handleSubmit,
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <PaymentOverlay
        visible={submitting || isVerifying}
        title={isVerifying ? 'Confirmez sur votre téléphone' : 'Traitement du paiement…'}
        subtitle={
          isVerifying
            ? 'Saisissez votre code PIN sur la demande reçue. Cette page se mettra à jour automatiquement.'
            : 'Nous préparons la demande de paiement.'
        }
        hint={
          isVerifying && ussdHint ? (
            <div>
              <span className="payment-overlay__ussd-label">{ussdHint.operator}</span>
              <span className="payment-overlay__ussd-code">{ussdHint.code}</span>
              <span className="payment-overlay__ussd-desc">
                Si la demande n'apparaît pas automatiquement, composez ce code sur votre téléphone
                pour {ussdHint.action}.
              </span>
            </div>
          ) : undefined
        }
        steps={
          isVerifying
            ? ["Demande envoyée", 'Confirmation sur le téléphone', 'Vérification']
            : ['Vérification des informations', "Envoi de la demande", 'Confirmation']
        }
        activeStep={1}
        elapsedSeconds={isVerifying ? elapsedSeconds : undefined}
        onCancel={isVerifying ? stopVerification : undefined}
        cancelLabel="Annuler"
      />

      {isMobile
        ? <CheckoutMobile {...viewProps} />
        : <CheckoutDesktop {...viewProps} />}

      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={() => {
          setAcceptTerms(true);
          clearError('terms');
          setTermsOpen(false);
        }}
      />

      <LocationModal
        open={locationModalOpen}
        permissionState={permissionState}
        locating={locationStatus === 'locating'}
        onRetry={attemptLocation}
        onClose={() => setLocationModalOpen(false)}
      />
    </>
  );
};

export default PaymentCheckoutPage;
