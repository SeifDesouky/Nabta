import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {io,Socket} from 'socket.io-client'
import { Conversation, Message } from '../../models/chat.model';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket:Socket
  private api=`${environment.apiUrl}chats`
  private expertApi=`${environment.apiUrl}user/all_experts`
  constructor(private http:HttpClient) { 
    this.socket=io(environment.apiUrl)
  }

  getExperts(){
    return this.http.get(`${this.expertApi}`)
  }

  getMyChats(){
    return this.http.get<Conversation[]>(`${this.api}/my`)
  }

  getMessages(conversationId:string){
    return this.http.get<Message[]>(`${this.api}/message/${conversationId}`)
  }

  startConversation(expertId:string){
    return this.http.post<Conversation>(`${this.api}/start`,{expertId:expertId})
  }

  //Socket

  addUser(userId: string) {
    this.socket.emit('addUser', userId);
  }

  sendMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    tempId:string
  }) {
    this.socket.emit('sendMessage', data);
  }

  onMessageSent():Observable<{tempId:string;message:Message}>{
    return new Observable(observer=>{
      this.socket.on('messsageSent',(data:{tempId:string;message:Message})=>{
        observer.next(data)
      })
    })
  }

  onReceiveMessage(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('receiveMessage', (msg: Message) => {
        observer.next(msg);
      });
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}

