import React from 'react';
import styled from 'styled-components';
import { FiWifi, FiCheckCircle, FiShield, FiZap } from 'react-icons/fi';
import { colors, borderRadius, shadows } from '../../config/theme';

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${colors.neutral};
`;

const Brand = styled.aside`
  flex: 1 1 46%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem;
  color: #fff;
  background: linear-gradient(150deg, ${colors.primaryLight} 0%, ${colors.primary} 45%, ${colors.primaryDark} 100%);

  @media (max-width: 920px) {
    display: none;
  }
`;

const Glow = styled.div<{ $top: string; $left: string; $size: string }>`
  position: absolute;
  top: ${p => p.$top};
  left: ${p => p.$left};
  width: ${p => p.$size};
  height: ${p => p.$size};
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
`;

const BrandTop = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoMark = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const BrandBody = styled.div`
  position: relative;
  z-index: 1;
  max-width: 420px;
`;

const Headline = styled.h2`
  font-size: 2.25rem;
  line-height: 1.15;
  font-weight: 800;
  margin: 0 0 1rem 0;
`;

const Lede = styled.p`
  font-size: 1rem;
  line-height: 1.65;
  opacity: 0.85;
  margin: 0 0 2rem 0;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  opacity: 0.95;

  svg {
    flex-shrink: 0;
  }
`;

const BrandFooter = styled.div`
  position: relative;
  z-index: 1;
  font-size: 0.8rem;
  opacity: 0.65;
`;

const FormSide = styled.main`
  flex: 1 1 54%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background:
    radial-gradient(1200px 600px at 100% 0%, rgba(45, 90, 140, 0.06) 0%, rgba(45, 90, 140, 0) 60%),
    ${colors.neutral};
`;

const Card = styled.div`
  width: 100%;
  max-width: 440px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 20px;
  box-shadow: ${shadows.lg};
  padding: 2.5rem;
  animation: authCardIn 320ms ease-out;

  @keyframes authCardIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 480px) {
    padding: 1.75rem 1.25rem;
  }
`;

const MobileBrand = styled.div`
  display: none;

  @media (max-width: 920px) {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.5rem;
    color: ${colors.primary};
  }
`;

const MobileLogo = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${colors.primaryLight}, ${colors.primary});
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, footer }) => {
  return (
    <Shell>
      <Brand>
        <Glow $top="-120px" $left="-80px" $size="380px" />
        <Glow $top="40%" $left="55%" $size="320px" />

        <BrandTop>
          <LogoMark>
            <FiWifi size={22} />
          </LogoMark>
          <LogoText>Tikta</LogoText>
        </BrandTop>

        <BrandBody>
          <Headline>Vendez vos tickets WiFi en toute simplicité.</Headline>
          <Lede>
            La plateforme tout-en-un pour gérer vos zones d'accès, vendre vos passes WiFi
            et encaisser vos paiements en ligne, en toute sécurité.
          </Lede>
          <FeatureList>
            <FeatureItem><FiZap size={18} /> Tickets WiFi avec codes QR dynamiques</FeatureItem>
            <FeatureItem><FiShield size={18} /> Paiements sécurisés &amp; multi-devises</FeatureItem>
            <FeatureItem><FiCheckCircle size={18} /> Statistiques et revenus en temps réel</FeatureItem>
          </FeatureList>
        </BrandBody>

        <BrandFooter>© {new Date().getFullYear()} Tikta. Tous droits réservés.</BrandFooter>
      </Brand>

      <FormSide>
        <Card>
          <MobileBrand>
            <MobileLogo><FiWifi size={18} /></MobileLogo>
            <LogoText style={{ color: colors.primary }}>Tikta</LogoText>
          </MobileBrand>

          <Header>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </Header>

          {children}

          {footer && <FooterWrap>{footer}</FooterWrap>}
        </Card>
      </FormSide>
    </Shell>
  );
};

const Header = styled.div`
  margin-bottom: 1.75rem;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${colors.textPrimary};
  margin: 0 0 0.4rem 0;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

const FooterWrap = styled.div`
  margin-top: 1.5rem;
`;

export default AuthLayout;
