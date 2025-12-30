import { Loader2, Ticket, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TicketRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketBalance: number;
  onUseTicket: () => void;
  onPurchase: () => void;
  onCancel: () => void;
  isUsingTicket?: boolean;
  title?: string;
  description?: string;
  showEndOption?: boolean;
  onEnd?: () => void;
}

const TicketRequiredDialog = ({
  open,
  onOpenChange,
  ticketBalance,
  onUseTicket,
  onPurchase,
  onCancel,
  isUsingTicket = false,
  title = "チケットが必要です",
  description = "続けるにはチケットが必要です。",
  showEndOption = false,
  onEnd,
}: TicketRequiredDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <span className="text-sm">現在のチケット残高</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {ticketBalance} 枚
            </Badge>
          </div>

          {ticketBalance > 0 ? (
            <Button
              className="w-full"
              onClick={onUseTicket}
              disabled={isUsingTicket}
            >
              {isUsingTicket ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Ticket className="w-4 h-4 mr-2" />
              )}
              チケットを使って続ける（1枚消費）
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                チケットがありません
              </p>
              <Button className="w-full" onClick={onPurchase}>
                <Plus className="w-4 h-4 mr-2" />
                チケットを購入する
              </Button>
            </div>
          )}

          {showEndOption && onEnd ? (
            <Button variant="outline" className="w-full" onClick={onEnd}>
              チャットを終了する
            </Button>
          ) : (
            <DialogFooter className="sm:justify-center">
              <Button variant="outline" onClick={onCancel}>
                キャンセル
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketRequiredDialog;
