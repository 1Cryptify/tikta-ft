import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getOfferGroupById,
  getAllProducts,
  getAllOffers,
  formatPrice,
} from '../mocks/paymentData';
import { OfferGroup, Product, Offer } from '../types/payment.types';
import '../styles/payment.css';
import '../styles/pay-page.css';

export const PayPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  // Get the specific group
  const group = groupId ? getOfferGroupById(groupId) : null;
  
  if (!group) {
    return (
      <div className="pay-page">
        <div className="container">
          <div className="pay-header">
            <h1>Group not found</h1>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleProductClick = (productId: string) => {
    navigate(`/pay/${groupId}/product/${productId}`);
  };

  const handleOfferClick = (offerId: string) => {
    navigate(`/pay/${groupId}/offer/${offerId}`);
  };

  const handleBuyGroup = () => {
    navigate(`/pay/${groupId}/buy`);
  };

  const renderGroupBuyCard = (group: OfferGroup) => {
    if (!group.purchasable) return null;
    
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
              {formatPrice(group.price)}
              {group.discount && (
                <span className="group-discount-badge">
                  {group.discount}% OFF
                </span>
              )}
            </div>
            {group.originalPrice && (
              <div className="group-original-price">
                {formatPrice(group.originalPrice)}
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
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-content">
          <h4 className="product-name">{product.name}</h4>
          <p className="product-desc">{product.description}</p>
          <div className="product-price">{formatPrice(product.price)}</div>
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
      <div key={offer.id} className="offer-card">
        {offer.discount && (
          <div className="offer-badge">
            <div className="offer-badge-value">{offer.discount}%</div>
            <div>OFF</div>
          </div>
        )}
        <div className="offer-image">
          <img src={offer.image} alt={offer.name} />
        </div>
        <div className="offer-content">
          <h4 className="offer-name">{offer.name}</h4>
          <p className="offer-desc">{offer.description}</p>
          <div className="offer-price-group">
            <div className="offer-price">{formatPrice(offer.price)}</div>
            {offer.originalPrice && (
              <div className="offer-original-price">
                {formatPrice(offer.originalPrice)}
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

  return (
    <div className="pay-page">
      <div className="container">
        <div className="pay-header">
          <h1>{group.name}</h1>
          <p>{group.description}</p>
        </div>

        {/* Buy Group Bundle Section - Only if purchasable */}
        {group.purchasable && (
          <div className="pay-section">
            <h2 className="pay-section-title">Complete Bundle</h2>
            <div className="pay-groups-grid">
              {renderGroupBuyCard(group)}
            </div>
          </div>
        )}

        {/* Group Products Section */}
        <div className="pay-section">
          <h2 className="pay-section-title">
            {group.purchasable ? 'Or Choose Individual Products' : 'Available Products'}
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
