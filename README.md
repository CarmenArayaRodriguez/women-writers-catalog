# Catálogo de Escritoras Latinoamericanas

Este proyecto es una aplicación web full-stack diseñada para difundir la obra de escritoras latinoamericanas. Cuenta con un catálogo público y un panel de administración seguro para la gestión de contenidos.

## Características Técnicas

El proyecto cumple con estándares modernos de desarrollo, seguridad y accesibilidad:
* **Arquitectura:** Node.js con Express.
* **Base de Datos:** PostgreSQL gestionado mediante **Prisma ORM**.
* **Seguridad:** * Implementación de **Helmet JS** para cabeceras de seguridad.
    * Protocolo **HTTPS** mediante certificados SSL locales.
    * Cifrado de contraseñas con **Bcrypt**.
    * Autenticación basada en **JSON Web Tokens (JWT)**.
* **Accesibilidad:** Interfaz optimizada con atributos **ARIA** y navegación por teclado, validada con auditorías de Google Lighthouse.

## Instrucciones de Instalación y Configuración

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar variables de entorno:** Crear un archivo `.env` en la raíz del proyecto con los siguientes parámetros:
    ```env
    DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db"
    JWT_SECRET="tu_clave_secreta_aqui"
    ```
3.  **Desplegar esquema de base de datos:**
    ```bash
    npx prisma migrate dev --name init
    ```
4.  **Cargar datos iniciales (Seeding):** Para poblar el catálogo con las 14 obras maestras preconfiguradas, ejecute:
    ```bash
    node seed.js
    ```
5.  **Iniciar la aplicación segura:**
    ```bash
    node app.js
    ```

## Acceso al Panel de Administración

Para gestionar el catálogo (añadir, editar o eliminar libros y autoras), utilice las siguientes credenciales en la ruta de administración:

* **URL:** `https://localhost:3000/login.html`
* **Usuario:** `admin@admin.com`
* **Contraseña:** `1234`

> **Nota sobre HTTPS:** Al utilizar un certificado SSL autofirmado para el entorno local, el navegador mostrará una advertencia de seguridad. Debe seleccionar **"Configuración avanzada"** y **"Acceder a localhost (sitio no seguro)"** para habilitar la conexión cifrada.Se incluyen los archivos `server.key` y `server.cert` en el repositorio solo para facilitar la revisión local; en producción, estos archivos deben omitirse mediante `.gitignore`.