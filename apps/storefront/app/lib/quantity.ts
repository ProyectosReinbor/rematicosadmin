export function allowsFractionalQuantity(unit: string) {
  return /^(por )?(metro(s)?|metro_cuadrado|metro_lineal|kilogramo(s)?|libra(s)?|kg|m)$/i.test(
    unit.trim(),
  );
}
export function quantityStep(unit: string) {
  return allowsFractionalQuantity(unit) ? 0.1 : 1;
}
export function normalizeQuantity(value: number, unit: string) {
  const step = quantityStep(unit);
  return Math.min(
    999999,
    Math.max(
      step,
      Number.isFinite(value)
        ? step === 1
          ? Math.floor(value)
          : Math.round(value * 10) / 10
        : step,
    ),
  );
}
