import { createEventBus } from '../src/events';

// Define your event registrations
const eventRegistrations = [
  {
    event: 'user:login',
    listener: (data: { userId: string; timestamp: number }) => {
      console.log('User logged in:', data);
    },
    description: 'Handle user login events',
  },
  {
    event: 'form:submit',
    listener: (data: { formId: string; values: Record<string, unknown> }) => {
      console.log('Form submitted:', data);
    },
    description: 'Handle form submission events',
    debounce: 300, // Debounce form submissions by 300ms
  },
] as const;

// Create EventBus with DOM integration enabled
const eventBus = createEventBus(eventRegistrations, {
  dom: true, // Automatically enable DOM integration
  defaultDebounce: {
    'user:action': 500, // Default debounce for user actions
    'api:request': 1000, // Default debounce for API requests
  },
});

// Now you can emit events with type safety
eventBus.emit('user:login', {
  userId: '123',
  timestamp: Date.now(),
});

eventBus.emit('form:submit', {
  formId: 'login-form',
  values: { email: 'user@example.com', password: '***' },
});

// DOM integration is automatically enabled, so you can use data attributes
// <button data-event="user:action" data-action="logout">Logout</button>
