import { Component, OnInit} from '@angular/core';
import { AdministradoresService } from 'src/app/services/administradores.service';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-graficas-scren',
  templateUrl: './graficas-scren.component.html',
  styleUrls: ['./graficas-scren.component.scss']
})
export class GraficasScrenComponent implements OnInit {
  //Agregar chartjs-plugin-datalabels
  //Variables

  public total_user: any = {};

  // Histograma
  lineChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: '#F88406',
        borderColor: '#F88406',
        fill: false
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  // Barras
  barChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB'
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
    console.log("Total usuarios en gráfica: ", this.total_user);
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);

        // Actualizar gráfica de histograma con datos dinámicos
        this.lineChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [
                this.total_user.admins || 0,
                this.total_user.maestros || 0,
                this.total_user.alumnos || 0
              ],
              label: 'Registro de usuarios',
              backgroundColor: '#F88406',
              borderColor: '#F88406',
              fill: false
            }
          ]
        };

        // Actualizar gráfica de barras con datos dinámicos
        this.barChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [
                this.total_user.admins || 0,
                this.total_user.maestros || 0,
                this.total_user.alumnos || 0
              ],
              label: 'Registro de usuarios',
              backgroundColor: [
                '#F88406',
                '#FCFF44',
                '#82D3FB'
              ]
            }
          ]
        };

        // Actualizar gráfica circular con datos dinámicos
        this.pieChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [
                this.total_user.admins || 0,
                this.total_user.maestros || 0,
                this.total_user.alumnos || 0
              ],
              label: 'Registro de usuarios',
              backgroundColor: [
                '#FCFF44',
                '#F1C8F2',
                '#31E731'
              ]
            }
          ]
        };

        // Actualizar gráfica de dona con datos dinámicos
        this.doughnutChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [
                this.total_user.admins || 0,
                this.total_user.maestros || 0,
                this.total_user.alumnos || 0
              ],
              label: 'Registro de usuarios',
              backgroundColor: [
                '#F88406',
                '#FCFF44',
                '#31E7E7'
              ]
            }
          ]
        };
      }, (error)=>{
        console.log("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }
}
