import { useState, useCallback, useRef, useEffect } from 'react';
import { paymentService } from '../services/paymentService';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';

export interface VerificationResult {
  status: PaymentStatus;
  ticket?: any;
  tickets?: any[];
  offerName?: string;
  offerType?: string;
  groupName?: string;
  message?: string;
  adminContactMessage?: string;
  ticketAvailable?: boolean;
  allTicketsAvailable?: boolean;
  offersWithoutTickets?: string[];
  callbackUrl?: string;
}

interface UsePaymentVerificationParams {
  gatewayReference: string;
  paymentType: 'offer' | 'product' | 'group';
  offerId?: string;
  productId?: string;
  groupId?: string;
  paymentId?: string;
}

const POLL_INTERVAL_MS = 7000;
const MAX_ATTEMPTS = 40;

export const usePaymentVerification = (params?: UsePaymentVerificationParams) => {
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [attempts, setAttempts] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const stoppedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const verifyPayment = useCallback(async (
    gatewayReference: string,
    paymentType: 'offer' | 'product' | 'group',
    offerId?: string,
    productId?: string,
    groupId?: string,
    paymentId?: string,
  ): Promise<VerificationResult | null> => {
    try {
      // Prefer the gateway reference (idempotent "already completed" path);
      // fall back to the internal payment_id when the gateway returned none.
      const gatewayReferenceParam = gatewayReference || undefined;
      const paymentIdParam = gatewayReference ? undefined : paymentId;
      let response;

      if (paymentType === 'offer') {
        response = await paymentService.verifyOfferPayment({
          gateway_reference: gatewayReferenceParam,
          payment_id: paymentIdParam,
          offer_id: offerId || '',
        });
      } else if (paymentType === 'product') {
        response = await paymentService.verifyProductPayment({
          gateway_reference: gatewayReferenceParam,
          payment_id: paymentIdParam,
          product_id: productId || '',
        });
      } else if (paymentType === 'group') {
        response = await paymentService.verifyGroupPayment({
          gateway_reference: gatewayReferenceParam,
          payment_id: paymentIdParam,
          group_id: groupId || '',
        });
      }

      if (response?.status === 'success') {
        const result: VerificationResult = { status: 'completed', message: response.message || 'Paiement confirme' };

        if (response.ticket) {
          result.ticket = response.ticket;
          result.offerName = response.ticket.offer_name;
          result.offerType = response.offer_type;
        } else if (response.tickets) {
          result.tickets = response.tickets.filter((t: any) => t.ticket_id);
          result.groupName = response.group_name;
          result.offerType = 'package';
        }

        if (response.ticket_available !== undefined) result.ticketAvailable = response.ticket_available;
        if (response.all_tickets_available !== undefined) result.allTicketsAvailable = response.all_tickets_available;
        if (response.admin_contact_message) result.adminContactMessage = response.admin_contact_message;
        if (response.offers_without_tickets) result.offersWithoutTickets = response.offers_without_tickets;
        if (response.callback_url) result.callbackUrl = response.callback_url;
        if (response.offer_name) result.offerName = response.offer_name || result.offerName;

        return result;
      } else if (response?.status === 'pending') {
        return { status: 'pending', message: 'En attente du paiement...' };
      } else if (response?.status === 'error') {
        return { status: 'failed', message: response.message || 'Echec de la verification' };
      }

      return null;
    } catch (error: any) {
      console.log('Verification error:', error);
      return { status: 'pending', message: 'Verification en cours...' };
    }
  }, []);

  const startVerification = useCallback((params: {
    reference: string;
    gatewayReference: string;
    paymentType: 'offer' | 'product' | 'group';
    offerId?: string;
    productId?: string;
    groupId?: string;
    paymentId?: string;
  }) => {
    clearTimer();
    stoppedRef.current = false;
    attemptsRef.current = 0;
    setAttempts(0);
    setStatus('processing');
    setIsVerifying(true);
    setVerificationMessage('Verification en cours...');
    setVerificationResult(null);

    const performCheck = async () => {
      if (stoppedRef.current) return;

      attemptsRef.current += 1;
      setAttempts(attemptsRef.current);
      setVerificationMessage('Verification en cours...');

      const result = await verifyPayment(
        params.gatewayReference,
        params.paymentType,
        params.offerId,
        params.productId,
        params.groupId,
        params.paymentId,
      );

      if (!result || stoppedRef.current) return;

      if (result.status === 'completed') {
        clearTimer();
        setStatus('completed');
        setIsVerifying(false);
        setVerificationResult(result);
      } else if (result.status === 'failed') {
        clearTimer();
        setStatus('failed');
        setIsVerifying(false);
        setVerificationResult(result);
      } else if (attemptsRef.current >= MAX_ATTEMPTS) {
        clearTimer();
        setStatus('timeout');
        setIsVerifying(false);
        setVerificationResult({ status: 'timeout', message: 'Verification expiree. Verifiez vos tickets plus tard.' });
      }
    };

    intervalRef.current = setInterval(performCheck, POLL_INTERVAL_MS);
  }, [clearTimer, verifyPayment]);

  const stopVerification = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
    setIsVerifying(false);
    setStatus('pending');
  }, [clearTimer]);

  const resetVerification = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
    setStatus('pending');
    setIsVerifying(false);
    setVerificationMessage('');
    setVerificationResult(null);
    setAttempts(0);
    attemptsRef.current = 0;
  }, [clearTimer]);

  return {
    status,
    isVerifying,
    verificationMessage,
    verificationResult,
    attempts,
    startVerification,
    stopVerification,
    resetVerification,
  };
};

export default usePaymentVerification;
