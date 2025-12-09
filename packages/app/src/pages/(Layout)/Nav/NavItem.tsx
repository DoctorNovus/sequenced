import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface NavItemProps {
    to: string;
    title: string;
    children: ReactNode;
    disabled?: boolean;
}

export default function NavItem({ to, title, children, disabled }: NavItemProps) {
    const pathname = window.location.pathname;

    const isActive = pathname == to;
    const hasLabel = Boolean(title);

    return (
        <Link
            to={to}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center rounded-2xl px-2 py-1 text-[11px] font-semibold transition-colors ${disabled ? "pointer-events-none opacity-50 cursor-not-allowed hover:text-gray-500 fill-gray-500" : ""} ${isActive
                ? "text-accent-blue-800 fill-accent-blue-800"
                : "text-slate-500 fill-slate-500 hover:text-accent-blue-700 hover:fill-accent-blue-700"
                }`}
        >
            <div className={`flex items-center justify-center text-center w-9 h-9 rounded-2xl`}>
                <div className="flex justify-center items-center w-full h-full p-[4px]">
                    {children}
                </div>
            </div>
            {hasLabel && <span className="">{title}</span>}
        </Link>
    )
}
