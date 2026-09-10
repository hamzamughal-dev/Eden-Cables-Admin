export interface ParsedQuoteItem {
  product_id: string;
  product_name: string;
  dimension?: string;
  quantity: number;
  unit: "meter" | "coil";
  unit_price: number;
  line_total: number;
}

export interface ParsedQuoteDetails {
  items: ParsedQuoteItem[];
  requirementsNotes: string;
  totalEstimatedCost: number;
  totalItemsCount: number;
  isMultiItem: boolean;
}

/**
 * Parses raw requirements string to extract structured quote items, quantities, units,
 * and customer notes (with backward-compatibility fallback for legacy single product requests).
 */
export function parseQuoteDetails(
  rawRequirements?: string | null,
  fallbackProduct?: {
    id?: string;
    name?: string;
    dimension?: string;
    price?: number;
  } | null
): ParsedQuoteDetails {
  if (rawRequirements) {
    const match = rawRequirements.match(/<!--QUOTE_DATA:([\s\S]*?)-->/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          const items: ParsedQuoteItem[] = parsed.items.map((it: any) => ({
            product_id: it.product_id || "",
            product_name: it.product_name || "Conductor Cable",
            dimension: it.dimension || "",
            quantity: Number(it.quantity) || 1,
            unit: it.unit === "coil" ? "coil" : "meter",
            unit_price: Number(it.unit_price) || 0,
            line_total:
              it.line_total !== undefined
                ? Number(it.line_total)
                : (Number(it.quantity) || 1) *
                  (Number(it.unit_price) || 0) *
                  (it.unit === "coil" ? 90 : 1),
          }));

          const totalEstimatedCost =
            parsed.totalEstimatedCost !== undefined
              ? Number(parsed.totalEstimatedCost)
              : items.reduce((acc, it) => acc + it.line_total, 0);

          return {
            items,
            requirementsNotes: parsed.requirements || "",
            totalEstimatedCost,
            totalItemsCount: items.length,
            isMultiItem: true,
          };
        }
      } catch (e) {
        // Continue to fallback
      }
    }
  }

  // Fallback for legacy requests without JSON block
  const cleanedNotes = (rawRequirements || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  const fallbackPrice = fallbackProduct ? Number(fallbackProduct.price) || 0 : 0;
  const items: ParsedQuoteItem[] = fallbackProduct
    ? [
        {
          product_id: fallbackProduct.id || "",
          product_name: fallbackProduct.name || "Cable Specification",
          dimension: fallbackProduct.dimension || "",
          quantity: 1,
          unit: "meter",
          unit_price: fallbackPrice,
          line_total: fallbackPrice,
        },
      ]
    : [];

  return {
    items,
    requirementsNotes: cleanedNotes,
    totalEstimatedCost: fallbackPrice,
    totalItemsCount: items.length,
    isMultiItem: false,
  };
}
