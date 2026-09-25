import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Village, Your Decision — Governance Lab | Class VI Social Science',
  description:
    'Interactive 3D Governance Simulation for Class VI Social Science (Grassroots Democracy / Panchayati Raj). Experience citizen consultation, Gram Sabha prioritization, budget allocation, and democratic consequences.',
};

/** Keeps the lab's original dark theme now that the root layout is light. */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lab-root fixed inset-0 select-none overflow-hidden bg-slate-950 text-slate-100" style={{ fontSize: 16 }}>
      {children}
    </div>
  );
}
