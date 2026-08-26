export function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="tracking-tight text-beige" aria-label={`${value.toFixed(1)} / 5`}>
      {"★★★★★".slice(0, rounded)}
      <span className="text-muted-foreground">{"★★★★★".slice(rounded)}</span>
    </span>
  );
}
