import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarUserModalComponent } from '../../modals/editar-user-modal/editar-user-modal.component';

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public admin:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: number = 0; // CAMBIADO: Number -> number

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private administradoresService: AdministradoresService,
    private facadeService: FacadeService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    //El primer if valida si existe un parámetro en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);

      // OBTENER LOS DATOS DEL ADMINISTRADOR POR ID
      this.obtenerAdminPorId();
    }else{
      // Si no va a this.editar, entonces inicializamos el JSON para registro nuevo
      this.admin = this.administradoresService.esquemaAdmin();
      this.admin.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    //Imprimir datos en consola
    console.log("Admin: ", this.admin);
  }

  // NUEVO MÉTODO PARA OBTENER ADMIN POR ID
  public obtenerAdminPorId() {
    this.administradoresService.obtenerAdminPorID(this.idUser).subscribe(
      (response) => {
        console.log("Datos del administrador obtenidos:", response);
        this.admin = response;

        // Asegurarnos de que tenemos todos los campos necesarios
        if (!this.admin.clave_admin) this.admin.clave_admin = '';
        if (!this.admin.first_name) this.admin.first_name = '';
        if (!this.admin.last_name) this.admin.last_name = '';
        if (!this.admin.email) this.admin.email = '';
        if (!this.admin.telefono) this.admin.telefono = '';
        if (!this.admin.rfc) this.admin.rfc = '';
        if (!this.admin.edad) this.admin.edad = '';
        if (!this.admin.ocupacion) this.admin.ocupacion = '';

        // Para edición, no necesitamos password
        this.admin.password = '';
        this.admin.confirmar_password = '';

        console.log("Admin cargado para edición:", this.admin);
      },
      (error) => {
        console.error("Error al obtener administrador:", error);
        alert("Error al cargar los datos del administrador");
        this.regresar();
      }
    );
  }

  public regresar(){
    this.location.back();
  }

  //Funciones para password
  public showPassword()
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

  public showPwdConfirmar()
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

  public registrar(){
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    // Validar si las contraseñas coinciden

    //Validar la contraseña
    if(this.admin.password == this.admin.confirmar_password){
      // Ejecutamos el servicio de registro
      this.administradoresService.registrarAdmin(this.admin).subscribe(
        (response) => {
          // Redirigir o mostrar mensaje de éxito
          alert("Administrador registrado exitosamente");
          console.log("Administrador registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["administrador"]);
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          // Manejar errores de la API
          alert("Error al registrar administrador");
          console.error("Error al registrar administrador: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.admin.password="";
      this.admin.confirmar_password="";
    }
  }

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Abrir modal de confirmación
    const dialogRef = this.dialog.open(EditarUserModalComponent, {
      data: { rol: 'administrador' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.isEdit){
        // Si el usuario confirmó, ejecutar la actualización
        console.log("Datos a actualizar:", this.admin);

        // Ejecutamos el servicio de actualización
        this.administradoresService.actualizarAdmin(this.admin).subscribe(
          (response) => {
            // Redirigir o mostrar mensaje de éxito
            alert("Administrador actualizado exitosamente");
            console.log("Administrador actualizado: ", response);
            this.router.navigate(["administrador"]);
          },
          (error) => {
            // Manejar errores de la API
            alert("Error al actualizar administrador");
            console.error("Error al actualizar administrador: ", error);
          }
        );
      }
    });
  }

  // Función para los campos solo de datos alfabeticos
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
