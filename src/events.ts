import type { EventRegistration, EventRegistrationTuple, InferEventMap } from './types';

// Listener interface
interface Listener<T = unknown> {
  id: string;
  callback: (data: T) => void | Promise<void>;
}

class EventBus<T extends EventRegistrationTuple = never> {
  private listeners = new Map<string, Listener[]>();
  private registeredEvents = new Set<string>();

  /**
   * Constructor with optional default events
   * @param defaultEvents - Optional default event registrations
   */
  constructor(defaultEvents?: T) {
    if (defaultEvents) {
      this.registerEvents(defaultEvents);
    }
  }

  /**
   * Register events and listeners
   * This method can be called multiple times to add more events
   */
  registerEvents<U extends EventRegistrationTuple>(
    registrations: U
  ): string[] {
    const listenerIds: string[] = [];

    for (const registration of registrations) {
      const { event, listener, description } = registration;
      const eventKey = event as string;

      // Mark the event as registered
      this.registeredEvents.add(eventKey);

      // Register the listener
      const listenerId = this.on(event, listener);
      listenerIds.push(listenerId);

      // Optional: record registration information
      if (description) {
        console.log(`Registered event: ${eventKey} - ${description}`);
      }
    }

    return listenerIds;
  }

  /**
   * Check if the event is registered
   */
  isEventRegistered(event: string): boolean {
    return this.registeredEvents.has(event);
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.registeredEvents);
  }

  /**
   * Validate if the event is registered (used in emit)
   */
  private validateEventRegistration(event: string): void {
    if (!this.isEventRegistered(event)) {
      throw new Error(
        `Event "${event}" is not registered. Please call registerEvents() first.`
      );
    }
  }

  /**
   * Emit an event with type safety for registered events
   */
  async emit<E extends keyof InferEventMap<T>>(
    event: E,
    data: InferEventMap<T>[E]
  ): Promise<void> {
    // Validate if the event is registered
    this.validateEventRegistration(event as string);

    const eventListeners = this.listeners.get(event as string);
    if (eventListeners && eventListeners.length > 0) {
      const promises = eventListeners.map(({ callback }) => {
        try {
          const result = callback(data);
          return result instanceof Promise ? result : Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      });

      await Promise.all(promises);
    }
  }

  /**
   * Add a listener for an event with type safety for registered events
   */
  on<E extends keyof InferEventMap<T>>(
    event: E,
    listener: (data: InferEventMap<T>[E]) => void | Promise<void>
  ): string {
    const eventKey = event as string;
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, []);
    }

    const listenerId = Math.random().toString(36).substr(2, 9);
    const eventListeners = this.listeners.get(eventKey);
    if (eventListeners) {
      eventListeners.push({
        id: listenerId,
        callback: listener as (data: unknown) => void | Promise<void>,
      });
    }

    return listenerId;
  }

  off(eventName: string, listenerId: string): boolean {
    const eventKey = eventName as string;
    const eventListeners = this.listeners.get(eventKey);

    if (eventListeners) {
      const initialLength = eventListeners.length;
      const filteredListeners = eventListeners.filter(
        (listener) => listener.id !== listenerId
      );

      if (filteredListeners.length === 0) {
        this.listeners.delete(eventKey);
      } else {
        this.listeners.set(eventKey, filteredListeners);
      }

      return filteredListeners.length < initialLength;
    }

    return false;
  }

  getListenerCount(event: string): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.length : 0;
  }

  hasListeners(event: string): boolean {
    return this.getListenerCount(event) > 0;
  }

  clear(): void {
    this.listeners.clear();
    this.registeredEvents.clear();
  }

  clearEvent(event: string): boolean {
    const eventKey = event as string;
    this.registeredEvents.delete(eventKey);
    return this.listeners.delete(eventKey);
  }
}

export function createEventBus<T extends EventRegistrationTuple>(
  defaultEvents?: T
): EventBus<T> {
  return new EventBus(defaultEvents);
}

export type TypedEventBus<T extends EventRegistrationTuple> = {
  emit<E extends keyof InferEventMap<T>>(
    event: E,
    data: InferEventMap<T>[E]
  ): Promise<void>;
  on<E extends keyof InferEventMap<T>>(
    event: E,
    listener: (data: InferEventMap<T>[E]) => void | Promise<void>
  ): string;
  registerEvents<U extends EventRegistrationTuple>(
    registrations: U
  ): string[];
  off(eventName: string, listenerId: string): boolean;
  isEventRegistered(event: string): boolean;
  getRegisteredEvents(): string[];
  getListenerCount(event: string): number;
  hasListeners(event: string): boolean;
  clear(): void;
  clearEvent(event: string): boolean;
};

export { EventBus };
export type { EventRegistration };
