# FisioCore

Centro de Atención Médica a Pacientes - Sistema de Gestión Integral para Centros de Rehabilitación Física

## 📋 Descripción del Proyecto

FisioCore es una aplicación web diseñada para la gestión integral de centros de rehabilitación física. El sistema permite administrar pacientes, profesionales, turnos, historias clínicas y generar reportes de manera eficiente.

## 🎯 Objetivos del Sistema

### Roles Principales
- **Mesa de entrada**: Gestión de pacientes y turnos
- **Profesionales**: Acceso a calendarios y historias clínicas
- **Gerente**: Supervisión general y acceso a dashboards
- **Paciente**: Rol opcional para futuras funcionalidades

## ⚡ Funcionalidades Principales

### 1. 👥 Gestión de Pacientes
- ✅ Registro de pacientes con datos identificatorios
- ✅ Gestión de datos de contacto
- ✅ Administración de obras sociales
- ✅ API REST para operaciones CRUD

### 2. 👨‍⚕️ Gestión de Profesionales
- Datos identificatorios y matrícula
- Especialidades médicas
- Disponibilidad horaria (días/horarios)
- Obras sociales asociadas

### 3. 📅 Gestión de Turnos
- **Alta de turnos** *(funcionalidad clave)*
- Datos: fecha, horario, profesional, obra social
- Cancelación de turnos
- Modificación de turnos
- Prioridad de urgencias (opcional)

### 4. 🗓️ Sistema de Calendarios
- Acceso personalizado por rol
- Profesionales: calendario individual
- Gerente: múltiples profesionales
- **Filtros disponibles:**
  - Turnos por paciente
  - Turnos por profesional
  - Turnos cancelados
  - Turnos del día
- Múltiples vistas de calendario

### 5. 📋 Historia Clínica Digital
- Registro de atenciones pasadas
- Anotaciones de profesionales
- Diagnósticos y prácticas
- Gestión de archivos adjuntos

### 6. 📊 Dashboards e Indicadores
- Métricas operacionales
- Reportes gerenciales
- *(Implementación en incrementos futuros)*

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15.5.3 con React 19.1.0
- **Styling**: TailwindCSS 4.0, PrimeReact 10.9.7
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL con Prisma ORM
- **TypeScript**: Desarrollo type-safe
- **Herramientas**: ESLint para calidad de código

## 📁 Estructura del Proyecto

```
fisiocore/
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   └── migrations/            # Migraciones de BD
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── paciente/     # ✅ Endpoints de pacientes
│   │   │   └── obras_sociales/ # Endpoints de obras sociales
│   │   ├── (centro)/         # Layout del centro médico
│   │   │   └── paciente/     # ✅ Gestión de pacientes
│   │   └── globals.css
│   └── components/
│       ├── common/           # Componentes reutilizables
│       │   ├── header.tsx
│       │   ├── button.tsx
│       │   └── inputs/
│       └── pages/
│           └── centro_layout/ # Layout del centro
├── public/
└── package.json
```

## 🗄️ Modelo de Datos

### Entidades Principales
- **usuarios**: Sistema de usuarios y roles
- **pacientes**: ✅ Información de pacientes
- **profesionales**: Datos de profesionales médicos
- **especialidades**: Especialidades médicas
- **obras_sociales**: ✅ Sistemas de salud
- **turnos**: Sistema de citas médicas
- **horarios_profesionales**: Disponibilidad
- **registros_clinicos**: Historia clínica
- **estados_turno**: Estados de los turnos

## 🚀 Instalación y Configuración

### Prerequisitos
- Node.js 18+
- PostgreSQL
- npm o yarn

### Configuración del entorno

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd fisiocore
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/fisiocore"
```

4. **Configurar la base de datos**
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción
npm start            # Servidor de producción
npm run lint         # Linting con ESLint
```

## 🏗️ Desarrollo por Incrementos

### Incremento 1 ✅
- ✅ Configuración inicial del proyecto
- ✅ Modelo de base de datos
- ✅ Gestión básica de pacientes
- ✅ API de pacientes y obras sociales
- ✅ Interfaz de registro de pacientes

### Incremento 2 (En desarrollo)
- Gestión de profesionales
- Sistema de turnos
- Calendarios básicos

### Incremento 3 (Planificado)
- Historia clínica
- Dashboards e indicadores
- Optimizaciones

## 🔐 Características de Seguridad

- Validación de datos en API
- Sanitización de inputs
- Gestión de errores robusta
- Conexiones seguras a BD

## 📚 API Endpoints

### Pacientes
- `POST /api/paciente` - Crear paciente
- `GET /api/paciente` - Listar pacientes

