"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccessibilityMenu } from "@/components/accessibility-menu";

const TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tutor", label: "Tutor" },
  { href: "/simulado", label: "Simulado" },
  { href: "/portugues", label: "Português" },
  { href: "/matematica", label: "Matemática" },
  { href: "/ingles", label: "Inglês" },
  { href: "/foco", label: "Foco" },
  { href: "/relatorios", label: "Relatórios" },
];

export function Nav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status !== "authenticated") return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const tabs =
    session.user?.role === "responsible"
      ? [...TABS, { href: "/painel", label: "Painel do responsável" }]
      : TABS;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4">
        <Link href="/dashboard" className="mr-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            ME
          </span>
          <span className="hidden font-bold text-slate-900 sm:block dark:text-slate-100">
            Mestre do Estudo
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive(t.href)
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-500 md:block dark:text-slate-400">
            {session.user?.name}
          </span>
          <ThemeToggle />
          <AccessibilityMenu />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
