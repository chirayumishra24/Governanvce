import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'Government Control Room: Who Handles What? | Class 6 Social Science',
  description:
    'A two-team classroom simulation for NCERT Class 6 “Grassroots Democracy – Part 1: Governance”. Students decide which level and which organ of government handles real-life situations.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#eef3f9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full w-full">{children}</body>
    </html>
  );
}
