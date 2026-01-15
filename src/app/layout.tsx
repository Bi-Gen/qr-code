import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR Code Generator Gratuito | BI-Gen',
  description: 'Genera QR code gratuiti per URL, WiFi, vCard, email, telefono e SMS. Personalizza colori e dimensioni. Download PNG e SVG.',
  keywords: 'qr code, generatore qr, qr code gratis, qr wifi, qr vcard, qr code generator',
  authors: [{ name: 'BI-Gen' }],
  openGraph: {
    title: 'QR Code Generator Gratuito | BI-Gen',
    description: 'Genera QR code gratuiti per URL, WiFi, vCard, email, telefono e SMS.',
    url: 'https://qr.bi-gen.it',
    siteName: 'BI-Gen QR Code Generator',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
