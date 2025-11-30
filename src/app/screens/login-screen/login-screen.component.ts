import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent implements OnInit {
  /** Datos del formulario */
  public username:string = "";
  public password:string = "";
  public type: string = "password";
  public errors:any = {};
  public load:boolean = false;

  constructor(
    public router: Router,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {
  }

  public login(){
    this.errors = {};
    this.errors = this.facadeService.validarLogin(this.username, this.password);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    this.load = true;
    this.facadeService.login(this.username, this.password).subscribe(
      (response:any) => {
        // Guardar token en localStorage (cookies)
        this.facadeService.saveUserData(response);
        // Redirigir segun su rol
        const role = response.rol;
        if(role === 'admin'){
          this.router.navigate(['/admin']);
        } else if(role === 'maestro'){
          this.router.navigate(['/maestros']);
        } else if(role === 'alumno'){
          this.router.navigate(['/alumnos']);
        } else {
          this.router.navigate(["home"]);
        }
        this.load = false;
      },
      (error:any) => {
        this.load = false;
        alert("Error en el inicio de sesión: " + error.message);
        this.errors.general = "Credenciales incorrectas. Inténtalo de nuevo.";
      }
    )
  }

  public showPassword(){
    this.type = this.type === "password" ? "text" : "password";
  }

  public registrar(){
    this.router.navigate(["registro-usuarios"]);
  }
}
