/**
 * Maps technical backend / gateway error messages to user-friendly messages.
 * Keep this in sync with any new user-facing backend errors.
 */

export const GENERIC_FALLBACK_MESSAGE =
  "Une erreur s'est produite. Veuillez réessayer dans un instant.";

export const NETWORK_ERROR_MESSAGE =
  "Impossible de contacter le serveur. Vérifiez votre connexion internet puis réessayez.";

export const GATEWAY_CONFIG_ERROR_MESSAGE =
  "Le service de paiement est momentanément indisponible. Veuillez réessayer dans quelques minutes ou contacter le support.";

export const USER_FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  // Active company / multi-company errors
  'No active company set. Please set an active company using /users/set-active-company/':
    "Aucune entreprise active n'est sélectionnée. Veuillez choisir une entreprise dans vos paramètres avant de continuer.",
  'Superusers must provide company_id': "Veuillez sélectionner une entreprise pour continuer.",
  'Active company has been deleted':
    "L'entreprise sélectionnée a été supprimée. Veuillez choisir une autre entreprise.",
  'Active company is blocked':
    "L'entreprise sélectionnée est bloquée. Veuillez contacter le support.",
  'User is not assigned to the active company':
    "Vous n'avez pas accès à cette entreprise. Veuillez en sélectionner une autre.",
  'Company ID is not available':
    "Impossible d'identifier l'entreprise. Veuillez réessayer ou contacter le support.",
  'Company not found': "L'entreprise demandée est introuvable.",

  // Auth / access errors
  'Authentication required': 'Veuillez vous connecter pour continuer.',
  'Your account is not active': "Votre compte n'est pas actif. Veuillez contacter le support.",
  'Your account is blocked': 'Votre compte a été bloqué. Veuillez contacter le support.',
  'You do not have permission to access this company':
    "Vous n'avez pas la permission d'accéder à cette entreprise.",
  'This company is not available': "Cette entreprise n'est pas disponible.",
  'Superuser access required': 'Accès réservé aux super administrateurs.',
  'Admin access required': 'Accès réservé aux administrateurs.',
  'Staff access required': 'Accès réservé au personnel autorisé.',

  // Request / validation errors
  'Invalid request method': 'Requête invalide. Veuillez réessayer.',
  'Invalid JSON data': 'Données invalides. Veuillez réessayer.',
  'Request data is not valid JSON': 'Données invalides. Veuillez réessayer.',
  'Missing required field: offer_id': "Impossible d'identifier l'offre à payer.",
  'Missing required field: group_id': "Impossible d'identifier le pack à payer.",
  'Missing required fields: amount, currency, phone':
    'Informations de paiement incomplètes. Veuillez réessayer.',
  'offer_id is required': "Impossible d'identifier l'offre à payer.",
  'group_id is required': "Impossible d'identifier le pack à payer.",
  'Either payment_id or reference is required':
    'Référence de paiement manquante. Veuillez relancer le paiement.',
  'Phone number is required for mobile money payments':
    'Veuillez saisir votre numéro Mobile Money.',
  'A customer phone number is required for CamPay mobile money payments':
    'Veuillez saisir un numéro Mobile Money valide.',
  'No customer phone number provided': 'Veuillez saisir votre numéro Mobile Money.',

  // Offer / group availability
  'Offer not found or inactive': "Cette offre n'est plus disponible.",
  'Offer is not yet available': "Cette offre n'est pas encore disponible.",
  'Offer has expired': 'Cette offre a expiré.',
  'Offer not found': 'Offre introuvable.',
  'Offer group not found or inactive': "Ce pack n'est plus disponible.",
  'Offer group not found': 'Pack introuvable.',
  'This offer group is not a payable package. It only contains offers.':
    "Ce pack ne peut pas être acheté en une seule fois. Choisissez une offre à l'intérieur.",
  'This package does not have a valid price or currency set':
    "Ce pack n'a pas de prix valide. Veuillez contacter le support.",

  // Payment lifecycle
  'Payment not found': 'Paiement introuvable.',
  'Transaction not found': 'Transaction introuvable.',
  'No active transaction found for this payment':
    'Ce paiement a déjà été traité ou a expiré.',
  'Unable to determine payment status from provider':
    'Statut du paiement indisponible. Veuillez patienter puis réessayer.',
  'Payment already completed': 'Ce paiement est déjà confirmé.',
  'Payment is still processing': 'Le paiement est toujours en cours de traitement.',
  'Payment verification failed': 'Le paiement a échoué. Vous n’avez pas été débité.',
  'Payment was cancelled': 'Le paiement a été annulé.',
  'Insufficient balance': 'Solde insuffisant.',
  'Payment balance not found': 'Solde de paiement introuvable.',

  // Ticket availability (not errors per se, but surfaced to the user)
  'This offer is currently sold out. You have not been charged.':
    'Cette offre est épuisée. Vous n’avez pas été débité.',
  'This offer is sold out. You have not been charged.':
    'Cette offre est épuisée. Vous n’avez pas été débité.',

  // Consent / location
  'Veuillez activer votre localisation et cocher les conditions d utilisation avant de payer.':
    'Veuillez activer votre localisation et accepter les conditions avant de payer.',
  'Veuillez activer et accepter le partage de votre localisation pour payer.':
    'Veuillez accepter le partage de votre localisation pour payer.',

  // Gateway / infrastructure
  'CamPay authentication error': GATEWAY_CONFIG_ERROR_MESSAGE,
  'CamPay authentication returned a non-JSON response': GATEWAY_CONFIG_ERROR_MESSAGE,
  'CamPay authentication failed: no token returned': GATEWAY_CONFIG_ERROR_MESSAGE,
  'Payment gateway request timeout':
    'Le service de paiement met trop de temps à répondre. Veuillez réessayer.',
  'Payment gateway connection error':
    'Connexion au service de paiement impossible. Veuillez réessayer.',
  'Payment gateway error': GATEWAY_CONFIG_ERROR_MESSAGE,

  // Generic fallback
  'An unexpected error occurred': GENERIC_FALLBACK_MESSAGE,
  'An unexpected error occurred during verification': GENERIC_FALLBACK_MESSAGE,
};

