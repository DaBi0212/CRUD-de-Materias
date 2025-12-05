import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EliminarMateriaModalComponent } from '../../modals/eliminar-materia-modal/eliminar-materia-modal.component';

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_materias: any[] = [];
  public lista_maestros: any[] = [];

  public displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<DatosMateria>(this.lista_materias as DatosMateria[]);

  public totalMaterias: number = 0;
  public pageSize: number = 10;
  public currentPage: number = 0;
  public search: string = '';
  public sortBy: string = 'nrc';
  public sortOrder: string = 'asc';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public facadeService: FacadeService,
    public materiasService: MateriasService,
    private maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (this.token == "") {
      this.router.navigate(["/"]);
    }

    this.configurarColumnas();
    this.cargarMaestros();
    this.obtenerMaterias();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private configurarColumnas() {
    if (this.rol === 'administrador') {
      this.displayedColumns = ['nrc', 'nombre_materia', 'seccion', 'dias', 'horario', 'salon', 'programa_educativo', 'profesor', 'creditos', 'editar', 'eliminar'];
    } else if (this.rol === 'maestro') {
      this.displayedColumns = ['nrc', 'nombre_materia', 'seccion', 'dias', 'horario', 'salon', 'programa_educativo', 'profesor', 'creditos'];
    } else {
      this.displayedColumns = ['nrc', 'nombre_materia', 'seccion', 'dias', 'horario', 'salon', 'programa_educativo', 'profesor', 'creditos'];
    }
  }

  // Obtener materias con paginación, ordenamiento y filtros
  public obtenerMaterias() {
    const params = {
      page: (this.currentPage + 1).toString(),
      page_size: this.pageSize.toString(),
      search: this.search,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
    };

    console.log("Obteniendo materias con params:", params);

    this.materiasService.obtenerListaMaterias(params).subscribe(
      (response) => {
        console.log("Respuesta del backend:", response);

        // Verificar si la respuesta es del tipo paginado o simple array
        if (response && response.results !== undefined) {
          // Formato paginado (Django REST Framework)
          this.lista_materias = response.results;
          this.totalMaterias = response.count || 0;
        } else if (Array.isArray(response)) {
          // Si es un array simple (sin paginación)
          this.lista_materias = response;
          this.totalMaterias = response.length;
        } else {
          console.error("Formato de respuesta inesperado:", response);
          this.lista_materias = [];
          this.totalMaterias = 0;
        }

        // Actualizar el dataSource
        if (this.lista_materias.length > 0) {
          this.dataSource.data = this.lista_materias as DatosMateria[];
          console.log("Materias cargadas:", this.lista_materias.length);
        } else {
          this.dataSource.data = [];
          console.log("No hay materias registradas");
        }
      },
      (error) => {
        console.error("Error al obtener la lista de materias: ", error);
        alert("No se pudo obtener la lista de materias. Verifica la conexión con el servidor.");
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search = filterValue.trim().toLowerCase();
    this.currentPage = 0;
    this.obtenerMaterias();
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.obtenerMaterias();
  }

  // ORDENAMIENTO DESDE EL SELECTOR
  onSortFieldChange(event: any) {
    const nuevoCampo = event.value;

    // Si se selecciona el mismo campo, cambiar la dirección
    if (nuevoCampo === this.sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es un campo diferente, establecer dirección ascendente por defecto
      this.sortBy = nuevoCampo;
      this.sortOrder = 'asc';
    }

    this.currentPage = 0;

    // Actualizar visualmente los encabezados de la tabla
    this.actualizarEncabezadosTabla();

    this.obtenerMaterias();
  }

  // ORDENAMIENTO DESDE LOS ENCABEZADOS DE LA TABLA
  onSortChange(event: any) {
    // Solo actualizar si realmente hubo un cambio
    if (event.active !== this.sortBy || event.direction !== this.sortOrder) {
      this.sortBy = event.active;
      this.sortOrder = event.direction;
      this.currentPage = 0;
      this.obtenerMaterias();
    }
  }

  // Método para actualizar visualmente los encabezados de la tabla
  private actualizarEncabezadosTabla() {
    if (this.sort) {
      // Forzar la actualización visual del ordenamiento en la tabla
      this.sort.active = this.sortBy;
      this.sort.direction = this.sortOrder as 'asc' | 'desc' | '';

      // Emitir evento para que Angular Material actualice las flechas visuales
      const sortState: Sort = {
        active: this.sortBy,
        direction: this.sortOrder as 'asc' | 'desc' | ''
      };

      // Solo emitir si realmente hubo un cambio
      if (this.sort.active !== sortState.active || this.sort.direction !== sortState.direction) {
        setTimeout(() => {
          this.sort.sortChange.emit(sortState);
        }, 0);
      }
    }
  }

  public formatearDias(dias: any): string {
    if (!dias) return '';

    // Si es string, intentar convertirlo a array
    if (typeof dias === 'string') {
      try {
        dias = JSON.parse(dias);
      } catch (e) {
        // Si no es JSON válido, verificar si es string separado por comas
        if (dias.includes(',')) {
          dias = dias.split(',').map((d: string) => d.trim());
        } else if (dias.includes('"') || dias.includes("'")) {
          // Intentar manejar otros formatos
          const cleaned = dias.replace(/[\[\]\"\']/g, '');
          dias = cleaned.split(',').map((d: string) => d.trim());
        } else {
          return dias; // Devolver el string tal cual
        }
      }
    }

    // Si es array, unirlo
    if (Array.isArray(dias)) {
      return dias.join(', ');
    }

    return '';
  }

  public formatearHorario(horaInicio: string, horaFin: string): string {
    if (!horaInicio || !horaFin) return '';

    // Formatear para mostrar solo hora:minutos (sin segundos)
    const formatTime = (timeStr: string) => {
      if (!timeStr) return '';
      // Si tiene segundos, removerlos
      if (timeStr.includes(':') && timeStr.split(':').length > 2) {
        const parts = timeStr.split(':');
        return `${parts[0]}:${parts[1]}`;
      }
      return timeStr;
    };

    return `${formatTime(horaInicio)} - ${formatTime(horaFin)}`;
  }

  private cargarMaestros() {
    this.maestrosService.obtenerListaMaestros({ page_size: 1000 }).subscribe(
      (response) => {
        if (response && response.results) {
          this.lista_maestros = response.results;
          console.log("Maestros cargados:", this.lista_maestros.length);
        } else if (Array.isArray(response)) {
          this.lista_maestros = response;
        }
      },
      (error) => {
        console.error("Error al cargar maestros:", error);
      }
    );
  }

  public obtenerNombreProfesor(profesorId: any): string {
    if (!profesorId || profesorId === 'null' || profesorId === 'undefined' || profesorId === '') {
      return 'Sin asignar';
    }

    // Asegurar que sea número para comparar
    const idNumerico = Number(profesorId);

    const maestro = this.lista_maestros.find(m =>
      m.id === idNumerico ||
      m.id === profesorId ||
      (m.user && m.user.id === idNumerico)
    );

    if (maestro) {
      return `${maestro.first_name || ''} ${maestro.last_name || ''}`.trim();
    }

    // Si no se encuentra en la lista, mostrar el ID
    return `Profesor ID: ${profesorId}`;
  }

  public goEditar(idMateria: number) {
    if (this.rol === 'administrador') {
      this.router.navigate(["registro-materias/" + idMateria]);
    } else {
      alert("No tienes permisos para editar materias");
    }
  }

  public delete(idMateria: number) {
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EliminarMateriaModalComponent, {
        data: { id: idMateria },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.isDelete) {
          console.log("Materia eliminada");
          alert("Materia eliminada correctamente.");
          this.obtenerMaterias();
        } else {
          alert("Materia no se ha podido eliminar.");
          console.log("No se eliminó la materia");
        }
      });
    } else {
      alert("No tienes permisos para eliminar materias.");
    }
  }

}

export interface DatosMateria {
  id: number;
  nrc: string;
  nombre_materia: string;
  seccion: string;
  dias: any;
  hora_inicio: string;
  hora_fin: string;
  salon: string;
  programa_educativo: string;
  profesor_asignado: any;
  creditos: string;
}
