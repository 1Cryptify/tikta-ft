import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiWifi, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { colors, spacing, borderRadius, shadows, transitions } from '../config/theme';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

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
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <FiCreditCard size={32} color={colors.primary} />
            </div>
            <h4 style={styles.featureTitle}>Plateforme de Paiement</h4>
            <p style={styles.featureDesc}>
              Acceptez les paiements en ligne facilement et en toute sécurité avec notre plateforme intégrée
            </p>
          </div>

          {/* Feature 2: WiFi Tickets */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <FiWifi size={32} color={colors.success} />
            </div>
            <h4 style={styles.featureTitle}>Gestion Tickets WiFi</h4>
            <p style={styles.featureDesc}>
              Vendez et gérez des passes WiFi pour vos zones d'accès. Contrôle total avec code QR unique
            </p>
          </div>

          {/* Feature 3: E-Shop */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <FiShoppingBag size={32} color={colors.info} />
            </div>
            <h4 style={styles.featureTitle}>Boutique en Ligne</h4>
            <p style={styles.featureDesc}>
              Créez et gérez votre magasin en ligne pour vendre vos produits et services en ligne
            </p>
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
            <a
              href="mailto:contact@tikta.com"
              style={styles.secondaryBtn}
            >
              Contacter l'équipe
            </a>
          </div>

          <div style={styles.contactInfo}>
            <p style={styles.contactInfoText}>
              📧 <strong>Email:</strong> contact@tikta.com
            </p>
            <p style={styles.contactInfoText}>
              💼 <strong>Support commercial:</strong> business@tikta.com
            </p>
          </div>
        </div>
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
    color: colors.primary,
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

  // Hero Section
  hero: {
    backgroundColor: colors.primary,
    color: colors.surface,
    padding: `${spacing.xxl} ${spacing.xl}`,
    textAlign: 'center' as const,
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
  } as React.CSSProperties,

  featureIcon: {
    marginBottom: spacing.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px',
    backgroundColor: colors.neutral,
    borderRadius: borderRadius.lg,
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
    margin: 0,
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
  } as React.CSSProperties,

  stepNumber: {
    width: '50px',
    height: '50px',
    backgroundColor: colors.primary,
    color: colors.surface,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 700,
    margin: `0 auto ${spacing.md} auto`,
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
    backgroundColor: colors.primary,
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
} as const;
