import React from 'react';
import { FiWifi } from 'react-icons/fi';
import './wifi-loader.css';

interface WifiLoaderProps {
  label?: string;
  className?: string;
}

/**
 * WiFi signal loader: a wifi icon plus signal bars that fill and drain in a
 * continuous wave. Uses `currentColor` so it adapts to its button/panel.
 */
export const WifiLoader: React.FC<WifiLoaderProps> = ({ label, className = '' }) => (
  <span className={`wifi-loader ${className}`.trim()} role="status" aria-live="polite">
    <FiWifi className="wifi-loader__icon" aria-hidden="true" />
    <span className="wifi-loader__bars" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
    {label && <span className="wifi-loader__label">{label}</span>}
  </span>
);

export default WifiLoader;
