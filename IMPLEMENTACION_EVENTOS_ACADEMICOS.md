# Implementación del Sistema de Eventos Académicos

## 📋 Resumen de Implementación

Se ha implementado exitosamente el sistema CRUD completo para Eventos Académicos según los requerimientos del proyecto. A continuación se detallan todos los componentes creados y las instrucciones para conectar con el backend de Django.

---

## 🎯 Funcionalidades Implementadas

### ✅ 1. Menú Lateral (Sidebar)
- ✔️ Dropdown "Eventos Académicos" agregado al sidebar
- ✔️ Submenú con dos opciones:
  - "Registro de Eventos" (solo visible para administradores)
  - "Lista de Eventos" (visible para todos los roles)

### ✅ 2. Formulario de Registro
**Ubicación:** `src/app/partials/registro-eventos/`

**Campos implementados (11 campos):**
1. ✔️ Nombre del evento (validación: solo letras, números y espacios)
2. ✔️ Tipo de evento (select: Conferencia, Taller, Seminario, Concurso)
3. ✔️ Fecha de realización (DatePicker, no permite fechas pasadas)
4. ✔️ Hora de inicio (TimePicker)
5. ✔️ Hora de finalización (TimePicker, validación: debe ser posterior a hora inicio)
6. ✔️ Lugar (alfanumérico con espacios)
7. ✔️ Público objetivo (checkboxes: Estudiantes, Profesores, Público general)
8. ✔️ Programa educativo (select, solo aparece si se selecciona "Estudiantes")
9. ✔️ Responsable del evento (select con maestros y administradores)
10. ✔️ Descripción breve (textarea, máximo 300 caracteres)
11. ✔️ Cupo máximo de asistentes (numérico, máximo 3 dígitos)

**Validaciones implementadas:**
- ✔️ Todos los campos son obligatorios
- ✔️ Validación en tiempo real con keypress events
- ✔️ Validación de formatos específicos
- ✔️ Mensajes de error informativos

### ✅ 3. Tabla de Eventos
**Ubicación:** `src/app/screens/eventos-academicos-screen/`

**Características:**
- ✔️ Mat-Table con todas las columnas del evento
- ✔️ Paginación (5, 10, 25, 100 registros)
- ✔️ Filtrado por nombre de evento
- ✔️ Ordenamiento (sorting) por columnas
- ✔️ Botones de Editar y Eliminar (solo para administrador)

### ✅ 4. Sistema de Permisos por Rol

**Administrador:**
- ✔️ Puede registrar eventos
- ✔️ Puede ver todos los eventos
- ✔️ Puede editar cualquier evento
- ✔️ Puede eliminar cualquier evento

**Maestro:**
- ❌ No puede registrar eventos
- ✔️ Puede ver eventos para profesores y público general
- ❌ No puede editar ni eliminar eventos

**Alumno:**
- ❌ No puede registrar eventos
- ✔️ Puede ver eventos para estudiantes y público general
- ❌ No puede editar ni eliminar eventos

### ✅ 5. Modales
- ✔️ Modal de confirmación para eliminar eventos
- ✔️ Modal de advertencia para actualizar eventos

### ✅ 6. Servicio HTTP
**Ubicación:** `src/app/services/eventos.service.ts`

**Endpoints implementados:**
- `getEventos()` - Obtener todos los eventos
- `getEventoById(id)` - Obtener un evento específico
- `registrarEvento(evento)` - Crear nuevo evento
- `actualizarEvento(id, evento)` - Actualizar evento existente
- `eliminarEvento(id)` - Eliminar evento
- `getMaestrosYAdministradores()` - Obtener lista de responsables

### ✅ 7. Gráficas Dinámicas
- ✔️ Gráfica circular (pie) actualizada con datos reales de usuarios
- ✔️ Gráfica de dona (doughnut) actualizada con datos reales de usuarios
- ✔️ Servicio `getTotalUsuarios()` ya funcional

---

## 🔧 Configuración del Backend (Django)

### Endpoints Requeridos

