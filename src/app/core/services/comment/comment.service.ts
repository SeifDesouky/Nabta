import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Comment, CreateCommentRequest } from '../../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly BASE = `${environment.apiUrl}comment`;

  constructor(private http: HttpClient) {}

  // GET /comment/:postId/comments
  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.BASE}/${postId}/comments`);
  }

  // POST /comment (token)
  addComment(payload: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.BASE}/`, payload);
  }

  // PATCH /comment/:id
  updateComment(id: string, content: string): Observable<Comment> {
    return this.http.patch<Comment>(`${this.BASE}/${id}`, { content });
  }

  // DELETE /comment/:id (token)
  deleteComment(id: string): Observable<string> {
    return this.http.delete<string>(`${this.BASE}/${id}`);
  }
}
