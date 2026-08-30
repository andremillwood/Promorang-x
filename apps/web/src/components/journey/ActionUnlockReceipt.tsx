import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";
import type { ActionUnlockReceiptModel } from "@/lib/action-unlock-receipt";

type ActionUnlockReceiptProps = {
  receipt: ActionUnlockReceiptModel;
};

export function ActionUnlockReceipt({ receipt }: ActionUnlockReceiptProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <PaperReceipt
        heading={receipt.heading}
        lines={[
          { label: t("receipt.proved"), value: receipt.proved, strong: true },
          { label: t("receipt.unlocked"), value: receipt.unlocked, strong: true },
          { label: t("receipt.next"), value: receipt.next },
        ]}
        footer={receipt.next}
      />
      <Link
        to={receipt.nextHref}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-white"
      >
        {receipt.nextLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
