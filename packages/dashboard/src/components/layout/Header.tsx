import { Moon, Sun, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { LiveUpdatesIndicator } from "./LiveUpdatesIndicator";
import { ExportButton } from "@/components/home/ExportButton";

interface HeaderProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Header({ search, onSearchChange }: HeaderProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDark]);

  function handleToggleTheme() {
    setIsDark(!isDark);
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-6 glass">
      <div className="relative w-48 transition-all duration-300 ease-out focus-within:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={onSearchChange}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <LiveUpdatesIndicator />
        <ExportButton />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
