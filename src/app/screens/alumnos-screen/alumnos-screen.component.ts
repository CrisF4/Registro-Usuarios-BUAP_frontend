import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit {
  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  //TODO: Cambiar variables que manejan 'clave_alumno' a 'matricula' tanto en frontend como en backend
  displayedColumns: string[] = ['clave_alumno', 'nombre', 'apellidos', 'email', 'fecha_nacimiento', 'curp', 'rfc', 'edad', 'telefono', 'ocupacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

    constructor(
      public facadeService: FacadeService,
      public AlumnosService: AlumnosService,
      private router: Router,
      public dialog: MatDialog
    ) { }

    ngOnInit(): void {
      this.name_user = this.facadeService.getUserCompleteName();
      this.rol = this.facadeService.getUserGroup();
      //Validar que haya inicio de sesión
      //Obtengo el token del login
      this.token = this.facadeService.getSessionToken();
      console.log("Token: ", this.token);
      if(this.token == ""){
        this.router.navigate(["/"]);
      }
      //Obtener alumnos
      this.obtenerAlumnos();
    }

    // Consumimos el servicio para obtener los alumnos
    public obtenerAlumnos() {
      this.AlumnosService.obtenerListaAlumnos().subscribe(
        (response) => {
          this.lista_alumnos = response;
          console.log("Lista users: ", this.lista_alumnos);
          if (this.lista_alumnos.length > 0) {
            //Agregar datos del nombre e email
            this.lista_alumnos.forEach(usuario => {
              usuario.first_name = usuario.user.first_name;
              usuario.last_name = usuario.user.last_name;
              usuario.email = usuario.user.email;
            });
            console.log("Alumnos: ", this.lista_alumnos);

            this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);

            // Configurar sortingDataAccessor ANTES de asignar sort y paginator
            this.dataSource.sortingDataAccessor = (item: DatosUsuario, property: string) => {
              switch(property) {
                case 'nombre':
                  return item.first_name?.toLowerCase() || '';
                case 'apellidos':
                  return item.last_name?.toLowerCase() || '';
                case 'clave_alumno':
                  return item.clave_alumno ? Number(item.clave_alumno) : 0;
                default:
                  return (item as any)[property];
              }
            };

            // Configurar filterPredicate personalizado para buscar en múltiples campos
            this.dataSource.filterPredicate = (data: DatosUsuario, filter: string) => {
              const searchStr = filter.toLowerCase();
              const nombre = data.first_name?.toLowerCase() || '';
              const apellidos = data.last_name?.toLowerCase() || '';
              const email = data.email?.toLowerCase() || '';
              const clave = data.clave_alumno?.toString() || '';

              return nombre.includes(searchStr) ||
                     apellidos.includes(searchStr) ||
                     email.includes(searchStr) ||
                     clave.includes(searchStr);
            };

            // Usar setTimeout para asegurar que sort y paginator estén disponibles
            setTimeout(() => {
              if (this.paginator) {
                this.dataSource.paginator = this.paginator;
                console.log("Paginator asignado");
              }
              if (this.sort) {
                this.dataSource.sort = this.sort;
                console.log("Sort asignado:", this.sort);
              } else {
                console.warn("Sort NO está disponible todavía");
              }
            });
          }
        }, (error) => {
          console.error("Error al obtener la lista de alumnos: ", error);
          alert("No se pudo obtener la lista de maestros");
        }
      );
    }

    public goEditar(idUser: number) {
      // Solo administradores y maestros pueden editar alumnos
      if (this.rol === 'administrador' || this.rol === 'maestro') {
        this.router.navigate(["registro-usuarios/alumno/" + idUser]);
        return;
      }
      // Los alumnos NO pueden editar ningún registro (ni el suyo ni el de otros)
      if (this.rol === 'alumno') {
        alert("No tienes permisos para editar registros de alumnos.");
        return;
      }
      alert("No tienes permisos para realizar esta acción.");
    }

    // Verificar si el usuario puede editar alumnos
    public puedeEditarEliminarAlumnos(): boolean {
      // Solo administradores y maestros pueden editar alumnos
      return this.rol === 'administrador' || this.rol === 'maestro';
    }

    public delete(idUser: number) {
      // Administrador y Maestro pueden eliminar cualquier alumno
      if (this.rol === 'administrador'|| this.rol === 'maestro') {
        //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
        const dialogRef = this.dialog.open(EliminarUserModalComponent,{
          data: {id: idUser, rol: 'alumno'}, //Se pasan valores a través del componente
          height: '288px',
          width: '328px',
        });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Alumno eliminado");
        alert("Alumno eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Alumno no se ha podido eliminar.");
        console.log("No se eliminó el alumno");
      }
    });
      return true;
    }else{
      alert("No tienes permisos para eliminar este alumno.");
      return false;
    }
    }

    // Método para filtrar la tabla
    public applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }

}

export interface DatosUsuario {
  id: number,
  clave_alumno: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  curp: string,
  rfc: string,
  edad: number,
  telefono: string,
  ocupacion: string
}
