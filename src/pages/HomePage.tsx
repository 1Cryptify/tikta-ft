import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
    FiCreditCard, FiWifi, FiShoppingBag, FiArrowRight, FiCheck,
    FiLock, FiTrendingUp, FiZap, FiClock, FiMapPin, FiPhone, FiMail, FiStar,
} from 'react-icons/fi';
import { colors, spacing, borderRadius, shadows, transitions } from '../config/theme';

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${colors.neutral};
  color: ${colors.textPrimary};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${colors.border};
`;

const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing.lg} ${spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const LogoMark = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${colors.primaryLight}, ${colors.primary});
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoText = styled.span`
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const GhostBtn = styled.button`
  padding: 0.6rem 1.1rem;
  background: transparent;
  color: ${colors.primary};
  border: 1px solid ${colors.primary};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: ${transitions.fast};

  &:hover {
    background: ${colors.primary};
    color: #fff;
  }

  @media (max-width: 560px) {
    display: none;
  }
`;

const SolidBtn = styled.button`
  padding: 0.6rem 1.2rem;
  background: ${colors.primary};
  color: #fff;
  border: none;
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: ${transitions.fast};

  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, ${colors.primaryLight} 0%, ${colors.primary} 45%, ${colors.primaryDark} 100%);
  color: #fff;
  padding: 5rem 2rem 5.5rem;
`;

const Glow = styled.div<{ $top: string; $left: string; $size: string }>`
  position: absolute;
  top: ${p => p.$top};
  left: ${p => p.$left};
  width: ${p => p.$size};
  height: ${p => p.$size};
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 3rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.1rem;
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0 0 1.25rem 0;

  span {
    background: linear-gradient(120deg, #7ee7c7 0%, #b6f0dd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 900px) {
    font-size: 2.3rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  opacity: 0.9;
  margin: 0 0 2rem 0;
  max-width: 540px;

  @media (max-width: 900px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeroCtas = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

const PrimaryCta = styled.button`
  padding: 0.95rem 1.9rem;
  background: #fff;
  color: ${colors.primary};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: ${transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  }
