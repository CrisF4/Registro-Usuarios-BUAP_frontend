import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
  }

  // Obtener todos los eventos
  public getEventos(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.url_api}/eventos-academicos/`, { headers });
  }

  // Obtener un evento por ID
  public getEventoById(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.url_api}/eventos-academicos/${id}/`, { headers });
  }

  // Registrar un nuevo evento
  public registrarEvento(evento: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.url_api}/eventos-academicos/`, evento, { headers });
  }

  // Actualizar un evento existente
  public actualizarEvento(id: number, evento: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${environment.url_api}/eventos-academicos/${id}/`, evento, { headers });
  }

  // Eliminar un evento
  public eliminarEvento(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.url_api}/eventos-academicos/${id}/`, { headers });
  }

  // Obtener maestros y administradores para el select de responsables
  public getMaestrosYAdministradores(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.url_api}/usuarios/maestros-admins/`, { headers });
  }
}
