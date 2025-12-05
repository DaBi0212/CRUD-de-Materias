import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  // Variables
  public total_user: any = {};
  public totalUsuarios: number = 0;
  public isLoading: boolean = true;

  // Histograma (datos simulados - se mantienen igual)
  lineChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data:[89, 34, 43, 54, 28, 74, 93],
        label: 'Registro de materias',
        backgroundColor: '#F88406'
      }
    ]
  }
  lineChartOption: ChartOptions = {
    responsive: false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  // Barras (datos simulados - se mantienen igual)
  barChartData = {
    labels: ["Congreso", "FePro", "Presentación Doctoral", "Feria Matemáticas", "T-System"],
    datasets: [
      {
        data:[34, 43, 54, 28, 74],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5',
          '#2AD84A'
        ]
      }
    ]
  }
  barChartOption: ChartOptions = {
    responsive: false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  // NUEVA GRÁFICA: Barras para usuarios registrados (inicializada con ceros)
  usuariosBarChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Usuarios Registrados',
        backgroundColor: [
          '#F88406',  // Naranja para administradores
          '#31E731',  // Verde para maestros
          '#31E7E7'   // Turquesa para alumnos
        ],
        borderColor: [
          '#D96F00',
          '#1FC71F',
          '#1FC7C7'
        ],
        borderWidth: 2
      }
    ]
  }

  usuariosBarChartOptions: ChartOptions<'bar'> = {
    responsive: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        color: '#000000',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value: number) => {
          return value.toString();
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Usuarios',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tipo de Usuario',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        }
      }
    }
  }

  usuariosBarChartPlugins = [ DatalabelsPlugin ];

  // Circular (inicializada con ceros)
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
  pieChartOption: ChartOptions = {
    responsive: false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut (inicializada con ceros)
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
  doughnutChartOption: ChartOptions = {
    responsive: false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers() {
    this.isLoading = true;

    this.administradoresServices.getTotalUsuarios().subscribe(
      (response: any) => {
        this.total_user = response;
        console.log("Respuesta del servicio: ", this.total_user);

        // Asegúrate de que la respuesta tenga la estructura esperada
        // Puedes depurar la estructura aquí
        console.log("Estructura de la respuesta:", Object.keys(response));

        // Obtener valores dinámicos - ajusta según la estructura real de tu API
        let totalAdmins = 0;
        let totalMaestros = 0;
        let totalAlumnos = 0;

        // Opción 1: Si la respuesta es un objeto con propiedades específicas
        if (response.total_administradores !== undefined) {
          totalAdmins = response.total_administradores;
        } else if (response.administradores !== undefined) {
          totalAdmins = response.administradores;
        } else if (response.admins !== undefined) {
          totalAdmins = response.admins;
        }

        if (response.total_maestros !== undefined) {
          totalMaestros = response.total_maestros;
        } else if (response.maestros !== undefined) {
          totalMaestros = response.maestros;
        } else if (response.teachers !== undefined) {
          totalMaestros = response.teachers;
        }

        if (response.total_alumnos !== undefined) {
          totalAlumnos = response.total_alumnos;
        } else if (response.alumnos !== undefined) {
          totalAlumnos = response.alumnos;
        } else if (response.students !== undefined) {
          totalAlumnos = response.students;
        }

        // Opción 2: Si la respuesta es un array
        if (Array.isArray(response)) {
          response.forEach((item: any) => {
            if (item.rol === 'administrador' || item.role === 'admin') {
              totalAdmins = item.cantidad || item.count || 0;
            } else if (item.rol === 'maestro' || item.role === 'teacher') {
              totalMaestros = item.cantidad || item.count || 0;
            } else if (item.rol === 'alumno' || item.role === 'student') {
              totalAlumnos = item.cantidad || item.count || 0;
            }
          });
        }

        console.log("Valores obtenidos - Admins:", totalAdmins, "Maestros:", totalMaestros, "Alumnos:", totalAlumnos);

        // Calcular total general
        this.totalUsuarios = totalAdmins + totalMaestros + totalAlumnos;
        console.log("Total usuarios:", this.totalUsuarios);

        // Actualizar gráfica de barras de usuarios - FORZAR ACTUALIZACIÓN
        this.usuariosBarChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{
            data: [totalAdmins, totalMaestros, totalAlumnos],
            label: 'Usuarios Registrados',
            backgroundColor: [
              '#F88406',
              '#31E731',
              '#31E7E7'
            ],
            borderColor: [
              '#D96F00',
              '#1FC71F',
              '#1FC7C7'
            ],
            borderWidth: 2
          }]
        };

        // Actualizar gráfica circular (pie)
        this.pieChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{
            data: [totalAdmins, totalMaestros, totalAlumnos],
            label: 'Registro de usuarios',
            backgroundColor: [
              '#FCFF44',
              '#F1C8F2',
              '#31E731'
            ]
          }]
        };

        // Actualizar gráfica de dona (doughnut)
        this.doughnutChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{
            data: [totalAdmins, totalMaestros, totalAlumnos],
            label: 'Registro de usuarios',
            backgroundColor: [
              '#F88406',
              '#FCFF44',
              '#31E7E7'
            ]
          }]
        };

        this.isLoading = false;

      },
    );
  }

}
