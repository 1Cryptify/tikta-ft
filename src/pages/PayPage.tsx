import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { paymentService } from '../services/paymentService';
import { OfferGroup, Product, Offer } from '../types/payment.types';
import '../styles/payment.css';
import '../styles/pay-page.css';
import { API_BASE_URL } from '../services/api';

interface PayPageProps {
  groupData?: OfferGroup;
}

export const PayPage: React.FC<PayPageProps> = ({ groupData }) => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<OfferGroup | null>(groupData || null);
  const [loading, setLoading] = useState(!groupData);
  const [error, setError] = useState<string | null>(null);

  // Fetch group data from API (only if groupData prop is not provided)
  useEffect(() => {
    const fetchGroup = async () => {
      // Skip fetching if groupData was provided via props
      if (groupData) {
        setGroup(groupData);
        setLoading(false);
        return;
      }

      if (!groupId) return;

      try {
        setLoading(true);
        const response = await paymentService.getOfferGroup(groupId);

        if (response.data.status === 'success' && response) {
          // Map the API response to OfferGroup format
          const groupData: OfferGroup = {
            id: response.id || groupId,
            name: response.name || 'Unnamed Group',
            description: response.description || '',
            price: response.price ? parseFloat(response.price) : undefined,
            originalPrice: response.originalPrice ? parseFloat(response.originalPrice) : undefined,
            currency: response.currency?.code || response.currency || 'XAF',
            discount: response.discount,
            image: response.image,
            coverImage: response.coverImage || response.image,
            // Map offers to items
            items: response.offers?.map((offer: any) => ({
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
            // is_package from backend indicates if group is payable as package
            is_package: response.is_package || false,
            is_active: response.is_active ?? true,
            is_featured: response.is_featured || false,
            // Legacy field for backward compatibility
            purchasable: response.is_package || false,
          };
          setGroup(groupData);
        } else {
          setError('Group not found or unavailable');
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Failed to load group data');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, groupData]);

  const handleProductClick = (productId: string) => {
    navigate(`/checkout/product/${productId}`);
  };

  const handleOfferClick = (offerId: string) => {
    navigate(`/pay/offer/${offerId}`);
  };

  const handleBuyGroup = () => {
    if (group?.is_package && groupId) {
      navigate(`/checkout/group/${groupId}/buy`);
    }
  };

  const formatPrice = (amount?: number, currency: string = 'XAF'): string => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const renderGroupBuyCard = (group: OfferGroup) => {
    // Only show if group is a payable package
    if (!group.is_package) return null;

    return (
      <div className="group-card">
        <div className="group-cover">
          <img src={group.coverImage || group.image} alt={group.name} />
        </div>
        <div className="group-content">
          <h3 className="group-name">{group.name}</h3>
          <p className="group-desc">{group.description}</p>

          <div className="group-price-section">
            <div className="group-price">
              {formatPrice(group.price, group.currency)}
              {group.discount && (
                <span className="group-discount-badge">
                  {group.discount}% OFF
                </span>
              )}
            </div>
            {group.originalPrice && (
              <div className="group-original-price">
                {formatPrice(group.originalPrice, group.currency)}
              </div>
            )}
          </div>

          <p className="group-items-count">
            {group.items.length} item{group.items.length !== 1 ? 's' : ''} included
          </p>

          <div className="group-action-buttons">
            <button
              className="btn-primary"
              onClick={handleBuyGroup}
            >
              Buy Bundle
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProductCard = (product: Product) => {
    return (
      <div key={product.id} className="product-card">
        <div className="product-image">
          <img src={API_BASE_URL+product.image} alt={product.name} />
        </div>
        <div className="product-content">
          <h4 className="product-name">{product.name}</h4>
          <p className="product-desc">{product.description}</p>
          <div className="product-price">{formatPrice(product.price, product.currency)}</div>
          <button
            className="btn-primary"
            onClick={() => handleProductClick(product.id)}
          >
            Purchase
          </button>
        </div>
      </div>
    );
  };

  const renderOfferCard = (offer: Offer) => {
    return (
      <div key={offer.id} className="offer-card" onClick={() => handleOfferClick(offer.id)} style={{ cursor: 'pointer' }}>
        {offer.discount && (
          <div className="offer-badge">
            <div className="offer-badge-value">{offer.discount}%</div>
            <div>OFF</div>
          </div>
        )}
        <div className="offer-image" onClick={() => handleOfferClick(offer.id)}>
          <img src={API_BASE_URL+offer.image} alt={offer.name} />
        </div>
        <div className="offer-content">
          <h4 className="offer-name">{offer.name}</h4>
          <p className="offer-desc">{offer.description}</p>
          <div className="offer-price-group">
            <div className="offer-price">{formatPrice(offer.price, offer.currency)}</div>
            {offer.originalPrice && (
              <div className="offer-original-price">
                {formatPrice(offer.originalPrice, offer.currency)}
              </div>
            )}
          </div>
          {offer.validUntil && (
            <p className="offer-validity">
              Valid until {offer.validUntil.toLocaleDateString()}
            </p>
          )}
          <button
            className="btn-primary"
            onClick={() => handleOfferClick(offer.id)}
          >
            Get Offer
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pay-page">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="pay-page">
        <div className="container">
          <div className="pay-header">
            <h1>{error || 'Group not found'}</h1>
            <button className="btn-secondary" onClick={() => navigate('/')}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pay-page">
      {/* Cover Image Header */}
      {(group.coverImage || group.image) && (
        <div className="pay-cover-header">
          <img src={API_BASE_URL + (group.coverImage || group.image)} alt={group.name} />
          <div className="pay-cover-overlay"></div>
          <div className="pay-cover-content">
            <h1>{group.name}</h1>
            <p>{group.description}</p>
          </div>
        </div>
      )}
      
      <div className="container">
        {!group.coverImage && !group.image && (
          <div className="pay-header">
            <h1>{group.name}</h1>
            <p>{group.description}</p>
          </div>
        )}

        {/* Buy Group Bundle Section - Only if is_package is true */}
        {group.is_package && (
          <div className="pay-section">
            <h2 className="pay-section-title">Complete Bundle</h2>
            <div className="pay-groups-grid">
              {renderGroupBuyCard(group)}
            </div>
          </div>
        )}

        {/* Group Products/Offers Section
            NOTE: Backend automatically filters out ticket offers without available tickets,
            so all items here are guaranteed to be purchasable */}
        <div className="pay-section">
          <h2 className="pay-section-title">
            {group.is_package ? 'Or Choose Individual Products' : 'Available Products'}
          </h2>
          <div className="pay-products-grid">
            {group.items.map((item) => {
              if ('originalPrice' in item && !('items' in item)) {
                // It's an offer
                return renderOfferCard(item as Offer);
              } else {
                // It's a product
                return renderProductCard(item as Product);
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPage;
