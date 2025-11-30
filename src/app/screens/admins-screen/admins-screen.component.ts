import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-admins-screen',
  templateUrl: './admins-screen.component.html',
  styleUrls: ['./admins-screen.component.scss']
})
export class AdminsScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user: string = "";
  public rol: string = "";
  public lista_admins: any[] = [];

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    console.log("Nombre de usuario obtenido:", this.name_user);
    console.log("Todas las cookies:", document.cookie);

    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //Obtener lista de usuarios
  public obtenerAdmins() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        this.lista_admins = response;
        console.log("Lista users: ", this.lista_admins);
      }, (error) => {
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/administrador/" + idUser]);
  }

  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
    const userIdSession = Number(this.facadeService.getUserId());
    const totalAdmins = this.lista_admins.length;
    const esPropioRegistro = userIdSession === idUser;

    // Verificar que sea administrador
    if (this.rol !== 'administrador') {
      alert("No tienes permisos para eliminar administradores.");
      return;
    }
    // No puede eliminarse si es el único administrador
    if (esPropioRegistro && totalAdmins === 1) {
      alert("No puedes eliminar tu propio registro porque eres el único administrador del sistema.");
      return;
    }
    // Puede eliminar su propio registro si hay más admins, o a otros administradores
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idUser, rol: 'administrador' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDelete) {
        console.log("Administrador eliminado");

        if (esPropioRegistro) {
          // Si eliminó su propio registro, hacer logout
          alert("Tu cuenta de administrador ha sido eliminada. Serás redirigido al login.");
          this.facadeService.logout().subscribe(
            () => {
              this.facadeService.destroyUser();
              this.router.navigate(['/login']);
            },
            () => {
              // En caso de error en logout, igual destruir sesión local
              this.facadeService.destroyUser();
              this.router.navigate(['/login']);
            }
          );
        } else {
          // Si eliminó a otro administrador, recargar la lista
          alert("Administrador eliminado correctamente.");
          this.obtenerAdmins();
        }
      } else {
        console.log("No se eliminó el administrador");
      }
    });
  }
}
