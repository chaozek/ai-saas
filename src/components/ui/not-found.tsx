import { RestrictedAccess } from "./restricted-access";
import { Search } from "lucide-react";

interface NotFoundProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export function NotFound({
  title = "Stránka nenalezena",
  message = "Požadovaná stránka nebyla nalezena. Zkontrolujte prosím URL adresu.",
  showBackButton = true,
  backButtonText = "Zpět na hlavní stránku",
  backButtonHref = "/",
}: NotFoundProps) {
  return (
    <RestrictedAccess
      title={title}
      message={message}
      icon="warning"
      showBackButton={showBackButton}
      backButtonText={backButtonText}
      backButtonHref={backButtonHref}
    />
  );
}