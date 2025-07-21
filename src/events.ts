import type { AppEvents, EventMap } from './types';

// Listener interface
interface Listener<T = unknown> {
  id: string;
  callback: (data: T) => void | Promise<void>;
}

class EventBus implements AppEvents {
  private listeners = new Map<string, Listener[]>();

  async emit<T extends keyof EventMap>(
    event: T,
    data: EventMap[T]
  ): Promise<void> {
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

  on<T extends keyof EventMap>(
    event: T,
    listener: (data: EventMap[T]) => void | Promise<void>
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

  off<T extends keyof EventMap>(eventName: T, listenerId: string): boolean {
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

  getListenerCount<T extends keyof EventMap>(event: T): number {
    const eventListeners = this.listeners.get(event as string);
    return eventListeners ? eventListeners.length : 0;
  }

  hasListeners<T extends keyof EventMap>(event: T): boolean {
    return this.getListenerCount(event) > 0;
  }

  clear(): void {
    this.listeners.clear();
  }

  clearEvent<T extends keyof EventMap>(event: T): boolean {
    const eventKey = event as string;
    return this.listeners.delete(eventKey);
  }
}

export { EventBus };
