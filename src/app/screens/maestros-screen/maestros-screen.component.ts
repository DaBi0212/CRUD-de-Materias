import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EliminarUserModalComponent } from '../../modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];

  // Para la tabla
  displayedColumns: string[] = ['id_trabajador', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'cubiculo', 'area_investigacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>(this.lista_maestros as DatosUsuario[]);

  // Variables para paginación y filtros
  public totalMaestros: number = 0;
  public pageSize: number = 10;
  public currentPage: number = 0;
  public search: string = '';
  public sortBy: string = 'id';
  public sortOrder: string = 'asc';

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
    this.token = this.facadeService.getSessionToken();

    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    this.obtenerMaestros();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Obtener maestros con paginación, ordenamiento y filtros
  public obtenerMaestros() {
    const params = {
      page: (this.currentPage + 1).toString(),
      page_size: this.pageSize.toString(),
      search: this.search,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
    };

    this.maestrosService.obtenerListaMaestros(params).subscribe(
      (response) => {
        this.lista_maestros = response.results;
        this.totalMaestros = response.count;

        if (this.lista_maestros.length > 0) {
          this.dataSource.data = this.lista_maestros as DatosUsuario[];
        }
      },
      (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  // Aplicar filtro de búsqueda
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search = filterValue.trim().toLowerCase();
    this.currentPage = 0;
    this.obtenerMaestros();
  }

  // Manejar cambio de página
  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.obtenerMaestros();
  }

  // Manejar ordenamiento desde el selector
  onSortFieldChange(event: any) {
    this.sortBy = event.value;
    this.currentPage = 0;
    this.obtenerMaestros();
  }

  // Manejar ordenamiento desde la tabla
  onSortChange(event: any) {
    this.sortBy = event.active;
    this.sortOrder = event.direction;
    this.currentPage = 0;
    this.obtenerMaestros();
  }

  public goEditar(idUser: number) {
  const userId = Number(this.facadeService.getUserId());
  const userRol = this.facadeService.getUserGroup();

  // Si es maestro, solo puede editar su propio perfil
  if (userRol === 'maestro' && userId !== idUser) {
    alert("No tienes permisos para editar otros maestros.");
    return;
  }

  // Si es administrador o es su propio perfil, permite editar
  this.router.navigate(["registro-usuarios/maestro/" + idUser]);
}

public delete(idUser: number) {
  const userId = Number(this.facadeService.getUserId());
  const userRol = this.facadeService.getUserGroup();

  // Validar permisos
  if (userRol === 'administrador') {
    // Administrador puede eliminar cualquier maestro
    this.openDeleteDialog(idUser);
  } else if (userRol === 'maestro' && userId === idUser) {
    // Maestro solo puede eliminarse a sí mismo
    this.openDeleteDialog(idUser);
  } else {
    alert("No tienes permisos para eliminar este maestro.");
  }
}

private openDeleteDialog(idUser: number) {
  const dialogRef = this.dialog.open(EliminarUserModalComponent, {
    data: { id: idUser, rol: 'maestro' },
    height: '288px',
    width: '328px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if(result && result.isDelete){
      console.log("Maestro eliminado");
      alert("Maestro eliminado correctamente.");
      this.obtenerMaestros();
    } else {
      alert("Maestro no se ha podido eliminar.");
      console.log("No se eliminó el maestro");
    }
  });
}

}

export interface DatosUsuario {
  id: number;
  id_trabajador: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  rfc: string;
  cubiculo: string;
  area_investigacion: string;
  materias_json: any[];
}
