import QRCode from 'qrcode';

export interface QROptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generates PNG Data URL of the QR code
 */
export async function generateQRCodeDataURL(
  text: string,
  options?: QROptions
): Promise<string> {
  const width = options?.width || 300;
  const margin = options?.margin ?? 2;
  const darkColor = options?.darkColor || '#0f172a';
  const lightColor = options?.lightColor || '#ffffff';
  const errorCorrectionLevel = options?.errorCorrectionLevel || 'H';

  return QRCode.toDataURL(text, {
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel,
  });
}

/**
 * Generates clean SVG markup string of the QR code
 */
export async function generateQRCodeSVG(
  text: string,
  options?: QROptions
): Promise<string> {
  const width = options?.width || 300;
  const margin = options?.margin ?? 2;
  const darkColor = options?.darkColor || '#0f172a';
  const lightColor = options?.lightColor || '#ffffff';
  const errorCorrectionLevel = options?.errorCorrectionLevel || 'H';

  return QRCode.toString(text, {
    type: 'svg',
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel,
  });
}

/**
 * Triggers browser download for PNG QR code
 */
export async function downloadQRCodePNG(
  text: string,
  filename: string,
  options?: QROptions
): Promise<void> {
  const dataUrl = await generateQRCodeDataURL(text, options);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Triggers browser download for SVG QR code
 */
export async function downloadQRCodeSVG(
  text: string,
  filename: string,
  options?: QROptions
): Promise<void> {
  const svgString = await generateQRCodeSVG(text, options);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
