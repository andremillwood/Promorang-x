import React from "react";
import { useLocation } from "react-router-dom";
import StakeholderNextV5 from "@/pages/stakeholder-next/StakeholderNextV5";
import MerchantCommercialReview from "@/pages/stakeholder-next/MerchantCommercialReview";
import "@/stakeholder-next-v6.css";

/**
 * V6 — Object-Embedded World
 *
 * V5 proved that world/context helps, but the right rail should not carry the
 * personality of the product. V6 keeps V5's truthful operating model and moves
 * PROMORANG identity into the work objects themselves through role-specific
 * materials, embedded media, native navigation language and lifecycle residue.
 *
 * Canonical convergence reviews can replace an individual review route without
 * changing the shared stakeholder shell. This lets one object family mature at
 * a time while keeping the rest of Stakeholder Next stable.
 */
export default function StakeholderNextV6() {
  const location = useLocation();
  if (location.pathname === "/merchant/commercial") return <MerchantCommercialReview />;
  return <div className="sn6-object-world"><StakeholderNextV5 /></div>;
}
