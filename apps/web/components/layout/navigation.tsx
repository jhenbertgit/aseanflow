"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@aseanflow/ui/components/button";
import { Send, Layout, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

const navItems = [
  { name: "Send", href: "/send", icon: Send },
  { name: "Architecture", href: "/architecture", icon: Layout },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-bold text-emerald-600 tracking-tight">
              ASEANFlow
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 p-0"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
