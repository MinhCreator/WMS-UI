import { ArrowLeft, Boxes, ScanLine, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "../../components/shell/ShellWidgets";
import { warehouses } from "../../data/meta";

const features = [
  {
    icon: ScanLine,
    title: "Guided scan workflows",
    detail: "Receiving, putaway and picking with scan-first validation.",
  },
  {
    icon: Boxes,
    title: "Live inventory truth",
    detail: "Bins, lots and reservations reconciled on every count.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    detail: "Operator, lead and manager permissions across every site.",
  },
];

const stats = [
  { value: String(warehouses.length), label: "sites connected" },
  { value: "27", label: "floor workflows" },
  { value: "24/7", label: "shift coverage" },
];

export function AuthCard({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-panel border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(16_24_40/0.04)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-accent-line! bg-accent-soft text-accent">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-2xs font-semibold tracking-[0.08em] text-ink-4 uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-0.5 text-[19px] leading-6 font-semibold tracking-[-0.01em] text-ink">
            {title}
          </h1>
        </div>
      </div>
      <p className="-mt-2 mb-4 text-tn leading-relaxed text-ink-3">
        {description}
      </p>
      {children}
    </section>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-app">
      <aside className="relative sticky top-0 hidden h-screen w-[46%] max-w-[620px] shrink-0 flex-col justify-between overflow-hidden bg-ink p-10 lg:flex xl:p-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 85% 70% at 30% 30%, #000 15%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 70% at 30% 30%, #000 15%, transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-accent/30 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="text-[16px] font-bold tracking-[-0.01em] text-white">
            WarehouseOS
          </span>
          <span className="rounded-[4px] bg-white/10 px-1.5 py-px text-[9.5px] font-bold tracking-[0.08em] text-white/60">
            WMS
          </span>
        </div>

        <div className="relative z-10 max-w-[420px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10! bg-white/[0.04] px-2.5 py-1 text-2xs font-medium text-white/70">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
            </span>
            Live across {warehouses.length} sites
          </div>

          <h2 className="mt-5 text-[30px] leading-[1.15] font-semibold tracking-[-0.02em] text-white">
            Every pick, receipt and count in one place.
          </h2>
          <p className="mt-3 max-w-[360px] text-tn leading-relaxed text-white/55">
            A scan-first workspace for inbound, outbound and inventory teams —
            tuned for the pace of the floor.
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-white/10! bg-white/[0.04] text-[#7dd3fc]">
                    <Icon size={15} strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-tn font-semibold text-white/90">
                      {feature.title}
                    </span>
                    <span className="mt-0.5 block text-2xs leading-relaxed text-white/45">
                      {feature.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative z-10">
          <div className="tnum grid grid-cols-3 divide-x divide-white/10! border-y border-white/10! py-3">
            {stats.map((stat) => (
              <div key={stat.label} className="px-3 first:pl-0 last:pr-0">
                <div className="text-[17px] font-semibold text-white">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-2xs text-white/45">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-2xs text-white/40">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
              All systems operational
            </span>
            <span>v1.0.0 · Build 2026.10</span>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <LogoMark size={24} />
            <span className="text-tn font-bold tracking-[-0.01em] text-ink">
              WarehouseOS
            </span>
          </Link>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-2xs font-medium text-ink-3 transition-colors hover:bg-surface hover:text-ink"
          >
            <ArrowLeft size={12} />
            Back to demo
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-4">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>

        <footer className="shrink-0 px-6 pb-5 text-center text-2xs text-ink-4">
          <span>© 2026 WarehouseOS</span>
          <span className="mx-1.5 text-line-strong">·</span>
          <a
            href="mailto:ops-support@warehouseos.io"
            className="transition-colors hover:text-ink-2"
          >
            ops-support@warehouseos.io
          </a>
          <span className="mx-1.5 text-line-strong">·</span>
          <span>Build 2026.10.7</span>
        </footer>
      </div>
    </div>
  );
}
