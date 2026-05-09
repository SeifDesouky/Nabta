import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatBubble, ChatMessage,Section } from '../../../../core/models/AI.models/chatbot.model';
import { ChatbotService } from '../../../../core/services/AI-Module/Chatbbot/chatbot.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './ai-chatbot.component.html',
  styleUrl: './ai-chatbot.component.css'
})
export class AiChatbotComponent {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages:ChatBubble[]=[]
  userInput=''
  isLoading=false
  constructor(private chatService:ChatbotService){}

  historySessions: { id: string; title: string; time: string; active: boolean }[] = [];
  activeSessionId: string | null = null;

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.chatService.getHistory().subscribe({
      next: (history: ChatMessage[]) => {
        // ابني الـ sessions من الهيستوري — جمّع كل رسائل نفس اليوم أو اعمل session per first message
        const sessionMap = new Map<string, { id: string; title: string; time: string; msgs: ChatMessage[] }>();

        history.forEach((msg) => {
          const dateKey = new Date(msg.createdAt!).toDateString();
          if (!sessionMap.has(dateKey)) {
            sessionMap.set(dateKey, {
              id: msg._id!,
              title: msg.userMsg.split(' ').slice(0, 4).join(' '), // أول 4 كلمات
              time: this.formatDate(new Date(msg.createdAt!)),
              msgs: []
            });
          }
          sessionMap.get(dateKey)!.msgs.push(msg);
        });

        this.historySessions = Array.from(sessionMap.values()).map(s => ({
          id: s.id,
          title: s.title,
          time: s.time,
          active: false
        }));

        // افتح أحدث session تلقائي
        if (this.historySessions.length > 0) {
          this.openSession(this.historySessions[0].id);
        } else {
          this.showGreeting();
        }
      },
      error: () => this.showGreeting()
    });
  }

  openSession(sessionId: string): void {
    this.activeSessionId = sessionId;
    this.historySessions = this.historySessions.map(s => ({ ...s, active: s.id === sessionId }));

    this.chatService.getHistory().subscribe({
      next: (history) => {
        this.messages = [];
        this.showGreeting();

        // فلتر الرسائل اللي تخص الـ session دي بالتاريخ
        const targetSession = this.historySessions.find(s => s.id === sessionId);
        const sessionDate = history.find(m => m._id === sessionId)?.createdAt;
        const sessionDay = sessionDate ? new Date(sessionDate).toDateString() : null;

        history
          .filter(m => sessionDay ? new Date(m.createdAt!).toDateString() === sessionDay : true)
          .forEach(msg => {
            this.messages.push({ text: msg.userMsg, sender: 'user', timestamp: new Date(msg.createdAt!) });
            this.messages.push({ text: msg.botReply, sender: 'ai', timestamp: new Date(msg.createdAt!) });
          });
      }
    });
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    // لو أول رسالة في session جديدة، ضيف session في الهيستوري
    const isNewSession = !this.activeSessionId;
    if (isNewSession) {
      const newSession = {
        id: Date.now().toString(), // temp id
        title: text.split(' ').slice(0, 4).join(' '),
        time: 'Just now',
        active: true
      };
      this.historySessions = [newSession, ...this.historySessions.map(s => ({ ...s, active: false }))];
      this.activeSessionId = newSession.id;
    }

    this.messages.push({ text, sender: 'user', timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;
    this.messages.push({ text: '', sender: 'ai', timestamp: new Date(), isLoading: true });

    this.chatService.sendMessage(text).subscribe({
      next: (res) => {
        const idx = this.messages.map(m => m.isLoading).lastIndexOf(true);
        if (idx !== -1) {
          this.messages[idx] = { text: res.botReply, sender: 'ai', timestamp: new Date(), isLoading: false };
        }
        this.isLoading = false;
      },
      error: () => {
        const idx = this.messages.map(m => m.isLoading).lastIndexOf(true);
        if (idx !== -1) {
          this.messages[idx] = { text: 'Sorry, something went wrong.', sender: 'ai', timestamp: new Date(), isLoading: false };
        }
        this.isLoading = false;
      }
    });
  }

  startNewChat(): void {
    this.activeSessionId = null;
    this.historySessions = this.historySessions.map(s => ({ ...s, active: false }));
    this.showGreeting();
  }

  private showGreeting(): void {
    this.messages = [{
      text: `Hello! I'm your NABTA AI Assistant. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date()
    }];
  }

  formatDate(date: Date): string {
    const today = new Date();
    const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  parseAiResponse(text: string): { isStructured: boolean; sections: Section[] } | null {
    if (!text || typeof text !== 'string') return null;

    // شرط أدق بكتير
    const hasStructuredPattern = 
      text.includes('بناءً على') && 
      text.includes(':') && 
      (text.includes('بيانات') || 
      text.match(/-\s|:\s*\S+/g)?.length! >= 3);   // نحتاج دليل أقوى

    if (!hasStructuredPattern) return null;

    const sections: Section[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0).filter(l => !l.includes('بناءً على') && !l.startsWith('المصدر'));

    let currentSection: Section | null = null;

    for (const line of lines) {
      let trimmed = line;

      // إزالة الـ bullet points
      if (trimmed.startsWith('- ')) {
        trimmed = trimmed.substring(2).trim();
      }

      // عنوان القسم (بيانات الـ ... :)
      if (trimmed.includes('بيانات') && trimmed.includes(':')) {
        const title = trimmed
          .replace('بيانات', '')
          .replace(':', '')
          .trim();

        currentSection = { title: title || 'معلومات', items: [] };
        sections.push(currentSection);
        continue;
      }

      // key: value
      if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        if (key && value) {
          if (!currentSection) {
            currentSection = { title: '', items: [] };
            sections.push(currentSection);
          }
          currentSection.items.push({ key, value });
        }
        continue;
      }

      // لو السطر مش key:value ومش عنوان → نعتبره محتوى نصي عادي (مهم جداً)
      if (currentSection && currentSection.items.length === 0) {
        currentSection.items.push({ 
          key: '', 
          value: trimmed 
        });
      }
    }

    // قرار نهائي: لو الـ structured ضعيف → نرجعه كـ plain text
    if (sections.length === 0 || 
        (sections.length === 1 && 
        sections[0].items.length <= 1 && 
        !sections[0].title)) {
      return null;
    }

    return { isStructured: true, sections };
  }

  formatPlainText(text: string): { text: string; isBullet: boolean; isMuted: boolean }[] {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .filter(l => !l.includes('بناءً على') && !l.startsWith('المصدر'))
    .map(line => {
      const isBullet = line.startsWith('-');
      return {
        text: line.replace(/^-\s*/, '').trim(),
        isBullet,
        isMuted: false
      };
    });
  }
}


