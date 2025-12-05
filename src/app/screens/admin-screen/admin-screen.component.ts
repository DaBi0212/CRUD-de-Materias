import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user: string = "";
  public lista_admins: any[] = [];

  // Variables para paginación y filtros
  public totalAdmins: number = 0;
  public pageSize: number = 10;
  public currentPage: number = 0;
  public search: string = '';
  public sortBy: string = 'id';
  public sortOrder: string = 'asc';
  public loading: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();

    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //Obtener lista de usuarios
  public obtenerAdmins() {
    this.loading = true;
    const params = {
      page: (this.currentPage + 1).toString(),
      page_size: this.pageSize.toString(),
      search: this.search,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
    };

    this.administradoresService.obtenerListaAdmins(params).subscribe(
      (response) => {
        console.log("Respuesta de administradores:", response);

        if (response && response.results) {
          // Respuesta con paginación
          this.lista_admins = response.results;
          this.totalAdmins = response.count;
        } else if (Array.isArray(response)) {
          // Respuesta sin paginación (fallback)
          this.lista_admins = response;
          this.totalAdmins = response.length;
        } else {
          console.error("Estructura de respuesta inesperada:", response);
          this.lista_admins = [];
          this.totalAdmins = 0;
        }

        console.log("Lista admins procesada: ", this.lista_admins);
        this.loading = false;
      }, (error) => {
        console.error("Error al obtener administradores:", error);
        alert("No se pudo obtener la lista de administradores");
        this.loading = false;
      }
    );
  }

  // Aplicar filtro de búsqueda
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search = filterValue.trim().toLowerCase();
    this.currentPage = 0;
    this.obtenerAdmins();
  }

  // Manejar cambio de página
  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.obtenerAdmins();
  }

  // Manejar ordenamiento desde el selector
  onSortFieldChange(event: any) {
    this.sortBy = event.value;
    this.currentPage = 0;
    this.obtenerAdmins();
  }

  public goEditar(idUser: number) { // Asegúrate de que sea number, no Number
    this.router.navigate(["registro-usuarios/administrador/"+idUser]);
  }

  public delete(idUser: number) { // Asegúrate de que sea number, no Number
    const dialogRef = this.dialog.open(EliminarUserModalComponent,{
      data: {id: idUser, rol: 'administrador'},
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Administrador eliminado");
        // Si estamos en la última página y solo queda un elemento, retroceder una página
        if (this.lista_admins.length === 1 && this.currentPage > 0) {
          this.currentPage--;
          if (this.paginator) {
            this.paginator.pageIndex = this.currentPage;
          }
        }
        // Recargar la lista
        this.obtenerAdmins();
      }else{
        alert("No se pudo eliminar el administrador");
      }
    });
  }
}
