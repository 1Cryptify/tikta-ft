import React from 'react';
import { FiImage } from 'react-icons/fi';
import { getMediaUrl } from '../services/api';
import { getOfferBackground, getOfferIllustrationIcon } from '../config/offerIllustrations';

interface OfferVisualProps {
  /** Uploaded image path (takes priority over the illustration). */
  image?: string | null;
  /** Illustration/icon identifier. */
  icon?: string | null;
  /** Background identifier for the illustration. */
  background?: string | null;
  alt?: string;
  /** Icon size (number = px, string = any CSS length such as '58%'). */
  iconSize?: number | string;
  className?: string;
  style?: React.CSSProperties;
  /** Rendered when there is neither an image nor a known illustration. */
  placeholder?: React.ReactNode;
}

/**
 * Renders the visual of an offer: either its uploaded image, or a predefined
 * illustration (icon) rendered on a coherent background.
 */
export const OfferVisual: React.FC<OfferVisualProps> = ({
  image,
  icon,
  background,
  alt = '',
  iconSize = '66%',
  className,
  style,
  placeholder,
}) => {
  if (image) {
    return (
      <img
        src={getMediaUrl(image)}
        alt={alt}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  const Icon = getOfferIllustrationIcon(icon);
  if (Icon) {
    const bg = getOfferBackground(background);
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          background: bg.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: bg.iconColor,
          ...style,
        }}
      >
        <Icon size={iconSize} aria-hidden="true" />
      </div>
    );
  }

  if (placeholder !== undefined) {
    return <>{placeholder}</>;
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        ...style,
      }}
    >
      <FiImage size={iconSize} aria-hidden="true" />
    </div>
  );
};

export default OfferVisual;
