import React from 'react';
import { OffersList } from './OffersList';

/**
 * Page « Offers & Groups ».
 *
 * La gestion des offres ET des groupes (onglets Offers / Groups) est portée par
 * `OffersList`, qui fournit l'en-tête et les onglets. On évite ainsi tout
 * doublon d'en-tête/onglets au niveau de la page.
 */
export const OffersPage: React.FC = () => {
  return <OffersList />;
};
