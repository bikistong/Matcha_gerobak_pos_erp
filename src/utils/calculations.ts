import { Product, ProductPrice, Ingredient, BOM, BOMDetail, ProductFinancialMetrics } from '../types';

/**
 * Format numeric value into Indonesian Rupiah (IDR) currency string.
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format float number into clean decimal presentation.
 */
export function formatDecimal(val: number, decimals: number = 1): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return val.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Find the active selling price for a product based on effective date rule (BR-PRD-003).
 * Price selected is the latest price where effectiveDate <= targetDate.
 */
export function getActiveProductPrice(
  productId: string,
  prices: ProductPrice[],
  targetDate: string = new Date().toISOString().split('T')[0]
): ProductPrice | null {
  const matchingPrices = prices
    .filter(p => p.productId === productId && p.effectiveDate <= targetDate)
    .sort((a, b) => {
      if (a.effectiveDate !== b.effectiveDate) {
        return b.effectiveDate.localeCompare(a.effectiveDate); // Descending date
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

  return matchingPrices[0] || null;
}

/**
 * Find active BOM for a product based on effective date and status = 'ACTIVE' (BR-PRD-004).
 */
export function getActiveProductBom(
  productId: string,
  boms: BOM[],
  targetDate: string = new Date().toISOString().split('T')[0]
): BOM | null {
  const activeBoms = boms
    .filter(b => b.productId === productId && b.status === 'ACTIVE' && b.effectiveDate <= targetDate)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

  return activeBoms[0] || null;
}

/**
 * Calculate total theoretical HPP (COGS) for a specific BOM & ingredient list.
 * Formula: Sum( Quantity * (1 + wastePercentage / 100) * Ingredient.avgCost )
 */
export function calculateTheoreticalHppForBom(
  bomId: string,
  bomDetails: BOMDetail[],
  ingredients: Ingredient[]
): { totalHpp: number; itemCount: number; details: Array<BOMDetail & { ingredientName: string; costContribution: number; unitCost: number }> } {
  const detailsForBom = bomDetails.filter(bd => bd.bomId === bomId);

  let totalHpp = 0;
  const enrichedDetails = detailsForBom.map(bd => {
    const ing = ingredients.find(i => i.id === bd.ingredientId);
    const unitCost = ing ? ing.avgCost : 0;
    const wasteFactor = 1 + ((bd.wastePercentage || 0) / 100);
    const costContribution = bd.quantity * wasteFactor * unitCost;

    totalHpp += costContribution;

    return {
      ...bd,
      ingredientName: ing ? ing.name : 'Unknown Ingredient',
      costContribution,
      unitCost,
    };
  });

  return {
    totalHpp,
    itemCount: detailsForBom.length,
    details: enrichedDetails,
  };
}

/**
 * Compute full financial metrics for a single product.
 */
export function computeProductMetrics(
  product: Product,
  prices: ProductPrice[],
  boms: BOM[],
  bomDetails: BOMDetail[],
  ingredients: Ingredient[],
  targetDate: string = new Date().toISOString().split('T')[0]
): ProductFinancialMetrics {
  const activePriceObj = getActiveProductPrice(product.id, prices, targetDate);
  const activeSellingPrice = activePriceObj ? activePriceObj.sellingPrice : 0;
  const priceEffectiveDate = activePriceObj ? activePriceObj.effectiveDate : null;

  const activeBom = getActiveProductBom(product.id, boms, targetDate);
  let theoreticalHpp = 0;
  let bomItemCount = 0;
  let bomVersion: string | null = null;

  if (activeBom) {
    bomVersion = activeBom.version;
    const calc = calculateTheoreticalHppForBom(activeBom.id, bomDetails, ingredients);
    theoreticalHpp = calc.totalHpp;
    bomItemCount = calc.itemCount;
  }

  const grossMarginNominal = activeSellingPrice - theoreticalHpp;
  const grossMarginPercentage = activeSellingPrice > 0
    ? (grossMarginNominal / activeSellingPrice) * 100
    : 0;

  // Validation according to BR-PRD-010
  const validationErrors: string[] = [];
  if (!activePriceObj || activeSellingPrice <= 0) {
    validationErrors.push('Belum memiliki harga jual aktif (BR-PRD-003 & BR-PRD-009)');
  }
  if (!activeBom) {
    validationErrors.push('Belum memiliki BOM berstatus ACTIVE (BR-PRD-004)');
  } else if (bomItemCount === 0) {
    validationErrors.push('BOM aktif belum memiliki item rincian bahan baku (BR-PRD-010)');
  }

  const isEligibleForSale = validationErrors.length === 0;

  return {
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    category: product.category,
    status: product.status,
    activeSellingPrice,
    priceEffectiveDate,
    theoreticalHpp,
    grossMarginNominal,
    grossMarginPercentage,
    bomVersion,
    bomItemCount,
    isEligibleForSale,
    validationErrors,
  };
}

/**
 * Get Gross Margin health indicator info.
 */
export const formatRupiah = formatIDR;

/**
 * Get Gross Margin health indicator info.
 */
export function getMarginHealthBadge(marginPercent: number) {
  if (marginPercent >= 60) {
    return {
      label: 'Sangat Sehat (>60%)',
      colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      barColor: 'bg-emerald-500',
    };
  }
  if (marginPercent >= 40) {
    return {
      label: 'Sehat (40-60%)',
      colorClass: 'bg-teal-100 text-teal-800 border-teal-300',
      barColor: 'bg-teal-500',
    };
  }
  if (marginPercent > 0) {
    return {
      label: 'Margin Rendah (<40%)',
      colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
      barColor: 'bg-amber-500',
    };
  }
  return {
    label: 'Rugi (HPP > Harga)',
    colorClass: 'bg-rose-100 text-rose-800 border-rose-300',
    barColor: 'bg-rose-500',
  };
}

/**
 * Get numerical active selling price for product on target date.
 */
export function getActivePriceForDate(
  productId: string,
  prices: ProductPrice[],
  targetDate: string = new Date().toISOString().split('T')[0]
): number {
  const pObj = getActiveProductPrice(productId, prices, targetDate);
  return pObj ? pObj.sellingPrice : 0;
}

/**
 * Compute total BOM COGS cost for product on target date.
 */
export function computeBOMCOGS(
  productId: string,
  boms: BOM[],
  bomDetails: BOMDetail[],
  ingredients: Ingredient[],
  targetDate: string = new Date().toISOString().split('T')[0]
): number {
  const activeBom = getActiveProductBom(productId, boms, targetDate);
  if (!activeBom) return 0;
  return calculateTheoreticalHppForBom(activeBom.id, bomDetails, ingredients).totalHpp;
}
