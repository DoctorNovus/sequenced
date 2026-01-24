import { useAuth } from "@/hooks/auth";

export default function AuthBootstrap() {
  useAuth();
  return null;
}