### Obras Sociales
- `GET /api/obras_sociales` - Listar obras sociales

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades, crear un issue en el repositorio del proyecto.

## 📋 LINEAMIENTOS Y CONSIDERACIONES ACADÉMICAS

### 🎓 Contexto Académico - Desarrollo Ágil
Este proyecto es parte de una materia de **Desarrollo Ágil** y debe cumplir estrictamente con los siguientes lineamientos académicos:

#### 🗂️ Estructura de Carpetas Obligatoria
**Carpeta principal**: "Grupo - Desarrollo Ágil"
**Subcarpetas requeridas**:
- **Incremento 0** - Documentación inicial
- **Incremento 1** - Primer sprint de desarrollo
- **Incremento 2** - Segundo sprint de desarrollo
- **Incremento 3** - Tercer sprint de desarrollo
- **Documentación Sw** - Documentación técnica por incremento
- **Otros** - Archivos adicionales

#### 📝 INCREMENTO 0 - Documentación Requerida
**Documentos obligatorios**:
1. **Mapa de Historias Inicial** - Planificación completa de los 3 incrementos
2. **Configuración del Entorno de Desarrollo** - Setup detallado

#### 📝 INCREMENTOS 1-3 - Documentación por Sprint
**Para cada incremento se debe documentar**:

**a) Reunión de Planificación**:
- Velocity del equipo
- Fotos del momento de la reunión
- Mapa de historias actualizado al momento
- Actas de reunión

**b) Historias de Usuario**:
- Historias comprometidas en la iteración
- Criterios de aceptación de cada historia
- Priorización de historias representativas del incremento

**c) Reuniones Diarias (Daily Standups)**:
- Mínimo 3 reuniones diarias documentadas
- Identificación clara del día de cada reunión
- Tablero de tareas actualizado
- Estado de progreso individual

**d) Plan de Pruebas**:
- Al menos 2 historias de usuario con plan de pruebas
- Criterios de aceptación representativos
- Casos de prueba específicos

**e) Consideraciones de Construcción**:
- Herramientas utilizadas
- Inconvenientes técnicos encontrados
- Resolución de problemas técnicos
- Decisiones de arquitectura

**f) Documentación del Equipo**:
- Trabajo colaborativo realizado
- Roles utilizados y asignados
- Inconvenientes de equipo y resolución
- Comunicación y coordinación

**g) Conclusiones Grupales**:
- Reuniones de revisión del incremento
- Retrospectiva del equipo
- Lecciones aprendidas
- Mejoras para el próximo sprint

#### 📊 DOCUMENTACIÓN SW - Por Funcionalidad
**Por cada incremento y funcionalidad construida**:

**a) Diagrama de Componentes + Flujo de Datos**:
- Interacción entre entornos de ejecución
- Dependencias del sistema
- Arquitectura de componentes
- Flujo de información

**b) Modelo de Datos Incremental**:
- Solo funcionalidades del incremento actual
- Relaciones específicas implementadas
- Evolución del modelo por sprint

### 🎨 Elementos de Identidad del Producto
**Requerimientos obligatorios**:
- ✅ **Nombre**: FisioCore
- ❌ **Logo**: Pendiente de diseño
- ✅ **Estilos**: TailwindCSS + PrimeReact implementados

---

## 🚀 GUÍA DE DESARROLLO PARA CLAUDE

### 📋 Estado Actual del Proyecto

#### ✅ INCREMENTO 1 - COMPLETADO
**Funcionalidades Implementadas**:
- ✅ Configuración inicial con Next.js + Prisma + TailwindCSS
- ✅ Modelo de base de datos completo (schema.prisma)
- ✅ API de gestión de pacientes (`/api/paciente/`)
- ✅ API de obras sociales (`/api/obras_sociales/`)
- ✅ Interfaz de registro de pacientes con modal
- ✅ Layout básico del centro médico
- ✅ Componentes reutilizables (Header, Button, inputs)

**Archivos clave implementados**:
- `prisma/schema.prisma` - Modelo completo de datos
- `src/app/api/paciente/route.ts` - CRUD de pacientes
- `src/app/(centro)/paciente/page.tsx` - UI de gestión
- `src/app/(centro)/paciente/Modal.tsx` - Modal de registro
- `src/components/common/` - Componentes base

#### 🔄 INCREMENTO 2 - EN DESARROLLO
**Funcionalidades Pendientes**:
- Gestión completa de profesionales
- Sistema de turnos (funcionalidad clave)
- Calendarios básicos por rol
- Autenticación y autorización

