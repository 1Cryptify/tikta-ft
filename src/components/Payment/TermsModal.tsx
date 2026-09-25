import React, { useEffect, useRef } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import {
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
  TERMS_VERSION,
} from '../../content/termsOfUse';
import './terms-modal.css';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when the user explicitly accepts the terms. */
  onAccept?: () => void;
}

/**
 * Scrollable, accessible terms dialog. Rendered as an overlay on top of the
 * checkout page so the user never navigates away.
 */
export const TermsModal: React.FC<TermsModalProps> = ({ open, onClose, onAccept }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    // Lock background scroll while the modal is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
      <div className="terms-modal__backdrop" onClick={onClose} />

      <div className="terms-modal__panel" ref={panelRef} tabIndex={-1}>
        <header className="terms-modal__head">
          <div className="terms-modal__heading">
            <h2 id="terms-title">Conditions générales d'utilisation</h2>
            <span className="terms-modal__meta">
              Version {TERMS_VERSION} — mise à jour le {TERMS_LAST_UPDATED}
            </span>
          </div>
          <button
            type="button"
            className="terms-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <FiX />
          </button>
        </header>

        <div className="terms-modal__body" ref={bodyRef}>
          <p className="terms-modal__intro">
            Veuillez lire attentivement les conditions ci-dessous avant de valider votre
            paiement. L'achat d'un ticket vaut acceptation de ces conditions.
          </p>

          {TERMS_SECTIONS.map((section, index) => (
            <section key={section.title} className="terms-sec">
              <h3 className="terms-sec__title">
                {index + 1}. {section.title}
              </h3>
              {section.blocks.map((block, blockIndex) =>
                block.type === 'p' ? (
                  <p key={blockIndex}>{block.text}</p>
                ) : (
                  <ul key={blockIndex}>
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ))}
        </div>

        <footer className="terms-modal__foot">
          <button type="button" className="terms-modal__btn terms-modal__btn--ghost" onClick={onClose}>
            Fermer
          </button>
          {onAccept && (
            <button type="button" className="terms-modal__btn terms-modal__btn--primary" onClick={onAccept}>
              <FiCheck aria-hidden="true" />
              J'accepte les conditions
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default TermsModal;
