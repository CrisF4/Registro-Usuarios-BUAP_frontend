# Refactorización: Registro de Eventos Académicos

## 📋 Objetivo
Refactorizar el módulo de registro de eventos académicos para seguir la **misma estructura ordenada** que usa el registro de maestros, respetando el diseño del backend Django.

## 🔄 Cambios Implementados

### 1. **EventosService** (`eventos.service.ts`)

#### ✅ Agregado: `esquemaEvento()`
```typescript
public esquemaEvento() {
  return {
    'nombre_evento': '',
    'tipo_evento': '',
    'fecha_realizacion': '',
    'hora_inicio': '',
    'hora_fin': '',
    'lugar': '',
    'publico_objetivo': [], // Array vacío para checkboxes (igual que materias_json)
    'programa_educativo': '',
    'responsable': '',
    'descripcion': '',
    'cupo_maximo': null
  };
}
```
**Propósito**: Inicializar el esquema del evento con estructura limpia y consistente (igual que `esquemaMaestro()`).

#### ✅ Agregado: `validarEvento(data, editar)`
```typescript
public validarEvento(data: any, editar: boolean) {
  console.log('Validando evento...', data);
  let error: any = {};
  
  // Validaciones usando ValidatorService y ErrorsService
  if (!this.validatorService.required(data['nombre_evento'])) {
    error['nombre_evento'] = this.errorService.required;
  }
  // ... más validaciones
  
  return error;
}
```
**Propósito**: Centralizar toda la lógica de validación en el servicio (igual que `validarMaestro()`).

**Validaciones implementadas**:
- ✓ Campos requeridos: nombre_evento, tipo_evento, fecha_realizacion, hora_inicio, hora_fin, lugar, responsable, descripcion, cupo_maximo
- ✓ Público objetivo: al menos un checkbox seleccionado
- ✓ Programa educativo: requerido solo si público objetivo incluye "Estudiantes"
- ✓ Comparación de horarios: hora_fin > hora_inicio
- ✓ Descripción: máximo 300 caracteres
- ✓ Cupo máximo: debe ser mayor a 0

---

### 2. **RegistroEventosComponent** (`registro-eventos.component.ts`)

#### ✅ Cambio: Manejo de `publico_objetivo` con checkboxes

**ANTES** (estructura manual con objeto):
```typescript
public publicoObjetivo = {
  estudiantes: false,
  profesores: false,
  publico_general: false
};
```

**DESPUÉS** (array de opciones - igual que materias en maestros):
```typescript
public publicosObjetivo: any[] = [
  {value: 'Estudiantes', nombre: 'Estudiantes'},
  {value: 'Profesores', nombre: 'Profesores'},
  {value: 'Público general', nombre: 'Público general'}
];
```

#### ✅ Refactorizado: `ngOnInit()`

**ANTES**:
```typescript
ngOnInit(): void {
  this.evento = this.inicializarEvento(); // Método local
  if (this.activatedRoute.snapshot.params['id']) {
    this.editar = true;
    this.idEvento = this.activatedRoute.snapshot.params['id'];
    this.obtenerEvento();
  }
  this.obtenerResponsables();
}
```

**DESPUÉS** (siguiendo patrón de maestros):
```typescript
ngOnInit(): void {
  this.obtenerResponsables();
  
  if (this.activatedRoute.snapshot.params['id'] != undefined) {
    this.editar = true;
    this.idEvento = this.activatedRoute.snapshot.params['id'];
    console.log('ID Evento: ', this.idEvento);
    this.obtenerEvento();
  } else {
    // Usar esquema del servicio
    this.evento = this.eventosService.esquemaEvento();
    this.token = this.facadeService.getSessionToken();
    this.evento.publico_objetivo = [];
  }
  console.log('Evento: ', this.evento);
}
```

