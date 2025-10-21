-- AlterTable
ALTER TABLE "public"."pacientes" ADD COLUMN     "enfermedad_cronica" VARCHAR(150);

-- AlterTable
ALTER TABLE "public"."registros_clinicos" ADD COLUMN     "ejercicios_asignados" TEXT,
ADD COLUMN     "instrumentos_utilizados" TEXT,
ADD COLUMN     "nota_post_turno" TEXT,
ADD COLUMN     "objetivos_sesion" TEXT;
