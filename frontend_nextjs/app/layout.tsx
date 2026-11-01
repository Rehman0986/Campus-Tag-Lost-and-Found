import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: 'Campus Tag — Scan It to Find It',
  description: 'University-grade privacy-first lost & found platform with Leaflet maps and QR tag recovery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-light text-dark">
        {children}
      </body>
    </html>
  );
}
