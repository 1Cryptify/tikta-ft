declare module 'qrcode.react' {
  import React from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    renderAs?: 'svg' | 'canvas';
    fgColor?: string;
    bgColor?: string;
    style?: React.CSSProperties;
    imageSettings?: {
      src: string;
      x?: number;
      y?: number;
      height: number;
      width: number;
      opacity?: number;
      excavate?: boolean;
    };
    quietZone?: number;
  }

  const QRCode: React.FC<QRCodeProps>;
  export = QRCode;
}
