import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';

@Component({
  selector: 'app-registro-eventos',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class RegistroEventosComponent implements OnInit {

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public idEvento: number = 0;
  public token: string = "";

  // Opciones para selects
  public programasEducativos: any[] = [
    {value: 'Ingeniería en Ciencias de la Computación', viewValue:'Ingeniería en Ciencias de la Computación'},
    {value: 'Licenciatura en Ciencias de la Computación', viewValue:'Licenciatura en Ciencias de la Computación'},
    {value: 'Ingeniería en Tecnologías de la Información', viewValue:'Ingeniería en Tecnologías de la Información'}
  ];

  public tiposEvento: any[] = [
    {value: 'Conferencia', viewValue: 'Conferencia'},
    {value: 'Taller', viewValue: 'Taller'},
    {value: 'Seminario', viewValue: 'Seminario'},
    {value: 'Concurso', viewValue: 'Concurso'}
  ];

  public responsables: any[] = [];

  // Opciones de público objetivo
  public publicosObjetivo: any[] = [
    {value: 'Estudiantes', nombre: 'Estudiantes'},
    {value: 'Profesores', nombre: 'Profesores'},
    {value: 'Público general', nombre: 'Público general'}
  ];

  public fechaMinima = new Date(); // Para el datepicker

  // Tema personalizado para el timepicker (colores modernos)
  public timePickerTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#3f51b5'
    },
    dial: {
      dialBackgroundColor: '#3f51b5',
      dialActiveColor: '#fff',
      dialInactiveColor: 'rgba(255, 255, 255, 0.5)'
    },
    clockFace: {
      clockFaceBackgroundColor: '#f0f0f0',
      clockHandColor: '#3f51b5',
      clockFaceTimeInactiveColor: '#6c6c6c'
    }
  };

  constructor(
    private location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public facadeService: FacadeService,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    // Cargar lista de responsables (maestros y administradores)
    this.obtenerResponsables();

    // Verificar si es modo edición
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log('ID Evento: ', this.idEvento);
      // Cargar datos del evento
      this.obtenerEvento();
    } else {
      // Inicializar con esquema vacío del servicio
      this.evento = this.eventosService.esquemaEvento();
      this.token = this.facadeService.getSessionToken();
      this.evento.publico_objetivo = []; // Array vacío para checkboxes
    }
    console.log('Evento: ', this.evento);
  }

  public registrar() {
    // Limpiar errores
    this.errors = {};

    // Convertir fecha a formato YYYY-MM-DD si es un objeto Date
    if (this.evento.fecha_realizacion instanceof Date) {
      this.evento.fecha_realizacion = this.evento.fecha_realizacion.toISOString().split('T')[0];
    }

    // Validar evento usando el servicio
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) {
      console.error('Errores de validación:', this.errors);
      return false;
    }

    // Preparar datos para enviar (convertir publico_objetivo a JSON string para el backend)
    const eventoParaEnviar = {
      ...this.evento,
      publico_objetivo: JSON.stringify(this.evento.publico_objetivo)
    };

    console.log('Datos que se enviarán al backend:', eventoParaEnviar);

    // Consumir servicio para registrar evento
    this.eventosService.registrarEvento(eventoParaEnviar).subscribe({
      next: (response: any) => {
        alert('Evento registrado con éxito');
        console.log('Evento registrado', response);

        // Validar token y navegar
        if (this.token && this.token != '') {
          this.router.navigate(['eventos-academicos']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error: any) => {
        console.error('Error completo:', error);
        console.error('Status:', error.status);
        console.error('Mensaje:', error.message);
        console.error('Error body:', error.error);

        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          alert('Error al registrar el evento. Revisa la consola para más detalles.');
        }
      }
    });
  }

  public actualizar() {
    // Limpiar errores
    this.errors = {};

    // Convertir fecha a formato YYYY-MM-DD si es un objeto Date
    if (this.evento.fecha_realizacion instanceof Date) {
      this.evento.fecha_realizacion = this.evento.fecha_realizacion.toISOString().split('T')[0];
    }

    // Validar evento usando el servicio
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Preparar datos para enviar (convertir publico_objetivo a JSON string para el backend)
    const eventoParaEnviar = {
      ...this.evento,
      publico_objetivo: JSON.stringify(this.evento.publico_objetivo)
    };

    // Ejecutar servicio de actualización
    this.eventosService.actualizarEvento(this.idEvento, eventoParaEnviar).subscribe(
      (response) => {
        alert('Evento actualizado exitosamente');
        console.log('Evento actualizado: ', response);
        this.router.navigate(['eventos-academicos']);
      },
      (error) => {
        alert('Error al actualizar evento');
        console.error('Error al actualizar evento: ', error);
      }
    );
  }

  // Agregar métodos para manejar checkboxes
  public checkboxChange(event: any) {
    console.log('Evento: ', event);
    if (event.checked) {
      this.evento.publico_objetivo.push(event.source.value);
    } else {
      console.log(event.source.value);
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

  public obtenerResponsables() {
    // Obtener maestros y administradores como responsables
    this.eventosService.getMaestrosYAdministradores().subscribe(
      (response) => {
        // El backend devuelve arrays separados de maestros y admins
        // Los combinamos en un solo array
        this.responsables = [];

        if (response.maestros && Array.isArray(response.maestros)) {
          response.maestros.forEach((maestro: any) => {
            this.responsables.push({
              id: maestro.user.id,
              nombre_completo: `${maestro.user.first_name} ${maestro.user.last_name}`,
              rol: 'Maestro'
            });
          });
        }

        if (response.admins && Array.isArray(response.admins)) {
          response.admins.forEach((admin: any) => {
            this.responsables.push({
              id: admin.user.id,
              nombre_completo: `${admin.user.first_name} ${admin.user.last_name}`,
              rol: 'Administrador'
            });
          });
        }

        console.log("Responsables obtenidos:", this.responsables);
      },
      (error) => {
        console.error("Error al obtener responsables:", error);
      }
    );
  }

  public obtenerEvento() {
    this.eventosService.getEventoById(this.idEvento).subscribe(
      (response) => {
        console.log('Evento obtenido:', response);
        this.evento = response;

        // Parsear publico_objetivo si viene como string desde el backend
        // El backend puede devolver un string JSON doblemente codificado
        if (this.evento.publico_objetivo && typeof this.evento.publico_objetivo === 'string') {
          try {
            let parsed = JSON.parse(this.evento.publico_objetivo);
            // Si después del primer parse sigue siendo string, parsear de nuevo
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed);
            }
            this.evento.publico_objetivo = parsed;
          } catch (error) {
            console.error('Error al parsear publico_objetivo:', error);
            this.evento.publico_objetivo = [];
          }
        }

        // Asegurar que publico_objetivo sea un array
        if (!Array.isArray(this.evento.publico_objetivo)) {
          this.evento.publico_objetivo = [];
        }

        // FIX: Convertir fecha sin perder un día (usar fecha local, no UTC)
        if (this.evento.fecha_realizacion) {
          // En lugar de new Date() que usa UTC, usar la fecha como string local
          const [year, month, day] = this.evento.fecha_realizacion.split('-');
          this.evento.fecha_realizacion = new Date(Number(year), Number(month) - 1, Number(day));
        }

        // FIX: Convertir hora_inicio de formato HH:mm:ss a HH:mm (que espera el timepicker)
        if (this.evento.hora_inicio) {
          // Si viene en formato HH:mm:ss, quitar los segundos
          if (this.evento.hora_inicio.length === 8) { // "02:00:00" tiene 8 caracteres
            this.evento.hora_inicio = this.evento.hora_inicio.substring(0, 5); // "02:00"
          }
        } else {
          this.evento.hora_inicio = '';
        }

        // FIX: Convertir hora_fin de formato HH:mm:ss a HH:mm (que espera el timepicker)
        if (this.evento.hora_fin) {
          // Si viene en formato HH:mm:ss, quitar los segundos
          if (this.evento.hora_fin.length === 8) { // "05:00:00" tiene 8 caracteres
            this.evento.hora_fin = this.evento.hora_fin.substring(0, 5); // "05:00"
          }
        } else {
          this.evento.hora_fin = '';
        }

        // FIX: Asegurar que programa_educativo esté disponible
        if (!this.evento.programa_educativo) {
          this.evento.programa_educativo = '';
        }

        console.log('Evento procesado:', this.evento);
        console.log('Público objetivo:', this.evento.publico_objetivo);
        console.log('Fecha procesada:', this.evento.fecha_realizacion);
        console.log('Hora inicio:', this.evento.hora_inicio);
        console.log('Hora fin:', this.evento.hora_fin);
      },
      (error) => {
        console.error('Error al obtener evento:', error);
        alert('No se pudo cargar la información del evento');
      }
    );
  }

  public regresar() {
    this.location.back();
  }

  // Función para detectar el cambio de fecha (igual que en maestros)
  public changeFecha(event: any) {
    console.log(event);
    console.log(event.value.toISOString());

    this.evento.fecha_realizacion = event.value.toISOString().split('T')[0];
    console.log('Fecha: ', this.evento.fecha_realizacion);
  }

  // Validaciones en tiempo real para inputs
  public soloLetrasYNumeros(event: KeyboardEvent) {
    const pattern = /[a-zA-Z0-9\s]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public soloNumeros(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
