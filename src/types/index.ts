import { z } from 'zod';

// Zod schema for event registration
export const EventRegistrationSchema = z.object({
  event: z.string(),
  listener: z.function(),
  description: z.string().optional(),
});

export interface EventRegistration<T extends string, D> {
  event: T;
  listener: (data: D) => void | Promise<void>;
  description?: string;
}

export type EventRegistrationTuple = readonly EventRegistration<string, any>[];

// Enhanced type inference for event maps
export type InferEventMap<T extends EventRegistrationTuple> = {
  [K in T[number] as K['event']]: K extends EventRegistration<
    K['event'],
    infer D
  >
    ? D
    : never;
};

// Extract event names as union type for better type hints
export type InferEventNames<T extends EventRegistrationTuple> =
  T[number]['event'];

export type MergeEventMaps<
  T extends EventRegistrationTuple,
  U extends EventRegistrationTuple,
> = InferEventMap<T> & InferEventMap<U>;

// Enhanced EventBus interface with typed event names
export type DynamicEventBus<T extends EventRegistrationTuple = never> = {
  emit<E extends keyof InferEventMap<T>>(
    event: E,
    data: InferEventMap<T>[E]
  ): Promise<void>;
  on<E extends keyof InferEventMap<T>>(
    event: E,
    listener: (data: InferEventMap<T>[E]) => void | Promise<void>
  ): string;
  off(eventName: InferEventNames<T>, listenerId: string): boolean;
  registerEvents<U extends EventRegistrationTuple>(registrations: U): string[];
  isEventRegistered(event: InferEventNames<T>): boolean;
  validateEventRegistration(event: InferEventNames<T>): void;
  getRegisteredEvents(): string[];
  getListenerCount(event: InferEventNames<T>): number;
  hasListeners(event: InferEventNames<T>): boolean;
  clear(): void;
  clearEvent(event: InferEventNames<T>): boolean;
};

export type AppEvents<T extends EventRegistrationTuple> = DynamicEventBus<T>;

// Zod schema for validating event data based on registration
export function createEventDataSchema<T extends EventRegistrationTuple>(
  registrations: T
): z.ZodSchema {
  const eventSchemas = registrations.reduce(
    (acc, registration) => {
      acc[registration.event] = z.any(); // Can be enhanced with specific schemas
      return acc;
    },
    {} as Record<string, z.ZodSchema>
  );

  return z.object(eventSchemas);
}

// Helper type for typed event names with autocompletion
export type TypedEventName<T extends EventRegistrationTuple> =
  InferEventNames<T>;

// Helper type for creating strongly typed EventBus instances
export type StrictEventBus<T extends EventRegistrationTuple> = {
  emit<E extends keyof InferEventMap<T>>(
    event: E,
    data: InferEventMap<T>[E]
  ): Promise<void>;
  on<E extends keyof InferEventMap<T>>(
    event: E,
    listener: (data: InferEventMap<T>[E]) => void | Promise<void>
  ): string;
  off(eventName: TypedEventName<T>, listenerId: string): boolean;
  registerEvents<U extends EventRegistrationTuple>(registrations: U): string[];
  isEventRegistered(event: TypedEventName<T>): boolean;
  validateEventRegistration(event: TypedEventName<T>): void;
  getRegisteredEvents(): string[];
  getListenerCount(event: TypedEventName<T>): number;
  hasListeners(event: TypedEventName<T>): boolean;
  clear(): void;
  clearEvent(event: TypedEventName<T>): boolean;
};

export type DOMEventData = {
  'dom:action': {
    action: string;
    element: HTMLElement;
    data: Record<string, unknown>;
    originalEvent: Event;
  };
  'dom:action:error': {
    error: Error;
    target: HTMLElement;
    originalEvent: Event;
  };
  'form:change': {
    element: HTMLElement;
    value: string;
    originalEvent: Event;
  };
  'seller-report:change': {
    element: HTMLElement;
    value: string;
    originalEvent: Event;
  };
};
