import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarUserModalComponent } from '../../modals/editar-user-modal/editar-user-modal.component';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = null;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  //Para el select
  public areas: any[] = [
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  this.token = this.facadeService.getSessionToken();

  // Verificar si hay parámetro ID en la URL para modo edición
  if(this.activatedRoute.snapshot.params['id'] != undefined){
    this.editar = true;
    this.idUser = this.activatedRoute.snapshot.params['id'];
    console.log("ID User para edición: ", this.idUser);

    // Obtener el ID del usuario logueado
    const loggedUserId = Number(this.facadeService.getUserId());
    const userRol = this.facadeService.getUserGroup();

    // Validar permisos: si es maestro y no está editando su propio perfil
    if (userRol === 'maestro' && loggedUserId !== Number(this.idUser)) {
      alert("No tienes permisos para editar otros maestros.");
      this.regresar();
      return;
    }

    // Obtener datos del maestro por ID
    this.obtenerMaestroPorId();
  }
  // Si se reciben datos de usuario con ID, estamos en modo edición
  else if (this.datos_user && this.datos_user.id) {
    console.log("Datos recibidos para edición:", this.datos_user);
    this.editar = true;

    // Validar permisos
    const loggedUserId = Number(this.facadeService.getUserId());
    const userRol = this.facadeService.getUserGroup();

    if (userRol === 'maestro' && loggedUserId !== this.datos_user.id) {
      alert("No tienes permisos para editar otros maestros.");
      this.regresar();
      return;
    }

    this.maestro = { ...this.datos_user };

    // Si no viene el rol de los datos, usar el rol del input
    if (!this.maestro.rol && this.rol) {
      this.maestro.rol = this.rol;
    }

    // Asegurar que materias_json sea un array
    if (!this.maestro.materias_json) {
      this.maestro.materias_json = [];
    }
  } else {
    // Modo registro - inicializar esquema vacío
    this.editar = false;
    this.maestro = this.maestrosService.esquemaMaestro();
    if (this.rol) {
      this.maestro.rol = this.rol;
    }
  }

  console.log("Datos maestro: ", this.maestro);
}

  // Método para obtener maestro por ID
  public obtenerMaestroPorId() {
    this.maestrosService.obtenerMaestroPorId(Number(this.idUser)).subscribe(
      (response) => {
        console.log("Datos del maestro obtenidos:", response);
        if (response && Array.isArray(response) && response.length > 0) {
          this.maestro = response[0];
        } else if (response && response.id) {
          this.maestro = response;
        } else {
          alert("Maestro no encontrado");
          this.regresar();
          return;
        }

        // Asegurar que el rol esté asignado
        if (!this.maestro.rol && this.rol) {
          this.maestro.rol = this.rol;
        }

        // Asegurar que materias_json sea un array
        if (!this.maestro.materias_json) {
          this.maestro.materias_json = [];
        }
      },
      (error) => {
        console.error("Error al obtener maestro:", error);
        alert("Error al cargar datos del maestro");
        this.regresar();
      }
    );
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      console.log("Errores:", this.errors);
      return false;
    }

    if (this.editar) {
      this.actualizarMaestro();
    } else {
      this.registrarMaestro();
    }
  }

  public registrarMaestro() {
    //Validar la contraseña
    if(this.maestro.password == this.maestro.confirmar_password){
      this.maestrosService.registrarMaestro(this.maestro).subscribe(
        (response) => {
          alert("Maestro registrado exitosamente");
          console.log("Maestro registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["maestros"]);
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          alert("Error al registrar maestro");
          console.error("Error al registrar maestro: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.maestro.password="";
      this.maestro.confirmar_password="";
    }
  }

  public actualizarMaestro() {
    // Abrir modal de confirmación
    const dialogRef = this.dialog.open(EditarUserModalComponent, {
      data: { rol: 'maestro' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.isEdit){
        // Si el usuario confirmó, ejecutar la actualización
        this.maestrosService.actualizarMaestro(this.maestro.id, this.maestro).subscribe(
          (response) => {
            alert("Maestro actualizado correctamente");
            console.log("Maestro actualizado: ", response);
            this.router.navigate(["maestros"]);
          },
          (error) => {
            alert("Error al actualizar maestro");
            console.error("Error al actualizar maestro: ", error);
          }
        );
      }
    });
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    console.log(event);
    console.log(event.value.toISOString());

    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.maestro.fecha_nacimiento);
  }

  // Funciones para los checkbox
  public checkboxChange(event:any){
    console.log("Evento: ", event);
    if(event.checked){
      this.maestro.materias_json.push(event.source.value)
    }else{
      console.log(event.source.value);
      this.maestro.materias_json.forEach((materia, i) => {
        if(materia == event.source.value){
          this.maestro.materias_json.splice(i,1)
        }
      });
    }
    console.log("Array materias: ", this.maestro);
  }

  public revisarSeleccion(nombre: string){
    if(this.maestro.materias_json){
      var busqueda = this.maestro.materias_json.find((element)=>element==nombre);
      if(busqueda != undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }

}
