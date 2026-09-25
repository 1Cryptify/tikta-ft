import type { IconType } from 'react-icons';
import {
  FaBolt,
  FaRocket,
  FaTachometerAlt,
  FaWind,
  FaWifi,
  FaSatelliteDish,
  FaBroadcastTower,
  FaNetworkWired,
  FaPlane,
  FaPaperPlane,
  FaHelicopter,
  FaParachuteBox,
  FaCoins,
  FaPiggyBank,
  FaPercentage,
  FaMoneyBillWave,
} from 'react-icons/fa';

/**
 * Illustrations proposées à défaut d'image téléversée pour une offre.
 *
 * 16 icônes réparties en 4 thèmes (vitesse, connectivité, vol en l'air,
 * économie). L'icône est toujours rendue sur un fond cohérent choisi par
 * l'utilisateur (voir `OFFER_BACKGROUNDS`).
 */
export type OfferIllustrationCategory = 'speed' | 'connectivity' | 'flight' | 'economy';

export interface OfferIllustrationTheme {
  id: OfferIllustrationCategory;
  label: string;
}

export interface OfferIllustration {
  id: string;
  label: string;
  category: OfferIllustrationCategory;
  Icon: IconType;
}

export interface OfferBackground {
  id: string;
  label: string;
  gradient: string;
  iconColor: string;
}

export const OFFER_ILLUSTRATION_THEMES: OfferIllustrationTheme[] = [
  { id: 'speed', label: 'Vitesse' },
  { id: 'connectivity', label: 'Connectivité' },
  { id: 'flight', label: 'Vol en l’air' },
  { id: 'economy', label: 'Économie' },
];

export const OFFER_ILLUSTRATIONS: OfferIllustration[] = [
  // Vitesse
  { id: 'speed-bolt', label: 'Éclair', category: 'speed', Icon: FaBolt },
  { id: 'speed-rocket', label: 'Fusée', category: 'speed', Icon: FaRocket },
  { id: 'speed-gauge', label: 'Compteur', category: 'speed', Icon: FaTachometerAlt },
  { id: 'speed-wind', label: 'Souffle', category: 'speed', Icon: FaWind },

  // Connectivité
  { id: 'net-wifi', label: 'Wi-Fi', category: 'connectivity', Icon: FaWifi },
  { id: 'net-satellite', label: 'Satellite', category: 'connectivity', Icon: FaSatelliteDish },
  { id: 'net-antenna', label: 'Antenne', category: 'connectivity', Icon: FaBroadcastTower },
  { id: 'net-network', label: 'Réseau', category: 'connectivity', Icon: FaNetworkWired },

  // Vol en l'air
  { id: 'air-plane', label: 'Avion', category: 'flight', Icon: FaPlane },
  { id: 'air-paper-plane', label: 'Envol', category: 'flight', Icon: FaPaperPlane },
  { id: 'air-helicopter', label: 'Hélicoptère', category: 'flight', Icon: FaHelicopter },
  { id: 'air-parachute', label: 'Parachute', category: 'flight', Icon: FaParachuteBox },

  // Économie
  { id: 'eco-coins', label: 'Économies', category: 'economy', Icon: FaCoins },
  { id: 'eco-piggy', label: 'Épargne', category: 'economy', Icon: FaPiggyBank },
  { id: 'eco-percent', label: 'Promo', category: 'economy', Icon: FaPercentage },
  { id: 'eco-money', label: 'Billet', category: 'economy', Icon: FaMoneyBillWave },
];

export const OFFER_BACKGROUNDS: OfferBackground[] = [
  { id: 'ocean', label: 'Océan', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', iconColor: '#ffffff' },
  { id: 'sky', label: 'Ciel', gradient: 'linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)', iconColor: '#ffffff' },
  { id: 'teal', label: 'Lagon', gradient: 'linear-gradient(135deg, #0f766e 0%, #2dd4bf 100%)', iconColor: '#ffffff' },
  { id: 'emerald', label: 'Émeraude', gradient: 'linear-gradient(135deg, #047857 0%, #4ade80 100%)', iconColor: '#ffffff' },
  { id: 'sunset', label: 'Coucher', gradient: 'linear-gradient(135deg, #ea580c 0%, #fbbf24 100%)', iconColor: '#ffffff' },
  { id: 'rose', label: 'Rubis', gradient: 'linear-gradient(135deg, #9f1239 0%, #fb7185 100%)', iconColor: '#ffffff' },
  { id: 'violet', label: 'Violet', gradient: 'linear-gradient(135deg, #5b21b6 0%, #a78bfa 100%)', iconColor: '#ffffff' },
  { id: 'indigo', label: 'Indigo', gradient: 'linear-gradient(135deg, #3730a3 0%, #6366f1 100%)', iconColor: '#ffffff' },
  { id: 'amber', label: 'Ambre', gradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)', iconColor: '#ffffff' },
  { id: 'graphite', label: 'Graphite', gradient: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)', iconColor: '#ffffff' },
];

export const DEFAULT_OFFER_BACKGROUND_ID = 'ocean';

const illustrationById = new Map(OFFER_ILLUSTRATIONS.map((item) => [item.id, item]));
const backgroundById = new Map(OFFER_BACKGROUNDS.map((item) => [item.id, item]));

export const getOfferIllustration = (id?: string | null): OfferIllustration | null =>
  (id && illustrationById.get(id)) || null;

export const getOfferIllustrationIcon = (id?: string | null): IconType | null =>
  getOfferIllustration(id)?.Icon ?? null;

export const getOfferBackground = (id?: string | null): OfferBackground =>
  (id && backgroundById.get(id)) || backgroundById.get(DEFAULT_OFFER_BACKGROUND_ID)!;

export const isKnownOfferIllustration = (id?: string | null): boolean =>
  Boolean(id && illustrationById.has(id));
