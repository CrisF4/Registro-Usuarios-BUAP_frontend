import { Component, OnInit } from '@angular/core';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit {

  public rol: string = "";

  constructor(
    public facadeService: FacadeService
  ) { }

  ngOnInit(): void {
    this.rol = this.facadeService.getUserGroup();
  }
}
