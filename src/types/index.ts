export interface EventRegistration<T extends string, D> {
  event: T;
  listener: (data: D) => void | Promise<void>;
  description?: string;
}

export type EventRegistrationTuple = readonly EventRegistration<string, any>[];

// 更精确的类型推导
export type InferEventMap<T extends EventRegistrationTuple> = {
  [K in T[number] as K['event']]: K extends EventRegistration<K['event'], infer D> ? D : never
}

export type MergeEventMaps<T extends EventRegistrationTuple, U extends EventRegistrationTuple> = 
  InferEventMap<T> & InferEventMap<U>;

export type DynamicEventBus<T extends EventRegistrationTuple = never> = {
  emit<E extends keyof InferEventMap<T>>(event: E, data: InferEventMap<T>[E]): Promise<void>;
  on<E extends keyof InferEventMap<T>>(
    event: E,
    listener: (data: InferEventMap<T>[E]) => void | Promise<void>
  ): string;
  off(eventName: string, listenerId: string): boolean;
  registerEvents<U extends EventRegistrationTuple>(
    registrations: U
  ): string[];
  isEventRegistered(event: string): boolean;
  getRegisteredEvents(): string[];
  getListenerCount(event: string): number;
  hasListeners(event: string): boolean;
  clear(): void;
  clearEvent(event: string): boolean;
};

export type AppEvents<T extends EventRegistrationTuple> = DynamicEventBus<T>;