#### ✅ Agregado: `checkboxChange(event)`
```typescript
public checkboxChange(event: any) {
  console.log('Evento: ', event);
  if (event.checked) {
    this.evento.publico_objetivo.push(event.source.value);
  } else {
    this.evento.publico_objetivo.forEach((publico: string, i: number) => {
      if (publico == event.source.value) {
        this.evento.publico_objetivo.splice(i, 1);
      }
    });
  }
  console.log('Array publico_objetivo: ', this.evento);
  
  // Si se deselecciona "Estudiantes", limpiar programa educativo
  if (!this.evento.publico_objetivo.includes('Estudiantes')) {
    this.evento.programa_educativo = '';
  }
}
```
**Propósito**: Manejar checkboxes dinámicamente agregando/removiendo del array (igual que `materias_json`).

#### ✅ Agregado: `revisarSeleccion(nombre)`
```typescript
public revisarSeleccion(nombre: string) {
  if (this.evento.publico_objetivo) {
    var busqueda = this.evento.publico_objetivo.find((element: string) => element == nombre);
    if (busqueda != undefined) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
```
**Propósito**: Verificar si un checkbox debe estar marcado al cargar datos en edición.

#### ✅ Agregado: `changeFecha(event)`
```typescript
public changeFecha(event: any) {
  console.log(event);
  console.log(event.value.toISOString());
  this.evento.fecha_realizacion = event.value.toISOString().split('T')[0];
  console.log('Fecha: ', this.evento.fecha_realizacion);
}
```
**Propósito**: Convertir fecha del datepicker a formato YYYY-MM-DD (igual que en maestros).

#### ✅ Refactorizado: `registrar()`

**CAMBIOS CLAVE**:
1. ❌ Eliminado: `validarFormulario()` local
2. ✅ Usar: `this.eventosService.validarEvento()` del servicio
3. ✅ Estructura de respuesta: `{next, error}` (igual que maestros)
4. ✅ Conversión: `publico_objetivo` array → JSON string para backend

```typescript
public registrar() {
  this.errors = {};
  
  // Convertir fecha si es Date object
  if (this.evento.fecha_realizacion instanceof Date) {
    this.evento.fecha_realizacion = this.evento.fecha_realizacion.toISOString().split('T')[0];
  }
  
  // Validar usando el servicio
  this.errors = this.eventosService.validarEvento(this.evento, this.editar);
  if (Object.keys(this.errors).length > 0) {
    console.error('Errores de validación:', this.errors);
    return false;
  }
  
  // Preparar datos para backend (JSON.stringify para publico_objetivo)
  const eventoParaEnviar = {
    ...this.evento,
    publico_objetivo: JSON.stringify(this.evento.publico_objetivo)
  };
  
  // Llamar al servicio
  this.eventosService.registrarEvento(eventoParaEnviar).subscribe({
    next: (response: any) => {
      alert('Evento registrado con éxito');
      // ... navegación
    },
    error: (error: any) => {
      // ... manejo de errores
    }
  });
}
```

#### ✅ Refactorizado: `actualizar()`
Misma estructura que `registrar()`, usando `actualizarEvento()` del servicio.

#### ✅ Refactorizado: `obtenerEvento()`
**CAMBIO**: Ya no actualiza objeto `publicoObjetivo` separado, solo parsea el array `publico_objetivo`.

```typescript
public obtenerEvento() {
  this.eventosService.getEventoById(this.idEvento).subscribe(
    (response) => {
      this.evento = response;
      
      // Parsear publico_objetivo si viene como string (igual que materias_json)
      if (this.evento.publico_objetivo && typeof this.evento.publico_objetivo === 'string') {
        try {
          this.evento.publico_objetivo = JSON.parse(this.evento.publico_objetivo);
        } catch (error) {
          console.error('Error al parsear publico_objetivo:', error);
          this.evento.publico_objetivo = [];
        }
      }
      
      // Asegurar que sea array
      if (!Array.isArray(this.evento.publico_objetivo)) {
        this.evento.publico_objetivo = [];
      }
      
      // Convertir fecha ISO a Date object
      if (this.evento.fecha_realizacion) {
        this.evento.fecha_realizacion = new Date(this.evento.fecha_realizacion);
      }
    }
  );
}
```

