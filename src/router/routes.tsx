import { ReactNode } from 'react';
import { LoginPage } from '../components/Auth/LoginPage';
import { ConfirmationPage } from '../components/Auth/ConfirmationPage';
import { Dashboard } from '../pages/Dashboard';
import { PaymentCheckoutPage } from '../pages/PaymentCheckoutPage';
import { PaymentSuccessPage } from '../pages/PaymentSuccessPage';
import { PaymentFailedPage } from '../pages/PaymentFailedPage';
import { PayRouterPage } from '../pages/PayRouterPage';

export interface RouteConfig {
    path: string;
    element: ReactNode;
    protected?: boolean;
    children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
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
    // Payment Routes
    // /pay/:id - Offer payment page (or group package if id is a group with is_package=true)
    {
        path: '/pay/:id',
        element: <PayRouterPage type="offer" />,
        protected: false,
    },
    // /pay/g/:groupId - Group routing (payment if is_package=true, offers list if is_package=false)
    {
        path: '/pay/g/:groupId',
        element: <PayRouterPage type="group" />,
        protected: false,
    },
    // Checkout routes (internal redirects from PayRouterPage)
    {
        path: '/checkout/offer/:offerId',
        element: <PaymentCheckoutPage />,
        protected: false,
    },
    {
        path: '/checkout/group/:groupId/buy',
        element: <PaymentCheckoutPage />,
        protected: false,
    },
    {
        path: '/checkout/product/:productId',
        element: <PaymentCheckoutPage />,
        protected: false,
    },
    // Success/Failed pages
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
    // Legacy redirects for backward compatibility
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
