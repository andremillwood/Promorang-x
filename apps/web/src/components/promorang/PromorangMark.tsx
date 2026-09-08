import { cn } from "@/lib/utils";
import promorangMark from "@/assets/promorang-mark.png";

type PromorangMarkProps = {
  className?: string;
  size?: number;
  title?: string;
};

export function PromorangMark({ className, size = 36, title = "PROMORANG" }: PromorangMarkProps) {
  return (
    <img
      src={promorangMark}
      alt={title}
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}
