-- La disponibilidad se consulta por nombre; ya no se registra la presentación.
ALTER TABLE "products" DROP COLUMN IF EXISTS "unit";
