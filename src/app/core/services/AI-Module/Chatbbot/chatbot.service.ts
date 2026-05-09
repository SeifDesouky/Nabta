import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage, SendMessageRequest, SendMessageResponse } from '../../../models/AI.models/chatbot.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private baseUrl=`${environment.apiUrl}chatbot/`
  constructor(private http:HttpClient) { }

  sendMessage(text:string):Observable<SendMessageResponse>{
    return this.http.post<SendMessageResponse>(`${this.baseUrl}`,{text})
  }

  getHistory():Observable<ChatMessage[]>{
    return this.http.get<ChatMessage[]>(`${this.baseUrl}`)
  }
}
