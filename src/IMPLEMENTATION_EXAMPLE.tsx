/**
 * PAYMENT SYSTEM IMPLEMENTATION EXAMPLE
 *
 * This file shows how to integrate the payment system into your main application router.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentRoutes from './config/payment-routes';

/**
 * STEP 1: Add the payment routes to your main router
 *
 * Example App.tsx or main routing file:
 */
export const AppRouterExample: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Your other routes */}
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />

        {/* Payment System Routes - All under /pay prefix */}
        <Route path="/pay/*" element={<PaymentRoutes />} />

        {/* Other routes */}
      </Routes>
    </Router>
  );
};

/**
 * STEP 2: Available routes after integration:
 *
 * ✅ /pay                                - Landing page (PayPage)
 * ✅ /pay/:groupId                       - Bundle checkout
 * ✅ /pay/product/:productId             - Product checkout
 * ✅ /pay/offer/:offerId                 - Offer checkout
 * ✅ /pay/success                        - Success confirmation
 * ✅ /pay/failed                         - Failure notification
 *
 * Example URLs for testing:
 * - http://localhost:3000/pay
 * - http://localhost:3000/pay/GROUP_001
 * - http://localhost:3000/pay/product/PROD_001
 * - http://localhost:3000/pay/offer/OFFER_001
 * - http://localhost:3000/pay/success
 * - http://localhost:3000/pay/failed
 */

/**
 * STEP 3: Using Payment Data in Other Components
 *
 * Example: Display a product in another page
 */
import {
  getProductById,
  getAllProducts,
  formatPrice,
} from './mocks/paymentData';

export const ProductDisplayExample: React.FC<{ productId: string }> = ({
  productId,
}) => {
  const product = getProductById(productId);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <img src={product.image} alt={product.name} />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: {formatPrice(product.price)}</p>
    </div>
  );
};

/**
 * STEP 4: Linking to Checkout from Other Pages
 *
 * Example: Button to start payment
 */
import { useNavigate } from 'react-router-dom';

export const BuyButtonExample: React.FC = () => {
  const navigate = useNavigate();

  const handleBuyProduct = () => {
    navigate('/pay/product/PROD_001');
  };

  const handleBuyBundle = () => {
    navigate('/pay/GROUP_001');
  };

  return (
    <div>
      <button onClick={handleBuyProduct}>Buy Starter Package</button>
      <button onClick={handleBuyBundle}>Buy Bundle</button>
    </div>
  );
};

/**
 * STEP 5: Import Global Styles
 *
 * Add to your main App.tsx or index.tsx:
 */
export const ImportExample = `
import './styles/payment.css';        // Global payment styles
import './styles/pay-page.css';       // Landing page styles
import './styles/payment-checkout.css'; // Checkout page styles
import './styles/payment-success.css'; // Success page styles
import './styles/payment-failed.css';  // Failed page styles
`;

/**
 * STEP 6: TypeScript Types Usage
 *
 * Example: Use types in your components
 */
import { Product, Offer, OfferGroup, PaymentFormData } from './types/payment.types';

export const TypesExample: React.FC = () => {
  const myProduct: Product = {
    id: 'CUSTOM_001',
    name: 'Custom Product',
    description: 'A custom product for testing',
    price: 299.99,
    currency: 'USD',
    image: 'https://example.com/image.jpg',
  };

  const myOffer: Offer = {
    id: 'CUSTOM_OFFER',
    name: 'Custom Offer',
    description: 'A custom offer',
    price: 199.99,
    originalPrice: 299.99,
    currency: 'USD',
    discount: 33,
  };

  const formData: PaymentFormData = {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main St',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
    paymentMethod: 'CC',
    acceptTerms: true,
  };

  return null;
};

/**
 * COMPLETE INTEGRATION CHECKLIST
 *
 * ✓ Copy all files from ft/src/ to your project
 * ✓ Add PaymentRoutes to your main router
 * ✓ Import CSS files in your main App file
 * ✓ Ensure React Router is installed
 * ✓ Test all routes at /pay/*
 * ✓ Verify responsive design on mobile/tablet
 * ✓ Check form validation works
 * ✓ Confirm payment flow works (success/failed pages)
 * ✓ Update payment processing logic when ready
 * ✓ Replace mock data with real API when ready
 * ✓ Add real payment gateway integration
 * ✓ Set up error handling and logging
 */

/**
 * CUSTOMIZATION EXAMPLES
 *
 * To customize colors, edit: ft/src/styles/payment.css
 * CSS custom properties in :root section:
 *
 * --color-primary: #333         (Dark text)
 * --color-secondary: #666       (Gray text)
 * --color-accent: #007bff       (Blue buttons)
 * --color-success: #28a745      (Green)
 * --color-danger: #dc3545       (Red)
 * --color-light: #f8f9fa        (Light background)
 * --color-border: #e0e0e0       (Borders)
 */

/**
 * TESTING QUICK LINKS
 *
 * Mock Product IDs:
 * - PROD_001: Starter Package
 * - PROD_002: Professional Suite
 * - PROD_003: Enterprise Solution
 * - PROD_004: Analytics Plus
 * - PROD_005: Security Pro
 *
 * Mock Offer IDs:
 * - OFFER_001: Summer Sale
 * - OFFER_002: Black Friday Bundle
 * - OFFER_003: Early Bird Special
 *
 * Mock Bundle IDs:
 * - GROUP_001: Starter Bundle
 * - GROUP_002: Professional Package
 * - GROUP_003: Ultimate Suite
 * - GROUP_004: Product Selection
 */
