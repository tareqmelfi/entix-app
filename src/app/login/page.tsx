import { LoginPanel } from "@/components/auth/LoginPanel";
import { isGoogleAuthConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginPanel googleConfigured={isGoogleAuthConfigured()} />;
}
