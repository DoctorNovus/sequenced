import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavItemProps {
    to: string;
    title: string;
    children: ReactNode;
    disabled?: boolean;
}

export default function NavItem({ to, title, children, disabled }: NavItemProps) {
    const { pathname } = useLocation();

    const isActive = pathname == to;
    const hasLabel = Boolean(title);

    return (
        <Link
            to={to}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-[11px] font-semibold transition-colors ${disabled ? "pointer-events-none opacity-50 cursor-not-allowed" : ""} ${
                isActive
                    ? "text-accent-blue-700 fill-accent-blue-700"
                    : "text-muted fill-muted hover:text-accent-blue-600 hover:fill-accent-blue-600"
            }`}
        >
            <div
                className={`flex items-center justify-center text-center w-11 h-11 rounded-2xl transition ${
                    isActive
                        ? "bg-accent-blue-50/90 border border-accent-blue/30 shadow-[0_10px_24px_rgba(48,122,207,0.25)] dark:bg-[rgba(99,102,241,0.18)]"
                        : "bg-transparent border border-transparent hover:border-accent-blue/20 hover:bg-accent-blue-50/60 dark:hover:bg-[rgba(99,102,241,0.12)]"
                }`}
            >
                <div className="flex justify-center items-center w-full h-full p-[6px]">
                    {children}
                </div>
            </div>
            {hasLabel && <span className="">{title}</span>}
        </Link>
    )
}
