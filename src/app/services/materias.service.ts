import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaMateria() {
    return {
      'nrc': '',
      'nombre_materia': '',
      'seccion': '',
      'dias': [],
      'hora_inicio': '',
      'hora_fin': '',
      'salon': '',
      'programa_educativo': '',
      'profesor_asignado': '',
      'creditos': ''
    }
  }

  // Validación para el formulario
  public validarMateria(data: any, editar: boolean) {
    let error: any = {};

    // Validación NRC - exactamente 6 dígitos
    if (!this.validatorService.required(data["nrc"])) {
      error["nrc"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["nrc"])) {
      error["nrc"] = this.errorService.numeric;
    } else if (data["nrc"].toString().length !== 6) {
      error["nrc"] = "El NRC debe tener exactamente 6 dígitos";
    }

    // Validación Nombre de la materia
    if (!this.validatorService.required(data["nombre_materia"])) {
      error["nombre_materia"] = this.errorService.required;
    }

    // Validación Sección
    if (!this.validatorService.required(data["seccion"])) {
      error["seccion"] = this.errorService.required;
    }

    // Validación Días
    if (!data["dias"] || data["dias"].length === 0) {
      error["dias"] = "Debe seleccionar al menos un día";
    }

    // Validación Hora inicio
    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }

    // Validación Hora fin
    if (!this.validatorService.required(data["hora_fin"])) {
      error["hora_fin"] = this.errorService.required;
    }

    // Validación Salón
    if (!this.validatorService.required(data["salon"])) {
      error["salon"] = this.errorService.required;
    }

    // Validación Programa educativo
    if (!this.validatorService.required(data["programa_educativo"])) {
      error["programa_educativo"] = this.errorService.required;
    }

    // Validación Profesor asignado (no requerido para permitir null)
    // Eliminamos la validación requerida para permitir campo vacío

    // Validación Créditos
    if (!this.validatorService.required(data["creditos"])) {
      error["creditos"] = this.errorService.required;
    }

    return error;
  }

  // Método privado para obtener headers con token
  private getHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
  }

  // Registrar nueva materia
  public registrarMateria(data: any): Observable<any> {
    const headers = this.getHeaders();

    // Asegurar que dias sea array y profesor_asignado sea correcto
    const dataToSend = {
      ...data,
      dias: Array.isArray(data.dias) ? data.dias : [],
      profesor_asignado: data.profesor_asignado === '' ? null : data.profesor_asignado
    };

    return this.http.post<any>(`${environment.url_api}/materias/`, dataToSend, { headers });
  }

  // Obtener lista de materias con paginación
public obtenerListaMaterias(params?: any): Observable<any> {
  const token = this.facadeService.getSessionToken();
  let headers: HttpHeaders;

  if (token) {
    headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
  } else {
    headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  let httpParams = new HttpParams();

  // Solo agregar parámetros que no sean nulos, undefined o string vacío
  if (params) {
    if (params.page && params.page !== '') {
      httpParams = httpParams.set('page', params.page);
    }
    if (params.page_size && params.page_size !== '') {
      httpParams = httpParams.set('page_size', params.page_size);
    }
    if (params.search && params.search !== '') {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.sort_by && params.sort_by !== '') {
      httpParams = httpParams.set('sort_by', params.sort_by);
    }
    if (params.sort_order && params.sort_order !== '') {
      httpParams = httpParams.set('sort_order', params.sort_order);
    }
  }

  console.log("Llamando a endpoint:", `${environment.url_api}/lista-materias/`);
  console.log("Parámetros:", httpParams.toString());

  return this.http.get<any>(`${environment.url_api}/lista-materias/`, {
    headers,
    params: httpParams
  });
}

  // Obtener materia por ID
  public obtenerMateriaPorId(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.url_api}/materias/?id=${id}`, { headers });
  }

  // Actualizar materia
  public actualizarMateria(id: number, data: any): Observable<any> {
    const headers = this.getHeaders();

    // Asegurar que dias sea array y profesor_asignado sea correcto
    const dataToSend = {
      ...data,
      id: id,
      dias: Array.isArray(data.dias) ? data.dias : [],
      profesor_asignado: data.profesor_asignado === '' ? null : data.profesor_asignado
    };

    return this.http.put<any>(`${environment.url_api}/materias/`, dataToSend, { headers });
  }

  // Eliminar materia
  public eliminarMateria(idMateria: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

  // Verificar si NRC existe
  public verificarNRC(nrc: string, excludeId?: number): Observable<any> {
    const headers = this.getHeaders();
    let params = new HttpParams().set('nrc', nrc);
    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }
    return this.http.get<any>(`${environment.url_api}/verificar-nrc/`, { headers, params });
  }
}
