import { Navigate } from "react-router-dom";

export default function MerchantCouponHub() {
  return <Navigate to="/dashboard?tab=promotions" replace />;
}