const LOWER_CASED_MAP: Record<string, string> = Object.entries(
  USER_FRIENDLY_ERROR_MESSAGES
).reduce((acc, [key, value]) => {
  acc[key.toLowerCase()] = value;
  return acc;
}, {} as Record<string, string>);

/**
 * Heuristics for dynamic messages (message contains a variable, e.g. the name
 * of the sold-out offer, or is prefixed by the backend).
 */
const matchDynamicMessage = (message: string): string | null => {
  const m = message.toLowerCase();

  // Sold-out (offer name is interpolated by the backend)
  if (m.includes('sold out')) {
    return 'Cette offre est épuisée. Vous n’avez pas été débité.';
  }

  // Prefixed gateway/initiate failures → keep a clean user-facing sentence.
  if (m.startsWith('failed to initiate offer payment') || m.startsWith('failed to initiate package payment')) {
    return "Le paiement n'a pas pu être lancé. Veuillez réessayer ou utiliser un autre moyen de paiement.";
  }
  if (m.startsWith('failed to initiate payment')) {
    return "Le paiement n'a pas pu être lancé. Veuillez réessayer.";
  }
  if (m.startsWith('failed to verify')) {
    return 'La vérification du paiement a échoué. Veuillez réessayer.';
  }
  if (m.includes('non-json response')) {
    return GATEWAY_CONFIG_ERROR_MESSAGE;
  }

  return null;
};

/**
 * Returns a user-friendly message for a raw backend error message.
 * If no mapping is found, returns the original message (or a generic fallback
 * when empty).
 */
export const getUserFriendlyErrorMessage = (
  rawMessage: string | undefined | null,
  fallback: string = GENERIC_FALLBACK_MESSAGE
): string => {
  if (!rawMessage) return fallback;

  const normalized = String(rawMessage).trim();
  if (!normalized) return fallback;

  const exact = USER_FRIENDLY_ERROR_MESSAGES[normalized] ?? LOWER_CASED_MAP[normalized.toLowerCase()];
  if (exact) return exact;

  const dynamic = matchDynamicMessage(normalized);
  if (dynamic) return dynamic;

  return normalized;
};
