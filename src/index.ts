// Core EventBus functionality
export {
  createEventBus,
  getGlobalEventBus,
  resetGlobalEventBus,
} from './events';

// DOM integration
export { DOMEventIntegration } from './dom-event-integration';

// Type definitions
export type {
  EventRegistration,
  EventRegistrationTuple,
  InferEventMap,
  InferEventNames,
  MergeEventMaps,
  TypedEventName,
  StrictEventBus,
  DynamicEventBus,
  AppEvents,
} from './types';
