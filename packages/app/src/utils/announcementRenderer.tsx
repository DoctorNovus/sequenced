import { ReactNode } from "react";
import { useNavigate } from "react-router";

type TextPart = { type: "text"; value: string; key: string };
type LinkPart = { type: "link"; label: string; href: string; key: string };
type BodyPart = TextPart | LinkPart;

export function useAnnouncementRenderer() {
    const navigate = useNavigate();

    const renderInline = (text: string, keyPrefix: string) => {
        const parts: BodyPart[] = [];
        let lastIndex = 0;
        let linkIndex = 0;
        const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match: RegExpExecArray | null = linkPattern.exec(text);

        while (match) {
            const [fullMatch, label, href] = match;
            const start = match.index;

            if (start > lastIndex) {
                parts.push({ type: "text", value: text.slice(lastIndex, start), key: `${keyPrefix}-text-${start}` });
            }

            parts.push({ type: "link", label: label.trim() || href.trim(), href: href.trim(), key: `${keyPrefix}-link-${linkIndex++}` });
            lastIndex = start + fullMatch.length;
            match = linkPattern.exec(text);
        }

        if (lastIndex < text.length) {
            parts.push({ type: "text", value: text.slice(lastIndex), key: `${keyPrefix}-text-${lastIndex}` });
        }

        if (!parts.length) {
            parts.push({ type: "text", value: text, key: `${keyPrefix}-text-empty` });
        }

        return parts.map((part) => {
            if (part.type === "text") return <span key={part.key}>{part.value}</span>;

            const isInternal = part.href.startsWith("/");
            const isExternal = part.href.startsWith("http://") || part.href.startsWith("https://");
            if (!isInternal && !isExternal) return <span key={part.key}>{`[${part.label}](${part.href})`}</span>;

            return (
                <a
                    key={part.key}
                    href={part.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="font-semibold text-accent-blue underline"
                    onClick={(e) => { if (isInternal) { e.preventDefault(); navigate(part.href); } }}
                >
                    {part.label}
                </a>
            );
        });
    };

    const renderBody = (body: string): ReactNode[] => {
        const lines = body.split("\n");
        const nodes: ReactNode[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            const keyPrefix = `line-${i}`;

            if (!trimmed) { nodes.push(<div key={keyPrefix} className="h-2" />); continue; }

            if (trimmed.startsWith("### ")) {
                nodes.push(<h4 key={keyPrefix} className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{renderInline(trimmed.slice(4), keyPrefix)}</h4>);
                continue;
            }
            if (trimmed.startsWith("## ")) {
                nodes.push(<h3 key={keyPrefix} className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{renderInline(trimmed.slice(3), keyPrefix)}</h3>);
                continue;
            }
            if (trimmed.startsWith("# ")) {
                nodes.push(<h2 key={keyPrefix} className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{renderInline(trimmed.slice(2), keyPrefix)}</h2>);
                continue;
            }

            if (trimmed.startsWith("- ")) {
                const items: ReactNode[] = [];
                let listIndex = i;
                while (listIndex < lines.length) {
                    const listLine = lines[listIndex].trim();
                    if (!listLine.startsWith("- ")) break;
                    const itemKey = `line-${listIndex}`;
                    items.push(<li key={itemKey} className="ml-5 list-disc">{renderInline(listLine.slice(2), itemKey)}</li>);
                    listIndex++;
                }
                nodes.push(<ul key={keyPrefix} className="space-y-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{items}</ul>);
                i = listIndex - 1;
                continue;
            }

            nodes.push(<p key={keyPrefix} className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{renderInline(line, keyPrefix)}</p>);
        }

        return nodes;
    };

    return { renderBody };
}
