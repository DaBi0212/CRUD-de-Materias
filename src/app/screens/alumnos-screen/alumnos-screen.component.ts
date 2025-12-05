import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { EliminarUserModalComponent } from '../../modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  // Para la tabla - QUITAR 'editar' y 'eliminar' cuando sea alumno
  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'curp', 'rfc', 'edad', 'telefono', 'ocupacion'];

  // Si el usuario NO es alumno, mostrar columnas de acciones
  public getColumnsToDisplay(): string[] {
    if (this.rol === 'alumno') {
      // Alumno: solo columnas de información
      return ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'curp', 'rfc', 'edad', 'telefono', 'ocupacion'];
    } else {
      // Administrador o Maestro: columnas con acciones
      return ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'curp', 'rfc', 'edad', 'telefono', 'ocupacion', 'editar', 'eliminar'];
    }
  }

  dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno[]);

  // Variables para paginación y filtros
  public totalAlumnos: number = 0;
  public pageSize: number = 10;
  public currentPage: number = 0;
  public search: string = '';
  public sortBy: string = 'id';
  public sortOrder: string = 'asc';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    this.obtenerAlumnos();

    // Actualizar displayedColumns según el rol
    this.displayedColumns = this.getColumnsToDisplay();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // En el método onSortChange, corregir el mapeo de campos:
  onSortChange(event: any) {
    // Mapear los nombres de columnas de la tabla a los campos del backend
    const columnMapping: {[key: string]: string} = {
      'nombre': 'first_name',
      'email': 'email',
      'matricula': 'matricula'
    };

    this.sortBy = columnMapping[event.active] || 'id';
    this.sortOrder = event.direction || 'asc';
    this.currentPage = 0;
    this.obtenerAlumnos();
  }

  // En el método onSortFieldChange, asegurar que se resetee la página:
  onSortFieldChange(event: any) {
    this.sortBy = event.value;
    this.sortOrder = 'asc'; // Resetear el orden a ascendente
    this.currentPage = 0;
    this.obtenerAlumnos();
  }

  // Modificar el método obtenerAlumnos para enviar correctamente los parámetros:
  public obtenerAlumnos() {
    const params: any = {
      page: (this.currentPage + 1).toString(),
      page_size: this.pageSize.toString(),
    };

    // Solo agregar search si tiene valor
    if (this.search && this.search.trim() !== '') {
      params.search = this.search.trim();
    }

    // Solo agregar ordenamiento si tiene valor
    if (this.sortBy && this.sortBy !== '') {
      params.sort_by = this.sortBy;
      params.sort_order = this.sortOrder;
    }

    this.alumnosService.obtenerListaAlumnos(params).subscribe(
      (response) => {
        this.lista_alumnos = response.results || response; // Manejar ambos formatos de respuesta
        this.totalAlumnos = response.count || this.lista_alumnos.length;

        if (this.lista_alumnos.length > 0) {
          this.dataSource.data = this.lista_alumnos as DatosAlumno[];
        } else {
          this.dataSource.data = [];
        }
      },
      (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  // Aplicar filtro de búsqueda
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search = filterValue.trim().toLowerCase();
    this.currentPage = 0;
    this.obtenerAlumnos();
  }

  // Manejar cambio de página
  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.obtenerAlumnos();
  }

  public goEditar(idUser: number) {
    // SOLO administradores y maestros pueden editar
    if (this.rol === 'administrador' || this.rol === 'maestro') {
      this.router.navigate(["registro-usuarios/alumno/" + idUser]);
    } else {
      alert("No tienes permisos para editar alumnos.");
    }
  }

  public delete(idUser: number) {
    // SOLO administradores y maestros pueden eliminar
    if (this.rol === 'administrador' || this.rol === 'maestro') {
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'alumno' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result && result.isDelete){
          console.log("Alumno eliminado");
          alert("Alumno eliminado correctamente.");
          this.obtenerAlumnos();
        } else {
          alert("Alumno no se ha podido eliminar.");
          console.log("No se eliminó el alumno");
        }
      });
    } else {
      alert("No tienes permisos para eliminar alumnos.");
    }
  }

}

export interface DatosAlumno {
  id: number;
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  curp: string;
  rfc: string;
  edad: number;
  telefono: string;
  ocupacion: string;
}
