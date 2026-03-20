"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { RippleButton } from "@/Components/ui/ripple-button";
import { Badge } from "@/Components/ui/badge";
import { useWeatherContext } from "@/context/WeatherContext";
import { CloudSun, MapPinCheck, Menu, Search, X } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { savedCities, removeSavedCity } = useWeatherContext();

  const submitSearch = (): void => {
    const city = query.trim();
    if (!city) return;
    router.push(`/?city=${encodeURIComponent(city)}`);
    setQuery("");
    setOpen(false);
  };

  const navigateToCity = (city: string): void => {
    router.push(`/?city=${encodeURIComponent(city)}`);
    setOpen(false);
  };

  const savedCitiesRow = savedCities.length > 0 && (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-white/90">
        Saved
      </span>
      <AnimatePresence mode="popLayout">
        {savedCities.map((city) => (
          <motion.div
            key={city}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Badge className="gap-1 py-0.5 px-2 text-[11px]">
              <button
                type="button"
                onClick={() => navigateToCity(city)}
                className="text-white hover:text-sky-200 transition"
              >
                {city}
              </button>
              <button
                type="button"
                onClick={() => removeSavedCity(city)}
                aria-label={`Remove ${city}`}
                className="text-white hover:text-white transition"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-sm bg-gray-900/30">
      <div className="mx-auto flex max-w-9xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo — Left */}
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-2"
        >
          <CloudSun className="h-5 w-5 text-cyan-200 transition group-hover:scale-110 group-hover:rotate-12" />
          <span className="bg-gradient-to-r from-rose-300 via-amber-200 via-emerald-200 to-sky-300 bg-clip-text font-display text-lg font-semibold text-transparent">
            Weather Live
          </span>
        </Link>

        {/* Search Bar — Center (desktop) */}
        <div className="hidden flex-1 max-w-lg flex-col items-center sm:flex">
          <div className="flex w-full items-center gap-2">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/90" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitSearch();
                }}
                placeholder="Search location..."
                className="h-10 pl-9"
                aria-label="Search location"
              />
            </div>
            <div className="cta-shine-wrap shrink-0 rounded-lg">
              <RippleButton
                type="button"
                onClick={submitSearch}
                className="cta-shine-button shrink-0 rounded-lg border border-sky-300/50 bg-gradient-to-r from-sky-500/35 via-sky-500/20 to-sky-500/10 px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(2,132,199,0.3)] backdrop-blur-sm transition hover:border-sky-200/60 hover:from-sky-500/45 hover:via-sky-500/25 hover:to-sky-500/15"
              >
                <MapPinCheck className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">Search City</span>
              </RippleButton>
            </div>
          </div>
          {savedCitiesRow}
        </div>

        {/* Nav Links — Right */}
        <div className="flex shrink-0 items-center gap-2">
          <RippleButton
            type="button"
            aria-label="Toggle menu"
            className="rounded-lg border border-white/20 bg-white/10 p-2 text-white shadow-[0_10px_30px_rgba(59,130,246,0.2)] backdrop-blur-sm sm:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </RippleButton>
          <div
            className={`absolute left-0 right-0 top-full flex flex-col gap-1 border-b border-white/20 bg-slate-900/80 px-4 py-3 backdrop-blur-2xl sm:static sm:flex-row sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none ${open ? "flex" : "hidden sm:flex"}`}
          >
            {/* Mobile search */}
            <div className="mb-2 flex w-full flex-col gap-2 sm:hidden">
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/90" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submitSearch();
                    }}
                    placeholder="Search location..."
                    className="h-10 pl-9"
                    aria-label="Search location mobile"
                  />
                </div>
                <RippleButton
                  type="button"
                  onClick={submitSearch}
                  className="rounded-lg border border-sky-300/50 bg-gradient-to-r from-sky-500/35 via-sky-500/20 to-sky-500/10 px-3 py-2 text-sm font-medium text-white shadow-[0_10px_30px_rgba(2,132,199,0.3)] backdrop-blur-sm transition hover:border-sky-200/60 hover:from-sky-500/45 hover:via-sky-500/25 hover:to-sky-500/15"
                >
                  <MapPinCheck className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">Search City</span>
                </RippleButton>
              </div>
              {savedCitiesRow}
            </div>
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium backdrop-blur-sm transition sm:px-3 sm:py-1.5 ${
                  pathname === href
                    ? "border-sky-300/50 bg-gradient-to-r from-sky-500/35 via-sky-500/20 to-sky-500/10 text-white shadow-[0_10px_30px_rgba(2,132,199,0.3)]"
                    : "border-white/15 bg-white/5 text-slate-100 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
