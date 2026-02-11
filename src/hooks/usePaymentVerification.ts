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
}

interface UsePaymentVerificationReturn {
  status: PaymentStatus;
  isVerifying: boolean;
  verificationMessage: string;
  verificationResult: VerificationResult | null;
  attempts: number;
  startVerification: (params: {
    reference: string;
    gatewayReference: string;
    paymentType: 'offer' | 'product' | 'group';
    offerId?: string;
    productId?: string;
    groupId?: string;
  }, onToastMessage?: (message: string, type: 'success' | 'error' | 'info') => void) => void;
  stopVerification: () => void;
  resetVerification: () => void;
}

// Polling configuration
const POLLING_INTERVAL = 5000; // 5 seconds between checks
const MAX_ATTEMPTS = 60; // 60 attempts = 5 minutes total (60 * 5s)
const INITIAL_DELAY = 3000; // Wait 3 seconds before first check

export const usePaymentVerification = (): UsePaymentVerificationReturn => {
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [attempts, setAttempts] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const verifyPayment = useCallback(async (
    reference: string,
    gatewayReference: string,
    paymentType: 'offer' | 'product' | 'group',
    currentAttempt: number,
    onToastMessage?: (message: string, type: 'success' | 'error' | 'info') => void
  ): Promise<VerificationResult | null> => {
    try {
      let response;

      if (paymentType === 'offer') {
        response = await paymentService.verifyOfferPayment({
          reference,
          gateway_reference: gatewayReference,
        });
      } else if (paymentType === 'product') {
        response = await paymentService.verifyProductPayment({
          reference,
          gateway_reference: gatewayReference,
        });
      } else if (paymentType === 'group') {
        response = await paymentService.verifyGroupPayment({
          reference,
          gateway_reference: gatewayReference,
        });
      }

      if (response?.status === 'success') {
        // Payment completed successfully
        const result: VerificationResult = {
          status: 'completed',
          message: response.message || 'Payment completed successfully',
        };

        if (response.ticket) {
          // Single ticket
          result.ticket = response.ticket;
          result.offerName = response.ticket.offer_name;
          result.offerType = response.offer_type;
        } else if (response.tickets) {
          // Multiple tickets (package)
          result.tickets = response.tickets.filter((t: any) => t.ticket_id);
          result.groupName = response.group_name;
          result.offerType = 'package';
        }

        // Show success toast with backend message
        if (onToastMessage && response.message) {
          onToastMessage(response.message, 'success');
        }

        return result;
      } else if (response?.status === 'pending') {
        // Payment still pending
        // Show pending toast with backend message if available
        if (onToastMessage && response.message) {
          onToastMessage(response.message, 'info');
        }
        return {
          status: 'pending',
          message: response.message || `Waiting for payment confirmation... (Attempt ${currentAttempt}/${MAX_ATTEMPTS})`,
        };
      } else if (response?.status === 'error') {
        // Payment failed
        // Show error toast with backend message
        if (onToastMessage && response.message) {
          onToastMessage(response.message, 'error');
        }
        return {
          status: 'failed',
          message: response.message || 'Payment verification failed',
        };
      }

      return null;
    } catch (error: any) {
      // If the request was aborted, don't treat it as an error
      if (error.name === 'AbortError') {
        return null;
      }

      console.log('Verification error:', error);
      // Show error toast
      if (onToastMessage) {
        onToastMessage(error.message || 'Verification error occurred', 'error');
      }
      // Return pending to retry
      return {
        status: 'pending',
        message: `Checking payment status... (Attempt ${currentAttempt}/${MAX_ATTEMPTS})`,
      };
    }
  }, []);

  const startVerification = useCallback(({
    reference,
    gatewayReference,
    paymentType,
  }: {
    reference: string;
    gatewayReference: string;
    paymentType: 'offer' | 'product' | 'group';
    offerId?: string;
    productId?: string;
    groupId?: string;
  }, onToastMessage?: (message: string, type: 'success' | 'error' | 'info') => void) => {
    // Reset state
    clearAllTimers();
    setStatus('processing');
    setIsVerifying(true);
    setAttempts(0);
    setVerificationMessage('Initializing payment verification...');
    setVerificationResult(null);

    let currentAttempt = 0;

    // Create new abort controller for this verification session
    abortControllerRef.current = new AbortController();

    // Function to perform a single verification attempt
    const performVerification = async () => {
      currentAttempt += 1;
      setAttempts(currentAttempt);

      setVerificationMessage(`Waiting for payment confirmation... (Attempt ${currentAttempt}/${MAX_ATTEMPTS})`);

      const result = await verifyPayment(
        reference,
        gatewayReference,
        paymentType,
        currentAttempt,
        onToastMessage
      );

      if (!result) {
        // Request was aborted or no result
        return;
      }

      if (result.status === 'completed') {
        // Payment successful - stop polling
        clearAllTimers();
        setStatus('completed');
        setIsVerifying(false);
        setVerificationMessage(result.message || 'Payment completed successfully!');
        setVerificationResult(result);
      } else if (result.status === 'failed') {
        // Payment failed - stop polling
        clearAllTimers();
        setStatus('failed');
        setIsVerifying(false);
        setVerificationMessage(result.message || 'Payment failed');
        setVerificationResult(result);
      } else if (currentAttempt >= MAX_ATTEMPTS) {
        // Timeout reached
        clearAllTimers();
        setStatus('timeout');
        setIsVerifying(false);
        setVerificationMessage('Payment verification timed out. Please check your payment status later.');
        setVerificationResult({
          status: 'timeout',
          message: 'Payment verification timed out after 5 minutes',
        });
      }
      // If pending, continue polling (interval will trigger next attempt)
    };

    // Initial delay before first check
    timeoutRef.current = setTimeout(() => {
      performVerification();

      // Set up interval for subsequent checks
      intervalRef.current = setInterval(() => {
        performVerification();
      }, POLLING_INTERVAL);
    }, INITIAL_DELAY);
  }, [clearAllTimers, verifyPayment]);

  const stopVerification = useCallback(() => {
    clearAllTimers();
    setIsVerifying(false);
    setStatus('pending');
    setVerificationMessage('Verification stopped');
  }, [clearAllTimers]);

  const resetVerification = useCallback(() => {
    clearAllTimers();
    setStatus('pending');
    setIsVerifying(false);
    setVerificationMessage('');
    setVerificationResult(null);
    setAttempts(0);
  }, [clearAllTimers]);

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
