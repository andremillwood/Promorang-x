import { Archive, Coins, Gem, Gift, Layers, Rocket, WalletCards } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const valueDestinations: Array<{
  href: string;
  labelKey: TranslationKey;
  detailKey: TranslationKey;
  icon: typeof WalletCards;
}> = [
  { href: "/wallet", labelKey: "valueNav.wallet", detailKey: "valueNav.walletDetail", icon: WalletCards },
  { href: "/portfolio", labelKey: "valueNav.pieces", detailKey: "valueNav.piecesDetail", icon: Layers },
  { href: "/marketplace", labelKey: "valueNav.market", detailKey: "valueNav.marketDetail", icon: Gem },
  { href: "/nodes", labelKey: "valueNav.saveWin", detailKey: "valueNav.saveWinDetail", icon: Coins },
  { href: "/vault", labelKey: "valueNav.vault", detailKey: "valueNav.vaultDetail", icon: Archive },
  { href: "/rewards", labelKey: "valueNav.rewards", detailKey: "valueNav.rewardsDetail", icon: Gift },
  { href: "/growth", labelKey: "valueNav.growth", detailKey: "valueNav.growthDetail", icon: Rocket },
];

type PersonalValueNavProps = {
  className?: string;
};

export function PersonalValueNav({ className = "" }: PersonalValueNavProps) {
  const { pathname } = useLocation();
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("valueNav.aria")}
      className={`w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111111]/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}
    >
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {valueDestinations.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex min-w-[155px] flex-1 items-center gap-3 rounded-[1.25rem] border px-4 py-3 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
                isActive
                  ? "border-primary/60 bg-primary text-primary-foreground shadow-[0_10px_32px_rgba(255,107,0,0.22)]"
                  : "border-transparent bg-white/[0.035] text-white hover:border-white/10 hover:bg-white/[0.07]"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-black/15" : "bg-white/[0.07] text-primary"}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black">{t(item.labelKey)}</span>
                <span className={`block truncate text-[10px] ${isActive ? "text-primary-foreground/70" : "text-white/40"}`}>{t(item.detailKey)}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
