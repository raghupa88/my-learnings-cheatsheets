import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { GreeksSnapshot, LifecycleEvent, RFQ } from '../types';

const quoteSubject = new Subject<RFQ>();
const greeksSubject = new Subject<GreeksSnapshot>();
const lifecycleSubject = new Subject<LifecycleEvent>();

let stompClient: Client | null = null;

export function connectWebSocket() {
  if (stompClient?.connected) return;

  stompClient = new Client({
    webSocketFactory: () => new SockJS('/ws') as WebSocket,
    reconnectDelay: 3000,
    onConnect: () => {
      stompClient!.subscribe('/topic/quotes', (msg) => {
        quoteSubject.next(JSON.parse(msg.body) as RFQ);
      });
      stompClient!.subscribe('/topic/greeks', (msg) => {
        greeksSubject.next(JSON.parse(msg.body) as GreeksSnapshot);
      });
      stompClient!.subscribe('/topic/lifecycle', (msg) => {
        lifecycleSubject.next(JSON.parse(msg.body) as LifecycleEvent);
      });
    },
  });

  stompClient.activate();
}

export function disconnectWebSocket() {
  stompClient?.deactivate();
}

export const quotes$ = quoteSubject.asObservable();
export const greeks$ = greeksSubject.asObservable();
export const lifecycle$ = lifecycleSubject.asObservable();

export const greeksFor$ = (tradeId: string) =>
  greeks$.pipe(filter((g) => g.tradeId === tradeId));
