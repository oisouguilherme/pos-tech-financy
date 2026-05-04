import {
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Stethoscope,
  Gamepad2,
  Home,
  Plane,
  BookOpen,
  DollarSign,
  TrendingUp,
  Gift,
  Coffee,
  Music,
  Shirt,
  Smartphone,
  Briefcase,
  Heart,
  Star,
  Zap,
  Droplets,
  Wrench,
  PawPrint,
  GraduationCap,
  Building2,
  // Figma picker icons
  BriefcaseBusiness,
  CarFront,
  HeartPulse,
  PiggyBank,
  Ticket,
  Dumbbell,
  BaggageClaim,
  Mailbox,
  ReceiptText,
  type LucideProps,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  // legacy keys (backward compat)
  shopping_cart: ShoppingCart,
  utensils: UtensilsCrossed,
  car: Car,
  stethoscope: Stethoscope,
  gamepad: Gamepad2,
  home: Home,
  plane: Plane,
  book: BookOpen,
  dollar: DollarSign,
  trending_up: TrendingUp,
  gift: Gift,
  coffee: Coffee,
  music: Music,
  shirt: Shirt,
  smartphone: Smartphone,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  zap: Zap,
  droplets: Droplets,
  wrench: Wrench,
  paw: PawPrint,
  graduation: GraduationCap,
  building: Building2,
  // Figma picker icons
  briefcase_business: BriefcaseBusiness,
  car_front: CarFront,
  heart_pulse: HeartPulse,
  piggy_bank: PiggyBank,
  ticket: Ticket,
  dumbbell: Dumbbell,
  baggage_claim: BaggageClaim,
  mailbox: Mailbox,
  receipt_text: ReceiptText,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

// Ordered list matching Figma design (node 3107-4607)
export const PICKER_ICONS = [
  "briefcase_business",
  "car_front",
  "heart_pulse",
  "piggy_bank",
  "shopping_cart",
  "ticket",
  "wrench",
  "utensils",
  "paw",
  "home",
  "gift",
  "dumbbell",
  "book",
  "baggage_claim",
  "mailbox",
  "receipt_text",
] as const;

export function CategoryIcon({
  icon,
  className,
  style,
}: {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = ICON_MAP[icon] ?? DollarSign;
  return <Icon className={className} style={style} />;
}
