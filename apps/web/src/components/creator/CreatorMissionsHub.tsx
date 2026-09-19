import CreatorReleaseWorkspaceBridge from "@/components/creator/CreatorReleaseWorkspaceBridge";

/**
 * Compatibility wrapper for older imports.
 *
 * The previous implementation contained a browser-only bounty board with
 * fabricated brands, cash values, claim counts, deadlines and local claim
 * success. Keep the old component name for compatibility, but always delegate
 * to the source-backed release workspace.
 */
export function CreatorMissionsHub() {
  return <CreatorReleaseWorkspaceBridge mode="work" />;
}

export default CreatorMissionsHub;
