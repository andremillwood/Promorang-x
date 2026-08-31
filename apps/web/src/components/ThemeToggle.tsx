import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const ThemeToggle = ({
  tone = "app",
  className,
}: {
  tone?: "marketing" | "app";
  className?: string;
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === "light" ? "dark" : "light";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setTheme(nextTheme);
      }}
      className={cn(
        "h-9 w-9 min-h-9 shrink-0",
        tone === "marketing"
          ? "text-white/80 hover:bg-white/[0.08] hover:text-white"
          : "text-foreground hover:bg-muted",
        className,
      )}
      aria-label={nextTheme === "dark" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <Sun className={cn("h-4 w-4", resolvedTheme === "dark" && "hidden")} />
      <Moon className={cn("h-4 w-4", resolvedTheme === "light" && "hidden")} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
