"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "@/i18n/routing";

type Hit = { slug: string; nameRu: string; nameEn: string; brand: { name: string } };

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const debounced = useDebounce(q, 200);

  useEffect(() => {
    if (!debounced) {
      setHits([]);
      return;
    }
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`)
      .then((res) => res.json())
      .then((json) => setHits(json.data ?? []))
      .catch(() => setHits([]));
  }, [debounced]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t("search")} value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>{t("emptySearch")}</CommandEmpty>
            <CommandGroup>
              {hits.map((hit) => (
                <CommandItem
                  key={hit.slug}
                  onSelect={() => {
                    onOpenChange(false);
                    router.push(`/products/${hit.slug}`);
                  }}
                >
                  {hit.brand.name} {hit.nameRu}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
