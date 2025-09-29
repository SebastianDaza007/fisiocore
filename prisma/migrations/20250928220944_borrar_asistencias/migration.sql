/*
  Warnings:

  - You are about to drop the column `asistencia_id` on the `turnos` table. All the data in the column will be lost.
  - You are about to drop the `asistencias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."turnos" DROP CONSTRAINT "turnos_asistencia_id_fkey";

-- AlterTable
ALTER TABLE "public"."turnos" DROP COLUMN "asistencia_id",
ALTER COLUMN "estado_turno_id" SET DEFAULT 2;

-- DropTable
DROP TABLE "public"."asistencias";
