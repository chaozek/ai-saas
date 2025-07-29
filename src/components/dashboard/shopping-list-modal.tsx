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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    // Kopírujeme původní Markdown text, ne vyrenderované HTML
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
            Váš organizovaný nákupní seznam pro všechny jídla v týdnu {selectedWeekNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            {shoppingListContent ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for different elements
                    h1: ({children}) => <h1 className="text-xl font-bold mb-3 text-primary">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold mb-2 text-primary">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-medium mb-2">{children}</h3>,
                    ul: ({children}) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>,
                    li: ({children}) => <li className="text-sm leading-relaxed">{children}</li>,
                    p: ({children}) => <p className="text-sm leading-relaxed mb-2">{children}</p>,
                    strong: ({children}) => <strong className="font-semibold text-primary">{children}</strong>,
                    em: ({children}) => <em className="italic">{children}</em>,
                    code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">{children}</blockquote>,
                  }}
                >
                  {shoppingListContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Načítám nákupní seznam...
              </div>
            )}
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