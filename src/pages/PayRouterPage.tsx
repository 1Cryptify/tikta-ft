import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { closePaymentTab } from '../utils/closeTab';
import LoadingSpinner from '../components/LoadingSpinner';
import { paymentService } from '../services/paymentService';
import { OfferGroup } from '../types/payment.types';
import { PayPage } from './PayPage';
import '../styles/payment.css';
import '../styles/order-flow.css';

interface PayRouterPageProps {
  type: 'offer' | 'group';
}

/**
 * PayRouterPage - Smart routing component for payment pages
 * 
 * Routes:
 * - /pay/:id -> type='offer' - Direct offer payment or group package payment
 * - /pay/g/:groupId -> type='group' - Group routing based on is_package flag
 * 
 * Logic:
 * - If type='offer' (from /pay/:id):
 *   - Try to fetch as offer first
 *   - If not found as offer, try as group
 *   - If group with is_package=true -> show payment checkout
 *   - Otherwise redirect to /pay/g/:id
 * 
 * - If type='group' (from /pay/g/:groupId):
 *   - Fetch group
 *   - If is_package=true -> redirect to payment checkout
 *   - If is_package=false -> show PayPage (intermediate offers list)
 */
export const PayRouterPage: React.FC<PayRouterPageProps> = ({ type }) => {
  const { id, groupId } = useParams<{ id?: string; groupId?: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupData, setGroupData] = useState<OfferGroup | null>(null);

  const targetId = type === 'offer' ? id : groupId;

  useEffect(() => {
    const determineRoute = async () => {
      if (!targetId) {
        setError('No ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (type === 'offer') {
          // Try to fetch as offer first
          try {
            const offerData = await paymentService.getOffer(targetId);
            if (offerData.status === 'success' && offerData.offer) {
              // It's an offer - redirect to offer checkout
              navigate(`/pay/offer/${targetId}`, { replace: true });
              return;
            }
          } catch (err) {
            // Not an offer, try as group
            console.log('Not an offer, trying as group...');
          }

          // Try as group
          try {
            const groupResponse = await paymentService.getOfferGroup(targetId);
            if (groupResponse.status === 'success' && groupResponse) {
              if (!groupResponse.is_package) {
                // Group is not a package, redirect to group route
                navigate(`/pay/g/${targetId}`, { replace: true });
                return;
              }
              // Group is a package - redirect to group checkout
              navigate(`/pay/g/${targetId}/buy`, { replace: true });
              return;
            }
          } catch (err) {
            setError('Item not found. Please check the URL and try again.');
            setLoading(false);
            return;
          }
        } else {
          // type === 'group' - fetch group and determine route based on is_package
          try {
            const groupResponse = await paymentService.getOfferGroup(targetId);
            if (groupResponse.status === 'success' && groupResponse) {
              if (groupResponse.is_package) {
                // Group is a package - redirect to payment checkout
                navigate(`/pay/g/${targetId}/buy`, { replace: true });
                return;
              }
              
              // Group is not a package - show intermediate offers list
              // Map the API response to OfferGroup format
              const mappedGroup: OfferGroup = {
                id: groupResponse.id || targetId,
                name: groupResponse.name || 'Unnamed Group',
                description: groupResponse.description || '',
                price: groupResponse.price ? parseFloat(groupResponse.price) : undefined,
                originalPrice: groupResponse.originalPrice ? parseFloat(groupResponse.originalPrice) : undefined,
                currency: groupResponse.currency?.code || groupResponse.currency || 'XAF',
                discount: groupResponse.discount,
                image: groupResponse.image,
                coverImage: groupResponse.coverImage || groupResponse.image,
                header_html: groupResponse.header_html || '',
                items: (groupResponse.offers || []).map((offer: any) => {
                  const basePrice = parseFloat(offer.price) || 0;
                  const finalPrice = offer.final_price != null ? parseFloat(offer.final_price) : basePrice;
                  const hasDiscount = offer.final_price != null && finalPrice < basePrice;
                  return {
                    id: offer.id,
                    name: offer.name,
                    description: offer.description,
                    price: finalPrice,
                    originalPrice: hasDiscount ? basePrice : undefined,
                    currency: offer.currency?.code || offer.currency || 'XAF',
                    discount: offer.discount_type === 'percentage' ? Number(offer.discount_value) : undefined,
                    validUntil: offer.validUntil || offer.valid_until ? new Date(offer.validUntil || offer.valid_until) : undefined,
                    image: offer.image,
                    icon: offer.icon,
                    icon_background: offer.icon_background,
                  };
                }),
                is_package: false,
                is_active: groupResponse.is_active ?? true,
                is_featured: groupResponse.is_featured || false,
              };
              setGroupData(mappedGroup);
              setLoading(false);
              return;
            } else {
              setError('Group not found or unavailable');
              setLoading(false);
              return;
            }
          } catch (err) {
            setError('Failed to load group data. Please try again.');
            setLoading(false);
            return;
          }
        }

        setError('Item not found');
        setLoading(false);
      } catch (err) {
        console.error('Error in PayRouterPage:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    determineRoute();
  }, [targetId, type, navigate]);

  if (loading) {
    return (
      <div className="of-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="of-center">
        <div className="of-card of-card--center">
          <div className="of-status-icon of-status-icon--error">
            <FiAlertTriangle aria-hidden="true" />
          </div>
          <h1 className="of-title">Indisponible</h1>
          <p className="of-subtitle">{error}</p>
          <div className="of-actions">
            <button type="button" className="of-btn of-btn--outline of-btn--block" onClick={closePaymentTab}>
              <FiX aria-hidden="true" /> Sortir
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For type='group' with is_package=false, show the intermediate offers list
  if (type === 'group' && groupData) {
    return <PayPage groupData={groupData} />;
  }

  // Fallback - should not reach here
  return (
    <div className="of-center">
      <div className="of-card of-card--center">
        <div className="of-status-icon of-status-icon--error">
          <FiAlertTriangle aria-hidden="true" />
        </div>
        <h1 className="of-title">Une erreur est survenue</h1>
        <p className="of-subtitle">Impossible de déterminer le type de paiement. Veuillez réessayer.</p>
        <div className="of-actions">
          <button type="button" className="of-btn of-btn--outline of-btn--block" onClick={closePaymentTab}>
            <FiX aria-hidden="true" /> Sortir
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayRouterPage;
