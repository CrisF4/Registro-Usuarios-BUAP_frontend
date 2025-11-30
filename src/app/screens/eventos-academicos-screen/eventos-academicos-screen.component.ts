import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { EliminarEventoModalComponent } from 'src/app/modals/eliminar-evento-modal/eliminar-evento-modal.component';

@Component({
  selector: 'app-eventos-academicos-screen',
  templateUrl: './eventos-academicos-screen.component.html',
  styleUrls: ['./eventos-academicos-screen.component.scss']
})
export class EventosAcademicosScreenComponent implements OnInit {

  public rol: string = "";
  public dataSource: MatTableDataSource<any>;
  public displayedColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    public facadeService: FacadeService,
    public dialog: MatDialog,
    private eventosService: EventosService
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.rol = this.facadeService.getUserGroup();
    this.setDisplayedColumns();
    this.obtenerEventos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public setDisplayedColumns() {
    // Columnas base para todos
    const baseColumns = [
      'nombre_evento',
      'tipo_evento',
      'fecha_realizacion',
      'horario',
      'lugar',
      'publico_objetivo',
      'responsable',
      'cupo_maximo'
    ];

    // Solo admin puede editar y eliminar
    if (this.rol === 'administrador') {
      this.displayedColumns = [...baseColumns, 'acciones'];
    } else {
      this.displayedColumns = baseColumns;
    }
  }

  public obtenerEventos() {
    this.eventosService.getEventos().subscribe(
      (response) => {
        console.log("Eventos obtenidos:", response);
        // Filtrar eventos según el rol
        const eventosFiltrados = this.filtrarEventosPorRol(response);
        this.dataSource.data = eventosFiltrados;
      },
      (error) => {
        console.error("Error al obtener eventos:", error);
        alert("No se pudieron cargar los eventos");
      }
    );
  }

  public filtrarEventosPorRol(eventos: any[]): any[] {
    if (this.rol === 'administrador') {
      // Admin ve todos los eventos
      return eventos;
    } else if (this.rol === 'maestro') {
      // Maestro ve eventos para profesores y público general
      return eventos.filter(evento =>
        evento.publico_objetivo.includes('Profesores') ||
        evento.publico_objetivo.includes('Público general')
      );
    } else if (this.rol === 'alumno') {
      // Alumno ve eventos para estudiantes y público general
      return eventos.filter(evento =>
        evento.publico_objetivo.includes('Estudiantes') ||
        evento.publico_objetivo.includes('Público general')
      );
    }
    return eventos;
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public editarEvento(evento: any) {
    console.log("Editando evento:", evento);
    this.router.navigate(['/registro-eventos', evento.id]);
  }

  public eliminarEvento(evento: any) {
    const dialogRef = this.dialog.open(EliminarEventoModalComponent, {
      width: '400px',
      data: { nombre_evento: evento.nombre_evento }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventosService.eliminarEvento(evento.id).subscribe(
          (response) => {
            console.log("Evento eliminado:", response);
            alert("Evento eliminado correctamente");
            this.obtenerEventos(); // Recargar la lista
          },
          (error) => {
            console.error("Error al eliminar evento:", error);
            alert("No se pudo eliminar el evento");
          }
        );
      }
    });
  }

  public goToRegistro() {
    this.router.navigate(['/registro-eventos']);
  }
}
