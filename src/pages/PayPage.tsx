import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiChevronRight, FiClock, FiPackage, FiTag, FiX } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { OfferVisual } from '../components/OfferVisual';
import { paymentService } from '../services/paymentService';
import { getMediaUrl } from '../services/api';
import { sanitizeHeaderHtml } from '../utils/sanitizeHtml';
import { closePaymentTab } from '../utils/closeTab';
import { OfferGroup, Product, Offer } from '../types/payment.types';
import '../styles/payment.css';
import '../styles/order-flow.css';

interface PayPageProps {
  groupData?: OfferGroup;
}

export const PayPage: React.FC<PayPageProps> = ({ groupData }) => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [group, setGroup] = useState<OfferGroup | null>(groupData || null);
  const [loading, setLoading] = useState(!groupData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      if (groupData) {
        setGroup(groupData);
        setLoading(false);
        return;
      }
      if (!groupId) return;

      try {
        setLoading(true);
        const response = await paymentService.getOfferGroup(groupId);

        if (response.status === 'success' && response) {
          const mapped: OfferGroup = {
            id: response.id || groupId,
            name: response.name || 'Pack',
            description: response.description || '',
            price: response.price ? parseFloat(response.price) : undefined,
            originalPrice: response.originalPrice ? parseFloat(response.originalPrice) : undefined,
            currency: response.currency?.code || response.currency || 'XAF',
            discount: response.discount,
            image: response.image,
            coverImage: response.coverImage || response.image,
            header_html: response.header_html || '',
            items: (response.offers || []).map((offer: any) => {
              const basePrice = parseFloat(offer.price) || 0;
              const finalPrice = offer.final_price != null ? parseFloat(offer.final_price) : basePrice;
              const hasDiscount = offer.final_price != null && finalPrice < basePrice;
              return {
                id: offer.id,
                name: offer.name,
                description: offer.description,
                price: finalPrice,
                originalPrice: hasDiscount ? basePrice : (offer.original_price ? parseFloat(offer.original_price) : undefined),
                currency: offer.currency?.code || offer.currency || 'XAF',
                discount: offer.discount_type === 'percentage' ? Number(offer.discount_value) : undefined,
                validUntil: offer.validUntil || offer.valid_until ? new Date(offer.validUntil || offer.valid_until) : undefined,
                image: offer.image,
                icon: offer.icon,
                icon_background: offer.icon_background,
              };
            }),
            is_package: response.is_package || false,
            is_active: response.is_active ?? true,
            is_featured: response.is_featured || false,
            purchasable: response.is_package || false,
          };
          setGroup(mapped);
        } else {
          setError('Ce pack est introuvable ou indisponible.');
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Impossible de charger ce pack. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, groupData]);

  const handleProductClick = (productId: string) =>
    navigate(`/checkout/product/${productId}`, { state: { from: location.pathname } });
  const handleOfferClick = (offerId: string) =>
    navigate(`/pay/offer/${offerId}`, { state: { from: location.pathname } });
  const handleBuyGroup = () => {
    if (group?.is_package && groupId) navigate(`/checkout/group/${groupId}/buy`);
  };

  const formatPrice = (amount?: number, currency: string = 'XAF'): string => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
  };

  if (loading) {
    return (
      <div className="of-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="of-center">
        <div className="of-card of-card--center">
          <div className="of-status-icon of-status-icon--error">!</div>
          <h1 className="of-title">Indisponible</h1>
          <p className="of-subtitle">{error || 'Pack introuvable.'}</p>
          <div className="of-actions">
            <button type="button" className="of-btn of-btn--outline of-btn--block" onClick={closePaymentTab}>
              <FiX aria-hidden="true" /> Sortir
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cover = getMediaUrl(group.coverImage || group.image);
  const headerHtml = sanitizeHeaderHtml(group.header_html);
  const hasHeader = Boolean(headerHtml);
  const items = group.items || [];

  return (
    <div className="of-page">
      <div className="of-container">
        {/* Group header — HTML custom (prioritaire) ou image de couverture */}
        <div className={`of-card ${(hasHeader || cover) ? 'of-card--flush' : ''}`}>
          {hasHeader ? (
            <div className="of-cover-html" dangerouslySetInnerHTML={{ __html: headerHtml }} />
          ) : cover ? (
            <div className="of-cover">
              <img src={cover} alt={group.name} />
              <div className="of-cover__overlay" />
              <div className="of-cover__content">
                <h1 className="of-cover__title">{group.name}</h1>
                {group.description && <p className="of-cover__desc">{group.description}</p>}
              </div>
            </div>
          ) : (
            <div className="of-group-head">
              <div className="of-group-thumb">
                <FiTag />
              </div>
              <div className="of-group-meta">
                <h1 className="of-group-name">{group.name}</h1>
                <p className="of-group-desc">{group.description}</p>
              </div>
            </div>
          )}

          {/* Package highlight */}
          {group.is_package && (
            <div className="of-package">
              <div className="of-package__top">
                <span className="of-package__label">
                  <FiPackage aria-hidden="true" /> Offre complète
                </span>
                {group.discount ? <span className="of-badge">-{group.discount}%</span> : null}
              </div>
              <h2 className="of-package__name">{group.name}</h2>
              <p className="of-package__desc">
                Achetez le pack complet en un seul paiement et recevez tous les identifiants d'un coup.
              </p>
              <div className="of-price-row" style={{ marginBottom: 14 }}>
                <span className="of-price">{formatPrice(group.price, group.currency)}</span>
                {group.originalPrice && (
                  <span className="of-price--old">{formatPrice(group.originalPrice, group.currency)}</span>
                )}
              </div>
              <button type="button" className="of-btn of-btn--primary of-btn--block" onClick={handleBuyGroup}>
                Acheter le pack
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Offers / products */}
        <div className="of-section-title">
          {group.is_package ? 'Ou choisissez une offre' : 'Offres disponibles'}
        </div>

        {items.length === 0 ? (
          <div className="of-card">
            <p className="of-subtitle">Aucune offre disponible pour le moment.</p>
          </div>
        ) : (
          <div className="of-offers">
            {items.map((item) => {
              const isOffer = 'originalPrice' in item && !('items' in item);
              const price = formatPrice(item.price, item.currency);
              const onClick = () =>
                isOffer
                  ? handleOfferClick((item as Offer).id)
                  : handleProductClick((item as Product).id);

              return (
                <div key={item.id} className="of-offer">
                  <div className="of-offer__thumb">
                    <OfferVisual
                      image={item.image}
                      icon={(item as Offer).icon}
                      background={(item as Offer).icon_background}
                      alt={item.name}
                      placeholder={<FiTag />}
                    />
                  </div>
                  <div className="of-offer__body">
                    <h3 className="of-offer__name">{item.name}</h3>
                    {item.description && <p className="of-offer__desc">{item.description}</p>}
                    {isOffer && (item as Offer).validUntil && (
                      <p className="of-offer__validity">
                        <FiClock aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }} />
                        Valable jusqu'au {(item as Offer).validUntil!.toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    <div className="of-offer__foot">
                      <div className="of-offer__prices">
                        <span className="of-offer__price">{price}</span>
                        {isOffer && (item as Offer).originalPrice ? (
                          <span className="of-offer__old">
                            {formatPrice((item as Offer).originalPrice, item.currency)}
                          </span>
                        ) : null}
                      </div>
                      <button type="button" className="of-btn of-btn--primary" onClick={onClick}>
                        Choisir
                        <FiChevronRight aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayPage;
