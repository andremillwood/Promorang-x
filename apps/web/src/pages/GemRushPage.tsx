import { useState } from "react";
import { Sparkles, Zap, Clock, ShieldCheck, ShoppingBag, CheckCircle, Flame, AlertCircle } from "lucide-react";

export default function GemRushPage() {
  const [userGems] = useState(350); // 350 Gems = $350 USD
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const vaultItems = [
    {
      id: "vlt-001",
      name: "Pro Wireless Noise-Canceling Earbuds",
      description: "High-fidelity audio with active noise cancellation and crystal-clear microphone.",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
      originalMsrp: "$149.99 USD",
      gemPrice: 150, // 150 Gems = $150 USD
      stockLeft: 8,
      initialStock: 25,
      status: "live"
    },
    {
      id: "vlt-002",
      name: "Ultra Fitness Smartwatch & Heart Monitor",
      description: "Tracks workout performance, sleep quality, and heart rate dynamics in real time.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      originalMsrp: "$199.99 USD",
      gemPrice: 200, // 200 Gems = $200 USD
      stockLeft: 4,
      initialStock: 15,
      status: "live"
    },
    {
      id: "vlt-003",
      name: "Handcrafted Leather Everyday Crossbody",
      description: "Premium handcrafted Italian leather with gold hardware and custom lining.",
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
      originalMsrp: "$120.00 USD",
      gemPrice: 120, // 120 Gems = $120 USD
      stockLeft: 12,
      initialStock: 30,
      status: "live"
    }
  ];

  const handlePurchase = () => {
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
      setSelectedItem(null);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* HERO HEADER */}
        <header className="relative overflow-hidden rounded-3xl border border-[#FFC300]/30 bg-gradient-to-br from-[#FFC300]/10 via-black to-[#FF6A00]/10 px-6 py-10 sm:px-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#FFC300]/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFC300]/40 bg-[#FFC300]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#FFC300]">
                <Zap className="h-4 w-4 text-[#FFC300]" />
                Daily Dopamine Flash Vault • Live
              </div>

              {/* Balance Widget */}
              <div className="flex items-center gap-3 rounded-full border border-[#FFC300]/30 bg-black/60 px-5 py-2 text-sm font-bold">
                <span className="text-white/70">Your Gems Balance:</span>
                <span className="font-mono text-[#FFC300] text-lg">{userGems} Gems</span>
                <span className="text-xs text-emerald-400">($350.00 USD)</span>
              </div>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl text-white">
              Redeem Withdrawable Gems. <br />
              <span className="bg-gradient-to-r from-[#FFC300] via-[#FF6A00] to-[#FF9000] bg-clip-text text-transparent">
                Claim Real High-Value Products.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-white/70">
              1 Gem = $1.00 USD cash value. Every item in the Dopamine Vault is 100% reserve-backed and shipped directly to your door.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-white/60">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> 1:1 Escrow Cash Solvency Backed</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#FFC300]" /> Vault Resets Daily at 12:00 PM EST</span>
            </div>
          </div>
        </header>

        {/* VAULT ITEMS GRID */}
        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Today's Flash Vault Drops</h2>
            <span className="text-xs font-bold text-[#FFC300]">3 Items Live Right Now</span>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {vaultItems.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#FFC300]/50 hover:bg-white/[0.05]">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-mono font-bold text-[#FFC300] backdrop-blur-md">
                    {item.gemPrice} Gems (${item.gemPrice} USD)
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>MSRP: {item.originalMsrp}</span>
                    <span className="text-[#FF6A00] font-bold">{item.stockLeft} left of {item.initialStock}</span>
                  </div>

                  <h3 className="mt-2 text-lg font-black text-white">{item.name}</h3>
                  <p className="mt-1 text-xs text-white/60 line-clamp-2">{item.description}</p>

                  {/* Stock Progress Bar */}
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FFC300]"
                      style={{ width: `${(item.stockLeft / item.initialStock) * 100}%` }}
                    />
                  </div>

                  <button
                    onClick={() => setSelectedItem(item)}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#FFC300] to-[#FF6A00] py-3 text-sm font-black text-black shadow-lg transition hover:brightness-110 active:scale-95"
                  >
                    Claim for {item.gemPrice} Gems
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PURCHASE CONFIRMATION MODAL */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl border border-[#FFC300]/30 bg-[#0F0F0F] p-6 text-white shadow-2xl">
              {purchaseSuccess ? (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto h-16 w-16 text-emerald-400" />
                  <h3 className="mt-4 text-2xl font-black">Vault Drop Claimed!</h3>
                  <p className="mt-2 text-xs text-white/60">
                    {selectedItem.gemPrice} Gems deducted. Your shipping confirmation is in your profile orders.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-black">Confirm Gem Purchase</h3>
                  <p className="mt-1 text-xs text-white/60">
                    1 Gem = $1.00 USD cash. This transaction debits your balance atomically.
                  </p>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Item Name</span>
                      <span className="font-bold text-white">{selectedItem.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Item Price</span>
                      <span className="font-mono font-bold text-[#FFC300]">{selectedItem.gemPrice} Gems</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2">
                      <span className="text-white/60">Gems Remaining After Purchase</span>
                      <span className="font-mono font-bold text-emerald-400">{userGems - selectedItem.gemPrice} Gems</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 rounded-xl border border-white/15 py-3 text-xs font-bold text-white/70 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePurchase}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[#FFC300] to-[#FF6A00] py-3 text-xs font-black text-black hover:brightness-110"
                    >
                      Confirm Purchase
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
