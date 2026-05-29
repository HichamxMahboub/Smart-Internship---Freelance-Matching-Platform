import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Notification } from '../../core/models/notification.model';
import { NotificationService } from '../../core/services/notification.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({ selector: 'app-notifications', standalone: true, imports: [CommonModule, MaterialModule], templateUrl: './notifications.component.html', styleUrl: './notifications.component.scss' })
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);
  readonly notifications = signal<Notification[]>([]);
  ngOnInit() { this.load(); }
  load() { this.notificationService.list().subscribe({ next: (items) => this.notifications.set(items), error: () => this.snackBar.open('Could not load notifications.', 'Close', { duration: 3000 }) }); }
  markRead(item: Notification) { this.notificationService.markRead(item.id).subscribe({ next: () => this.load() }); }
  markAll() { this.notificationService.markAllRead().subscribe({ next: (items) => this.notifications.set(items) }); }
}
