import { describe, it, expect, vi } from "vitest";
import { eventBus, SystemEvent } from "@rematicos/events";

describe("EventBus", () => {
  it("should publish and subscribe to events", async () => {
    const handler = vi.fn();
    eventBus.subscribe("TestEvent", handler);

    const event = eventBus.createEvent("TestEvent", { test: "data" }, "test");
    await eventBus.publish(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("should create events with correct structure", () => {
    const event = eventBus.createEvent("PaymentReceived", { id: "123" }, "test");

    expect(event).toHaveProperty("id");
    expect(event.type).toBe("PaymentReceived");
    expect(event.source).toBe("test");
    expect(event).toHaveProperty("timestamp");
    expect(event.data).toEqual({ id: "123" });
  });

  it("should handle multiple subscribers", async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    eventBus.subscribe("MultiEvent", handler1);
    eventBus.subscribe("MultiEvent", handler2);

    const event = eventBus.createEvent("MultiEvent", {}, "test");
    await eventBus.publish(event);

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it("should not crash on handler errors", async () => {
    const failingHandler = vi.fn().mockRejectedValue(new Error("Handler error"));
    const successHandler = vi.fn();

    eventBus.subscribe("ErrorEvent", failingHandler);
    eventBus.subscribe("ErrorEvent", successHandler);

    const event = eventBus.createEvent("ErrorEvent", {}, "test");
    await eventBus.publish(event);

    expect(failingHandler).toHaveBeenCalledOnce();
    expect(successHandler).toHaveBeenCalledOnce();
  });
});