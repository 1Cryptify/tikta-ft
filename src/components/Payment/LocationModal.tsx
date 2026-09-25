import React, { useEffect, useRef } from 'react';
import { FiLock, FiMapPin, FiRefreshCw, FiSettings, FiX } from 'react-icons/fi';
import './location-modal.css';

export type GeoPermissionState = 'unknown' | 'prompt' | 'granted' | 'denied';

interface LocationModalProps {
  open: boolean;
  permissionState: GeoPermissionState;
  locating: boolean;
  /** Re-tente la géolocalisation (déclenche le prompt natif si encore possible). */
  onRetry: () => void;
  onClose: () => void;
}

/**
 * Popup d'activation de la localisation.
 *
 * Rappel technique : une fois le refus mémorisé, le navigateur n'affiche plus
 * son prompt natif et aucune page ne peut le forcer. On guide donc l'utilisateur
 * pas à pas, on relance au clic (prompt natif si l'état est encore « prompt »)
 * et on surveille le changement d'autorisation pour repartir automatiquement.
 */
export const LocationModal: React.FC<LocationModalProps> = ({
  open,
  permissionState,
  locating,
  onRetry,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const blocked = permissionState === 'denied';

  return (
    <div className="loc-modal" role="dialog" aria-modal="true" aria-labelledby="loc-title">
      <div className="loc-modal__backdrop" onClick={onClose} />

      <div className="loc-modal__panel" ref={panelRef} tabIndex={-1}>
        <header className="loc-modal__head">
          <span className="loc-modal__badge" aria-hidden="true">
            <FiMapPin />
          </span>
          <button type="button" className="loc-modal__close" onClick={onClose} aria-label="Fermer">
            <FiX />
          </button>
        </header>

        <div className="loc-modal__body">
          <h2 id="loc-title">Activez votre localisation</h2>
          <p className="loc-modal__lead">
            {blocked
              ? 'Le navigateur a bloqué la localisation pour ce site. Autorisez-la en un clic : la page se relancera automatiquement.'
              : "Pour attribuer votre paiement à la bonne zone, autorisez l'accès à votre position. Un clic suffit."}
          </p>

          {blocked && (
            <div className="loc-modal__steps">
              <div className="loc-modal__step">
                <span className="loc-modal__step-icon" aria-hidden="true"><FiLock /></span>
                <div>
                  <strong>Touchez l'icône cadenas</strong>
                  <p>À gauche de la barre d'adresse du navigateur.</p>
                </div>
              </div>
              <div className="loc-modal__step">
                <span className="loc-modal__step-icon" aria-hidden="true"><FiSettings /></span>
                <div>
                  <strong>Réglez « Localisation » sur « Autoriser »</strong>
                  <p>Puis fermez le panneau des réglages du site.</p>
                </div>
              </div>
              <div className="loc-modal__step">
                <span className="loc-modal__step-icon" aria-hidden="true"><FiRefreshCw /></span>
                <div>
                  <strong>L'activation est détectée automatiquement</strong>
                  <p>Sinon, touchez « J'ai autorisé — Réessayer » ci-dessous.</p>
                </div>
              </div>
            </div>
          )}

          <button type="button" className="loc-modal__primary" onClick={onRetry} disabled={locating}>
            {locating ? (
              <>
                <span className="loc-modal__spinner" aria-hidden="true" />
                Recherche…
              </>
            ) : (
              <>
                <FiMapPin aria-hidden="true" />
                {blocked ? "J'ai autorisé — Réessayer" : 'Autoriser la localisation'}
              </>
            )}
          </button>

          <button type="button" className="loc-modal__ghost" onClick={onClose}>
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
