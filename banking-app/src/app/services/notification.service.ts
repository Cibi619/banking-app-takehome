import { Injectable, signal, computed } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<Notification[]>([]);

  count = computed(() => this._notifications().length);
  all = computed(() => this._notifications());

  add(message: string): void {
    this._notifications.update(n => [
      ...n,
      { id: Date.now(), message, timestamp: new Date() }
    ]);
  }

  clear(): void {
    this._notifications.set([]);
  }
}
