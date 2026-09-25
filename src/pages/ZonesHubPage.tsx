import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '../config/theme';
import { useAuth } from '../hooks/useAuth';
import { zonesApi } from '../services/zoneService';
import { ZonesPage } from './ZonesPage';
import { MyZonesPage } from './MyZonesPage';
import LoadingSpinner from '../components/LoadingSpinner';

const ToggleWrap = styled.div`
  display: flex;
  gap: ${spacing.xs};
  max-width: 1400px;
  margin: ${spacing.xl} auto 0;
  padding: 0 ${spacing.xl};
  width: 100%;
`;

const ToggleBtn = styled.button<{ active: boolean }>`
  padding: ${spacing.sm} ${spacing.lg};
  border: 1px solid ${(p) => (p.active ? colors.primary : colors.border)};
  background: ${(p) => (p.active ? `${colors.primary}12` : 'white')};
  color: ${(p) => (p.active ? colors.primary : colors.textSecondary)};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;

  &:hover { color: ${colors.textPrimary}; }
`;

/**
 * Menu unique « Zones » : affiche la vue entreprise (gestion des zones) et/ou
 * la vue associé (Mes zones) selon le rôle. Un utilisateur qui est les deux
 * dispose d'un sélecteur.
 */
export const ZonesHubPage: React.FC = () => {
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [isAssociate, setIsAssociate] = useState(false);
  const [mode, setMode] = useState<'company' | 'associate'>('company');

  const isCompanySide = !!user?.is_superuser || !!user?.is_staff || !!user?.active_company;

  useEffect(() => {
    let mounted = true;
    zonesApi
      .myZones()
      .then(({ zones, pending_confirmations }) => {
        if (!mounted) return;
        const assoc = (zones?.length || 0) + (pending_confirmations?.length || 0) > 0;
        setIsAssociate(assoc);
        setMode(isCompanySide ? 'company' : 'associate');
      })
      .catch(() => {
        if (mounted) setMode(isCompanySide ? 'company' : 'associate');
      })
      .finally(() => {
        if (mounted) setChecked(true);
      });
    return () => {
      mounted = false;
    };
  }, [isCompanySide]);

  if (!checked) return <LoadingSpinner />;

  // Associé uniquement
  if (!isCompanySide && isAssociate) return <MyZonesPage />;
  // Entreprise uniquement (ou aucun rôle)
  if (!isCompanySide || !isAssociate) return <ZonesPage />;

  // Les deux : sélecteur
  return (
    <div>
      <ToggleWrap>
        <ToggleBtn active={mode === 'company'} onClick={() => setMode('company')}>Entreprise</ToggleBtn>
        <ToggleBtn active={mode === 'associate'} onClick={() => setMode('associate')}>Mes zones</ToggleBtn>
      </ToggleWrap>
      {mode === 'company' ? <ZonesPage /> : <MyZonesPage />}
    </div>
  );
};

export default ZonesHubPage;
