import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

interface ExpandableTextareaProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const LINE_HEIGHT = 24; // px — matches text-base line-height
const COLLAPSED_ROWS = 3;
const COLLAPSED_MAX = LINE_HEIGHT * COLLAPSED_ROWS + 16; // +16 for py-2

export default function ExpandableTextarea({ name, value, onChange, placeholder }: ExpandableTextareaProps) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [overflows, setOverflows] = useState(false);

    const resize = () => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        const full = el.scrollHeight;
        setOverflows(full > COLLAPSED_MAX);
        el.style.height = expanded ? `${full}px` : `${Math.min(full, COLLAPSED_MAX)}px`;
    };

    useEffect(() => {
        resize();
    }, [value, expanded]);

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-primary px-1">{name}</label>
            <div className="relative">
                <textarea
                    ref={ref}
                    className="w-full resize-none overflow-hidden text-base px-3 py-2 rounded-xl border border-accent-blue/20 bg-silver-200 text-primary shadow-inner focus:border-accent-blue focus:outline-hidden dark:bg-vulcan-950 transition-[height] duration-200"
                    placeholder={placeholder ?? `${name}...`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {!expanded && overflows && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 rounded-b-xl bg-linear-to-t from-silver-200 to-transparent dark:from-vulcan-950 pointer-events-none" />
                )}
            </div>
            {overflows && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="flex items-center gap-1 self-start px-1 text-xs font-semibold text-accent-blue hover:text-accent-blue-700 transition"
                >
                    {expanded
                        ? <><ChevronUpIcon className="h-3.5 w-3.5" /> Show less</>
                        : <><ChevronDownIcon className="h-3.5 w-3.5" /> Show more</>
                    }
                </button>
            )}
        </div>
    );
}
