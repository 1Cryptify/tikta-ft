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
 * - /pay/:groupId               - Group landing page (products from this group)
 * - /pay/:groupId/product/:id   - Checkout for product in group
 * - /pay/:groupId/offer/:id     - Checkout for offer in group
 * - /pay/:groupId/buy           - Checkout for group itself (if purchasable)
 * - /pay/:groupId/success       - Payment success confirmation
 * - /pay/:groupId/failed        - Payment failure notification
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

      {/* Success/Failure Routes */}
      <Route path="/:groupId/success" element={<PaymentSuccessPage />} />
      <Route path="/:groupId/failed" element={<PaymentFailedPage />} />
    </Routes>
  );
};

export default PaymentRoutes;
