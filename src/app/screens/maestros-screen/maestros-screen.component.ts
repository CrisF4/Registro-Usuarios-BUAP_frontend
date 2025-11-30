import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MatSort } from '@angular/material/sort';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements OnInit {
  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];

  //Para la tabla
  //TODO: Cambiar variables que manejan 'clave_maestro' a 'id_trabajador' tanto en frontend como en backend
  displayedColumns: string[] = ['clave_maestro', 'nombre', 'apellidos', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'cubiculo', 'area_investigacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>(this.lista_maestros as DatosUsuario[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
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
    //Obtener maestros
    this.obtenerMaestros();
  }

  // Consumimos el servicio para obtener los maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        console.log("Lista users: ", this.lista_maestros);
        if (this.lista_maestros.length > 0) {
          //Agregar datos del nombre e email
          this.lista_maestros.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Maestros: ", this.lista_maestros);

          this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_maestros as DatosUsuario[]);

          // Configurar sortingDataAccessor ANTES de asignar sort y paginator
          this.dataSource.sortingDataAccessor = (item: DatosUsuario, property: string) => {
            switch(property) {
              case 'nombre':
                return item.first_name?.toLowerCase() || '';
              case 'apellidos':
                return item.last_name?.toLowerCase() || '';
              case 'clave_maestro':
                return item.clave_maestro ? Number(item.clave_maestro) : 0;
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
            const clave = data.clave_maestro?.toString() || '';

            return nombre.includes(searchStr) ||
                   apellidos.includes(searchStr) ||
                   email.includes(searchStr) ||
                   clave.includes(searchStr);
          };

          // Usar setTimeout para asegurar que sort y paginator estén disponibles
          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
            if (this.sort) {
              this.dataSource.sort = this.sort;
            }
          });
        }
      }, (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  public goEditar(idUser: number) {
    const userIdSession = Number(this.facadeService.getUserId());
    // Administrador puede editar a cualquier maestro
    if (this.rol === 'administrador') {
      this.router.navigate(["registro-usuarios/maestro/" + idUser]);
      return;
    }
    // Maestro solo puede editar su propio registro
    if (this.rol === 'maestro' && userIdSession === idUser) {
      this.router.navigate(["registro-usuarios/maestro/" + idUser]);
      return;
    }
    // Si no cumple ninguna condición, mostrar mensaje
    alert("No tienes permisos para editar este maestro.");
  }

  // Verificar si el usuario puede editar un maestro específico
  public puedeEditarEliminar(idMaestro: number): boolean {
    const userIdSession = Number(this.facadeService.getUserId());
    // Administrador puede editar a cualquiera
    if (this.rol === 'administrador') {
      return true;
    }
    // Maestro solo puede editar su propio registro
    if (this.rol === 'maestro' && userIdSession === idMaestro) {
      return true;
    }

    return false;
  }

  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
    const userIdSession = Number(this.facadeService.getUserId());
    // --------- Pero el parametro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    if (this.rol === 'administrador' || (this.rol === 'maestro' && userIdSession === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'maestro'}, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Maestro eliminado");
        alert("Maestro eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Maestro no se ha podido eliminar.");
        console.log("No se eliminó el maestro");
      }
    });
      return true;
    }else{
      alert("No tienes permisos para eliminar este maestro.");
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

//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  id: number,
  clave_maestro: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  cubiculo: string,
  area_investigacion: number,
}
