# 🏫 Sistema de Gestión Escolar - Web App (Frontend)

Este proyecto es una **Single Page Application (SPA)** desarrollada en **Angular** diseñada para la administración integral de una institución académica. Permite la gestión de usuarios (Administradores, Maestros, Alumnos), registro de materias con validación de horarios y visualización de estadísticas.

## 🚀 Tecnologías y Herramientas

El proyecto utiliza un stack moderno basado en componentes y diseño reactivo:

* **Framework:** Angular 15+
* **Lenguaje:** TypeScript / SCSS
* **UI Frameworks:** * Angular Material (Componentes visuales)
    * Bootstrap 5 (Sistema de rejillas y utilidades)
* **Librerías Clave:**
    * `ngx-material-timepicker` (v5.5.3): Selección de horarios estilo reloj circular.
    * `ng2-charts` / `chart.js`: Visualización de gráficas estadísticas.
    * `ngx-mask`: Máscaras para inputs (teléfonos, fechas).
    * `ngx-cookie-service`: Manejo de sesiones persistentes.

## 🛠 Funcionalidades Principales

1.  **Autenticación y Seguridad:**
    * Login con validación de credenciales y tokens JWT.
    * Guards para protección de rutas según roles.
    * Layouts diferenciados (`AuthLayout` para login, `DashboardLayout` para el sistema).

2.  **Gestión de Usuarios (CRUD):**
    * Registro de Administradores, Maestros y Alumnos.
    * Validaciones específicas (RFC para admins, CURP para alumnos).
    * Tablas con paginación y filtros de búsqueda.

3.  **Módulo de Materias:**
    * Registro con validación de **NRC único**.
    * **Selector de Horario:** Implementación de lógica para validar que la hora de inicio sea menor a la hora fin.
    * Asignación de días y profesores.

4.  **Dashboard Interactivo:**
    * Gráficas de barras, líneas y pastel mostrando estadísticas de usuarios y eventos.

## 📦 Instalación y Configuración

Sigue estos pasos para levantar el proyecto en tu entorno local:

### Prerrequisitos
* Node.js (v16 o superior recomendado)
* Angular CLI (`npm install -g @angular/cli`)

### Pasos
1.  **Clonar el repositorio:**
    ```bash
    git clone <url-de-tu-repo>
    cd app-movil-escolar-webapp
    ```

2.  **Instalar dependencias:**
    *Nota: Se usan versiones específicas para evitar conflictos con Ivy.*
    ```bash
    npm install
    ```

3.  **Ejecutar el servidor de desarrollo:**
    ```bash
    ng serve
    ```
    La aplicación estará disponible en `http://localhost:4200/`.

## 📂 Estructura del Proyecto

```text
src/app/
├── layouts/          # Plantillas base (Auth y Dashboard)
├── modals/           # Ventanas emergentes (Eliminar/Editar usuario)
├── partials/         # Componentes reusables (Navbar, Sidebar, Formularios)
├── screens/          # Vistas principales (Login, Home, Usuarios, Materias)
├── services/         # Comunicación con API y Facade (Session)
└── tools/            # Validadores y manejo de errores
