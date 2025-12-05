import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-registro-materias-screen',
  templateUrl: './registro-materias-screen.component.html',
  styleUrls: ['./registro-materias-screen.component.scss']
})
export class RegistroMateriasScreenComponent implements OnInit {

  public editar: boolean = false;
  public idMateria: number = 0;
  public datos_materia: any = null;

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private materiasService: MateriasService
  ) { }

  ngOnInit(): void {
    // Verificar permisos - solo administrador puede registrar materias
    const userRole = this.facadeService.getUserGroup();
    if (userRole !== 'administrador') {
      alert("No tienes permisos para acceder a esta sección");
      this.router.navigate(['/home']);
      return;
    }

    // Verificar si hay parámetro ID en la URL para modo edición
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idMateria = this.activatedRoute.snapshot.params['id'];
      console.log("ID Materia para edición: ", this.idMateria);

      // Obtener datos de la materia por ID
      this.obtenerMateriaPorId();
    }
  }

  // Método para obtener materia por ID
  public obtenerMateriaPorId() {
    this.materiasService.obtenerMateriaPorId(this.idMateria).subscribe(
      (response) => {
        console.log("Datos de la materia obtenidos:", response);
        if (response && Array.isArray(response) && response.length > 0) {
          this.datos_materia = response[0];
        } else if (response && response.id) {
          this.datos_materia = response;
        } else {
          alert("Materia no encontrada");
          this.goBack();
          return;
        }
      },
      (error) => {
        console.error("Error al obtener materia:", error);
        alert("Error al cargar datos de la materia");
        this.goBack();
      }
    );
  }

  // Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}

