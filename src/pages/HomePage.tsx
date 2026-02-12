import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiWifi, FiShoppingBag, FiArrowRight, FiCheck, FiLock, FiTrendingUp } from 'react-icons/fi';
import { colors, spacing, borderRadius, shadows, transitions } from '../config/theme';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string>('');

    const contactReasons = [
        { id: 'demo', label: 'Demander une démo' },
        { id: 'pricing', label: 'Information tarifaire' },
        { id: 'integration', label: 'Intégration API' },
        { id: 'support', label: 'Support technique' },
        { id: 'partnership', label: 'Partenariat' },
        { id: 'other', label: 'Autre' },
    ];

    const handleContactSubmit = () => {
        if (selectedReason) {
            const reasonLabel = contactReasons.find(r => r.id === selectedReason)?.label || 'Contact';
            const subject = encodeURIComponent(`Demande: ${reasonLabel}`);
            const body = encodeURIComponent(`Bonjour,\n\nJe souhaiterais: ${reasonLabel}\n\nMerci de me contacter.`);
            window.location.href = `mailto:contact@webafri.com?subject=${subject}&body=${body}`;
            setIsContactModalOpen(false);
            setSelectedReason('');
        }
    };

    return (
        <div style={styles.container}>
            {/* Header/Navigation */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.logo}>Tikta</h1>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.loginBtn}
                    >
                        Connexion
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h2 style={styles.heroTitle}>
                        Plateforme de Paiement & Gestion Simplifiée
                    </h2>
                    <p style={styles.heroSubtitle}>
                        Gérez vos paiements, vos tickets WiFi et votre boutique en ligne en un seul endroit
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.ctaButton}
                    >
                        Commencer maintenant
                        <FiArrowRight size={20} style={{ marginLeft: spacing.md }} />
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section style={styles.features}>
                <h3 style={styles.sectionTitle}>Nos Services</h3>

                <div style={styles.featureGrid}>
                    {/* Feature 1: Payment */}
                    <div
                        style={{
                            ...styles.featureCard,
                            ...(hoveredCard === 'payment' ? styles.featureCardHover : {}),
                        }}
                        onMouseEnter={() => setHoveredCard('payment')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={{ ...styles.featureIcon, backgroundColor: 'rgba(30, 58, 95, 0.1)' }}>
                            <FiCreditCard size={40} color={colors.primary} />
                        </div>
                        <h4 style={styles.featureTitle}>Plateforme de Paiement</h4>
                        <p style={styles.featureDesc}>
                            Acceptez les paiements en ligne facilement et en toute sécurité avec notre plateforme intégrée. Support multi-devises.
                        </p>
                        <ul style={styles.featureList}>
                            <li style={styles.featureListItem}><FiCheck size={16} style={{ marginRight: spacing.sm }} />Paiement sécurisé</li>
                            <li style={styles.featureListItem}><FiCheck size={16} style={{ marginRight: spacing.sm }} />Multi-devises</li>
                        </ul>
                    </div>

                    {/* Feature 2: WiFi Tickets */}
                    <div
                        style={{
                            ...styles.featureCard,
                            ...(hoveredCard === 'wifi' ? styles.featureCardHover : {}),
                        }}
                        onMouseEnter={() => setHoveredCard('wifi')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={{ ...styles.featureIcon, backgroundColor: 'rgba(5, 150, 105, 0.1)' }}>
                            <FiWifi size={40} color={colors.success} />
                        </div>
                        <h4 style={styles.featureTitle}>Gestion Tickets WiFi</h4>
                        <p style={styles.featureDesc}>
                            Vendez et gérez des passes WiFi pour vos zones d'accès. Contrôle total avec code QR unique.
                        </p>
                        <ul style={styles.featureList}>
                            <li style={styles.featureListItem}><FiCheck size={16} style={{ marginRight: spacing.sm }} />Codes QR dynamiques</li>
                            <li style={styles.featureListItem}><FiCheck size={16} style={{ marginRight: spacing.sm }} />Gestion des durées</li>
                        </ul>
                    </div>

                    {/* Feature 3: E-Shop */}
                    <div
                        style={{
                            ...styles.featureCard,
                            ...(hoveredCard === 'shop' ? styles.featureCardHover : {}),
                        }}
                        onMouseEnter={() => setHoveredCard('shop')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={{ ...styles.featureIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                            <FiShoppingBag size={40} color={colors.info} />
                        </div>
                        <h4 style={styles.featureTitle}>Boutique en Ligne</h4>
                        <p style={styles.featureDesc}>
                            Créez et gérez votre magasin en ligne pour vendre vos produits et services en ligne facilement.
                        </p>
                        <ul style={styles.featureList}>
                            <li style={styles.featureListItem}><FiCheck size={16} style={{ marginRight: spacing.sm }} />Catalogue illimité</li>
                            <li style={styles.featureListItem}><FiCheck size={16} style={{ marginRight: spacing.sm }} />Gestion d'inventaire</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section style={styles.benefitsSection}>
                <div style={styles.benefitsContent}>
                    <h3 style={styles.benefitsTitle}>Pourquoi Choisir Tikta ?</h3>
                    <div style={styles.benefitsGrid}>
                        <div style={styles.benefitItem}>
                            <FiLock size={28} color={colors.primary} style={{ marginBottom: spacing.md }} />
                            <h4 style={styles.benefitTitle}>100% Sécurisé</h4>
                            <p style={styles.benefitText}>Vos données et celles de vos clients sont protégées par les meilleurs standards de sécurité</p>
                        </div>
                        <div style={styles.benefitItem}>
                            <FiTrendingUp size={28} color={colors.success} style={{ marginBottom: spacing.md }} />
                            <h4 style={styles.benefitTitle}>Statistiques en Temps Réel</h4>
                            <p style={styles.benefitText}>Suivez vos ventes et revenus avec des rapports détaillés et actualisés en direct</p>
                        </div>
                        <div style={styles.benefitItem}>
                            <FiCheck size={28} color={colors.info} style={{ marginBottom: spacing.md }} />
                            <h4 style={styles.benefitTitle}>Support 24/7</h4>
                            <p style={styles.benefitText}>Notre équipe est toujours disponible pour vous aider et répondre à vos questions</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section style={styles.howItWorks}>
                <h3 style={styles.sectionTitle}>Comment ça Marche</h3>

                <div style={styles.stepsContainer}>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>1</div>
                        <h4 style={styles.stepTitle}>Créez votre compte</h4>
                        <p style={styles.stepDesc}>Inscrivez-vous gratuitement avec vos informations professionnelles</p>
                    </div>

                    <div style={styles.step}>
                        <div style={styles.stepNumber}>2</div>
                        <h4 style={styles.stepTitle}>Configurez vos services</h4>
                        <p style={styles.stepDesc}>Paramétrez vos paiements, tickets WiFi et produits</p>
                    </div>

                    <div style={styles.step}>
                        <div style={styles.stepNumber}>3</div>
                        <h4 style={styles.stepTitle}>Commencez à vendre</h4>
                        <p style={styles.stepDesc}>Acceptez vos premiers paiements et gérez vos ventes</p>
                    </div>

                    <div style={styles.step}>
                        <div style={styles.stepNumber}>4</div>
                        <h4 style={styles.stepTitle}>Suivez vos revenus</h4>
                        <p style={styles.stepDesc}>Accédez à des rapports détaillés et analytics en temps réel</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section style={styles.contact}>
                <div style={styles.contactContent}>
                    <h3 style={styles.contactTitle}>Prêt à démarrer ?</h3>
                    <p style={styles.contactDesc}>
                        Contactez notre équipe pour configurer vos services et commencer à accepter les paiements
                    </p>

                    <div style={styles.contactActions}>
                        <button
                            onClick={() => setIsContactModalOpen(true)}
                            style={styles.secondaryBtn}
                        >
                            Commencer maintenant et contacter l'équipe
                        </button>
                    </div>

                    <div style={styles.contactInfo}>
                        <p style={styles.contactInfoText}>
                            <strong>Email:</strong> contact@webafri.com
                        </p>
                        <p style={styles.contactInfoText}>
                            <strong>Téléphone:</strong> +237698692938
                        </p>
                    </div>
                </div>

                {/* Contact Modal */}
                {isContactModalOpen && (
                    <div style={styles.modalOverlay} onClick={() => setIsContactModalOpen(false)}>
                        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setIsContactModalOpen(false)}
                                style={styles.closeBtn}
                            >
                                ✕
                            </button>
                            <h3 style={styles.modalTitle}>Quel est le motif de votre contact ?</h3>
                            <div style={styles.reasonsContainer}>
                                {contactReasons.map((reason) => (
                                    <button
                                        key={reason.id}
                                        onClick={() => setSelectedReason(reason.id)}
                                        style={{
                                            ...styles.reasonButton,
                                            ...(selectedReason === reason.id ? styles.reasonButtonActive : {}),
                                        }}
                                    >
                                        {reason.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleContactSubmit}
                                disabled={!selectedReason}
                                style={{
                                    ...styles.submitBtn,
                                    ...(selectedReason ? {} : styles.submitBtnDisabled),
                                }}
                            >
                                Envoyer la demande
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <p>&copy; 2024 Tikta. Tous droits réservés.</p>
                    <div style={styles.footerLinks}>
                        <a href="#privacy" style={styles.footerLink}>Confidentialité</a>
                        <a href="#terms" style={styles.footerLink}>Conditions</a>
                        <a href="#contact" style={styles.footerLink}>Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: colors.neutral,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        color: colors.textPrimary,
    } as React.CSSProperties,

    // Header Styles
    header: {
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky' as const,
        top: 0,
        zIndex: 100,
        boxShadow: shadows.sm,
    } as React.CSSProperties,

    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `${spacing.lg} ${spacing.xl}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    } as React.CSSProperties,

    logo: {
        fontSize: '28px',
        fontWeight: 700,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
    } as React.CSSProperties,

    loginBtn: {
        padding: `${spacing.md} ${spacing.lg}`,
        backgroundColor: colors.primary,
        color: colors.surface,
        border: 'none',
        borderRadius: borderRadius.md,
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: transitions.fast,
    } as React.CSSProperties,

    'loginBtn:hover': {
        backgroundColor: colors.primaryDark,
        transform: 'translateY(-2px)',
        boxShadow: shadows.lg,
    } as React.CSSProperties,

    // Hero Section
    hero: {
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        color: colors.surface,
        padding: `${spacing.xxl} ${spacing.xl}`,
        textAlign: 'center' as const,
        position: 'relative' as const,
        overflow: 'hidden' as const,
    } as React.CSSProperties,

    heroContent: {
        maxWidth: '800px',
        margin: '0 auto',
    } as React.CSSProperties,

    heroTitle: {
        fontSize: '48px',
        fontWeight: 700,
        margin: `0 0 ${spacing.lg} 0`,
        lineHeight: 1.2,
    } as React.CSSProperties,

    heroSubtitle: {
        fontSize: '18px',
        margin: `0 0 ${spacing.xl} 0`,
        opacity: 0.9,
        lineHeight: 1.6,
    } as React.CSSProperties,

    ctaButton: {
        padding: `${spacing.lg} ${spacing.xxl}`,
        backgroundColor: colors.success,
        color: colors.surface,
        border: 'none',
        borderRadius: borderRadius.md,
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        transition: transitions.fast,
    } as React.CSSProperties,

    // Features Section
    features: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `${spacing.xxl} ${spacing.xl}`,
    } as React.CSSProperties,

    sectionTitle: {
        fontSize: '32px',
        fontWeight: 700,
        marginBottom: `${spacing.xl}`,
        textAlign: 'center' as const,
        color: colors.primary,
    } as React.CSSProperties,

    featureGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: spacing.xl,
    } as React.CSSProperties,

    featureCard: {
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.md,
        transition: transitions.base,
        border: `1px solid ${colors.border}`,
    } as React.CSSProperties,

    featureCardHover: {
        transform: 'translateY(-8px)',
        boxShadow: shadows.lg,
        borderColor: colors.primary,
    } as React.CSSProperties,

    featureIcon: {
        marginBottom: spacing.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '70px',
        height: '70px',
        borderRadius: borderRadius.lg,
        transition: transitions.base,
    } as React.CSSProperties,

    featureTitle: {
        fontSize: '18px',
        fontWeight: 600,
        margin: `0 0 ${spacing.md} 0`,
        color: colors.textPrimary,
    } as React.CSSProperties,

    featureDesc: {
        fontSize: '14px',
        lineHeight: 1.6,
        color: colors.textSecondary,
        margin: `0 0 ${spacing.lg} 0`,
    } as React.CSSProperties,

    featureList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    } as React.CSSProperties,

    featureListItem: {
        fontSize: '13px',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
    } as React.CSSProperties,

    // How It Works Section
    howItWorks: {
        backgroundColor: colors.surface,
        padding: `${spacing.xxl} ${spacing.xl}`,
        borderTop: `1px solid ${colors.border}`,
    } as React.CSSProperties,

    stepsContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: spacing.xl,
    } as React.CSSProperties,

    step: {
        textAlign: 'center' as const,
        padding: spacing.lg,
    } as React.CSSProperties,

    stepNumber: {
        width: '60px',
        height: '60px',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
        color: colors.surface,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 700,
        margin: `0 auto ${spacing.md} auto`,
        boxShadow: shadows.md,
    } as React.CSSProperties,

    stepTitle: {
        fontSize: '16px',
        fontWeight: 600,
        margin: `0 0 ${spacing.sm} 0`,
        color: colors.textPrimary,
    } as React.CSSProperties,

    stepDesc: {
        fontSize: '14px',
        color: colors.textSecondary,
        margin: 0,
        lineHeight: 1.6,
    } as React.CSSProperties,

    // Contact Section
    contact: {
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        color: colors.surface,
        padding: `${spacing.xxl} ${spacing.xl}`,
        textAlign: 'center' as const,
    } as React.CSSProperties,

    contactContent: {
        maxWidth: '600px',
        margin: '0 auto',
    } as React.CSSProperties,

    contactTitle: {
        fontSize: '32px',
        fontWeight: 700,
        margin: `0 0 ${spacing.md} 0`,
    } as React.CSSProperties,

    contactDesc: {
        fontSize: '16px',
        margin: `0 0 ${spacing.xl} 0`,
        opacity: 0.9,
        lineHeight: 1.6,
    } as React.CSSProperties,

    contactActions: {
        display: 'flex',
        gap: spacing.lg,
        justifyContent: 'center',
        flexWrap: 'wrap' as const,
        margin: `${spacing.xl} 0`,
    } as React.CSSProperties,

    primaryBtn: {
        padding: `${spacing.lg} ${spacing.xxl}`,
        backgroundColor: colors.success,
        color: colors.surface,
        border: 'none',
        borderRadius: borderRadius.md,
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: transitions.fast,
    } as React.CSSProperties,

    'primaryBtn:hover': {
        backgroundColor: '#047857',
        transform: 'translateY(-2px)',
        boxShadow: `0 10px 20px rgba(0, 0, 0, 0.2)`,
    } as React.CSSProperties,

    secondaryBtn: {
        padding: `${spacing.lg} ${spacing.xxl}`,
        backgroundColor: 'transparent',
        color: colors.surface,
        border: `2px solid ${colors.surface}`,
        borderRadius: borderRadius.md,
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-block',
        transition: transitions.fast,
    } as React.CSSProperties,

    'secondaryBtn:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transform: 'translateY(-2px)',
    } as React.CSSProperties,

    contactInfo: {
        marginTop: spacing.xl,
        paddingTop: spacing.xl,
        borderTop: `1px solid rgba(255, 255, 255, 0.2)`,
    } as React.CSSProperties,

    contactInfoText: {
        fontSize: '14px',
        margin: `${spacing.sm} 0`,
        opacity: 0.9,
    } as React.CSSProperties,

    // Footer Styles
    footer: {
        backgroundColor: colors.textPrimary,
        color: colors.surface,
        padding: `${spacing.xl} ${spacing.lg}`,
        textAlign: 'center' as const,
        fontSize: '14px',
    } as React.CSSProperties,

    footerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
        gap: spacing.lg,
    } as React.CSSProperties,

    footerLinks: {
        display: 'flex',
        gap: spacing.xl,
    } as React.CSSProperties,

    footerLink: {
        color: colors.surface,
        textDecoration: 'none',
        fontSize: '13px',
        transition: transitions.fast,
    } as React.CSSProperties,

    'footerLink:hover': {
        opacity: 0.7,
    } as React.CSSProperties,

    // Benefits Section
    benefitsSection: {
        backgroundColor: colors.neutral,
        padding: `${spacing.xxl} ${spacing.xl}`,
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
    } as React.CSSProperties,

    benefitsContent: {
        maxWidth: '1200px',
        margin: '0 auto',
    } as React.CSSProperties,

    benefitsTitle: {
        fontSize: '32px',
        fontWeight: 700,
        marginBottom: `${spacing.xl}`,
        textAlign: 'center' as const,
        color: colors.primary,
    } as React.CSSProperties,

    benefitsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: spacing.xl,
    } as React.CSSProperties,

    benefitItem: {
        textAlign: 'center' as const,
        padding: spacing.lg,
    } as React.CSSProperties,

    benefitTitle: {
        fontSize: '16px',
        fontWeight: 600,
        margin: `0 0 ${spacing.md} 0`,
        color: colors.textPrimary,
    } as React.CSSProperties,

    benefitText: {
        fontSize: '14px',
        color: colors.textSecondary,
        lineHeight: 1.6,
        margin: 0,
    } as React.CSSProperties,

    // Modal Styles
    modalOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    } as React.CSSProperties,

    modal: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xxl,
        maxWidth: '500px',
        width: '90%',
        boxShadow: shadows.lg,
        position: 'relative' as const,
        animation: 'slideUp 0.3s ease-out',
    } as React.CSSProperties,

    closeBtn: {
        position: 'absolute' as const,
        top: spacing.lg,
        right: spacing.lg,
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: colors.textSecondary,
        transition: transitions.fast,
    } as React.CSSProperties,

    modalTitle: {
        fontSize: '22px',
        fontWeight: 600,
        marginBottom: spacing.xl,
        color: colors.textPrimary,
        textAlign: 'center' as const,
    } as React.CSSProperties,

    reasonsContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: spacing.md,
        marginBottom: spacing.xl,
    } as React.CSSProperties,

    reasonButton: {
        padding: `${spacing.md} ${spacing.lg}`,
        border: `2px solid ${colors.border}`,
        backgroundColor: colors.surface,
        color: colors.textPrimary,
        borderRadius: borderRadius.md,
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: transitions.fast,
        textAlign: 'left' as const,
    } as React.CSSProperties,

    reasonButtonActive: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}15`,
        color: colors.primary,
        fontWeight: 600,
    } as React.CSSProperties,

    submitBtn: {
        width: '100%',
        padding: `${spacing.lg} ${spacing.xl}`,
        backgroundColor: colors.primary,
        color: colors.surface,
        border: 'none',
        borderRadius: borderRadius.md,
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: transitions.fast,
    } as React.CSSProperties,

    submitBtnDisabled: {
        backgroundColor: colors.border,
        cursor: 'not-allowed',
        opacity: 0.5,
    } as React.CSSProperties,
} as const;
