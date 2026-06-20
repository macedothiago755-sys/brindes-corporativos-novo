import { prisma } from "@/lib/prisma";

export async function resolveCouponCode(rawCode: string | undefined | null) {
  const code = rawCode?.trim().toUpperCase();
  if (!code) return null;

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return null;

  return coupon.code;
}
