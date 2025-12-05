import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { MatRadioChange } from '@angular/material/radio';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo:string = "registro-usuarios";
  public user:any = {};
  public editar:boolean = false;
  public rol:string = "";
  public idUser:number = 0;

  //Banderas para el tipo de usuario
  public isAdmin:boolean = false;
  public isAlumno:boolean = false;
  public isMaestro:boolean = false;

  public tipo_user:string = "";

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private alumnosService: AlumnosService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    this.user.tipo_usuario = '';

    //Obtener de la URL el rol para saber cual editar
    if(this.activatedRoute.snapshot.params['rol'] != undefined){
      this.rol = this.activatedRoute.snapshot.params['rol'];
      console.log("Rol detectado: ", this.rol);

      // Si estamos en modo edición, establecer automáticamente el tipo de usuario
      if (this.rol) {
        this.user.tipo_usuario = this.rol;
        this.setUserTypeFlags(this.rol);
      }
    }

    //El if valida si existe un parámetro ID en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Al iniciar la vista obtiene el usuario por su ID
      this.obtenerUserByID();
    }
  }

  public radioChange(event: MatRadioChange) {
    this.setUserTypeFlags(event.value);
  }

  // Método para establecer las banderas según el tipo de usuario
  private setUserTypeFlags(userType: string) {
    if(userType == "administrador"){
      this.isAdmin = true;
      this.isAlumno = false;
      this.isMaestro = false;
      this.tipo_user = "administrador";
    }else if (userType == "alumno"){
      this.isAdmin = false;
      this.isAlumno = true;
      this.isMaestro = false;
      this.tipo_user = "alumno";
    }else if (userType == "maestro"){
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = true;
      this.tipo_user = "maestro";
    } else {
      // Si no hay tipo seleccionado, ocultar todos los formularios
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = false;
      this.tipo_user = "";
    }
  }

  //Obtener usuario por ID
  public obtenerUserByID() {
    console.log("Obteniendo usuario de tipo: ", this.rol, " con ID: ", this.idUser);

    if(this.rol == "administrador"){
      this.administradoresService.obtenerAdminPorID(this.idUser).subscribe(
        (response) => {
          console.log("Respuesta completa del administrador: ", response);
          if (response && Array.isArray(response) && response.length > 0) {
            this.user = response[0];
          } else if (response && response.id) {
            this.user = response;
          } else {
            console.error("Estructura de respuesta inesperada:", response);
            alert("Error al cargar datos del administrador");
            return;
          }

          console.log("Usuario administrador obtenido: ", this.user);
          this.user.tipo_usuario = this.rol;
          this.setUserTypeFlags(this.rol);
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el administrador seleccionado");
        }
      );
    }else if(this.rol == "maestro"){
      this.maestrosService.obtenerMaestroPorId(this.idUser).subscribe(
        (response) => {
          console.log("Respuesta completa del maestro: ", response);
          if (response && Array.isArray(response) && response.length > 0) {
            this.user = response[0];
          } else if (response && response.id) {
            this.user = response;
          } else {
            console.error("Estructura de respuesta inesperada:", response);
            alert("Error al cargar datos del maestro");
            return;
          }

          console.log("Maestro obtenido: ", this.user);
          this.user.tipo_usuario = this.rol;
          this.setUserTypeFlags(this.rol);
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el maestro seleccionado");
        }
      );
    }else if(this.rol == "alumno"){
      this.alumnosService.obtenerAlumnoPorId(this.idUser).subscribe(
        (response) => {
          console.log("Respuesta completa del alumno: ", response);
          if (response && Array.isArray(response) && response.length > 0) {
            this.user = response[0];
          } else if (response && response.id) {
            this.user = response;
          } else {
            console.error("Estructura de respuesta inesperada:", response);
            alert("Error al cargar datos del alumno");
            return;
          }

          console.log("Alumno obtenido: ", this.user);
          this.user.tipo_usuario = this.rol;
          this.setUserTypeFlags(this.rol);
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el alumno seleccionado");
        }
      );
    }
  }

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
