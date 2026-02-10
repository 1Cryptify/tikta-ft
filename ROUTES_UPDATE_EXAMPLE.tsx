/**
 * EXEMPLE: Comment mettre à jour src/router/routes.tsx pour intégrer les routes de paiement
 * 
 * Remplacez le contenu de src/router/routes.tsx par le code ci-dessous
 * ou fusionnez les nouvelles routes avec votre configuration existante
 */

import { ReactNode } from 'react';
import { LoginPage } from '../components/Auth/LoginPage';
import { ConfirmationPage } from '../components/Auth/ConfirmationPage';
import { Dashboard } from '../pages/Dashboard';

// Imports des nouvelles pages de paiement
import { PaymentCheckoutPage } from '../pages/PaymentCheckoutPage';
import { PaymentSuccessPage } from '../pages/PaymentSuccessPage';
import { PaymentFailedPage } from '../pages/PaymentFailedPage';

export interface RouteConfig {
    path: string;
    element: ReactNode;
    protected?: boolean;
    children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
    // Routes d'authentification
    {
        path: '/login',
        element: <LoginPage />,
        protected: false,
    },
    {
        path: '/confirm',
        element: <ConfirmationPage email="" onSuccess={() => {}} onBack={() => {}} />,
        protected: false,
    },

    // Routes de paiement (NON PROTÉGÉES - accessibles sans login)
    {
        path: '/pay/:groupId',
        element: <PaymentCheckoutPage />,
        protected: false,
    },
    {
        path: '/pay/offer/:offerId',
        element: <PaymentCheckoutPage />,
        protected: false,
    },
    {
        path: '/pay/product/:productId',
        element: <PaymentCheckoutPage />,
        protected: false,
    },
    {
        path: '/pay/success',
        element: <PaymentSuccessPage />,
        protected: false,
    },
    {
        path: '/pay/failed',
        element: <PaymentFailedPage />,
        protected: false,
    },

    // Routes du dashboard (PROTÉGÉES)
    {
        path: '/dashboard',
        element: <Dashboard user={null as any} onLogout={() => {}} />,
        protected: true,
        children: [
            { path: '/dashboard/overview', element: null },
            { path: '/dashboard/business', element: null },
            { path: '/dashboard/offers', element: null },
            { path: '/dashboard/payment-api', element: null },
            { path: '/dashboard/payments', element: null },
            { path: '/dashboard/tickets', element: null },
            { path: '/dashboard/transactions', element: null },
            { path: '/dashboard/settings', element: null },
        ],
    },
];

export const dashboardSections = [
    { id: 'overview', label: 'Overview', path: '/dashboard/overview' },
    { id: 'business', label: 'Business', path: '/dashboard/business' },
    { id: 'offers', label: 'Offers & Products', path: '/dashboard/offers' },
    { id: 'payment_api', label: 'Payment API', path: '/dashboard/payment-api' },
    { id: 'payments', label: 'Payments', path: '/dashboard/payments' },
    { id: 'tickets', label: 'Tickets', path: '/dashboard/tickets' },
    { id: 'transactions', label: 'Transactions', path: '/dashboard/transactions' },
    { id: 'settings', label: 'Settings', path: '/dashboard/settings' },
];

/**
 * NOTES IMPORTANTES:
 * 
 * 1. Les routes de paiement ont protected: false
 *    - Elles sont accessibles sans authentification
 *    - Idéal pour les clients qui achètent (non connectés)
 * 
 * 2. Les IDs de groupe/offre/produit sont des paramètres d'URL
 *    - /pay/{groupId} -> /pay/550e8400-e29b-41d4-a716-446655440000
 *    - /pay/offer/{offerId} -> /pay/offer/550e8400-e29b-41d4-a716-446655440001
 *    - /pay/product/{productId} -> /pay/product/550e8400-e29b-41d4-a716-446655440002
 * 
 * 3. Le composant PaymentCheckoutPage gère automatiquement
 *    - La détection du type de paiement (groupe/offre/produit)
 *    - Le chargement des données depuis l'API
 *    - Les transitions entre les étapes
 * 
 * 4. Vérifiez que votre fichier .env contient:
 *    VITE_API_URL=http://localhost:8000/api
 * 
 * 5. Les pages de succès/erreur peuvent être personnalisées
 *    avec des paramètres de query:
 *    - /pay/success
 *    - /pay/failed?error=Payment%20declined&ref=TXN-12345
 */
