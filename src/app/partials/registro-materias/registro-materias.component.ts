import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss']
})
export class RegistroMateriasComponent implements OnInit {

  @Input() datos_materia: any = null;

  public materia: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idMateria: Number = 0;

  public diasSemana: any[] = [
    { value: 'Lunes', label: 'Lunes' },
    { value: 'Martes', label: 'Martes' },
    { value: 'Miércoles', label: 'Miércoles' },
    { value: 'Jueves', label: 'Jueves' },
    { value: 'Viernes', label: 'Viernes' }
  ];

  public programasEducativos: any[] = [
    { value: 'Ingeniería en Ciencias de la Computación', label: 'Ingeniería en Ciencias de la Computación' },
    { value: 'Licenciatura en Ciencias de la Computación', label: 'Licenciatura en Ciencias de la Computación' },
    { value: 'Ingeniería en Tecnologías de la Información', label: 'Ingeniería en Tecnologías de la Información' }
  ];

  public maestros: any[] = [];

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private materiasService: MateriasService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    this.token = this.facadeService.getSessionToken();
    this.cargarMaestros();

    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idMateria = this.activatedRoute.snapshot.params['id'];
      this.obtenerMateriaPorId();
    }
    else if (this.datos_materia) {
      this.editar = true;
      this.materia = { ...this.datos_materia };

      if (typeof this.materia.dias === 'string') {
        this.materia.dias = JSON.parse(this.materia.dias);
      }
      if (!Array.isArray(this.materia.dias)) {
        this.materia.dias = [];
      }
    } else {
      this.editar = false;
      this.materia = this.materiasService.esquemaMateria();
    }
  }

  public cargarMaestros() {
    this.maestrosService.obtenerListaMaestros({ page_size: 1000 }).subscribe(
      (response) => {
        if (response.results) {
          this.maestros = response.results.map((maestro: any) => ({
            id: maestro.id,
            nombre: `${maestro.first_name} ${maestro.last_name}`,
            id_trabajador: maestro.id_trabajador
          }));
        }
      },
      (error) => {
        console.error("Error al cargar maestros:", error);
      }
    );
  }

  public obtenerMateriaPorId() {
    this.materiasService.obtenerMateriaPorId(Number(this.idMateria)).subscribe(
      (response) => {
        if (response && response.id) {
          this.materia = response;
        } else if (response && Array.isArray(response) && response.length > 0) {
          this.materia = response[0];
        } else {
          alert("Materia no encontrada");
          this.regresar();
          return;
        }

        if (typeof this.materia.dias === 'string') {
          this.materia.dias = JSON.parse(this.materia.dias);
        }
        if (!Array.isArray(this.materia.dias)) {
          this.materia.dias = [];
        }
      },
      (error) => {
        alert("Error al cargar datos de la materia");
        this.regresar();
      }
    );
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    const dataToSend = this.prepararDatosParaEnviar();

    if (!this.validarHorario(dataToSend.hora_inicio, dataToSend.hora_fin)) {
      alert("Error en el horario: La hora de inicio debe ser menor que la hora de finalización.");
      this.errors.hora_inicio = "La hora de inicio debe ser antes que la hora de fin";
      this.errors.hora_fin = "Hora fin incorrecta";
      return false;
    }

    if (!this.editar || (this.editar && this.materia.nrc)) {
      this.verificarNRCUnico(dataToSend);
    } else {
      this.procesarRegistro(dataToSend);
    }
  }

  private prepararDatosParaEnviar(): any {
    const data = {
      ...this.materia,
      dias: Array.isArray(this.materia.dias) ? this.materia.dias : []
    };

    // Convertir horas a formato 24h
    if (data.hora_inicio) {
      data.hora_inicio = this.convertirHoraA24h(data.hora_inicio);
    }
    if (data.hora_fin) {
      data.hora_fin = this.convertirHoraA24h(data.hora_fin);
    }

    // Asegurar que profesor_asignado sea número o null
    if (data.profesor_asignado === '' || data.profesor_asignado === null || data.profesor_asignado === undefined) {
      data.profesor_asignado = null;
    } else {
      data.profesor_asignado = Number(data.profesor_asignado);
    }

    return data;
  }

  private convertirHoraA24h(hora: string): string {
    if (!hora) return '';

    hora = hora.trim().toUpperCase();

    // Si ya está en formato 24h (contiene solo números y :)
    if (!hora.includes('AM') && !hora.includes('PM')) {
      // Asegurar formato HH:MM
      const parts = hora.split(':');
      if (parts.length === 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      return hora;
    }

    // Convertir de 12h a 24h
    const match = hora.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const periodo = match[3].toUpperCase();

      if (periodo === 'PM' && hours < 12) {
        hours += 12;
      }
      if (periodo === 'AM' && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    return hora;
  }

  public validarHorario(inicio: string, fin: string): boolean {
    if (!inicio || !fin) return false;

    const minutosInicio = this.horaAMinutos(inicio);
    const minutosFin = this.horaAMinutos(fin);

    return minutosInicio < minutosFin;
  }

  private horaAMinutos(hora: string): number {
    if (!hora) return 0;

    hora = this.convertirHoraA24h(hora);
    const [hours, minutes] = hora.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private verificarNRCUnico(dataToSend: any) {
    const excludeId = this.editar ? Number(this.idMateria) : undefined;
    this.materiasService.verificarNRC(dataToSend.nrc, excludeId).subscribe(
      (response) => {
        if (response.exists) {
          this.errors["nrc"] = "El NRC ya existe en la base de datos";
          return;
        }
        this.procesarRegistro(dataToSend);
      },
      (error) => {
        this.procesarRegistro(dataToSend);
      }
    );
  }

  private procesarRegistro(dataToSend: any) {
    if (this.editar) {
      this.actualizarMateria(dataToSend);
    } else {
      this.registrarMateria(dataToSend);
    }
  }

  public registrarMateria(dataToSend: any) {
    this.materiasService.registrarMateria(dataToSend).subscribe(
      (response) => {
        alert("Materia registrada exitosamente");
        if (this.token && this.token !== "") {
          this.router.navigate(["lista-materias"]);
        } else {
          this.router.navigate(["/"]);
        }
      },
      (error) => {
        if (error.error && error.error.error) {
          const errorMsg = this.obtenerMensajeError(error.error.error);
          alert(`Error al registrar materia: ${errorMsg}`);
        } else {
          alert("Error al registrar materia");
        }
      }
    );
  }

  public actualizarMateria(dataToSend: any) {
    this.materiasService.actualizarMateria(this.materia.id, dataToSend).subscribe(
      (response) => {
        alert("Materia actualizada correctamente");
        this.router.navigate(["lista-materias"]);
      },
      (error) => {
        if (error.error && error.error.error) {
          const errorMsg = this.obtenerMensajeError(error.error.error);
          alert(`Error al actualizar materia: ${errorMsg}`);
        } else {
          alert("Error al actualizar materia");
        }
      }
    );
  }

  private obtenerMensajeError(errorObj: any): string {
  if (typeof errorObj === 'string') {
    return errorObj;
  }

  if (errorObj && typeof errorObj === 'object') {
    const errors: string[] = [];  // Especificar tipo string[]
    for (const key in errorObj) {
      if (errorObj.hasOwnProperty(key)) {
        errors.push(`${key}: ${errorObj[key]}`);
      }
    }
    return errors.join(', ');
  }

  return 'Error desconocido';
}

  public checkboxDiaChange(event: any, dia: string) {
    if (!this.materia.dias) {
      this.materia.dias = [];
    }
    if (event.checked) {
      if (!this.materia.dias.includes(dia)) {
        this.materia.dias.push(dia);
      }
    } else {
      const index = this.materia.dias.indexOf(dia);
      if (index > -1) {
        this.materia.dias.splice(index, 1);
      }
    }
  }

  public revisarDiaSeleccionado(dia: string): boolean {
    if (!this.materia.dias || !Array.isArray(this.materia.dias)) {
      return false;
    }
    return this.materia.dias.includes(dia);
  }

  public soloNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  public soloLetrasYEspacios(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32 &&
      charCode !== 209 &&
      charCode !== 241
    ) {
      event.preventDefault();
    }
  }

  public alfanumericoYEspacios(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 48 && charCode <= 57) &&
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

  public soloNumerosCreditos(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