`;

const SecondaryCta = styled.button`
  padding: 0.95rem 1.6rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: ${borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: ${transitions.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
`;

const HeroStats = styled.div`
  display: flex;
  gap: 2.25rem;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

const Stat = styled.div`
  strong {
    display: block;
    font-size: 1.5rem;
    font-weight: 800;
  }

  span {
    font-size: 0.8rem;
    opacity: 0.8;
  }
`;

const TicketCard = styled.div`
  position: relative;
  background: #fff;
  color: ${colors.textPrimary};
  border-radius: 20px;
  padding: 1.75rem;
  max-width: 340px;
  margin-left: auto;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.35);
  animation: ${float} 5s ease-in-out infinite;

  @media (max-width: 900px) {
    margin: 0 auto;
  }
`;

const TicketTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
`;

const TicketBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: ${colors.primary};
`;

const TicketTag = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: #ecfdf5;
  color: ${colors.success};
`;

const QrBox = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  background:
    repeating-linear-gradient(45deg, #1a1f2e 0 6px, transparent 6px 12px),
    repeating-linear-gradient(-45deg, #1a1f2e 0 6px, transparent 6px 12px);
  background-color: #eef1f5;
  opacity: 0.9;
  margin-bottom: 1.25rem;
`;

const TicketMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const TicketLabel = styled.span`
  font-size: 0.72rem;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TicketPrice = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${colors.textPrimary};
`;

const TicketValidity = styled.div`
  font-size: 0.85rem;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const Section = styled.section<{ $alt?: boolean }>`
  padding: 4.5rem 2rem;
  background: ${p => (p.$alt ? colors.surface : colors.neutral)};
  border-top: ${p => (p.$alt ? `1px solid ${colors.border}` : 'none')};
`;

const SectionInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Eyebrow = styled.div`
  text-align: center;
  color: ${colors.primary};
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-align: center;
  color: ${colors.primary};
  margin: 0 0 0.75rem 0;
`;

const SectionLede = styled.p`
  text-align: center;
  color: ${colors.textSecondary};
  max-width: 620px;
  margin: 0 auto 3rem;
  line-height: 1.65;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  padding: 1.75rem;
  transition: ${transitions.base};

  &:hover {
    transform: translateY(-6px);
    box-shadow: ${shadows.lg};
    border-color: ${colors.primary};
  }
`;

const CardIcon = styled.div<{ $bg: string; $fg: string }>`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.$bg};
  color: ${p => p.$fg};
  margin-bottom: 1.1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.6rem 0;
`;

const CardText = styled.p`
  font-size: 0.9rem;
  line-height: 1.65;
  color: ${colors.textSecondary};
  margin: 0 0 1rem 0;
`;

const CardList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CardItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${colors.textSecondary};

  svg {
    color: ${colors.success};
    flex-shrink: 0;
  }
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const Step = styled.div`
  text-align: center;
  padding: 1.25rem;
`;

const StepNumber = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  box-shadow: ${shadows.md};
`;

const StepTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
`;

const StepText = styled.p`
  font-size: 0.88rem;
  color: ${colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

const ContactSection = styled.section`
  padding: 4.5rem 2rem;
  background: linear-gradient(150deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: #fff;
  text-align: center;
`;

const ContactInner = styled.div`
  max-width: 640px;
  margin: 0 auto;
`;

const ContactTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.75rem 0;
`;

const ContactText = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.7;
  margin: 0 0 2rem 0;
`;

const ContactBtn = styled.button`
  padding: 1rem 2rem;
  background: #fff;
  color: ${colors.primary};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: ${transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  }
`;

const ContactInfo = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 0.9rem;
`;

const ContactInfoItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.9;
`;

const Footer = styled.footer`
  background: ${colors.textPrimary};
  color: #fff;
  padding: 1.75rem 2rem;
`;

const FooterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;

  a {
    color: #fff;
    text-decoration: none;
    opacity: 0.85;

    &:hover {
      opacity: 1;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: ${borderRadius.lg};
  padding: 2rem;
  max-width: 480px;
  width: 100%;
  box-shadow: ${shadows.lg};
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: ${colors.textSecondary};
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const Reasons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
`;

const ReasonBtn = styled.button<{ $active: boolean }>`
  padding: 0.8rem 1rem;
  border: 2px solid ${p => (p.$active ? colors.primary : colors.border)};
  background: ${p => (p.$active ? 'rgba(30, 58, 95, 0.06)' : '#fff')};
  color: ${p => (p.$active ? colors.primary : colors.textPrimary)};
  border-radius: ${borderRadius.md};
  font-size: 0.9rem;
  font-weight: ${p => (p.$active ? 700 : 500)};
  cursor: pointer;
  text-align: left;
  transition: ${transitions.fast};
`;

const ModalSubmit = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 0.9rem;
  background: ${p => (p.$disabled ? colors.border : colors.primary)};
  color: #fff;
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 1rem;
  font-weight: 700;
  cursor: ${p => (p.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${p => (p.$disabled ? 0.6 : 1)};
`;

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
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
            window.location.href = `mailto:contact@tikta.xyz?subject=${subject}&body=${body}`;
            setIsContactModalOpen(false);
            setSelectedReason('');
        }
    };

    return (
        <Container>
            <Header>
                <HeaderInner>
                    <Logo>
                        <LogoMark><FiWifi size={20} /></LogoMark>
                        <LogoText>Tikta</LogoText>
                    </Logo>
                    <HeaderActions>
                        <GhostBtn onClick={() => navigate('/register')}>Créer un compte</GhostBtn>
                        <SolidBtn onClick={() => navigate('/login')}>Connexion</SolidBtn>
                    </HeaderActions>
                </HeaderInner>
            </Header>

            <Hero>
                <Glow $top="-120px" $left="-80px" $size="420px" />
                <Glow $top="30%" $left="60%" $size="360px" />
                <HeroInner>
                    <div>
                        <Badge><FiStar size={14} /> Plateforme WiFi &amp; Paiements</Badge>
                        <HeroTitle>
                            Vendez vos <span>tickets WiFi</span> en quelques clics.
                        </HeroTitle>
                        <HeroSubtitle>
                            Gérez vos zones d'accès, générez des passes WiFi avec codes QR,
                            et encaissez vos paiements en ligne — le tout depuis une seule plateforme.
                        </HeroSubtitle>
                        <HeroCtas>
                            <PrimaryCta onClick={() => navigate('/register')}>
                                Commencer maintenant <FiArrowRight size={18} />
                            </PrimaryCta>
                            <SecondaryCta onClick={() => setIsContactModalOpen(true)}>
                                Demander une démo
                            </SecondaryCta>
                        </HeroCtas>
                        <HeroStats>
                            <Stat><strong>Zones illimitées</strong><span>Gérez toutes vos bornes</span></Stat>
                            <Stat><strong>Paiement sécurisé</strong><span>Multi-devises</span></Stat>
                            <Stat><strong>Temps réel</strong><span>Suivi des revenus</span></Stat>
                        </HeroStats>
                    </div>

                    <TicketCard>
                        <TicketTop>
                            <TicketBrand><FiWifi size={18} /> Pass WiFi</TicketBrand>
                            <TicketTag>Actif</TicketTag>
                        </TicketTop>
                        <QrBox />
                        <TicketMeta>
                            <div>
                                <TicketLabel>Forfait</TicketLabel>
                                <TicketPrice>1 000 FCFA</TicketPrice>
                            </div>
                            <TicketValidity><FiClock size={15} /> 24 heures</TicketValidity>
                        </TicketMeta>
                    </TicketCard>
                </HeroInner>
            </Hero>

            <Section $alt>
                <SectionInner>
                    <Eyebrow>Tout-en-un</Eyebrow>
                    <SectionTitle>Nos services</SectionTitle>
                    <SectionLede>
                        Une suite complète pour vendre et gérer vos tickets WiFi et vos paiements en ligne.
                    </SectionLede>
                    <Grid>
                        <Card>
                            <CardIcon $bg="rgba(5, 150, 105, 0.12)" $fg={colors.success}><FiWifi size={28} /></CardIcon>
                            <CardTitle>Tickets WiFi</CardTitle>
                            <CardText>
                                Créez et vendez des passes WiFi pour vos zones d'accès, avec contrôle total des durées et des quotas.
                            </CardText>
                            <CardList>
                                <CardItem><FiCheck size={16} /> Codes QR dynamiques</CardItem>
                                <CardItem><FiCheck size={16} /> Gestion des durées</CardItem>
                                <CardItem><FiCheck size={16} /> Accès par zone</CardItem>
                            </CardList>
                        </Card>

                        <Card>
                            <CardIcon $bg="rgba(30, 58, 95, 0.1)" $fg={colors.primary}><FiCreditCard size={28} /></CardIcon>
                            <CardTitle>Paiements en ligne</CardTitle>
                            <CardText>
                                Encaissez vos paiements en toute sécurité avec une plateforme intégrée et un support multi-devises.
                            </CardText>
                            <CardList>
                                <CardItem><FiCheck size={16} /> Paiement sécurisé</CardItem>
                                <CardItem><FiCheck size={16} /> Multi-devises</CardItem>
                                <CardItem><FiCheck size={16} /> Reçus automatiques</CardItem>
                            </CardList>
                        </Card>

                        <Card>
                            <CardIcon $bg="rgba(59, 130, 246, 0.12)" $fg={colors.info}><FiShoppingBag size={28} /></CardIcon>
                            <CardTitle>Boutique en ligne</CardTitle>
                            <CardText>
                                Créez et gérez votre boutique pour vendre vos produits et services complémentaires en ligne.
                            </CardText>
                            <CardList>
                                <CardItem><FiCheck size={16} /> Catalogue illimité</CardItem>
                                <CardItem><FiCheck size={16} /> Gestion d'inventaire</CardItem>
                                <CardItem><FiCheck size={16} /> Commandes en ligne</CardItem>
                            </CardList>
                        </Card>
                    </Grid>
                </SectionInner>
            </Section>

            <Section>
                <SectionInner>
                    <Eyebrow>Pourquoi Tikta</Eyebrow>
                    <SectionTitle>Simple, sécurisé, performant</SectionTitle>
                    <SectionLede>
                        Tout ce dont vous avez besoin pour développer votre activité WiFi.
                    </SectionLede>
                    <Grid>
                        <Card>
                            <CardIcon $bg="rgba(30, 58, 95, 0.1)" $fg={colors.primary}><FiLock size={26} /></CardIcon>
                            <CardTitle>100% sécurisé</CardTitle>
                            <CardText>Vos données et celles de vos clients sont protégées par les meilleurs standards de sécurité.</CardText>
                        </Card>
                        <Card>
                            <CardIcon $bg="rgba(5, 150, 105, 0.12)" $fg={colors.success}><FiTrendingUp size={26} /></CardIcon>
                            <CardTitle>Statistiques en temps réel</CardTitle>
                            <CardText>Suivez vos ventes et revenus avec des rapports détaillés et actualisés en direct.</CardText>
                        </Card>
                        <Card>
                            <CardIcon $bg="rgba(245, 158, 11, 0.14)" $fg={colors.warning}><FiZap size={26} /></CardIcon>
                            <CardTitle>Rapide à mettre en place</CardTitle>
                            <CardText>Créez votre compte, configurez vos zones et commencez à vendre en quelques minutes.</CardText>
                        </Card>
                    </Grid>
                </SectionInner>
            </Section>

            <Section $alt>
                <SectionInner>
                    <Eyebrow>En 4 étapes</Eyebrow>
                    <SectionTitle>Comment ça marche</SectionTitle>
                    <SectionLede>De l'inscription à vos premières ventes, sans friction.</SectionLede>
                    <StepsGrid>
                        <Step>
                            <StepNumber>1</StepNumber>
                            <StepTitle>Créez votre compte</StepTitle>
                            <StepText>Inscrivez-vous gratuitement avec vos informations professionnelles.</StepText>
                        </Step>
                        <Step>
                            <StepNumber>2</StepNumber>
                            <StepTitle>Configurez vos services</StepTitle>
                            <StepText>Paramétrez vos zones WiFi, vos forfaits et vos produits.</StepText>
                        </Step>
                        <Step>
                            <StepNumber>3</StepNumber>
                            <StepTitle>Commencez à vendre</StepTitle>
                            <StepText>Vendez vos tickets WiFi et encaissez vos premiers paiements.</StepText>
                        </Step>
                        <Step>
                            <StepNumber>4</StepNumber>
                            <StepTitle>Suivez vos revenus</StepTitle>
                            <StepText>Accédez à des rapports détaillés et à vos statistiques en temps réel.</StepText>
                        </Step>
                    </StepsGrid>
                </SectionInner>
            </Section>

            <ContactSection>
                <ContactInner>
                    <ContactTitle>Prêt à démarrer ?</ContactTitle>
                    <ContactText>
                        Contactez notre équipe pour configurer vos services et commencer à vendre vos tickets WiFi dès aujourd'hui.
                    </ContactText>
                    <ContactBtn onClick={() => setIsContactModalOpen(true)}>
                        Contacter l'équipe
                    </ContactBtn>
                    <ContactInfo>
                        <ContactInfoItem><FiMail size={16} /> contact@tikta.xyz</ContactInfoItem>
                        <ContactInfoItem><FiPhone size={16} /> +237 698 692 938</ContactInfoItem>
                        <ContactInfoItem><FiMapPin size={16} /> Cameroun</ContactInfoItem>
                    </ContactInfo>
                </ContactInner>
            </ContactSection>

            <Footer>
                <FooterInner>
                    <p>&copy; {new Date().getFullYear()} Tikta. Tous droits réservés.</p>
                    <FooterLinks>
                        <a href="#privacy">Confidentialité</a>
                        <a href="#terms">Conditions</a>
                        <a href="#contact">Contact</a>
                    </FooterLinks>
                </FooterInner>
            </Footer>

            {isContactModalOpen && (
                <ModalOverlay onClick={() => setIsContactModalOpen(false)}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <CloseBtn onClick={() => setIsContactModalOpen(false)}>✕</CloseBtn>
                        <ModalTitle>Quel est le motif de votre contact ?</ModalTitle>
                        <Reasons>
                            {contactReasons.map((reason) => (
                                <ReasonBtn
                                    key={reason.id}
                                    $active={selectedReason === reason.id}
                                    onClick={() => setSelectedReason(reason.id)}
                                >
                                    {reason.label}
                                </ReasonBtn>
                            ))}
                        </Reasons>
                        <ModalSubmit
                            $disabled={!selectedReason}
                            onClick={handleContactSubmit}
                            disabled={!selectedReason}
                        >
                            Envoyer la demande
                        </ModalSubmit>
                    </Modal>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default HomePage;