Debes crear los siguientes endpoints en tu backend de Django:

#### 1. **Listar todos los eventos**
```
GET /api/eventos-academicos/
Headers: Authorization: Bearer {token}
Response: Array de eventos
```

#### 2. **Obtener evento por ID**
```
GET /api/eventos-academicos/{id}/
Headers: Authorization: Bearer {token}
Response: Objeto evento
```

#### 3. **Crear nuevo evento**
```
POST /api/eventos-academicos/
Headers: Authorization: Bearer {token}
Body: {
  "nombre_evento": "string",
  "tipo_evento": "string",
  "fecha_realizacion": "YYYY-MM-DD",
  "hora_inicio": "HH:MM",
  "hora_fin": "HH:MM",
  "lugar": "string",
  "publico_objetivo": ["string"],
  "programa_educativo": "string",
  "responsable": integer,
  "descripcion": "string",
  "cupo_maximo": integer
}
Response: Evento creado
```

#### 4. **Actualizar evento**
```
PUT /api/eventos-academicos/{id}/
Headers: Authorization: Bearer {token}
Body: Mismo formato que POST
Response: Evento actualizado
```

#### 5. **Eliminar evento**
```
DELETE /api/eventos-academicos/{id}/
Headers: Authorization: Bearer {token}
Response: 204 No Content
```

#### 6. **Obtener maestros y administradores**
```
GET /api/usuarios/maestros-admins/
Headers: Authorization: Bearer {token}
Response: Array de usuarios con campos:
[
  {
    "id": integer,
    "first_name": "string",
    "last_name": "string",
    "rol": "string"
  }
]
```

### Modelo de Django Sugerido

```python
# models.py
from django.db import models
from django.contrib.auth.models import User

class EventoAcademico(models.Model):
    TIPO_EVENTO_CHOICES = [
        ('Conferencia', 'Conferencia'),
        ('Taller', 'Taller'),
        ('Seminario', 'Seminario'),
        ('Concurso', 'Concurso'),
    ]
    
    nombre_evento = models.CharField(max_length=200)
    tipo_evento = models.CharField(max_length=50, choices=TIPO_EVENTO_CHOICES)
    fecha_realizacion = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    lugar = models.CharField(max_length=200)
    publico_objetivo = models.JSONField()  # Lista de strings
    programa_educativo = models.CharField(max_length=200, blank=True, null=True)
    responsable = models.ForeignKey(User, on_delete=models.CASCADE)
    descripcion = models.TextField(max_length=300)
    cupo_maximo = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'eventos_academicos'
        ordering = ['-fecha_realizacion']
```

### Serializer de Django REST Framework

```python
# serializers.py
from rest_framework import serializers
from .models import EventoAcademico

class EventoAcademicoSerializer(serializers.ModelSerializer):
    responsable_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = EventoAcademico
        fields = '__all__'
    
    def get_responsable_nombre(self, obj):
        return f"{obj.responsable.first_name} {obj.responsable.last_name}"
```

### ViewSet de Django REST Framework

```python
# views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import EventoAcademico
from .serializers import EventoAcademicoSerializer

class EventoAcademicoViewSet(viewsets.ModelViewSet):
    queryset = EventoAcademico.objects.all()
    serializer_class = EventoAcademicoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = EventoAcademico.objects.all()
        
        # Filtrar según el rol del usuario
        if hasattr(user, 'rol'):
            if user.rol == 'maestro':
                # Maestros ven eventos para profesores y público general
                queryset = queryset.filter(
                    publico_objetivo__contains=['Profesores']
                ) | queryset.filter(
                    publico_objetivo__contains=['Público general']
                )
            elif user.rol == 'alumno':
                # Alumnos ven eventos para estudiantes y público general
                queryset = queryset.filter(
                    publico_objetivo__contains=['Estudiantes']
                ) | queryset.filter(
                    publico_objetivo__contains=['Público general']
                )
        
        return queryset
```

### URLs de Django

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventoAcademicoViewSet

