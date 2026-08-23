import { EventEmitter } from "events";
import { createClient } from "redis";
import { v4 as uuid } from "uuid";
import type { SystemEvent } from "@rematicos/events";

class EventBus extends EventEmitter {
  private redisClient: ReturnType<typeof createClient> | null = null;

  async connect(): Promise<void> {
    this.redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    await this.redisClient.connect();
  }

  async publish(event: SystemEvent): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.publish("events", JSON.stringify(event));
    }
    this.emit(event.type, event);
  }

  async subscribe(
    eventType: string,
    handler: (event: SystemEvent) => Promise<void>
  ): Promise<void> {
    this.on(eventType, handler);

    if (this.redisClient) {
      const subscriber = this.redisClient.duplicate();
      await subscriber.connect();
      await subscriber.subscribe("events", (message) => {
        const event = JSON.parse(message) as SystemEvent;
        if (event.type === eventType) {
          handler(event);
        }
      });
    }
  }
}

export const eventBus = new EventBus();