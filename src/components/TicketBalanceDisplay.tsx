import { memo } from "react";

interface TicketBalanceDisplayProps {
  isFirstFreeReading: boolean;
  ticketBalance: number;
}

const TicketBalanceDisplay = memo(({
  isFirstFreeReading,
  ticketBalance,
}: TicketBalanceDisplayProps) => {
  return (
    <div className="text-center text-sm text-muted-foreground">
      {isFirstFreeReading ? (
        <span className="text-accent">🎁 初回無料鑑定が利用できます</span>
      ) : (
        <span>🎫 チケット残高: {ticketBalance}枚</span>
      )}
    </div>
  );
});

TicketBalanceDisplay.displayName = "TicketBalanceDisplay";

export default TicketBalanceDisplay;
