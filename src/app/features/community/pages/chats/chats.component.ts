import { Component, ElementRef, ViewChild } from '@angular/core';
import { Conversation, Message } from '../../../../core/models/chat.model';
import { ChatService } from '../../../../core/services/chat/chat.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FarmerSidebarComponent } from "../../../farmer/shared/farmer-sidebar/farmer-sidebar.component";

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, FarmerSidebarComponent],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent {

  conversations:Conversation[]=[]
  activeConversation:Conversation|null=null
  messages:Message[]=[]
  isLoadingChats=true
  isLoadingMsgs=false
  isTyping = false;
  experts:any[]=[]
  showExperts=false

  currentUserId=localStorage.getItem('id') || ''
  currentUserRole=localStorage.getItem('role')
  private msgSub!:Subscription
  @ViewChild('messagesArea') messagesArea!: ElementRef;

  constructor(private chatService:ChatService){}
  ngOnInit() {
    if(!this.currentUserId) return

    // 1. سجّل نفسك أونلاين
    this.chatService.addUser(this.currentUserId);

    // 2. جيب المحادثات
    this.loadChats();

    // استبدل الـ temp message بالحقيقي
    this.chatService.onMessageSent().subscribe(({ tempId, message }) => {
      const idx = this.messages.findIndex(m => m._id === tempId);
      if (idx !== -1) {
        this.messages[idx] = { ...message, from: 'me' };
      }
    });

    // استقبل من الطرف التاني بس
    this.msgSub = this.chatService.onReceiveMessage().subscribe(msg => {
      if (msg.conversation === this.activeConversation?._id) {
        // تأكد مش رسالتك انت
        if (msg.sender !== this.currentUserId) {
          this.messages.push({ ...msg, from: 'them' });
          this.scrollToBottom();
        }
      }
    });
  }

  ngOnDestroy() {
    this.msgSub?.unsubscribe();
    this.chatService.disconnect();
  }

  // ─── Load Chats ──────────────────────────────
  loadChats() {
    this.isLoadingChats = true;
    this.chatService.getMyChats().subscribe({
      next: (data) => {
        this.conversations = data.filter(c => c.farmer && c.expert);
        this.isLoadingChats = false;
      },
      error: () => { this.isLoadingChats = false; }
    });
  }

  loadExperts(){
    this.chatService.getExperts().subscribe({
      next:(res:any)=>{
        this.experts=res
      },
      error:(err)=>{
        console.error(err);
        
      }
    })
  }

  toggleExperts(){
    this.showExperts=!this.showExperts
    if(this.showExperts && this.experts.length===0){
      this.loadExperts()
    }
  }

  startChat(expert:any){
    console.log(expert);
    const expertId=expert.user._id

    const existing=this.conversations.find(conv=>
      conv.expert._id===expertId || conv.farmer._id===expertId
    )
    if(existing){
      this.openChat(existing)
      this.showExperts=false
      return
    }

    this.chatService.startConversation(expertId).subscribe({
      next: (newConv: Conversation) => {
        this.conversations.unshift(newConv);
        this.openChat(newConv);
        this.showExperts = false;
      },
      error: (err) => console.error(err)
    });
  }

  // ─── Open Chat ───────────────────────────────
  openChat(conv: Conversation) {
    this.activeConversation = conv;
    this.messages = [];
    this.isLoadingMsgs = true;

    this.chatService.getMessages(conv._id).subscribe({
      next: (msgs) => {
        // حدد كل رسالة هي sent أو received
        this.messages = msgs.map(m => ({
          ...m,
          from: m.sender === this.currentUserId ? 'me' : 'them'
        }));
        this.isLoadingMsgs = false;
        this.scrollToBottom();
      },
      error: () => { this.isLoadingMsgs = false; }
    });
  }

  goBack() {
    this.activeConversation = null;
    this.messages = [];
  }

    // ─── Send Message ────────────────────────────
  sendMessage(input: HTMLTextAreaElement) {
    const text = input.value.trim();
    if (!text || !this.activeConversation) return;

    const conv = this.activeConversation;

    // استخراج الـ IDs بطريقة آمنة ومنسجمة مع الـ Interface
    const farmerId = typeof conv.farmer === 'string'? conv.farmer: conv.farmer?._id;

    const expertId = typeof conv.expert === 'string' ? conv.expert: conv.expert?._id;

    if (!farmerId || !expertId) {
      console.error('❌ Conversation data is incomplete:', conv);
      console.log('Farmer:', conv.farmer);
      console.log('Expert:', conv.expert);
      alert('بيانات المحادثة ناقصة، جرب إعادة تحميل الصفحة');
      return;
    }

    const receiverId = String(farmerId) === this.currentUserId? expertId : farmerId;
    const tempId = 'temp-' + Date.now();
    // Optimistic UI
    this.messages.push({
      _id: tempId ,
      conversation: conv._id,
      sender: this.currentUserId,
      text,
      from: 'me',
      createdAt: new Date()
    });

    this.chatService.sendMessage({
      conversationId: conv._id,
      senderId: this.currentUserId,
      receiverId: String(receiverId),
      text,
      tempId 
    });

    const convIndex = this.conversations.findIndex(c => c._id === conv._id);
    if (convIndex !== -1) {
      this.conversations[convIndex] = {
        ...this.conversations[convIndex],
        lastMsg: text,
        updatedAt: new Date().toISOString()
      };
    }

    input.value = '';
    this.scrollToBottom();
  }

  
  // ─── Helpers ─────────────────────────────────
  getOtherUser(conv: Conversation) {
    if (!conv|| !conv.farmer || !conv.expert) return { name: 'Unknown', _id: '' };

    const isfarmer = conv.farmer?._id === this.currentUserId;
    return isfarmer ? conv.expert : conv.farmer;
  }

  handleKey(event: KeyboardEvent, input: HTMLTextAreaElement) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage(input);
    }
  }

  autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.messagesArea?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