#### ❌ Eliminados (métodos obsoletos):
- `inicializarEvento()` → Reemplazado por `esquemaEvento()` del servicio
- `validarFormulario()` → Reemplazado por `validarEvento()` del servicio
- `getPublicoObjetivoSeleccionado()` → Ya no necesario (array directo)
- `onPublicoObjetivoChange()` → Lógica movida a `checkboxChange()`

---

### 3. **Template HTML** (`registro-eventos.component.html`)

#### ✅ Cambio: Checkboxes dinámicos

**ANTES**:
```html
<div class="publico-objetivo-section">
  <span class="section-label">Público objetivo</span>
  <div class="checkbox-group">
    <mat-checkbox [(ngModel)]="publicoObjetivo.estudiantes" (change)="onPublicoObjetivoChange()">
      Estudiantes
    </mat-checkbox>
    <mat-checkbox [(ngModel)]="publicoObjetivo.profesores">
      Profesores
    </mat-checkbox>
    <mat-checkbox [(ngModel)]="publicoObjetivo.publico_general">
      Público general
    </mat-checkbox>
  </div>
</div>
```

**DESPUÉS** (iteración con `*ngFor` - igual que materias):
```html
<div class="select-publico-objetivo">
  <div class="row mt-3 mb-3">
    <div class="form-group col-12">
      <label class="title-publico" for="publico_objetivo">Selecciona el público objetivo</label>
    </div>
  </div>
  <div class="checkbox-group" *ngFor="let publico of publicosObjetivo; let i = index">
    <mat-checkbox class="checkbox-item opc-sc" 
                  name="opsc" 
                  (change)="checkboxChange($event)" 
                  [value]="publico.value" 
                  [checked]="revisarSeleccion(publico.value)">
      <div class="d-checkbox-nombre">{{publico.nombre}}</div>
    </mat-checkbox>
  </div>
  <div *ngIf="errors.publico_objetivo" class="invalid-feedback">{{ errors.publico_objetivo }}</div>
</div>
```

#### ✅ Cambio: Condición para programa educativo

**ANTES**:
```html
*ngIf="publicoObjetivo.estudiantes"
```

**DESPUÉS**:
```html
*ngIf="evento.publico_objetivo && evento.publico_objetivo.includes('Estudiantes')"
```

#### ✅ Agregado: `(dateChange)="changeFecha($event)"` al datepicker
```html
<input matInput [matDatepicker]="picker" 
       [(ngModel)]="evento.fecha_realizacion"
       [min]="fechaMinima" 
       placeholder="dd/MM/yyyy" 
       (focus)="picker.open()" 
       (dateChange)="changeFecha($event)" 
       type="string">
```

---

### 4. **Estilos SCSS** (`registro-eventos.component.scss`)

#### ✅ Agregado: `.select-publico-objetivo` (estilo consistente con maestros)
```scss
.select-publico-objetivo {
  margin-bottom: 1.5rem;

  .title-publico {
    display: block;
    font-size: 0.95rem;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 0.75rem;
    font-weight: 500;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .checkbox-item {
      margin-bottom: 0.5rem;
      
      .d-checkbox-nombre {
        font-size: 0.95rem;
        color: #333;
      }
    }
  }
}
```

---

## 🎯 Comparación: Estructura Anterior vs. Nueva

| Aspecto | ANTES (Manual) | DESPUÉS (Patrón Maestros) |
|---------|---------------|---------------------------|
| **Inicialización** | `inicializarEvento()` local | `eventosService.esquemaEvento()` |
| **Validación** | `validarFormulario()` local | `eventosService.validarEvento()` |
| **Checkboxes** | Objeto `{estudiantes, profesores, publico_general}` | Array `['Estudiantes', 'Profesores', ...]` |
| **HTML Checkboxes** | 3 `mat-checkbox` hardcodeados | `*ngFor` dinámico |
| **Parseo datos** | Manual con métodos auxiliares | `checkboxChange()` + `revisarSeleccion()` |
| **Fecha** | Conversión inline | Método `changeFecha()` |
| **Backend compatibility** | JSON.stringify antes de enviar | JSON.stringify antes de enviar ✅ |

