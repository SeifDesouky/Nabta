import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ToggleInteractionRequest,
  MyInteractionsResponse,
  InteractionType,
  TargetType
} from '../../models/interactions.model';

@Injectable({ providedIn: 'root' })
export class InteractionService {
  private readonly BASE = `${environment.apiUrl}interaction`;

  constructor(private http: HttpClient) {}

  // POST /interaction (token) — like أو save أو remove لو موجود
  toggle(payload: ToggleInteractionRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.BASE}/`, payload);
  }

  // GET /interaction?type=like&targetType=Post (token)
  getMyInteractions(type?: InteractionType, targetType?: TargetType): Observable<MyInteractionsResponse> {
    let params = new HttpParams();
    if (type)       params = params.set('type', type);
    if (targetType) params = params.set('targetType', targetType);
    return this.http.get<MyInteractionsResponse>(`${this.BASE}/`, { params });
  }

  // helper: like post
  likePost(postId: string) {
    return this.toggle({ targetId: postId, targetType: 'Post', type: 'like' });
  }

  // helper: save post
  savePost(postId: string) {
    return this.toggle({ targetId: postId, targetType: 'Post', type: 'save' });
  }

  // helper: like tip
  likeTip(tipId: string) {
    return this.toggle({ targetId: tipId, targetType: 'ExpertTips', type: 'like' });
  }
}
