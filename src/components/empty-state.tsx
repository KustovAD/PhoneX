import { Search } from "lucide-react";

export function EmptyState({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border px-6 py-16 text-center">
      <Search className="mb-4 size-8 text-muted-foreground" />
      <p className="font-heading text-xl">{title}</p>
      {text ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{text}</p> : null}
    </div>
  );
}
