import {
  Briefcase, Home, ShoppingCart,
  Heart, GraduationCap, Users, Landmark
} from "lucide-react";

export const categories = [
  { id: "work", name: "Pekerjaan", icon: Briefcase, color: "blue" },
  { id: "personal", name: "Pribadi", icon: Home, color: "purple" },
  { id: "shopping", name: "Belanja", icon: ShoppingCart, color: "green" },
  { id: "health", name: "Kesehatan", icon: Heart, color: "red" },
  { id: "education", name: "Pendidikan", icon: GraduationCap, color: "yellow" },
  { id: "community", name: "Kegiatan Warga", icon: Users, color: "teal" },
  { id: "public-service", name: "Layanan Publik", icon: Landmark, color: "indigo" },
];

export const priorities = [
  { id: "low", name: "Low", color: "gray" },
  { id: "medium", name: "Medium", color: "blue" },
  { id: "high", name: "High", color: "orange" },
  { id: "urgent", name: "Urgent", color: "red" },
];
