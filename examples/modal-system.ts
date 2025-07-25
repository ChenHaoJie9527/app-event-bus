import { createEventBus } from '../src/events';

// Define modal system events
const modalEvents = [
  {
    event: 'modal:open',
    listener: (data: { id: string; props?: Record<string, unknown> }) => {
      console.log('Opening modal:', data.id, data.props);
      // Modal opening logic here
    },
    description: 'Open a modal dialog',
  },
  {
    event: 'modal:close',
    listener: (data: { id: string; reason?: string }) => {
      console.log('Closing modal:', data.id, 'Reason:', data.reason);
      // Modal closing logic here
    },
    description: 'Close a modal dialog',
  },
  {
    event: 'modal:action',
    listener: (data: { id: string; action: string; data: unknown }) => {
      console.log('Modal action:', data.action, 'Data:', data.data);
      // Handle modal actions
    },
    description: 'Handle modal actions',
    debounce: 100, // Debounce rapid modal actions
  },
] as const;

// Create EventBus with DOM integration and default debounce
const modalEventBus = createEventBus(modalEvents, {
  dom: true, // Enable DOM integration automatically
  defaultDebounce: {
    'modal:action': 150, // Override individual event debounce
    'user:interaction': 300, // Default for user interactions
  },
});

// Example usage
export async function openModal(
  modalId: string,
  props?: Record<string, unknown>
) {
  await modalEventBus.emit('modal:open', { id: modalId, props });
}

export async function closeModal(modalId: string, reason?: string) {
  await modalEventBus.emit('modal:close', { id: modalId, reason });
}

export async function triggerModalAction(
  modalId: string,
  action: string,
  data: unknown
) {
  await modalEventBus.emit('modal:action', { id: modalId, action, data });
}

// DOM integration allows using data attributes:
// <button data-event="modal:open" data-id="user-profile" data-props='{"userId": "123"}'>Open Profile</button>
// <button data-event="modal:close" data-id="user-profile" data-reason="user-cancelled">Close</button>
// <button data-event="modal:action" data-id="user-profile" data-action="save" data-data='{"name": "John"}'>Save</button>
