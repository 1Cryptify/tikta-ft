import React, { useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { User } from '../hooks/useAuth';
import { Business } from './Business';
import { UserRole } from '../config/menuPermissions';
import { OverviewPage } from './OverviewPage';
import { OffersPage } from './OffersPage';
import { PaymentAPIPage } from './PaymentAPIPage';
import { PaymentsPage } from './PaymentsPage';
import { TicketsPage } from './TicketsPage';
import { TransactionsPage } from './TransactionsPage';
import { SettingsPage } from './SettingsPage';
import { FiBarChart2, FiCreditCard, FiTrendingUp, FiSettings, FiShoppingBag, FiBriefcase, FiCode, FiTag } from 'react-icons/fi';

interface DashboardProps {
    user: User;
    onLogout: () => void;
    userRole?: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, userRole = UserRole.SUPER_ADMIN }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeCompany, setActiveCompany] = React.useState<{ id: string; name: string; logo?: string } | null>(null);

    // Get active section from URL path
    const getActiveSection = () => {
        const path = location.pathname;
        if (path.includes('overview') || path === '/dashboard' || path === '/dashboard/') return 'overview';
        if (path.includes('business')) return 'business';
        if (path.includes('offers')) return 'offers_produits';
        if (path.includes('payment-api')) return 'payment_api';
        if (path.includes('payments')) return 'payments';
        if (path.includes('tickets')) return 'tickets';
        if (path.includes('transactions')) return 'transactions';
        if (path.includes('settings')) return 'settings';
        return 'overview';
    };

    const activeNav = getActiveSection();

    const navItems = useMemo(() => [
        {
            id: 'overview',
            label: 'Overview',
            icon: <FiBarChart2 size={20} />,
            active: activeNav === 'overview',
            onClick: () => navigate('/dashboard/overview'),
        },
        {
            id: 'business',
            label: 'Businesses',
            icon: <FiBriefcase size={20} />,
            active: activeNav === 'business',
            onClick: () => navigate('/dashboard/business'),
        },
        {
            id: 'offers_produits',
            label: 'Offers & Products',
            icon: <FiShoppingBag size={20} />,
            active: activeNav === 'offers_produits',
            onClick: () => navigate('/dashboard/offers'),
        },
        {
            id: 'payment_api',
            label: 'Payment API',
            icon: <FiCode size={20} />,
            active: activeNav === 'payment_api',
            onClick: () => navigate('/dashboard/payment-api'),
        },
        {
            id: 'payments',
            label: 'Payments',
            icon: <FiCreditCard size={20} />,
            active: activeNav === 'payments',
            onClick: () => navigate('/dashboard/payments'),
        },
        {
            id: 'tickets',
            label: 'Tickets',
            icon: <FiTag size={20} />,
            active: activeNav === 'tickets',
            onClick: () => navigate('/dashboard/tickets'),
        },
        {
            id: 'transactions',
            label: 'Transactions',
            icon: <FiTrendingUp size={20} />,
            active: activeNav === 'transactions',
            onClick: () => navigate('/dashboard/transactions'),
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: <FiSettings size={20} />,
            active: activeNav === 'settings',
            onClick: () => navigate('/dashboard/settings'),
        },
    ], [activeNav, navigate]);

    return (
        <MainLayout
            user={user}
            navItems={navItems}
            navTitle="Menu"
            onLogout={onLogout}
            activeCompany={activeCompany}
        >
            <Routes>
                <Route path="/" element={<Navigate to="overview" replace />} />
                <Route path="/overview" element={<OverviewPage user={user} />} />
                <Route path="/business" element={<Business userRole={userRole} onCompanyActivated={setActiveCompany} />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/payment-api" element={<PaymentAPIPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </MainLayout>
    );
};
