import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { Conversation, Message } from '../../core/models/chat.model';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly realtime = inject(RealtimeService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly conversations = signal<Conversation[]>([]);
  readonly messages = signal<Message[]>([]);
  active?: Conversation;
  draft = '';
  private sub?: Subscription;

  ngOnInit() {
    this.realtime.connect();
    this.loadConversations(this.route.snapshot.queryParamMap.get('conversationId') ?? undefined);
    this.sub = this.realtime.messages$.subscribe((message) => {
      if (this.active && message.conversationId === this.active.id) {
        if (!this.messages().some((m) => m.id === message.id)) {
          this.messages.update((list) => [...list, message]);
        }
      } else {
        this.loadConversations();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  loadConversations(selectId?: string) {
    this.chatService.conversations().subscribe({
      next: (items) => {
        this.conversations.set(items);
        const toOpen = selectId ? items.find((c) => c.id === selectId) : undefined;
        if (toOpen) this.open(toOpen);
      },
      error: () => this.snackBar.open('Could not load conversations.', 'Close', { duration: 3000 })
    });
  }

  open(conversation: Conversation) {
    this.active = conversation;
    this.chatService.messages(conversation.id).subscribe({
      next: (items) => this.messages.set(items),
      error: () => this.snackBar.open('Could not load messages.', 'Close', { duration: 3000 })
    });
  }

  send() {
    const content = this.draft.trim();
    if (!content || !this.active) return;
    const conversationId = this.active.id;
    this.chatService.send(conversationId, content).subscribe({
      next: (sent) => {
        if (!this.messages().some((m) => m.id === sent.id)) {
          this.messages.update((list) => [...list, sent]);
        }
        this.draft = '';
      },
      error: () => this.snackBar.open('Could not send message.', 'Close', { duration: 3000 })
    });
  }

  mine(message: Message) {
    return message.senderId === this.auth.currentUser?.id;
  }

  avatarInitials(name?: string) {
    if (!name?.trim()) return '?';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
