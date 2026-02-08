export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  STAFF = 'staff',
  CLIENT = 'client',
  VISITOR = 'visitor',
}

export enum MenuName {
  BUSINESS = 'BUSINESS',
  // Ajouter d'autres menus selon les besoins
}

export enum ActionType {
  // Actions BUSINESS
  BUSINESS_VIEW = 'business_view',
  BUSINESS_CREATE = 'business_create',
  BUSINESS_DELETE = 'business_delete',
  BUSINESS_BLOQUER = 'business_bloquer',
  BUSINESS_ASSOCIER = 'business_associer',
  BUSINESS_UPLOADER_DOCUMENTS = 'business_uploader_documents',
  BUSINESS_MARQUER_ACTIVE = 'business_marquer_active',
  BUSINESS_EDIT = 'business_edit',
}

/**
 * Configuration des permissions par rôle et par menu
 * Structure: { [rôle]: { [menu]: [actions autorisées] } }
 */
export const menuPermissions: Record<UserRole, Record<MenuName, ActionType[]>> = {
  [UserRole.SUPER_ADMIN]: {
    [MenuName.BUSINESS]: [
      ActionType.BUSINESS_VIEW,
      ActionType.BUSINESS_CREATE,
      ActionType.BUSINESS_DELETE,
      ActionType.BUSINESS_BLOQUER,
      ActionType.BUSINESS_ASSOCIER,
      ActionType.BUSINESS_UPLOADER_DOCUMENTS,
      ActionType.BUSINESS_MARQUER_ACTIVE,
      ActionType.BUSINESS_EDIT,
    ],
  },
  [UserRole.STAFF]: {
    [MenuName.BUSINESS]: [
      ActionType.BUSINESS_VIEW,
      ActionType.BUSINESS_BLOQUER,
      ActionType.BUSINESS_EDIT,
    ],
  },
  [UserRole.CLIENT]: {
    [MenuName.BUSINESS]: [
      ActionType.BUSINESS_VIEW,
      ActionType.BUSINESS_UPLOADER_DOCUMENTS,
      ActionType.BUSINESS_MARQUER_ACTIVE,
    ],
  },
  [UserRole.VISITOR]: {
    [MenuName.BUSINESS]: [],
  },
};

/**
 * Vérifie si un utilisateur a la permission d'effectuer une action sur un menu
 * @param userRole - Le rôle de l'utilisateur
 * @param menu - Le nom du menu
 * @param action - L'action à vérifier
 * @returns true si l'utilisateur a la permission, false sinon
 */
export const hasPermission = (
  userRole: UserRole,
  menu: MenuName,
  action: ActionType
): boolean => {
  const rolePermissions = menuPermissions[userRole];
  if (!rolePermissions) return false;

  const menuActions = rolePermissions[menu];
  if (!menuActions) return false;

  return menuActions.includes(action);
};

/**
 * Retourne toutes les actions autorisées pour un utilisateur sur un menu
 * @param userRole - Le rôle de l'utilisateur
 * @param menu - Le nom du menu
 * @returns Tableau des actions autorisées
 */
export const getPermittedActions = (
  userRole: UserRole,
  menu: MenuName
): ActionType[] => {
  return menuPermissions[userRole]?.[menu] ?? [];
};

/**
 * Vérifie si l'utilisateur peut accéder à un menu
 * @param userRole - Le rôle de l'utilisateur
 * @param menu - Le nom du menu
 * @returns true si l'utilisateur peut voir le menu, false sinon
 */
export const canAccessMenu = (userRole: UserRole, menu: MenuName): boolean => {
  const actions = getPermittedActions(userRole, menu);
  return actions.length > 0;
};
