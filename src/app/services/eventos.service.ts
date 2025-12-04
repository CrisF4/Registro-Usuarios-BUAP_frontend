import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService,
    private validatorService: ValidatorService,
    private errorService: ErrorsService
  ) { }

  // Esquema inicial del evento académico
  public esquemaEvento() {
    return {
      'nombre_evento': '',
      'tipo_evento': '',
      'fecha_realizacion': '',
      'hora_inicio': '',
      'hora_fin': '',
      'lugar': '',
      'publico_objetivo': [],
      'programa_educativo': '',
      'responsable': '',
      'descripcion': '',
      'cupo_maximo': null
    };
  }

  // Validación del evento académico
  public validarEvento(data: any, editar: boolean) {
    console.log('Validando evento...', data);
    let error: any = {};

    // Validar nombre del evento
    if (!this.validatorService.required(data['nombre_evento'])) {
      error['nombre_evento'] = this.errorService.required;
    }

    // Validar tipo de evento
    if (!this.validatorService.required(data['tipo_evento'])) {
      error['tipo_evento'] = this.errorService.required;
    }

    // Validar fecha de realización
    if (!this.validatorService.required(data['fecha_realizacion'])) {
      error['fecha_realizacion'] = this.errorService.required;
    }

    // Validar hora de inicio
    if (!this.validatorService.required(data['hora_inicio'])) {
      error['hora_inicio'] = this.errorService.required;
    }

    // Validar hora de fin
    if (!this.validatorService.required(data['hora_fin'])) {
      error['hora_fin'] = this.errorService.required;
    }

    // Validar que hora_fin sea posterior a hora_inicio
    if (data['hora_inicio'] && data['hora_fin']) {
      if (data['hora_inicio'] >= data['hora_fin']) {
        error['hora_fin'] = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }

    // Validar lugar
    if (!this.validatorService.required(data['lugar'])) {
      error['lugar'] = this.errorService.required;
    }

    // Validar público objetivo (al menos un checkbox seleccionado)
    if (!this.validatorService.required(data['publico_objetivo']) || data['publico_objetivo'].length === 0) {
      error['publico_objetivo'] = 'Debe seleccionar al menos un público objetivo';
    }

    // Validar programa educativo (solo si público objetivo incluye 'Estudiantes')
    if (data['publico_objetivo'] && data['publico_objetivo'].includes('Estudiantes')) {
      if (!this.validatorService.required(data['programa_educativo'])) {
        error['programa_educativo'] = 'Debe seleccionar un programa educativo cuando el público objetivo incluye estudiantes';
      }
    }

    // Validar responsable
    if (!this.validatorService.required(data['responsable'])) {
      error['responsable'] = this.errorService.required;
    }

    // Validar descripción
    if (!this.validatorService.required(data['descripcion'])) {
      error['descripcion'] = this.errorService.required;
    } else if (!this.validatorService.max(data['descripcion'], 300)) {
      error['descripcion'] = this.errorService.max(300);
    }

    // Validar cupo máximo
    if (!this.validatorService.required(data['cupo_maximo'])) {
      error['cupo_maximo'] = this.errorService.required;
    } else if (data['cupo_maximo'] <= 0) {
      error['cupo_maximo'] = 'El cupo debe ser mayor a 0';
    }

    return error;
  }

  // Servicios HTTP
  // Servicio para obtener todos los eventos
  public obtenerListaEventos(): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/eventos-academicos/`, { headers });
  }

  // Petición para obtener un evento por su ID
  public obtenerEventoPorID(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/evento-academico/?id=${idEvento}`, { headers });
  }

  // Servicio para registrar un nuevo evento
  public registrarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers = new HttpHeaders;
    if (token) {
      headers = new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token});
    } else {
      headers = new HttpHeaders({'Content-Type': 'application/json'});
    }
    return this.http.post<any>(`${environment.url_api}/evento-academico/`, data, { headers });
  }

  // Petición para actualizar un evento
  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.put<any>(`${environment.url_api}/evento-academico/`, data, { headers });
  }

  // Servicio para eliminar un evento
  public eliminarEvento(idEvento: number): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/evento-academico/?id=${idEvento}`, { headers });
  }

  // Servicio para obtener maestros y administradores (responsables)
  public obtenerMaestrosYAdministradores(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    // Hacemos dos peticiones y las combinamos
    return new Observable((observer) => {
      Promise.all([
        this.http.get<any>(`${environment.url_api}/lista-maestros/`, { headers }).toPromise(),
        this.http.get<any>(`${environment.url_api}/lista-admins/`, { headers }).toPromise()
      ]).then(([maestros, admins]) => {
        observer.next({ maestros, admins });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
