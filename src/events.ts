import type {
  EventRegistration,
  EventRegistrationTuple,
  InferEventMap,
  TypedEventName,
  StrictEventBus,
} from './types';

// Listener interface
interface Listener<T = unknown> {
  id: string;
  callback: (data: T) => void | Promise<void>;
}

// Enhanced EventBus with full type safety
class EventBus<T extends EventRegistrationTuple = never>
  implements StrictEventBus<T>
{
  private listeners = new Map<string, Listener[]>();
  private registeredEvents = new Set<string>();

  /**
   * Constructor with optional default events
   * @param defaultEvents - Optional default event registrations with full type safety
   */
  constructor(defaultEvents?: T) {
    if (defaultEvents) {
      this.registerEvents(defaultEvents);
    }
  }

  /**
   * Register events and listeners with Zod validation
   * This method can be called multiple times to add more events
   */
  registerEvents<U extends EventRegistrationTuple>(registrations: U): string[] {
    // Validate event registrations using Zod
    this.validateEventRegistrations(registrations);

    const listenerIds: string[] = [];

    for (const registration of registrations) {
      const { event, listener, description } = registration;
      const eventKey = event as string;

      // Mark the event as registered
      this.registeredEvents.add(eventKey);

      // Register the listener
      const listenerId = this.on(event as keyof InferEventMap<T>, listener);
      listenerIds.push(listenerId);

      // Optional: record registration information
      if (description) {
        console.log(`Registered event: ${eventKey} - ${description}`);
      }
    }

    return listenerIds;
  }

  /**
   * Validate event registrations using Zod schema
   */
  private validateEventRegistrations<U extends EventRegistrationTuple>(
    registrations: U
  ): void {
    try {
      // Basic validation for event registration structure
      for (const registration of registrations) {
        if (!registration.event || typeof registration.event !== 'string') {
          throw new Error(
            'Event registration must have a valid event name (string)'
          );
        }
        if (
          !registration.listener ||
          typeof registration.listener !== 'function'
        ) {
          throw new Error(
            'Event registration must have a valid listener (function)'
          );
        }
        if (
          registration.description &&
          typeof registration.description !== 'string'
        ) {
          throw new Error('Event registration description must be a string');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Event registration validation failed: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Check if the event is registered - now with typed event names
   */
  isEventRegistered(event: TypedEventName<T>): boolean {
    return this.registeredEvents.has(event as string);
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.registeredEvents);
  }

  /**
   * Validate if the event is registered (now public for interface compliance)
   */
  validateEventRegistration(event: TypedEventName<T>): void {
    if (!this.isEventRegistered(event)) {
      throw new Error(
        `Event "${event as string}" is not registered. Please call registerEvents() first.`
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
    this.validateEventRegistration(event as TypedEventName<T>);

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

  /**
   * Remove a listener - now with typed event names for autocompletion
   */
  off(eventName: TypedEventName<T>, listenerId: string): boolean {
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

  /**
   * Get listener count for an event - now with typed event names
   */
  getListenerCount(event: TypedEventName<T>): number {
    const eventListeners = this.listeners.get(event as string);
    return eventListeners ? eventListeners.length : 0;
  }

  /**
   * Check if event has listeners - now with typed event names
   */
  hasListeners(event: TypedEventName<T>): boolean {
    return this.getListenerCount(event) > 0;
  }

  /**
   * Clear all listeners and registered events
   */
  clear(): void {
    this.listeners.clear();
    this.registeredEvents.clear();
  }

  /**
   * Clear specific event - now with typed event names
   */
  clearEvent(event: TypedEventName<T>): boolean {
    const eventKey = event as string;
    this.registeredEvents.delete(eventKey);
    return this.listeners.delete(eventKey);
  }
}

/**
 * Factory function to create a strongly typed EventBus
 */
export function createEventBus<T extends EventRegistrationTuple>(
  defaultEvents?: T
): StrictEventBus<T> {
  return new EventBus(defaultEvents);
}

// Legacy TypedEventBus type - maintained for backwards compatibility
export type TypedEventBus<T extends EventRegistrationTuple> = StrictEventBus<T>;

export { EventBus };
export type { EventRegistration };
