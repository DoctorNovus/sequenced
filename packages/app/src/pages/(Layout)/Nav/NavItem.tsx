import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface NavItemProps {
    to: string;
    title: string;
    children: ReactNode;
}

export default function NavItem({ to, title, children }: NavItemProps) {
    const pathname = window.location.pathname;

    const isActive = pathname == to;

    return (
        <Link
            to={to}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition-colors ${isActive
                ? "text-accent-blue-800 fill-accent-blue-800"
                : "text-slate-500 fill-slate-500 hover:text-accent-blue-700 hover:fill-accent-blue-700"
                }`}
        >
            <div className="flex items-center justify-center text-center w-11 h-11 rounded-2xl bg-accent-blue-50/60">
                <div className="flex justify-center items-center w-full h-full p-1">
                    {children}
                </div>
            </div>
            <span className="">{title}</span>
        </Link>
    )
}
