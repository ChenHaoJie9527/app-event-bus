import { DOMEventIntegration } from './dom-event-integration';
import { debounce } from './utils';
import type {
  EventRegistration,
  EventRegistrationTuple,
  InferEventMap,
  TypedEventName,
  StrictEventBus,
  EventBusOptions,
} from './types';

// Listener interface
interface Listener<T = unknown> {
  id: string;
  callback: (data: T) => void | Promise<void>;
}

// Global singleton instance
let globalEventBusInstance: EventBus | null = null;

// Enhanced EventBus with full type safety and singleton support
class EventBus<T extends EventRegistrationTuple = never>
  implements StrictEventBus<T>
{
  private listeners = new Map<string, Listener[]>();
  private registeredEvents = new Set<string>();
  private domIntegration?: DOMEventIntegration;
  private debouncedEmits = new Map<string, (data: any) => void>();
  private defaultDebounceConfig = new Map<string, number>();

  /**
   * Constructor with optional default events and configuration
   */
  constructor(defaultEvents?: T, options?: EventBusOptions) {
    // Apply default debounce configuration if provided
    if (options?.defaultDebounce) {
      for (const [event, delay] of Object.entries(options.defaultDebounce)) {
        this.setDefaultDebounce(event, delay);
      }
    }

    // Register default events if provided
    if (defaultEvents) {
      this.registerEvents(defaultEvents);
    }

    // Enable DOM integration if requested
    if (options?.dom) {
      this.enableDOMIntegration();
    }
  }

  /**
   * Enable DOM integration (lazy initialization)
   */
  enableDOMIntegration(): void {
    if (
      !this.domIntegration &&
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    ) {
      this.domIntegration = new DOMEventIntegration({
        document: window.document,
        eventBus: this,
      });
      this.domIntegration.connect();
    }
  }

  /**
   * Reset global singleton instance
   */
  static resetGlobalInstance(): void {
    if (globalEventBusInstance) {
      globalEventBusInstance.clear();
      if (globalEventBusInstance.domIntegration) {
        globalEventBusInstance.domIntegration.disconnect();
      }
    }
    globalEventBusInstance = null;
  }

  /**
   * Check if global instance exists
   */
  static hasGlobalInstance(): boolean {
    return globalEventBusInstance !== null;
  }

  /**
   * Register events and listeners
   */
  registerEvents<U extends EventRegistrationTuple>(registrations: U): string[] {
    this.validateEventRegistrations(registrations);

    const listenerIds: string[] = [];

    for (const registration of registrations) {
      const {
        event,
        listener,
        description,
        debounce: debounceTime,
      } = registration;
      const eventKey = event as string;

      this.registeredEvents.add(eventKey);

      if (debounceTime && debounceTime > 0) {
        this.setDefaultDebounce(eventKey, debounceTime);
      }

      const listenerId = this.on(event as keyof InferEventMap<T>, listener);
      listenerIds.push(listenerId);

      if (description) {
        console.log(`Registered event: ${eventKey} - ${description}`);
      }
    }

    return listenerIds;
  }

  /**
   * Disable DOM event integration
   */
  disableDOMIntegration(): void {
    if (this.domIntegration) {
      this.domIntegration.disconnect();
      this.domIntegration = undefined;
    }
  }

  /**
   * Get DOM event integration instance
   */
  getDOMIntegration(): DOMEventIntegration | undefined {
    return this.domIntegration;
  }

  /**
   * Check if DOM integration is enabled
   */
  isDOMIntegrationEnabled(): boolean {
    return this.domIntegration?.isConnected() ?? false;
  }

  /**
   * Validate event registrations using Zod schema
   */
  private validateEventRegistrations<U extends EventRegistrationTuple>(
    registrations: U
  ): void {
    // 简化验证，只检查基本结构
    for (const registration of registrations) {
      if (!registration.event || typeof registration.listener !== 'function') {
        throw new Error('Invalid event registration');
      }
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
   * Emit an event with type safety for registered events and optional debouncing
   */
  async emit<E extends keyof InferEventMap<T>>(
    event: E,
    data: InferEventMap<T>[E],
    options?: { debounce?: number }
  ): Promise<void> {
    const eventKey = event as string;
    const debounceDelay =
      options?.debounce ?? this.defaultDebounceConfig.get(eventKey);

    // If debounce is requested, use debounced version
    if (debounceDelay && debounceDelay > 0) {
      if (!this.debouncedEmits.has(eventKey)) {
        this.debouncedEmits.set(
          eventKey,
          debounce(
            (debouncedData: any) => this.emitImmediate(event, debouncedData),
            debounceDelay
          )
        );
      }

      const debouncedEmit = this.debouncedEmits.get(eventKey);
      if (debouncedEmit) {
        debouncedEmit(data);
        return;
      }
    }

    // Otherwise emit immediately
    await this.emitImmediate(event, data);
  }

  /**
   * Internal method for immediate event emission
   */
  private async emitImmediate<E extends keyof InferEventMap<T>>(
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

  /**
   * Set default debounce delay for specific events
   * @param event - Event name
   * @param delay - Debounce delay in milliseconds
   */
  setDefaultDebounce(event: string, delay: number): void {
    this.defaultDebounceConfig.set(event, delay);
  }
}

/**
 * Factory function to create a strongly typed EventBus singleton
 * Always returns the same instance - true singleton pattern
 */
export function createEventBus<T extends EventRegistrationTuple>(
  defaultEvents?: T,
  options?: EventBusOptions
): StrictEventBus<T> {
  if (globalEventBusInstance) {
    // Apply options to existing instance
    if (options?.defaultDebounce) {
      for (const [event, delay] of Object.entries(options.defaultDebounce)) {
        globalEventBusInstance.setDefaultDebounce(event, delay);
      }
    }

    if (options?.dom) {
      globalEventBusInstance.enableDOMIntegration();
    }

    // Register events if provided
    if (defaultEvents) {
      globalEventBusInstance.registerEvents(defaultEvents);
    }
  } else {
    globalEventBusInstance = new EventBus(defaultEvents, options);
  }
  return globalEventBusInstance as StrictEventBus<T>;
}

// Legacy TypedEventBus type - maintained for backwards compatibility
export type TypedEventBus<T extends EventRegistrationTuple> = StrictEventBus<T>;

export type { EventRegistration };

export const getGlobalEventBus = createEventBus;
export const resetGlobalEventBus = EventBus.resetGlobalInstance;
