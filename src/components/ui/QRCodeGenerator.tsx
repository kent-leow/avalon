'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ value, size = 256, className = '' }: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQRCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!value) return;

    setIsLoading(true);
    setError('');

    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((dataUrl) => {
        setQRCodeDataUrl(dataUrl);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
        setIsLoading(false);
      });
  }, [value, size]);

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-[#252547] rounded-lg ${className}`}
        style={{ width: size, height: size }}
        data-testid="qr-code-loading"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-[#252547] rounded-lg text-red-500 text-sm ${className}`}
        style={{ width: size, height: size }}
        data-testid="qr-code-error"
      >
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={`inline-block ${className}`} data-testid="qr-code-generator">
      <img
        src={qrCodeDataUrl}
        alt={`QR code for ${value}`}
        width={size}
        height={size}
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}
