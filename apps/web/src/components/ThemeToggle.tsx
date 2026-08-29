import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const cycle = {
  light: "dark",
  dark: "system",
  system: "light",
} as const;

const labels = {
  light: "Switch to dark theme",
  dark: "Switch to system theme",
  system: "Switch to light theme",
} as const;

const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(cycle[theme])}
      aria-label={labels[theme]}
      title={labels[theme]}
      className={cn("h-9 w-9 text-foreground hover:bg-accent", className)}
    >
      {theme === "system" ? (
        <Monitor className="h-4 w-4" />
      ) : (
        <>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-[color,opacity,transform] dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-[color,opacity,transform] dark:rotate-0 dark:scale-100" />
        </>
      )}
      <span className="sr-only">{labels[theme]}</span>
    </Button>
  );
};

export default ThemeToggle;
