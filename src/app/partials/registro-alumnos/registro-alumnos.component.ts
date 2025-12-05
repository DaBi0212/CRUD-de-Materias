import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarUserModalComponent } from '../../modals/editar-user-modal/editar-user-modal.component';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = null;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno:any= {};
  public token: string = "";
  public errors:any={};
  public editar:boolean = false;
  public idUser: Number = 0;

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private facadeService: FacadeService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.token = this.facadeService.getSessionToken();

    // Verificar si hay parámetro ID en la URL para modo edición
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User para edición: ", this.idUser);

      // Obtener datos del alumno por ID
      this.obtenerAlumnoPorId();
    }
    // Si se reciben datos de usuario con ID, estamos en modo edición
    else if (this.datos_user && this.datos_user.id) {
      console.log("Datos recibidos para edición:", this.datos_user);
      this.editar = true;
      this.alumno = { ...this.datos_user };

      // Si no viene el rol de los datos, usar el rol del input
      if (!this.alumno.rol && this.rol) {
        this.alumno.rol = this.rol;
      }
    } else {
      // Modo registro - inicializar esquema vacío
      this.editar = false;
      this.alumno = this.alumnosService.esquemaAlumno();
      if (this.rol) {
        this.alumno.rol = this.rol;
      }
    }

    console.log("Datos alumno: ", this.alumno);
  }

  // Método para obtener alumno por ID
  public obtenerAlumnoPorId() {
    this.alumnosService.obtenerAlumnoPorId(Number(this.idUser)).subscribe(
      (response) => {
        console.log("Datos del alumno obtenidos:", response);
        if (response && Array.isArray(response) && response.length > 0) {
          this.alumno = response[0];
        } else if (response && response.id) {
          this.alumno = response;
        } else {
          alert("Alumno no encontrado");
          this.regresar();
          return;
        }

        // Asegurar que el rol esté asignado
        if (!this.alumno.rol && this.rol) {
          this.alumno.rol = this.rol;
        }
      },
      (error) => {
        console.error("Error al obtener alumno:", error);
        alert("Error al cargar datos del alumno");
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
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      console.log("Errores:", this.errors);
      return false;
    }

    if (this.editar) {
      this.actualizarAlumno();
    } else {
      this.registrarAlumno();
    }
  }

  public registrarAlumno() {
    //Validar la contraseña
    if(this.alumno.password == this.alumno.confirmar_password){
      this.alumnosService.registrarAlumno(this.alumno).subscribe(
        (response) => {
          alert("Alumno registrado exitosamente");
          console.log("Alumno registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["alumnos"]);
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          alert("Error al registrar alumno");
          console.error("Error al registrar alumno: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.alumno.password="";
      this.alumno.confirmar_password="";
    }
  }

  public actualizarAlumno() {
    // Abrir modal de confirmación
    const dialogRef = this.dialog.open(EditarUserModalComponent, {
      data: { rol: 'alumno' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.isEdit){
        // Si el usuario confirmó, ejecutar la actualización
        this.alumnosService.actualizarAlumno(this.alumno.id, this.alumno).subscribe(
          (response) => {
            alert("Alumno actualizado correctamente");
            console.log("Alumno actualizado: ", response);
            this.router.navigate(["alumnos"]);
          },
          (error) => {
            alert("Error al actualizar alumno");
            console.error("Error al actualizar alumno: ", error);
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

    this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.alumno.fecha_nacimiento);
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
