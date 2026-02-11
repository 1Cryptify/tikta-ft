import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { paymentService } from '../services/paymentService';
import { OfferGroup } from '../types/payment.types';
import { PayPage } from './PayPage';

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
              navigate(`/checkout/group/${targetId}/buy`, { replace: true });
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
                navigate(`/checkout/group/${targetId}/buy`, { replace: true });
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
                items: groupResponse.offers?.map((offer: any) => ({
                  id: offer.id,
                  name: offer.name,
                  description: offer.description,
                  price: parseFloat(offer.price) || 0,
                  originalPrice: offer.originalPrice ? parseFloat(offer.originalPrice) : undefined,
                  currency: offer.currency?.code || offer.currency || 'XAF',
                  discount: offer.discount,
                  validUntil: offer.validUntil ? new Date(offer.validUntil) : undefined,
                  image: offer.image,
                })) || [],
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
      <div className="pay-page">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pay-page">
        <div className="container">
          <div className="pay-header">
            <h1>Error</h1>
            <p style={{ color: 'var(--color-error)' }}>{error}</p>
            <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
              Back to Home
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
    <div className="pay-page">
      <div className="container">
        <div className="pay-header">
          <h1>Something went wrong</h1>
          <p>Unable to determine the payment type. Please try again.</p>
          <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayRouterPage;
