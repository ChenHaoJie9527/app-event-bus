import { EventBus } from '../events';
import { modalHandler } from '../handlers/modal-handler';

// Creating an Event Bus Instance
const eventBus = new EventBus();

// Example: Setting up modal event listeners
export function setupModalEventListeners(): void {
  // Listening for modal:open events
  const openListenerId = eventBus.on("modal:open", (data) => {
    console.log(`Modal opening: ${data.modalId}`);
    // Calling business logic handler
    modalHandler.openModal(data.modalId);
  });

  // Listening for modal:close events
  const closeListenerId = eventBus.on('modal:close', (data) => {
    console.log(`Modal closing: ${data.modalId}`);
    // Calling business logic handler
    modalHandler.closeModal(data.modalId);
  });

  console.log('Modal event listeners setup complete');
  console.log(`Open listener ID: ${openListenerId}`);
  console.log(`Close listener ID: ${closeListenerId}`);
}

// Example: Triggering modal events
export async function triggerModalEvents(): Promise<void> {
  // Opening modal
  await eventBus.emit('modal:open', { modalId: 'user-profile-modal' });

  // Waiting for a while before closing modal
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await eventBus.emit('modal:close', { modalId: 'user-profile-modal' });
}

// Example: Removing specific listeners
export function removeModalListeners(
  openListenerId: string,
  closeListenerId: string
): void {
  const openRemoved = eventBus.off('modal:open', openListenerId);
  const closeRemoved = eventBus.off('modal:close', closeListenerId);

  console.log(`Open listener removed: ${openRemoved}`);
  console.log(`Close listener removed: ${closeRemoved}`);
}

// Example: Checking listener status
export function checkListenerStatus(): void {
  console.log(
    `Has modal:open listeners: ${eventBus.hasListeners('modal:open')}`
  );
  console.log(
    `Has modal:close listeners: ${eventBus.hasListeners('modal:close')}`
  );
  console.log(
    `Modal:open listener count: ${eventBus.getListenerCount('modal:open')}`
  );
  console.log(
    `Modal:close listener count: ${eventBus.getListenerCount('modal:close')}`
  );
}

// Example: Clearing all listeners
export function clearAllListeners(): void {
  eventBus.clear();
  console.log('All listeners cleared');
}

// Example: Async listeners
export function setupAsyncModalListeners(): void {
  eventBus.on('modal:open', async (data) => {
    console.log(`Async: Starting to open modal ${data.modalId}`);
    // Simulating async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`Async: Modal ${data.modalId} opened successfully`);
    modalHandler.openModal(data.modalId);
  });

  eventBus.on('modal:close', async (data) => {
    console.log(`Async: Starting to close modal ${data.modalId}`);
    // Simulating async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`Async: Modal ${data.modalId} closed successfully`);
    modalHandler.closeModal(data.modalId);
  });
}

// Example: Error handling
export function setupErrorHandlingListeners(): void {
  eventBus.on('modal:open', (data) => {
    console.log(`Processing modal open: ${data.modalId}`);
    // Simulating a possible error operation
    if (data.modalId === 'error-modal') {
      throw new Error(`Failed to open modal: ${data.modalId}`);
    }
    modalHandler.openModal(data.modalId);
  });

  eventBus.on('modal:open', (data) => {
    console.log(`Backup handler for modal: ${data.modalId}`);
    // This listener should always be executed, even if the previous listener fails
  });
}

// Example: Complete usage flow
export async function demonstrateCompleteFlow(): Promise<void> {
  console.log('=== Modal Event System Demo ===');

  // 1. Setting up listeners
  setupModalEventListeners();
  checkListenerStatus();

  // 2. Triggering events
  console.log('\n--- Triggering events ---');
  await triggerModalEvents();

  // 3. Setting up async listeners
  console.log('\n--- Setting up async listeners ---');
  setupAsyncModalListeners();

  // 4. Triggering async events
  console.log('\n--- Triggering async events ---');
  await eventBus.emit('modal:open', { modalId: 'async-modal' });
  await eventBus.emit('modal:close', { modalId: 'async-modal' });

  // 5. Testing error handling
  console.log('\n--- Testing error handling ---');
  setupErrorHandlingListeners();

  try {
    await eventBus.emit('modal:open', { modalId: 'error-modal' });
  } catch (error) {
    console.log(
      `Caught error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // 6. Normal events should still work
  await eventBus.emit('modal:open', { modalId: 'normal-modal' });

  // 7. Cleaning up
  console.log('\n--- Cleaning up ---');
  clearAllListeners();
  checkListenerStatus();

  console.log('\n=== Demo Complete ===');
}
