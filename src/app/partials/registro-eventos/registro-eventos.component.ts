import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';

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
  public programasEducativos: string[] = [
    'Ingeniería en Ciencias de la Computación',
    'Licenciatura en Ciencias de la Computación',
    'Ingeniería en Tecnologías de la Información'
  ];
  public tiposEvento: string[] = ['Conferencia', 'Taller', 'Seminario', 'Concurso'];
  public responsables: any[] = [];

  // Control de checkboxes de público objetivo
  public publicoObjetivo = {
    estudiantes: false,
    profesores: false,
    publico_general: false
  };

  public fechaMinima = new Date(); // Para el datepicker

  constructor(
    private location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public facadeService: FacadeService,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    this.evento = this.inicializarEvento();

    // Verificar si es modo edición
    if (this.activatedRoute.snapshot.params['id']) {
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      this.obtenerEvento();
    }

    // Cargar lista de responsables (maestros y administradores)
    this.obtenerResponsables();
  }

  public inicializarEvento() {
    return {
      nombre_evento: "",
      tipo_evento: "",
      fecha_realizacion: "",
      hora_inicio: "",
      hora_fin: "",
      lugar: "",
      publico_objetivo: [],
      programa_educativo: "",
      responsable: "",
      descripcion: "",
      cupo_maximo: null
    };
  }

  public registrar() {
    this.errors = [];

    // Preparar público objetivo desde checkboxes
    this.evento.publico_objetivo = this.getPublicoObjetivoSeleccionado();

    // Validar formulario
    this.errors = this.validarFormulario();

    if (Object.keys(this.errors).length === 0) {
      console.log("Registrando evento:", this.evento);
      this.eventosService.registrarEvento(this.evento).subscribe(
        (response) => {
          console.log("Evento registrado:", response);
          alert("Evento registrado correctamente");
          this.regresar();
        },
        (error) => {
          console.error("Error al registrar evento:", error);
          alert("No se pudo registrar el evento");
        }
      );
    } else {
      console.log("Errores en el formulario:", this.errors);
    }
  }

  public actualizar() {
    this.errors = [];

    // Preparar público objetivo desde checkboxes
    this.evento.publico_objetivo = this.getPublicoObjetivoSeleccionado();

    // Validar formulario
    this.errors = this.validarFormulario();

    if (Object.keys(this.errors).length === 0) {
      console.log("Actualizando evento:", this.evento);
      this.eventosService.actualizarEvento(this.idEvento, this.evento).subscribe(
        (response) => {
          console.log("Evento actualizado:", response);
          alert("Evento actualizado correctamente");
          this.regresar();
        },
        (error) => {
          console.error("Error al actualizar evento:", error);
          alert("No se pudo actualizar el evento");
        }
      );
    } else {
      console.log("Errores en el formulario:", this.errors);
    }
  }

  public validarFormulario(): any {
    let errors: any = {};

    // Validar nombre del evento
    if (!this.evento.nombre_evento || this.evento.nombre_evento.trim() === "") {
      errors.nombre_evento = "El nombre del evento es obligatorio";
    } else if (!/^[a-zA-Z0-9\s]+$/.test(this.evento.nombre_evento)) {
      errors.nombre_evento = "Solo se permiten letras, números y espacios";
    }

    // Validar tipo de evento
    if (!this.evento.tipo_evento) {
      errors.tipo_evento = "Debe seleccionar un tipo de evento";
    }

    // Validar fecha
    if (!this.evento.fecha_realizacion) {
      errors.fecha_realizacion = "La fecha de realización es obligatoria";
    }

    // Validar horarios
    if (!this.evento.hora_inicio) {
      errors.hora_inicio = "La hora de inicio es obligatoria";
    }
    if (!this.evento.hora_fin) {
      errors.hora_fin = "La hora de fin es obligatoria";
    }
    if (this.evento.hora_inicio && this.evento.hora_fin) {
      if (this.evento.hora_inicio >= this.evento.hora_fin) {
        errors.hora_fin = "La hora de fin debe ser posterior a la hora de inicio";
      }
    }

    // Validar lugar
    if (!this.evento.lugar || this.evento.lugar.trim() === "") {
      errors.lugar = "El lugar es obligatorio";
    } else if (!/^[a-zA-Z0-9\s]+$/.test(this.evento.lugar)) {
      errors.lugar = "Solo se permiten caracteres alfanuméricos y espacios";
    }

    // Validar público objetivo
    const publicoSeleccionado = this.getPublicoObjetivoSeleccionado();
    if (publicoSeleccionado.length === 0) {
      errors.publico_objetivo = "Debe seleccionar al menos un público objetivo";
    }

    // Validar programa educativo (solo si público objetivo incluye estudiantes)
    if (this.publicoObjetivo.estudiantes && !this.evento.programa_educativo) {
      errors.programa_educativo = "Debe seleccionar un programa educativo";
    }

    // Validar responsable
    if (!this.evento.responsable) {
      errors.responsable = "Debe seleccionar un responsable";
    }

    // Validar descripción
    if (!this.evento.descripcion || this.evento.descripcion.trim() === "") {
      errors.descripcion = "La descripción es obligatoria";
    } else if (this.evento.descripcion.length > 300) {
      errors.descripcion = "La descripción no puede exceder 300 caracteres";
    } else if (!/^[a-zA-Z0-9\s.,;:()¿?¡!\-]+$/.test(this.evento.descripcion)) {
      errors.descripcion = "Solo se permiten letras, números y signos de puntuación básicos";
    }

    // Validar cupo máximo
    if (!this.evento.cupo_maximo) {
      errors.cupo_maximo = "El cupo máximo es obligatorio";
    } else if (!/^\d{1,3}$/.test(this.evento.cupo_maximo.toString())) {
      errors.cupo_maximo = "El cupo debe ser un número entero de hasta 3 dígitos";
    } else if (this.evento.cupo_maximo <= 0) {
      errors.cupo_maximo = "El cupo debe ser mayor a 0";
    }

    return errors;
  }

  public getPublicoObjetivoSeleccionado(): string[] {
    let publico: string[] = [];
    if (this.publicoObjetivo.estudiantes) publico.push('Estudiantes');
    if (this.publicoObjetivo.profesores) publico.push('Profesores');
    if (this.publicoObjetivo.publico_general) publico.push('Público general');
    return publico;
  }

  public onPublicoObjetivoChange() {
    // Si no está seleccionado "Estudiantes", limpiar programa educativo
    if (!this.publicoObjetivo.estudiantes) {
      this.evento.programa_educativo = "";
    }
  }

  public obtenerResponsables() {
    this.eventosService.getMaestrosYAdministradores().subscribe(
      (response) => {
        this.responsables = response;
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
        console.log("Evento obtenido:", response);
        this.evento = response;

        // Cargar checkboxes de público objetivo
        if (this.evento.publico_objetivo) {
          this.publicoObjetivo.estudiantes = this.evento.publico_objetivo.includes('Estudiantes');
          this.publicoObjetivo.profesores = this.evento.publico_objetivo.includes('Profesores');
          this.publicoObjetivo.publico_general = this.evento.publico_objetivo.includes('Público general');
        }
      },
      (error) => {
        console.error("Error al obtener evento:", error);
        alert("No se pudo cargar la información del evento");
      }
    );
  }

  public regresar() {
    this.location.back();
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