---

## ✅ Compatibilidad con Backend Django

### Estructura respetada:

1. **`publico_objetivo`**: 
   - Frontend: Array `['Estudiantes', 'Profesores']`
   - Backend: TextField con JSON string `'["Estudiantes", "Profesores"]'`
   - Conversión: `JSON.stringify()` al enviar, `JSON.parse()` al recibir

2. **`responsable`**: 
   - Frontend: ID del usuario (number)
   - Backend: ForeignKey a User
   - ✅ Sin cambios necesarios

3. **`fecha_realizacion`**:
   - Frontend: Date object o string YYYY-MM-DD
   - Backend: DateField
   - Conversión: `toISOString().split('T')[0]`

4. **`tipo_evento` y `programa_educativo`**:
   - Frontend: String values matching backend CharField
   - Backend: CharField con valores exactos
   - ✅ Sin cambios necesarios

---

## 🚀 Beneficios de la Refactorización

1. ✅ **Consistencia**: Misma estructura que registro de maestros
2. ✅ **Mantenibilidad**: Lógica de validación centralizada en el servicio
3. ✅ **Escalabilidad**: Fácil agregar nuevos públicos objetivo (solo agregar al array)
4. ✅ **Reutilización**: Métodos `checkboxChange()` y `revisarSeleccion()` pueden usarse en otros componentes
5. ✅ **Separación de responsabilidades**: Componente solo maneja UI, servicio maneja lógica de negocio
6. ✅ **Compatibilidad backend**: Respeta completamente la estructura Django sin necesidad de cambios

---

## 📝 Notas Importantes

### ⚠️ No se requieren cambios en el backend Django
La refactorización fue diseñada para **respetar completamente** la estructura existente del backend. Los cambios son solo en el frontend para mejorar la organización y consistencia del código.

### ✅ Flujo de datos `publico_objetivo`:
```
Frontend (registro) → Array ['Estudiantes'] 
                   ↓ JSON.stringify()
Backend (Django)   → TextField '["Estudiantes"]'
                   ↓ Almacenado en DB
Backend (respuesta)→ String '["Estudiantes"]'
                   ↓ JSON.parse()
Frontend (edición) → Array ['Estudiantes']
                   ↓ Checkboxes checked
```

### 🔄 Similitud con `materias_json` en maestros:
Ambos campos funcionan exactamente igual:
- Array en frontend
- JSON string en backend TextField
- Checkboxes dinámicos con `*ngFor`
- Métodos `checkboxChange()` y `revisarSeleccion()`

---

## 🧪 Testing Recomendado

1. ✅ Registrar evento nuevo con diferentes combinaciones de público objetivo
2. ✅ Verificar que programa educativo aparece solo si se selecciona "Estudiantes"
3. ✅ Editar evento existente y verificar que checkboxes se marcan correctamente
4. ✅ Validar que errores se muestran correctamente
5. ✅ Verificar que fecha se convierte correctamente entre frontend y backend
6. ✅ Comprobar que al deseleccionar "Estudiantes" se limpia programa educativo

---

## 📚 Archivos Modificados

1. ✅ `src/app/services/eventos.service.ts`
2. ✅ `src/app/partials/registro-eventos/registro-eventos.component.ts`
3. ✅ `src/app/partials/registro-eventos/registro-eventos.component.html`
4. ✅ `src/app/partials/registro-eventos/registro-eventos.component.scss`

**Total de líneas refactorizadas**: ~400 líneas
**Tiempo estimado de implementación**: Completado ✅
