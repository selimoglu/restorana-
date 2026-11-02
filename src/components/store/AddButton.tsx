"use client";

import { useCart } from "./cart";

export function AddButton({ item, disabled }: { item: { id: string; name: string; price: number }; disabled?: boolean }) {
  const { add, setOpen } = useCart();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        add(item);
        setOpen(true);
      }}
      className="btn-primary px-3 py-1.5"
      aria-label={`${item.name} sepete ekle`}
    >
      {disabled ? "Tükendi" : "+ Ekle"}
    </button>
  );
}
