import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, NgZone, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ChatService } from '../../services/chat.service'; 
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: false
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  conversations: any[] = [];
  messages: any[] = [];
  selectedContactId: number | null = null;
  messageContent: string = '';
  currentUserId: number = 0;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.authService.getCurrentUserId();
    

    if (this.currentUserId !== 0) {
        this.loadConversations();
    }
    
    await this.chatService.startConnection();

    this.chatService.messageReceived$.subscribe((msg) => {
      this.ngZone.run(() => {
        if (msg && msg.contactId === this.selectedContactId) {
          this.messages.push(msg);
          this.cdr.detectChanges();
          this.scrollToBottom();
        }
      });
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        const contactId = Number(params['id']);
        this.selectContact(contactId);
      }
    });
  }

  ngOnDestroy(): void {
    this.chatService.stopConnection();
  }

  loadConversations() {
    this.chatService.getConversations().subscribe(data => {
      this.conversations = data;
      this.cdr.detectChanges();
    });
  }

  selectContact(contactId: number) {
    this.selectedContactId = contactId;
    this.chatService.joinGroup(contactId);
    this.chatService.getMessages(contactId).subscribe(data => {
      this.messages = data;
      this.cdr.detectChanges();
      this.scrollToBottom();
    });
  }

  sendMessage() {
    if (!this.messageContent.trim() || !this.selectedContactId) return;
    this.chatService.sendMessage(this.selectedContactId, this.messageContent)
      .then(() => {
        this.messageContent = '';
        this.cdr.detectChanges();
      });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}