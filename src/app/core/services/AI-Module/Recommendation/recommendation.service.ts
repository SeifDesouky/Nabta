import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cropInput, CropResponse } from '../../../models/AI.models/recommendation.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly apiUrl=`${environment.apiUrl}recommend`

  constructor(private http:HttpClient) { }

  recommend(input:cropInput):Observable<CropResponse>{
    return this.http.post<CropResponse>(this.apiUrl,input)
  }
}
