import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  PayPage,
  PaymentCheckoutPage,
  PaymentSuccessPage,
  PaymentFailedPage,
  PayRouterPage,
} from '../pages/payment.index';

/**
 * Payment System Routes Configuration
 *
 * New URL Structure:
 * - /pay/:id                         - Offer payment page (or group package if id is a group with is_package=true)
 * - /pay/g/:groupId                  - Group routing (payment if is_package=true, offers list if is_package=false)
 * - /pay/offer/:offerId         - Direct checkout for offer
 * - /checkout/group/:groupId/buy     - Checkout for group package
 * - /checkout/product/:productId     - Checkout for product
 * - /pay/success                     - Payment success page
 * - /pay/failed                      - Payment failure page
 *
 * Legacy Routes (for backward compatibility):
 * - /pay/offer/:offerId              - Redirects to new structure
 * - /pay/product/:productId          - Redirects to new structure
 */
export const PaymentRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 
        New Payment Router - Smart routing based on ID type
        /pay/:id - If offer ID -> payment page, If group with is_package=true -> payment page
      */}
      <Route path="/:id" element={<PayRouterPage type="offer" />} />

      {/* 
        Group Router - Handles groups specifically
        /pay/g/:groupId - If is_package=true -> payment, If is_package=false -> offers list
      */}
      <Route path="/g/:groupId" element={<PayRouterPage type="group" />} />

      {/* Checkout Routes (internal use) */}
      <Route path="/pay/offer/:offerId" element={<PaymentCheckoutPage />} />
      <Route path="/pay/g/:groupId/buy" element={<PaymentCheckoutPage />} />
      <Route path="/pay/product/:productId" element={<PaymentCheckoutPage />} />

      {/* Success/Failure Routes */}
      <Route path="/success" element={<PaymentSuccessPage />} />
      <Route path="/failed" element={<PaymentFailedPage />} />

      {/* Legacy Routes - For backward compatibility */}
      <Route path="/offer/:offerId" element={<PaymentCheckoutPage />} />
      <Route path="/product/:productId" element={<PaymentCheckoutPage />} />
      
      {/* Legacy Group Routes - These will be handled by the new router */}
      <Route path="/:groupId/product/:productId" element={<PaymentCheckoutPage />} />
      <Route path="/:groupId/offer/:offerId" element={<PaymentCheckoutPage />} />
      <Route path="/:groupId/buy" element={<PaymentCheckoutPage />} />
      <Route path="/:groupId/success" element={<PaymentSuccessPage />} />
      <Route path="/:groupId/failed" element={<PaymentFailedPage />} />
      
      {/* Default - Group landing page (for /pay/:groupId format) */}
      <Route path="/:groupId" element={<PayPage />} />
    </Routes>
  );
};

export default PaymentRoutes;
