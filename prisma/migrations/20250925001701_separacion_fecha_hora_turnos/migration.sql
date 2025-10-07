/*
  Warnings:

  - You are about to drop the column `fecha_hora_turno` on the `turnos` table. All the data in the column will be lost.
  - Added the required column `fecha_turno` to the `turnos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hora_turno` to the `turnos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."turnos" DROP COLUMN "fecha_hora_turno",
ADD COLUMN     "fecha_turno" DATE NOT NULL,
ADD COLUMN     "hora_turno" TIME(6) NOT NULL,
ALTER COLUMN "creado_por_usuario_id" DROP NOT NULL;
