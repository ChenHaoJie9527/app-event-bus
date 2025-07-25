# Small Event System

A lightweight, type-safe event bus system with DOM integration and smart configuration options.

## Features

- 🔒 **Type Safety**: Full TypeScript support with compile-time type checking
- ⚡ **Async Support**: Handle both synchronous and asynchronous listeners
- 🛡️ **Error Isolation**: One listener's error doesn't prevent others from executing
- 🎯 **Precise Control**: Remove listeners by unique ID for better memory management
- 🚀 **High Performance**: Concurrent listener execution for optimal performance
- ⚙️ **Smart Configuration**: Automatic DOM integration and debounce configuration through options
- 🌐 **DOM Integration**: Seamless integration with DOM events using data attributes
- 📦 **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install small-event-system
```

## Quick Start

### 1. Define Event Registrations

```typescript
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
    debounce: 300, // Individual event debounce
  },
] as const;
```

### 2. Create EventBus with Configuration

```typescript
import { createEventBus } from 'small-event-system';

const eventBus = createEventBus(eventRegistrations, {
  dom: true, // Automatically enable DOM integration
  defaultDebounce: {
    'user:action': 500, // Default debounce for user actions
    'api:request': 1000, // Default debounce for API requests
  },
});
```

### 3. Emit Events with Type Safety

```typescript
await eventBus.emit('user:login', {
  userId: 'user123',
  timestamp: Date.now(),
});

await eventBus.emit('form:submit', {
  formId: 'login-form',
  values: { email: 'user@example.com', password: '***' },
});
```

### 4. Use DOM Integration (Optional)

```html
<!-- DOM integration automatically enabled -->
<button data-event="user:action" data-action="logout">Logout</button>
<button data-event="notification:show" data-message="Hello!" data-type="success">
  Show Notification
</button>
```

## Configuration Options

### EventBusOptions

```typescript
interface EventBusOptions {
  /**
   * Enable DOM integration automatically
   * @default false
   */
  dom?: boolean;
  
  /**
   * Default debounce configuration for events
   * @default {}
   */
  defaultDebounce?: Record<string, number>;
}
```

### DOM Integration

When `dom: true` is set, the EventBus automatically:

- Enables DOM event listening
- Processes `data-event` attributes on HTML elements
- Converts DOM events to EventBus events
- Handles data extraction from `data-*` attributes

### Debounce Configuration

You can set default debounce delays for events:

```typescript
const eventBus = createEventBus(events, {
  defaultDebounce: {
    'user:action': 500,    // 500ms debounce for user actions
    'api:request': 1000,   // 1000ms debounce for API requests
    'form:input': 300,     // 300ms debounce for form inputs
  },
});
```

Individual events can override this with their own `debounce` property.

## Advanced Usage

### Modal System Example

```typescript
const modalEvents = [
  {
    event: 'modal:open',
    listener: (data: { id: string; props?: Record<string, unknown> }) => {
      console.log('Opening modal:', data.id, data.props);
    },
    description: 'Open a modal dialog',
  },
  {
    event: 'modal:close',
    listener: (data: { id: string; reason?: string }) => {
      console.log('Closing modal:', data.id, 'Reason:', data.reason);
    },
    description: 'Close a modal dialog',
  },
] as const;

const modalEventBus = createEventBus(modalEvents, {
  dom: true,
  defaultDebounce: {
    'modal:action': 150,
    'user:interaction': 300,
  },
});

// Usage
await modalEventBus.emit('modal:open', { id: 'user-profile', props: { userId: '123' } });
```

### DOM Integration with Data Attributes

```html
<button data-event="modal:open" data-id="user-profile" data-props='{"userId": "123"}'>
  Open Profile
</button>

<button data-event="modal:close" data-id="user-profile" data-reason="user-cancelled">
  Close
</button>

<button data-event="modal:action" data-id="user-profile" data-action="save" data-data='{"name": "John"}'>
  Save
</button>
```

## API Reference

### createEventBus<T>(events?, options?)

Creates a singleton EventBus instance with optional configuration.

**Parameters:**
- `events` (optional): Array of event registrations
- `options` (optional): Configuration options

**Returns:** `StrictEventBus<T>`

### EventBus Methods

- `emit(event, data)`: Emit an event with data
- `on(event, listener)`: Add an event listener
- `off(event, listenerId)`: Remove an event listener
- `registerEvents(registrations)`: Register multiple events
- `isEventRegistered(event)`: Check if event is registered
- `getRegisteredEvents()`: Get all registered event names
- `getListenerCount(event)`: Get listener count for an event
- `hasListeners(event)`: Check if event has listeners
- `clear()`: Clear all listeners and events
- `clearEvent(event)`: Clear specific event
- `enableDOMIntegration()`: Enable DOM integration manually
- `disableDOMIntegration()`: Disable DOM integration
- `isDOMIntegrationEnabled()`: Check if DOM integration is enabled
- `setDefaultDebounce(event, delay)`: Set default debounce for an event

## Examples

See the `examples/` directory for complete working examples:

- `basic-usage.ts`: Basic usage with configuration
- `modal-system.ts`: Modal system implementation
- `simple-demo.html`: Interactive HTML demo

## License

MIT 