import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Post, CreatePostRequest, UpdatePostRequest } from '../../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly BASE = `${environment.apiUrl}post`;

  constructor(private http: HttpClient) {}

  // GET /post/all_posts
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.BASE}/all_posts`);
  }

  // GET /post/my_posts (token)
  getMyPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.BASE}/my_posts`);
  }

  // POST /post
  createPost(payload: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${this.BASE}/`, payload);
  }

  // PATCH /post/:id (token)
  updatePost(id: string, payload: UpdatePostRequest): Observable<Post> {
    return this.http.patch<Post>(`${this.BASE}/${id}`, payload);
  }

  // DELETE /post/:id
  deletePost(id: string): Observable<string> {
    return this.http.delete<string>(`${this.BASE}/${id}`);
  }

  // helper: format time ago
  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}
