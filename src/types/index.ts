// Base event mapping interface
export interface BaseEventMap {
  'modal:open': {
    modalId: string;
  };
  'modal:close': {
    modalId: string;
  };
}

// Full event mapping type
export type EventMap = BaseEventMap;

export type AppEvents = {
  emit<T extends keyof EventMap>(event: T, data: EventMap[T]): Promise<void>;
  on<T extends keyof EventMap>(
    event: T,
    listener: (data: EventMap[T]) => void | Promise<void>
  ): string;
  off<T extends keyof EventMap>(eventName: T, listenerId: string): boolean;
};
