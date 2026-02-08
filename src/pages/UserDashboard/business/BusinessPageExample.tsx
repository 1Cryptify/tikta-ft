/**
 * EXEMPLE D'INTÉGRATION - BusinessPage avec changement de header dynamique
 * 
 * Ce fichier montre comment intégrer BusinessPage dans votre application
 * avec le système de gestion du header dynamique.
 */

import React, { useState } from 'react';
import { BusinessPage } from './BusinessPage';
import { MainLayout } from '../../../components/Layout/MainLayout';
import { useAuth } from '../../../hooks/useAuth';
import { Company } from '../../../hooks/useCompany';

// ==================== EXEMPLE D'UTILISATION ====================

/**
 * Dans votre App.tsx ou le composant parent principal:
 */

export const BusinessPageWithLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [headerTitle, setHeaderTitle] = useState<string>('Tikta');

  const navItems = [
    { id: '1', label: 'Dashboard', icon: '📊' },
    { id: '2', label: 'Entreprises', icon: '🏢', active: true },
    { id: '3', label: 'Produits', icon: '📦' },
    { id: '4', label: 'Paramètres', icon: '⚙️' },
  ];

  const handleCompanySelect = (company: Company) => {
    console.log('Entreprise sélectionnée:', company.name);
    // Vous pouvez ajouter ici d'autres logiques:
    // - Naviguer vers le dashboard de l'entreprise
    // - Charger les données spécifiques à l'entreprise
    // - Mettre à jour le contexte global, etc.
  };

  const handleHeaderTitleChange = (title: string) => {
    setHeaderTitle(title);
  };

  return (
    <MainLayout
      user={user}
      navItems={navItems}
      navTitle="TIKTA"
      onLogout={logout}
      headerTitle={headerTitle}
    >
      <BusinessPage
        onCompanySelect={handleCompanySelect}
        onHeaderTitleChange={handleHeaderTitleChange}
      />
    </MainLayout>
  );
};

// ==================== INTÉGRATION SIMPLE ====================

/**
 * Ou utiliser BusinessPage seul sans le MainLayout:
 */

export const SimpleBusinessPage: React.FC = () => {
  const [headerTitle, setHeaderTitle] = useState<string>('Tikta');

  const handleHeaderTitleChange = (title: string) => {
    setHeaderTitle(title);
  };

  return (
    <BusinessPage
      onHeaderTitleChange={handleHeaderTitleChange}
    />
  );
};

// ==================== FONCTIONNALITÉS ====================

/**
 * BusinessPage offre:
 * 
 * ✓ Affichage responsive des entreprises en grille
 * ✓ Cartes sélectionnables avec indicateur actif
 * ✓ Badge "Actif" sur la carte sélectionnée
 * ✓ Changement dynamique du titre du header
 * ✓ Utilisation du hook useCompany pour les données
 * ✓ Gestion de l'erreur et du chargement
 * ✓ Design cohérent avec le thème de l'application
 * ✓ Responsive sur mobile, tablet et desktop
 * 
 * Props:
 * - onCompanySelect: Callback appelé quand une entreprise est sélectionnée
 * - onHeaderTitleChange: Callback pour mettre à jour le titre du header
 */
