import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, AlertTriangle, Lock } from "lucide-react";

interface RestrictedAccessProps {
  title?: string;
  message?: string;
  icon?: "shield" | "warning" | "lock";
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  className?: string;
}

export function RestrictedAccess({
  title = "Přístup odepřen",
  message = "Nemáte oprávnění k přístupu k této stránce. Vyžadována je admin role.",
  icon = "shield",
  showBackButton = true,
  backButtonText = "Zpět na hlavní stránku",
  backButtonHref = "/",
  className = "",
}: RestrictedAccessProps) {
  const getIcon = () => {
    switch (icon) {
      case "warning":
        return <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />;
      case "lock":
        return <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
      case "shield":
      default:
        return <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />;
    }
  };

  return (
    <div className={`min-h-screen bg-background flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {getIcon()}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3">
          {title}
        </h2>

        <p className="text-muted-foreground mb-6 leading-relaxed">
          {message}
        </p>

        {showBackButton && (
          <Button asChild>
            <Link href={backButtonHref}>
              {backButtonText}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}