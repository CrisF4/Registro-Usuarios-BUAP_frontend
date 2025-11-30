import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { RegistroAdminComponent } from './partials/registro-admin/registro-admin.component';
import { RegistroAlumnosComponent } from './partials/registro-alumnos/registro-alumnos.component';
import { RegistroMaestrosComponent } from './partials/registro-maestros/registro-maestros.component';

//Angular Material
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import {MatDialogModule} from '@angular/material/dialog';

//Paginación
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
//Sorting
import { MatSortModule } from '@angular/material/sort';
//Para el paginator en español
import { getSpanishPaginatorIntl } from './shared/spanish-paginator-intl';
// IMPORTANTE: añade el módulo de Sidenav
import { MatSidenavModule } from '@angular/material/sidenav';
//Ngx-cookie-service
import { CookieService } from 'ngx-cookie-service';
//Modulo para graficas
import { NgChartsModule } from 'ng2-charts';

// Third Party Modules
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { AlumnosScreenComponent } from './screens/alumnos-screen/alumnos-screen.component';
import { MaestrosScreenComponent } from './screens/maestros-screen/maestros-screen.component';
import { AdminsScreenComponent } from './screens/admins-screen/admins-screen.component';
import { NavbarUserComponent } from './partials/navbar-user/navbar-user.component';
import { SidebarUserComponent } from './partials/sidebar-user/sidebar-user.component';
import { EliminarUserModalComponent } from './modals/eliminar-user-modal/eliminar-user-modal.component';
import { GraficasScrenComponent } from './screens/graficas-scren/graficas-scren.component';
import { RegistroEventosComponent } from './partials/registro-eventos/registro-eventos.component';
import { EventosAcademicosScreenComponent } from './screens/eventos-academicos-screen/eventos-academicos-screen.component';
import { EliminarEventoModalComponent } from './modals/eliminar-evento-modal/eliminar-evento-modal.component';
import { RegistroEventosScreenComponent } from './screens/registro-eventos-screen/registro-eventos-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginScreenComponent,
    RegistroUsuariosScreenComponent,
    AuthLayoutComponent,
    DashboardLayoutComponent,
    RegistroAdminComponent,
    RegistroAlumnosComponent,
    RegistroMaestrosComponent,
    HomeScreenComponent,
    AlumnosScreenComponent,
    MaestrosScreenComponent,
    AdminsScreenComponent,
    NavbarUserComponent,
    SidebarUserComponent,
    EliminarUserModalComponent,
    GraficasScrenComponent,
    RegistroEventosComponent,
    EventosAcademicosScreenComponent,
    EliminarEventoModalComponent,
    RegistroEventosScreenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaskDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    NgChartsModule
  ],
  providers: [
    CookieService,
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },
    provideNgxMask()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
