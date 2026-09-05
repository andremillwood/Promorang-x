import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CardTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CardTopUpModal: React.FC<CardTopUpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Top-up is not a live path</DialogTitle>
          <DialogDescription className="text-zinc-400">
            PromoCard does not accept simulated cash deposits or bonus recharge in customer journeys.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm leading-6 text-white/65">
          Get your next benefit from a participating merchant. Use it. Come back after they record it.
        </p>
        <Link to="/card" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-black">
          Use this
        </Link>
      </DialogContent>
    </Dialog>
  );
};