#### 📋 INCREMENTO 3 - PLANIFICADO
- Historia clínica digital
- Dashboards e indicadores
- Optimizaciones de rendimiento
- Funcionalidades avanzadas

### 🗄️ Arquitectura y Stack Tecnológico

**Frontend**:
- Next.js 15.5.3 (App Router)
- React 19.1.0
- TypeScript para type safety
- TailwindCSS 4.0 para estilos
- PrimeReact 10.9.7 para componentes UI

**Backend**:
- Next.js API Routes
- Prisma ORM para base de datos
- PostgreSQL como SGBD

**Herramientas de Desarrollo**:
- ESLint para calidad de código
- Turbopack para desarrollo rápido
- Git para control de versiones

### 📐 Convenciones y Patrones

**Estructura de Carpetas**:
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (centro)/         # Layout grupo del centro médico
│   └── globals.css       # Estilos globales
├── components/            # Componentes React
│   ├── common/           # Componentes reutilizables
│   └── pages/            # Componentes específicos de página
prisma/                   # Base de datos
├── schema.prisma        # Modelo de datos
└── migrations/          # Migraciones
```

**Convenciones de Código**:
- Uso de TypeScript en todos los archivos
- Componentes funcionales con hooks
- API Routes con validación de datos
- Manejo de errores robusto
- Responsive design con TailwindCSS

### 🔍 Modelo de Datos Detallado

**Entidades Implementadas**:

1. **usuarios** - Sistema de usuarios y roles
   - Campos: id, nombre, apellido, dni, email, password_hash, rol_id
   - Relaciones: roles, profesionales, turnos

2. **pacientes** ✅ - Información completa de pacientes
   - Campos: id, nombre, apellido, dni, email, teléfono, fecha_nacimiento, dirección
   - Relaciones: obras_sociales, turnos, registros_clinicos

3. **profesionales** - Datos de profesionales médicos
   - Campos: id, usuario_id, matricula, especialidad_id
   - Relaciones: usuarios, especialidades, horarios, turnos

4. **obras_sociales** ✅ - Sistemas de salud
   - Campos: id, nombre_obra_social
   - Relaciones: pacientes, profesionales

5. **turnos** - Sistema de citas médicas
   - Campos: id, paciente_id, profesional_id, fecha, hora, estado, tipo_consulta
   - Relaciones: pacientes, profesionales, estados_turno

### ⚙️ Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo con Turbopack

# Calidad de código
npm run lint             # Linting con ESLint
npm run build            # Build de producción
npm start                # Servidor de producción

# Base de datos
npx prisma generate      # Generar cliente Prisma
npx prisma migrate dev   # Crear y aplicar migración
npx prisma studio        # Interface gráfica de BD
npx prisma db seed       # Poblar BD con datos de prueba

# Git
git status              # Estado del repositorio
git add .               # Agregar cambios
git commit -m "mensaje"  # Commit con mensaje
git push origin dev     # Push a rama dev
```

### 🎯 Próximos Pasos Críticos

**Para Incremento 2**:
1. **Gestión de Profesionales** - CRUD completo
2. **Sistema de Turnos** - Funcionalidad clave del incremento
3. **Autenticación básica** - Login/logout
4. **Calendarios por rol** - Vista profesionales/gerente

**Funcionalidades de Alta Prioridad**:
- Alta de turnos (fecha, horario, profesional, obra social)
- Calendario de profesionales
- Filtros de turnos (paciente, profesional, estado)
- Validaciones robustas en APIs

### 📚 Recursos y Referencias
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [PrimeReact Components](https://primereact.org/)

---

## ⚠️ INSTRUCCIONES PARA CLAUDE

**Cuando te soliciten ayuda con el proyecto**:

1. **Siempre revisar el estado actual** en CLAUDE.md antes de hacer cambios
2. **Seguir las convenciones establecidas** en el código existente
3. **Validar que las nuevas funcionalidades** encajan con el modelo de datos
4. **Generar documentación académica** siguiendo los lineamientos específicos
5. **Mantener coherencia** con el stack tecnológico definido
6. **Priorizar funcionalidades** según el incremento actual
7. **Crear código production-ready** con manejo de errores

**Para documentación académica**:
- Usar los formatos específicos requeridos por la cátedra
- Incluir evidencia visual (fotos, diagramas, capturas)
- Documentar proceso de desarrollo ágil completo
- Mantener trazabilidad de historias de usuario

**Para desarrollo técnico**:
- TypeScript en todo momento
- Validaciones robustas en APIs
- Componentes reutilizables
- Responsive design
- Manejo de errores consistente