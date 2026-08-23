import { EventEmitter } from "events";
import { v4 as uuid } from "uuid";

export interface BaseEvent {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  correlationId?: string;
}

export interface PaymentReceivedEvent extends BaseEvent {
  type: "PaymentReceived";
  data: {
    id: string;
    payerName: string;
    amount: number;
    bank: string;
    reference: string;
    status: string;
    paymentMethod: string;
  };
}

export interface PaymentValidatedEvent extends BaseEvent {
  type: "PaymentValidated";
  data: {
    id: string;
    reference: string;
    status: string;
    validatedBy: string;
  };
}

export interface PaymentSavedEvent extends BaseEvent {
  type: "PaymentSaved";
  data: {
    id: string;
    reference: string;
    payerName: string;
    amount: number;
  };
}

export interface PaymentDisplayedEvent extends BaseEvent {
  type: "PaymentDisplayed";
  data: {
    id: string;
    reference: string;
  };
}

export interface VoiceAnnouncementRequestedEvent extends BaseEvent {
  type: "VoiceAnnouncementRequested";
  data: {
    payerName: string;
    amount: number;
    message: string;
  };
}

export type SystemEvent =
  | PaymentReceivedEvent
  | PaymentValidatedEvent
  | PaymentSavedEvent
  | PaymentDisplayedEvent
  | VoiceAnnouncementRequestedEvent;

type EventHandler = (event: SystemEvent) => Promise<void>;

class EventBus extends EventEmitter {
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor() {
    super();
    this.setMaxListeners(50);
  }

  async publish(event: SystemEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    const allHandlers = [...handlers, ...(this.handlers.get("*") || [])];

    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }

    this.emit(event.type, event);
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  createEvent(type: string, data: Record<string, unknown>, source: string): SystemEvent {
    return {
      id: uuid(),
      type,
      timestamp: new Date().toISOString(),
      source,
      data,
    } as SystemEvent;
  }
}

export const eventBus = new EventBus();