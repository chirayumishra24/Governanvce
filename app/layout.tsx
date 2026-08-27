import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Your Village, Your Decision — Governance Lab | Class VI Social Science',
  description: 'Interactive 3D Governance Simulation for Class VI Social Science (Grassroots Democracy / Panchayati Raj). Experience citizen consultation, Gram Sabha prioritization, budget allocation, and democratic consequences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full w-full overflow-hidden bg-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
