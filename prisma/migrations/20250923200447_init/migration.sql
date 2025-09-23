-- CreateTable
CREATE TABLE "public"."asistencias" (
    "id_asistencia" SERIAL NOT NULL,
    "nombre_asistencia" VARCHAR(25) NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id_asistencia")
);

-- CreateTable
CREATE TABLE "public"."dias_inhabilitados" (
    "id_dia_inhabilitado" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "motivo" VARCHAR NOT NULL,
    "todo_el_dia" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "dias_inhabilitados_pkey" PRIMARY KEY ("id_dia_inhabilitado")
);

-- CreateTable
CREATE TABLE "public"."dias_semana" (
    "id_dia" SERIAL NOT NULL,
    "nombre_dia" VARCHAR(9) NOT NULL,

    CONSTRAINT "dias_semana_pkey" PRIMARY KEY ("id_dia")
);

-- CreateTable
CREATE TABLE "public"."especialidades" (
    "id_especialidad" SERIAL NOT NULL,
    "nombre_especialidad" VARCHAR NOT NULL,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id_especialidad")
);

-- CreateTable
CREATE TABLE "public"."estados_turno" (
    "id_estado_turno" SERIAL NOT NULL,
    "nombre_estado_turno" VARCHAR(25) NOT NULL,

    CONSTRAINT "estados_turno_pkey" PRIMARY KEY ("id_estado_turno")
);

-- CreateTable
CREATE TABLE "public"."horarios_profesionales" (
    "id_horario" SERIAL NOT NULL,
    "profesional_id" INTEGER NOT NULL,
    "dia_semana_id" INTEGER NOT NULL,
    "hora_inicio" TIME(6) NOT NULL,
    "hora_fin" TIME(6) NOT NULL,
    "duracion_turno" INTEGER NOT NULL,

    CONSTRAINT "horarios_profesionales_pkey" PRIMARY KEY ("id_horario")
);

-- CreateTable
CREATE TABLE "public"."obras_sociales" (
    "id_obra_social" SERIAL NOT NULL,
    "nombre_obra_social" VARCHAR NOT NULL,

    CONSTRAINT "obras_sociales_pkey" PRIMARY KEY ("id_obra_social")
);

-- CreateTable
CREATE TABLE "public"."pacientes" (
    "id_paciente" SERIAL NOT NULL,
    "nombre_paciente" VARCHAR(40) NOT NULL,
    "apellido_paciente" VARCHAR(40) NOT NULL,
    "email_paciente" VARCHAR(150),
    "dni_paciente" VARCHAR(8) NOT NULL,
    "telefono_paciente" VARCHAR(20) NOT NULL,
    "fecha_nacimiento_paciente" DATE NOT NULL,
    "direccion_paciente" VARCHAR,
    "obra_social_id" INTEGER NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id_paciente")
);

-- CreateTable
CREATE TABLE "public"."profesionales" (
    "id_profesional" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "matricula_profesional" VARCHAR NOT NULL,
    "especialidad_id" INTEGER NOT NULL,

    CONSTRAINT "profesionales_pkey" PRIMARY KEY ("id_profesional")
);

-- CreateTable
CREATE TABLE "public"."profesionales_por_obras_sociales" (
    "id_profesional_obra" SERIAL NOT NULL,
    "profesional_id" INTEGER NOT NULL,
    "obra_social_id" INTEGER NOT NULL,

    CONSTRAINT "profesionales_por_obras_sociales_pkey" PRIMARY KEY ("id_profesional_obra")
);

-- CreateTable
CREATE TABLE "public"."registros_clinicos" (
    "id_registro" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "turno_id" INTEGER NOT NULL,
    "profesional_id" INTEGER NOT NULL,
    "texto_comentario" TEXT,
    "texto_indicacion" TEXT,
    "fecha_registro" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "registros_clinicos_pkey" PRIMARY KEY ("id_registro")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "public"."tipos_consulta" (
    "id_tipo_consulta" SERIAL NOT NULL,
    "nombre_tipo_consulta" VARCHAR(40) NOT NULL,

    CONSTRAINT "tipos_consulta_pkey" PRIMARY KEY ("id_tipo_consulta")
);

-- CreateTable
CREATE TABLE "public"."turnos" (
    "id_turno" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "profesional_id" INTEGER NOT NULL,
    "fecha_hora_turno" TIMESTAMP(6) NOT NULL,
    "estado_turno_id" INTEGER NOT NULL,
    "asistencia_id" INTEGER NOT NULL,
    "tipo_consulta_id" INTEGER NOT NULL,
    "fecha_agendamiento_turno" TIMESTAMP(6) NOT NULL,
    "creado_por_usuario_id" INTEGER NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id_turno")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_usuario" VARCHAR(40) NOT NULL,
    "apellido_usuario" VARCHAR(40) NOT NULL,
    "dni_usuario" VARCHAR(8) NOT NULL,
    "email_usuario" VARCHAR(150) NOT NULL,
    "password_hash_usuario" VARCHAR NOT NULL,
    "rol_id" INTEGER NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "profesionales_usuario_id_key" ON "public"."profesionales"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "profesionales_matricula_profesional_key" ON "public"."profesionales"("matricula_profesional");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_rol_key" ON "public"."roles"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_usuario_key" ON "public"."usuarios"("email_usuario");

-- AddForeignKey
ALTER TABLE "public"."horarios_profesionales" ADD CONSTRAINT "horarios_profesionales_dia_semana_id_fkey" FOREIGN KEY ("dia_semana_id") REFERENCES "public"."dias_semana"("id_dia") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."horarios_profesionales" ADD CONSTRAINT "horarios_profesionales_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id_profesional") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."pacientes" ADD CONSTRAINT "pacientes_obra_social_id_fkey" FOREIGN KEY ("obra_social_id") REFERENCES "public"."obras_sociales"("id_obra_social") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profesionales" ADD CONSTRAINT "profesionales_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "public"."especialidades"("id_especialidad") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profesionales" ADD CONSTRAINT "profesionales_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profesionales_por_obras_sociales" ADD CONSTRAINT "profesionales_por_obras_sociales_obra_social_id_fkey" FOREIGN KEY ("obra_social_id") REFERENCES "public"."obras_sociales"("id_obra_social") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profesionales_por_obras_sociales" ADD CONSTRAINT "profesionales_por_obras_sociales_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id_profesional") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."registros_clinicos" ADD CONSTRAINT "registros_clinicos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id_paciente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."registros_clinicos" ADD CONSTRAINT "registros_clinicos_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id_profesional") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."registros_clinicos" ADD CONSTRAINT "registros_clinicos_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "public"."turnos"("id_turno") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."turnos" ADD CONSTRAINT "turnos_asistencia_id_fkey" FOREIGN KEY ("asistencia_id") REFERENCES "public"."asistencias"("id_asistencia") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."turnos" ADD CONSTRAINT "turnos_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "public"."usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."turnos" ADD CONSTRAINT "turnos_estado_turno_id_fkey" FOREIGN KEY ("estado_turno_id") REFERENCES "public"."estados_turno"("id_estado_turno") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."turnos" ADD CONSTRAINT "turnos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id_paciente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."turnos" ADD CONSTRAINT "turnos_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id_profesional") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."turnos" ADD CONSTRAINT "turnos_tipo_consulta_id_fkey" FOREIGN KEY ("tipo_consulta_id") REFERENCES "public"."tipos_consulta"("id_tipo_consulta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION;
