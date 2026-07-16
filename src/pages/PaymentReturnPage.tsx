import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import LoadingSpinner from '../components/LoadingSpinner';

const MAX_ATTEMPTS = 40;
const POLL_INTERVAL_MS = 7000;

export const PaymentReturnPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('Verification du paiement en cours...');
    const doneRef = useRef(false);

    useEffect(() => {
        const reference = searchParams.get('reference') || '';
        const paymentId = searchParams.get('payment_id') || '';
        const type = (searchParams.get('type') || 'offer') as 'offer' | 'product' | 'group';
        const id = searchParams.get('id') || '';

        let stored: any = {};
        try {
            const raw = localStorage.getItem('pendingPayment');
            stored = raw ? JSON.parse(raw) : {};
        } catch { stored = {}; }

        const info = stored.paymentInfo || {};
        const gatewayReference = info.gatewayReference || reference;
        const pType = (stored.paymentType || type) as 'offer' | 'product' | 'group';
        const offerId = stored.offerId || (pType === 'offer' ? id : undefined);
        const productId = stored.productId || (pType === 'product' ? id : undefined);
        const groupId = stored.groupId || (pType === 'group' ? id : undefined);

        const buildSuccessData = (response: any) => {
            const successData: any = {
                paymentInfo: {
                    paymentId: response.payment_id || info.paymentId || paymentId,
                    transactionId: info.transactionId,
                    reference: response.transaction_reference || reference,
                    gatewayReference: gatewayReference,
                    amount: response.amount || info.amount,
                    currency: response.currency || info.currency,
                },
                paymentType: pType,
                offerId, productId, groupId,
            };

            if (response.ticket) {
                successData.tickets = [response.ticket];
                successData.offerName = response.ticket.offer_name;
                successData.offerType = response.offer_type;
            } else if (response.tickets) {
                successData.tickets = response.tickets.filter((t: any) => t.ticket_id);
                successData.offerName = response.group_name;
                successData.offerType = 'package';
            }

            if (response.admin_contact_message) successData.adminContactMessage = response.admin_contact_message;
            if (response.ticket_available !== undefined) successData.ticketAvailable = response.ticket_available;
            if (response.all_tickets_available !== undefined) successData.allTicketsAvailable = response.all_tickets_available;
            if (response.offers_without_tickets) successData.offersWithoutTickets = response.offers_without_tickets;
            if (response.callback_url) successData.callbackUrl = response.callback_url;
            if (response.offer_name) successData.offerName = response.offer_name || successData.offerName;

            return successData;
        };

        let attempt = 0;

        const verifyOnce = async () => {
            if (doneRef.current) return;
            attempt++;
            setMessage('Verification du paiement en cours...');

            let response: any;
            try {
                if (pType === 'group' && groupId) {
                    response = await paymentService.verifyGroupPayment({ gateway_reference: gatewayReference, payment_id: paymentId, group_id: groupId });
                } else if (pType === 'offer' && offerId) {
                    response = await paymentService.verifyOfferPayment({ gateway_reference: gatewayReference, payment_id: paymentId, offer_id: offerId });
                } else if (pType === 'product' && productId) {
                    response = await paymentService.verifyProductPayment({ gateway_reference: gatewayReference, payment_id: paymentId, product_id: productId });
                } else {
                    navigate('/pay/failed', { state: { errorMessage: 'Parametres de paiement invalides' }, replace: true });
                    return true;
                }

                if (response?.status === 'success') {
                    doneRef.current = true;
                    const successData = buildSuccessData(response);
                    localStorage.setItem('pendingPayment', JSON.stringify(successData));
                    navigate('/pay/success', { state: { paymentData: successData }, replace: true });
                    return true;
                }
                if (response?.status === 'error') {
                    doneRef.current = true;
                    navigate('/pay/failed', { state: { errorMessage: response?.message }, replace: true });
                    return true;
                }
            } catch (err: any) {
                console.log('Verify error:', err);
            }

            if (attempt >= MAX_ATTEMPTS) {
                doneRef.current = true;
                navigate('/pay/success', { state: { paymentData: stored, timeout: true }, replace: true });
                return true;
            }

            return false;
        };

        const interval = setInterval(async () => {
            const done = await verifyOnce();
            if (done) clearInterval(interval);
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <LoadingSpinner />
            <p style={{ color: '#555', fontSize: '16px' }}>{message}</p>
        </div>
    );
};
