import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SplitTenderCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  merchantName: string;
  itemTitle: string;
  grossAmount: number;
  onSuccess?: (receipt: never) => void;
}

export const SplitTenderCheckoutModal: React.FC<SplitTenderCheckoutModalProps> = ({
  isOpen,
  onClose,
  merchantName,
  itemTitle,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>PromoCard is used at the merchant</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {itemTitle} at {merchantName} cannot be completed with a simulated split-tender payment.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm leading-6 text-white/65">
          Claim a live benefit, show it in store, and let the merchant validate it. That recorded redemption is the only completion. There is no in-app payment, gift activation, or recharge on this path.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link to="/card" onClick={onClose} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-black">
            <Ticket className="h-4 w-4" />
            Use this
          </Link>
          <Link to="/discover" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-bold">
            Available nearby
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};
