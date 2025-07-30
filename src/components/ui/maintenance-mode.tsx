import { RestrictedAccess } from "./restricted-access";
import { Wrench } from "lucide-react";

interface MaintenanceModeProps {
  title?: string;
  message?: string;
  estimatedTime?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export function MaintenanceMode({
  title = "Údržba systému",
  message = "Systém je momentálně v údržbě. Prosím zkuste to později.",
  estimatedTime,
  showBackButton = true,
  backButtonText = "Zkusit znovu",
  backButtonHref = "/",
}: MaintenanceModeProps) {
  const fullMessage = estimatedTime
    ? `${message} Odhadovaný čas dokončení: ${estimatedTime}`
    : message;

  return (
    <RestrictedAccess
      title={title}
      message={fullMessage}
      icon="lock"
      showBackButton={showBackButton}
      backButtonText={backButtonText}
      backButtonHref={backButtonHref}
    />
  );
}