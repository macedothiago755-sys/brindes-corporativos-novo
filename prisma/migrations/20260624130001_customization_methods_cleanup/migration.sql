-- Remove BORDADO from CustomizationMethod enum and rename IMPRESSAO_UV -> DIGITAL_UV.
-- Affected columns: Product.customizationMethods (CustomizationMethod[]), QuoteItem.metodo (CustomizationMethod[]).

-- 1. Rename existing enum out of the way.
ALTER TYPE "CustomizationMethod" RENAME TO "CustomizationMethod_old";

-- 2. Create new enum with the correct, final set of values.
CREATE TYPE "CustomizationMethod" AS ENUM ('GRAVACAO_LASER', 'SILK_SCREEN', 'DIGITAL_UV', 'TRANSFER');

-- 3. Migrate Product.customizationMethods (array column).
ALTER TABLE "Product"
  ALTER COLUMN "customizationMethods" TYPE "CustomizationMethod"[]
  USING (
    ARRAY(
      SELECT CASE x
        WHEN 'BORDADO' THEN 'GRAVACAO_LASER'
        WHEN 'IMPRESSAO_UV' THEN 'DIGITAL_UV'
        ELSE x::text
      END::"CustomizationMethod"
      FROM unnest("customizationMethods") x
    )
  );

-- 4. Migrate QuoteItem.metodo (array column).
ALTER TABLE "QuoteItem"
  ALTER COLUMN "metodo" TYPE "CustomizationMethod"[]
  USING (
    ARRAY(
      SELECT CASE x
        WHEN 'BORDADO' THEN 'GRAVACAO_LASER'
        WHEN 'IMPRESSAO_UV' THEN 'DIGITAL_UV'
        ELSE x::text
      END::"CustomizationMethod"
      FROM unnest("metodo") x
    )
  );

-- 5. Drop the old enum type, no longer referenced.
DROP TYPE "CustomizationMethod_old";
