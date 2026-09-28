/** A completed share sheet or copied link is a distribution action, never a conversion. */
export async function shareSceneLink(title: string, url: string, text?: string): Promise<"shared" | "copied" | "cancelled"> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      if ((error as Error).name === "AbortError") return "cancelled";
      throw error;
    }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}
