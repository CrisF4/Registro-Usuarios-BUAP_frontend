# CRUD de Eventos Académicos - Frontend

Frontend para la gestión de eventos académicos de la Facultad de Computación BUAP, desarrollado con Angular 16 y Django.

## Contenido

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Scripts Disponibles](#scripts-disponibles)
- [Arquitectura](#arquitectura)
- [Autores](#autores)

### Características

- Gestión completa de eventos académicos (Crear, Leer, Actualizar, Eliminar)
- Gestión de usuarios (Administradores, Maestros, Alumnos)
- Autenticación JWT con roles (Administrador, Maestro, Alumno)
- Validaciones en tiempo real en formularios reactivos
- Tablas dinámicas con paginación, ordenamiento y filtros
- Gráficas estadísticas
- Diseño 100% responsive

## Tecnologías

**Angular**  16.2.0 
**Angular Material**  16.2.14 
**TypeScript**  5.1.3
**RxJS**  7.8.0
**Bootstrap**  5.3.8
**Chart.js**  4.5.1
**ng2-charts**  5.0.4
**ngx-material-timepicker**  13.1.1
**ngx-mask**  16.4.2
**ngx-cookie-service**  16.1.0

## Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Angular CLI** >= 16.x

### Verificar instalación:

```cmd
node --version
npm --version
ng version
```

## Instalación

### 1. Clonar el repositorio

```powershell
git clone https://github.com/CrisF4/Registro-de-Usuarios-BUAP.git
cd Registro-de-Usuarios-BUAP/app-movil-escolar-webapp
```

### 2. Instalar dependencias

```powershell
npm install
```

Esto instalará todas las dependencias listadas en `package.json`

## Configuración

### Configurar URL del Backend

Edita el archivo (url_api) de entornos según tu configuración:

**Desarrollo:** `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  url_api: 'http://localhost:8000/api/'
};
```

**Producción:** `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  url_api: 'https://tu-backend.com/api/'
};
```

## Ejecución

### Modo Desarrollo (LOCAL)

```powershell
npm start
# o
ng serve -o
```

La aplicación estará disponible en: **http://localhost:4200**

## Despliegue a producción

En un servicio como Vercel, solo hay que seguir los pasos que la misma pagina te ofrece para desplegar un servicio web estatico.

Solo ten cuidado con el tamaño del 'budget' que asignas dentro de angular.json.
Lo recomendable es utilizar un tamaño de 4mb para no tener ningun problema al desplegar.
Ademas, agrega al apartado de "production" las configuraciones para que se utilice la direccion de api de tu backend desplegado en producción.
Tu archivo deberia de quedar asi:

``` json
"configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "4mb",
                  "maximumError": "4mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "4mb",
                  "maximumError": "4mb"
                }
```
