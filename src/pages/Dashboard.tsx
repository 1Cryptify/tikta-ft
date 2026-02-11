import React, { useMemo, useEffect } from 'react';
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
import { SettingsPage } from './SettingsPage';
import { PaymentMethodsCurrencyPage } from './PaymentMethodsCurrencyPage';
import { FiBarChart2, FiCreditCard, FiTrendingUp, FiSettings, FiShoppingBag, FiBriefcase, FiCode, FiTag, FiSliders } from 'react-icons/fi';

interface DashboardProps {
    user: User;
    onLogout: () => void;
    userRole?: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, userRole = UserRole.SUPER_ADMIN }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeCompany, setActiveCompany] = React.useState<{ id: string; name: string; logo?: string } | null>(null);

    // Synchronize active company from auth user on mount and when user changes
    useEffect(() => {
        if (user?.active_company) {
            setActiveCompany({
                id: user.active_company.id,
                name: user.active_company.name,
                logo: user.active_company.logo,
            });
        }
    }, [user?.active_company?.id]);

    // Get active section from URL path
    const getActiveSection = () => {
        const path = location.pathname;
        // if (path.includes('overview') || path === '/dashboard' || path === '/dashboard/') return 'overview';
        if (path.includes('business')) return 'business';
        if (path.includes('offers')) return 'offers_produits';
        if (path.includes('payment-api')) return 'payment_api';
        if (path.includes('payments')) return 'payments';
        if (path.includes('payment-config')) return 'payment_config';
        if (path.includes('tickets')) return 'tickets';
        if (path.includes('transactions')) return 'transactions';
        if (path.includes('settings')) return 'settings';
        return 'overview';
    };

    const activeNav = getActiveSection();

    const navItems = useMemo(() => {
        const allItems = [
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
                id: 'payments',
                label: 'Payments',
                icon: <FiCreditCard size={20} />,
                active: activeNav === 'payments',
                onClick: () => navigate('/dashboard/payments'),
            },
            {
                id: 'payment_config',
                label: 'Payment Config',
                icon: <FiSliders size={20} />,
                active: activeNav === 'payment_config',
                onClick: () => navigate('/dashboard/payment-config'),
                restricted: true,
                allowedRoles: [UserRole.SUPER_ADMIN, UserRole.STAFF],
            },
            {
                id: 'tickets',
                label: 'Tickets',
                icon: <FiTag size={20} />,
                active: activeNav === 'tickets',
                onClick: () => navigate('/dashboard/tickets'),
            },
            {
                id: 'payment_api',
                label: 'Payment API',
                icon: <FiCode size={20} />,
                active: activeNav === 'payment_api',
                onClick: () => navigate('/dashboard/payment-api'),
                badge: 'Coming Soon',
                disabled: true,
            },

            {
                id: 'settings',
                label: 'Settings',
                icon: <FiSettings size={20} />,
                active: activeNav === 'settings',
                onClick: () => navigate('/dashboard/settings'),
            },
        ];

        // Filter menu items based on user role
        return allItems.filter(item => {
            if (item.restricted && item.allowedRoles) {
                return item.allowedRoles.includes(userRole);
            }
            return true;
        });
    }, [activeNav, navigate, userRole]);

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
                <Route 
                    path="/payment-config" 
                    element={
                        [UserRole.SUPER_ADMIN, UserRole.STAFF].includes(userRole) ? (
                            <PaymentMethodsCurrencyPage />
                        ) : (
                            <Navigate to="/dashboard/overview" replace />
                        )
                    } 
                />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </MainLayout>
    );
};
