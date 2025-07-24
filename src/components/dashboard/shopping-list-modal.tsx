"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface ShoppingListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWeekNumber: number | null;
  shoppingListContent: string;
}

export function ShoppingListModal({
  open,
  onOpenChange,
  selectedWeekNumber,
  shoppingListContent
}: ShoppingListModalProps) {
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shoppingListContent);
    toast.success("Nákupní seznam zkopírován do schránky!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Nákupní seznam pro týden {selectedWeekNumber}
          </DialogTitle>
          <DialogDescription>
            Vaše organizovaný nákupní seznam pro všechny jídla v týdnu {selectedWeekNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {shoppingListContent || "Načítám nákupní seznam..."}
            </pre>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Zavřít
            </Button>
            <Button onClick={handleCopyToClipboard}>
              Kopírovat do schránky
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}