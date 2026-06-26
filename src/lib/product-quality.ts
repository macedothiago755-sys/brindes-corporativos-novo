type QualityInput = {
  images: string[];
  shortDescription: string | null;
  categoryId: string | null;
};

export function productQualityScore(product: QualityInput) {
  let score = 100;
  if (product.images.length === 0) score -= 20;
  if (!product.shortDescription) score -= 20;
  if (!product.categoryId) score -= 20;
  return Math.max(score, 0);
}