router = DefaultRouter()
router.register(r'eventos-academicos', EventoAcademicoViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
```

---

## 🚀 Cómo Probar la Aplicación

### 1. Asegúrate de que el backend esté corriendo
```bash
python manage.py runserver
```

### 2. Inicia la aplicación Angular
```bash
cd app-movil-escolar-webapp
ng serve
```

### 3. Accede a la aplicación
```
http://localhost:4200
```

### 4. Flujo de Prueba

**Como Administrador:**
1. Inicia sesión
2. Ve al menú lateral → "Eventos Académicos" → "Registro de Eventos"
3. Completa el formulario con todos los campos
4. Haz clic en "Registrar"
5. Ve a "Lista de Eventos" para ver el evento creado
6. Prueba editar y eliminar eventos

**Como Maestro:**
1. Inicia sesión
2. Ve al menú lateral → "Eventos Académicos" → "Lista de Eventos"
3. Verifica que solo veas eventos para profesores y público general
4. Verifica que NO veas botones de editar/eliminar

**Como Alumno:**
1. Inicia sesión
2. Ve al menú lateral → "Eventos Académicos" → "Lista de Eventos"
3. Verifica que solo veas eventos para estudiantes y público general
4. Verifica que NO veas botones de editar/eliminar

---

## 📁 Estructura de Archivos Creados

```
src/app/
├── partials/
│   └── registro-eventos/
│       ├── registro-eventos.component.ts
│       ├── registro-eventos.component.html
│       └── registro-eventos.component.scss
├── screens/
│   ├── eventos-academicos-screen/
│   │   ├── eventos-academicos-screen.component.ts
│   │   ├── eventos-academicos-screen.component.html
│   │   └── eventos-academicos-screen.component.scss
│   └── registro-eventos-screen/
│       ├── registro-eventos-screen.component.ts
│       ├── registro-eventos-screen.component.html
│       └── registro-eventos-screen.component.scss
├── modals/
│   └── eliminar-evento-modal/
│       ├── eliminar-evento-modal.component.ts
│       ├── eliminar-evento-modal.component.html
│       └── eliminar-evento-modal.component.scss
└── services/
    └── eventos.service.ts
```

---

## ⚠️ Notas Importantes

1. **Autenticación:** Todos los endpoints requieren token de autenticación Bearer
2. **CORS:** Asegúrate de que Django tenga configurado CORS para aceptar peticiones desde `http://localhost:4200`
3. **Validaciones:** El frontend valida los datos antes de enviar, pero es recomendable también validar en el backend
4. **Fechas:** El formato de fecha en el backend debe ser `YYYY-MM-DD`
5. **Horarios:** El formato de hora debe ser `HH:MM` (24 horas)
6. **Público Objetivo:** Se envía como array de strings: `["Estudiantes", "Profesores"]`

---

## 🐛 Solución de Problemas Comunes

### Error: "No se pudieron cargar los eventos"
- Verifica que el backend esté corriendo
- Verifica la URL del API en `src/environments/environment.ts`
- Verifica que el token de autenticación sea válido

### Error: "No se pudo registrar el evento"
- Verifica que todos los campos estén completos
- Revisa la consola del navegador para ver errores específicos
- Verifica que el endpoint de Django esté funcionando

### No aparece el menú de "Eventos Académicos"
- Verifica que el usuario haya iniciado sesión
- Limpia las cookies y vuelve a iniciar sesión

---

## 📞 Contacto y Soporte

Si tienes dudas sobre la implementación, revisa:
1. Los comentarios en el código
2. La consola del navegador (F12)
3. Las respuestas del servidor en la pestaña Network

---

## ✨ Próximos Pasos

1. Conectar con el backend de Django
2. Probar todos los flujos de usuario
3. Ajustar estilos según preferencias
4. Agregar más validaciones si es necesario
5. Implementar notificaciones (opcional)

---

**Fecha de implementación:** 29 de noviembre de 2025
**Versión de Angular:** 16.2.14
**Estado:** ✅ Implementación completa del frontend
