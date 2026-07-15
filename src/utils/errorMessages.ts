/**
 * Maps technical backend error messages to user-friendly messages.
 * Keep this in sync with any new user-facing backend errors.
 */
export const USER_FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  // Active company / multi-company errors
  'No active company set. Please set an active company using /users/set-active-company/':
    "Aucune entreprise active n'est sélectionnée. Veuillez choisir une entreprise dans vos paramètres avant de continuer.",
  'Superusers must provide company_id':
    "Veuillez sélectionner une entreprise pour continuer.",
  'Active company has been deleted':
    "L'entreprise sélectionnée a été supprimée. Veuillez choisir une autre entreprise.",
  'Active company is blocked':
    "L'entreprise sélectionnée est bloquée. Veuillez contacter le support.",
  'User is not assigned to the active company':
    "Vous n'avez pas accès à cette entreprise. Veuillez en sélectionner une autre.",
  'Company ID is not available':
    "Impossible d'identifier l'entreprise. Veuillez réessayer ou contacter le support.",

  // Auth / access errors
  'Authentication required':
    "Veuillez vous connecter pour continuer.",
  'Your account is not active':
    "Votre compte n'est pas actif. Veuillez contacter le support.",
  'Your account is blocked':
    "Votre compte a été bloqué. Veuillez contacter le support.",
  'You do not have permission to access this company':
    "Vous n'avez pas la permission d'accéder à cette entreprise.",
  'This company is not available':
    "Cette entreprise n'est pas disponible.",

  // Generic fallback
  'An unexpected error occurred':
    "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
};

/**
 * Returns a user-friendly message for a raw backend error message.
 * If no mapping is found, returns the original message (or a generic fallback when empty).
 */
export const getUserFriendlyErrorMessage = (
  rawMessage: string | undefined | null,
  fallback = "Une erreur s'est produite. Veuillez réessayer."
): string => {
  if (!rawMessage) return fallback;

  const normalized = rawMessage.trim();
  if (!normalized) return fallback;

  return USER_FRIENDLY_ERROR_MESSAGES[normalized] ?? normalized;
};
