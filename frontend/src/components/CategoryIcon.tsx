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
  type LucideProps,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
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
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

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
