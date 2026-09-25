import {
  Banknote,
  Bike,
  BookOpen,
  Briefcase,
  Building2,
  Globe2,
  HeartPulse,
  Home,
  Landmark,
  Lamp,
  Map,
  Megaphone,
  Recycle,
  Route,
  Scale,
  ScrollText,
  Shield,
  SunMedium,
  TrainFront,
  Trees,
  Users,
  Vote,
  Droplets,
  type LucideIcon,
} from 'lucide-react';

const ILLUSTRATIONS: Record<string, { icon: LucideIcon; from: string; to: string; fg: string }> = {
  road: { icon: Route, from: '#E2E8F0', to: '#CBD5E1', fg: '#334155' },
  park: { icon: Trees, from: '#DCFCE7', to: '#BBF7D0', fg: '#15803D' },
  water: { icon: Droplets, from: '#E0F2FE', to: '#BAE6FD', fg: '#0369A1' },
  waste: { icon: Recycle, from: '#ECFCCB', to: '#D9F99D', fg: '#4D7C0F' },
  school: { icon: BookOpen, from: '#FEF9C3', to: '#FDE68A', fg: '#A16207' },
  hospital: { icon: HeartPulse, from: '#FFE4E6', to: '#FECDD3', fg: '#BE123C' },
  defence: { icon: Shield, from: '#E0E7FF', to: '#C7D2FE', fg: '#3730A3' },
  globe: { icon: Globe2, from: '#E0F2FE', to: '#C7D2FE', fg: '#1D4ED8' },
  law: { icon: ScrollText, from: '#EDE9FE', to: '#DDD6FE', fg: '#6D28D9' },
  parliament: { icon: Landmark, from: '#EDE9FE', to: '#DDD6FE', fg: '#5B21B6' },
  court: { icon: Scale, from: '#FCE7F3', to: '#FBCFE8', fg: '#9D174D' },
  briefcase: { icon: Briefcase, from: '#E0F2FE', to: '#BAE6FD', fg: '#0369A1' },
  streetlight: { icon: Lamp, from: '#FEF3C7', to: '#FDE68A', fg: '#B45309' },
  community: { icon: Users, from: '#FFEDD5', to: '#FED7AA', fg: '#C2410C' },
  energy: { icon: SunMedium, from: '#FEF9C3', to: '#FEF08A', fg: '#A16207' },
  train: { icon: TrainFront, from: '#E2E8F0', to: '#CBD5E1', fg: '#1E293B' },
  home: { icon: Home, from: '#FFEDD5', to: '#FED7AA', fg: '#9A3412' },
  traffic: { icon: Bike, from: '#E0E7FF', to: '#C7D2FE', fg: '#3730A3' },
  money: { icon: Banknote, from: '#DCFCE7', to: '#BBF7D0', fg: '#166534' },
  vote: { icon: Vote, from: '#E0F2FE', to: '#BAE6FD', fg: '#075985' },
  megaphone: { icon: Megaphone, from: '#FFEDD5', to: '#FED7AA', fg: '#C2410C' },
  map: { icon: Map, from: '#CCFBF1', to: '#99F6E4', fg: '#0F766E' },
  building: { icon: Building2, from: '#F1F5F9', to: '#E2E8F0', fg: '#334155' },
};

export const ILLUSTRATION_KEYS = Object.keys(ILLUSTRATIONS);

/** Small illustrative tile for a situation: a built-in icon key, or any image URL set by the teacher. */
export function IssueIllustration({ image, className = '' }: { image?: string; className?: string }) {
  if (image && /^(https?:|data:|\/)/.test(image)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className={`object-cover ${className}`} />;
  }
  const ill = ILLUSTRATIONS[image ?? ''] ?? ILLUSTRATIONS.building;
  const Icon = ill.icon;
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${ill.from}, ${ill.to})`, color: ill.fg }}
      aria-hidden
    >
      <Icon className="h-[46%] w-[46%]" strokeWidth={1.8} />
    </div>
  );
}
