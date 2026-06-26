-- Remove BORDADO from CustomizationMethod enum and rename IMPRESSAO_UV -> DIGITAL_UV.
-- Affected columns: Product.customizationMethods (CustomizationMethod[]), QuoteItem.metodo (CustomizationMethod[]).
-- Strategy: drop down to text[] first, remap legacy values as plain text, then
-- recreate the enum and cast back. Avoids any ambiguity casting old-enum
-- literals directly against a CASE expression.

-- 1. Convert affected columns to a plain text[] representation.
ALTER TABLE "Product" ALTER COLUMN "customizationMethods" TYPE text[] USING "customizationMethods"::text[];
ALTER TABLE "QuoteItem" ALTER COLUMN "metodo" TYPE text[] USING "metodo"::text[];

-- 2. Drop the old enum (no column references it anymore) and recreate it
--    with the final, reduced set of values.
DROP TYPE "CustomizationMethod";
CREATE TYPE "CustomizationMethod" AS ENUM ('GRAVACAO_LASER', 'SILK_SCREEN', 'DIGITAL_UV', 'TRANSFER');

-- 3. Remap legacy values while the columns are still plain text[].
UPDATE "Product" SET "customizationMethods" = ARRAY(
  SELECT CASE v
    WHEN 'BORDADO' THEN 'GRAVACAO_LASER'
    WHEN 'IMPRESSAO_UV' THEN 'DIGITAL_UV'
    ELSE v
  END
  FROM unnest("customizationMethods") v
);

UPDATE "QuoteItem" SET "metodo" = ARRAY(
  SELECT CASE v
    WHEN 'BORDADO' THEN 'GRAVACAO_LASER'
    WHEN 'IMPRESSAO_UV' THEN 'DIGITAL_UV'
    ELSE v
  END
  FROM unnest("metodo") v
);

-- 4. Cast the columns back to the (new) enum array type.
ALTER TABLE "Product" ALTER COLUMN "customizationMethods" TYPE "CustomizationMethod"[] USING "customizationMethods"::"CustomizationMethod"[];
ALTER TABLE "QuoteItem" ALTER COLUMN "metodo" TYPE "CustomizationMethod"[] USING "metodo"::"CustomizationMethod"[];
