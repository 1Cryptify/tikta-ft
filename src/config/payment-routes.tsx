import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  PayPage,
  PaymentCheckoutPage,
  PaymentSuccessPage,
  PaymentFailedPage,
} from '../pages/payment.index';

/**
 * Payment System Routes Configuration
 *
 * All routes are prefixed with /pay
 *
 * Structure:
 * - /pay/:groupId                    - Group landing page (products from this group)
 * - /pay/:groupId/product/:id        - Checkout for product in group
 * - /pay/:groupId/offer/:id          - Checkout for offer in group
 * - /pay/:groupId/buy                - Checkout for group itself (if purchasable)
 * - /pay/:groupId/success            - Payment success confirmation
 * - /pay/:groupId/failed             - Payment failure notification
 *
 * Direct offer/product routes (no group required):
 * - /pay/offer/:offerId              - Direct checkout for offer
 * - /pay/product/:productId          - Direct checkout for product
 * - /pay/success                     - Payment success (direct)
 * - /pay/failed                      - Payment failure (direct)
 */
export const PaymentRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Group Landing Page - Shows products/offers for specific group */}
      <Route path="/:groupId" element={<PayPage />} />

      {/* Group Purchase Routes */}
      <Route path="/:groupId/product/:productId" element={<PaymentCheckoutPage />} />
      <Route path="/:groupId/offer/:offerId" element={<PaymentCheckoutPage />} />
      <Route path="/:groupId/buy" element={<PaymentCheckoutPage />} />

      {/* Group Success/Failure Routes */}
      <Route path="/:groupId/success" element={<PaymentSuccessPage />} />
      <Route path="/:groupId/failed" element={<PaymentFailedPage />} />

      {/* Direct Offer/Product Routes (no group required) */}
      <Route path="/offer/:offerId" element={<PaymentCheckoutPage />} />
      <Route path="/product/:productId" element={<PaymentCheckoutPage />} />

      {/* Direct Success/Failure Routes */}
      <Route path="/success" element={<PaymentSuccessPage />} />
      <Route path="/failed" element={<PaymentFailedPage />} />
    </Routes>
  );
};

export default PaymentRoutes;
