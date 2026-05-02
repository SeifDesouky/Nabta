import { Component, ElementRef, ViewChild } from '@angular/core';
import { Expert, Message } from '../../../../core/models/chat.model';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent {

  activeChat: number | null = null;

  experts: Expert[] = [
    {
      id: 0,
      name: "Dr. Layla Hassan",
      specialty: "Soil & Fertility Specialist",
      avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
      status: 'online',
      verified: true,
      messages: []
    }
    // باقي الداتا زي ما هي...
  ];

  @ViewChild('messagesArea') messagesArea!: ElementRef;

  // -----------------------------
  // OPEN CHAT
  // -----------------------------
  openChat(index: number): void {
    this.activeChat = index;
  }

  // -----------------------------
  // GO BACK
  // -----------------------------
  goBack(): void {
    this.activeChat = null;
  }

  // -----------------------------
  // RENDER LOGIC (بدل DOM manipulation)
  // -----------------------------
  get activeMessages(): Message[] {
    if (this.activeChat === null) return [];
    return this.experts[this.activeChat].messages;
  }

  // -----------------------------
  // SEND MESSAGE
  // -----------------------------
  sendMessage(input: HTMLTextAreaElement): void {
    if (this.activeChat === null) return;

    const text = input.value.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });

    this.experts[this.activeChat].messages.push({
      from: 'me',
      text,
      time,
      read: false
    });

    input.value = '';
  }

  // -----------------------------
  // IMAGE UPLOAD
  // -----------------------------
  sendImage(event: Event): void {
    if (this.activeChat === null) return;

    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const time = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });

      this.experts[this.activeChat!].messages.push({
        from: 'me',
        image: reader.result as string,
        time,
        read: false
      });
    };

    reader.readAsDataURL(file);
  }

  // -----------------------------
  // AUTO REPLY (optional)
  // -----------------------------
  private autoReplies = [
    "Understood — I'll check it.",
    "Let me analyze this and get back to you.",
    "Noted. I'll update you soon."
  ];

  getAutoReply(): string {
    return this.autoReplies[
      Math.floor(Math.random() * this.autoReplies.length)
    ];
  }

  // -----------------------------
  // KEY HANDLER
  // -----------------------------
  handleKey(event: KeyboardEvent, input: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage(input);
    }
  }

  // -----------------------------
  // AUTO RESIZE TEXTAREA
  // -----------------------------
  autoResize(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }
}
