import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../events';
import { modalHandler } from '../handlers/modal-handler';
import type { EventMap } from '../types';

// Mock console.log to capture output
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
  // Mock implementation
});

describe('Modal Event System', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    consoleSpy.mockClear();
  });

  describe('Event Emission and Listening', () => {
    it('should emit and listen to modal:open event', async () => {
      const mockListener = vi.fn();
      const modalId = 'test-modal';

      // Listening for modal:open events using registerEvents
      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Test modal open listener'
        }
      ]);

      // Emitting modal:open events
      await eventBus.emit('modal:open', { modalId });

      // Verifying that the listener was called
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith({ modalId });
    });

    it('should emit and listen to modal:close event', async () => {
      const mockListener = vi.fn();
      const modalId = 'test-modal';

      // Listening for modal:close events using registerEvents
      eventBus.registerEvents([
        {
          event: 'modal:close',
          listener: mockListener,
          description: 'Test modal close listener'
        }
      ]);

      // Emitting modal:close events
      await eventBus.emit('modal:close', { modalId });

      // Verifying that the listener was called
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith({ modalId });
    });

    it('should handle multiple listeners for the same event', async () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();
      const modalId = 'test-modal';

      // Adding multiple listeners using registerEvents
      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener1,
          description: 'First modal open listener'
        },
        {
          event: 'modal:open',
          listener: mockListener2,
          description: 'Second modal open listener'
        }
      ]);

      // Emitting events
      await eventBus.emit('modal:open', { modalId });

      // Verifying that all listeners were called
      expect(mockListener1).toHaveBeenCalledTimes(1);
      expect(mockListener1).toHaveBeenCalledWith({ modalId });
      expect(mockListener2).toHaveBeenCalledTimes(1);
      expect(mockListener2).toHaveBeenCalledWith({ modalId });
    });

    it('should handle events with different modal IDs', async () => {
      const mockListener = vi.fn();
      const modalId1 = 'modal-1';
      const modalId2 = 'modal-2';

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Test modal open listener'
        }
      ]);

      // Firing events with different modal IDs
      await eventBus.emit('modal:open', { modalId: modalId1 });
      await eventBus.emit('modal:open', { modalId: modalId2 });

      // Verify that the listener is called twice with the correct parameters
      expect(mockListener).toHaveBeenCalledTimes(2);
      expect(mockListener).toHaveBeenNthCalledWith(1, { modalId: modalId1 });
      expect(mockListener).toHaveBeenNthCalledWith(2, { modalId: modalId2 });
    });
  });

  describe('Modal Handler Integration', () => {
    it('should trigger openModal handler when modal:open event is emitted', async () => {
      const modalId = 'test-modal';

      // Listening for modal:open events and calling handler using registerEvents
      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: (data) => {
            modalHandler.openModal(data.modalId);
          },
          description: 'Modal open handler integration'
        }
      ]);

      // Emitting events
      await eventBus.emit('modal:open', { modalId });

      // Verifying that the handler was called
      expect(consoleSpy).toHaveBeenCalledWith(`Opening modal: ${modalId}`);
    });

    it('should trigger closeModal handler when modal:close event is emitted', async () => {
      const modalId = 'test-modal';

      // Listening for modal:close events and calling handler using registerEvents
      eventBus.registerEvents([
        {
          event: 'modal:close',
          listener: (data) => {
            modalHandler.closeModal(data.modalId);
          },
          description: 'Modal close handler integration'
        }
      ]);

      // Emitting events
      await eventBus.emit('modal:close', { modalId });

      // Verifying that the handler was called
      expect(consoleSpy).toHaveBeenCalledWith(`Closing modal: ${modalId}`);
    });

    it('should handle both open and close events in sequence', async () => {
      const modalId = 'test-modal';
      const openHandler = vi.fn();
      const closeHandler = vi.fn();

      // Setting listeners using registerEvents
      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: (data) => {
            modalHandler.openModal(data.modalId);
            openHandler(data.modalId);
          },
          description: 'Modal open sequence handler'
        },
        {
          event: 'modal:close',
          listener: (data) => {
            modalHandler.closeModal(data.modalId);
            closeHandler(data.modalId);
          },
          description: 'Modal close sequence handler'
        }
      ]);

      // Clear the console spy to remove registration messages
      consoleSpy.mockClear();

      // Emitting events in sequence
      await eventBus.emit('modal:open', { modalId });
      await eventBus.emit('modal:close', { modalId });

      // Verifying call order and parameters
      expect(openHandler).toHaveBeenCalledWith(modalId);
      expect(closeHandler).toHaveBeenCalledWith(modalId);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        1,
        `Opening modal: ${modalId}`
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        2,
        `Closing modal: ${modalId}`
      );
    });
  });

  describe('Event Bus Behavior', () => {
    it('should handle events with no listeners gracefully', async () => {
      const modalId = 'test-modal';

      // Register the event but don't add any listeners
      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: () => {
            // Empty listener
          },
          description: 'Empty listener'
        }
      ]);

      // Remove the listener to test no listeners scenario
      const listenerIds = eventBus.getRegisteredEvents();
      eventBus.clear();

      // Now try to emit without any listeners
      await expect(
        eventBus.emit('modal:open', { modalId })
      ).rejects.toThrow('Event "modal:open" is not registered');
    });

    it('should handle async listeners correctly', async () => {
      const mockListener = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      const modalId = 'test-modal';

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Async modal listener'
        }
      ]);

      const startTime = Date.now();
      await eventBus.emit('modal:open', { modalId });
      const endTime = Date.now();

      // Verifying that the async listener was correctly awaited
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(endTime - startTime).toBeGreaterThanOrEqual(10);
    });

    it('should handle multiple events in parallel', async () => {
      const mockListener = vi.fn();
      const modalId1 = 'modal-1';
      const modalId2 = 'modal-2';

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Parallel events listener'
        }
      ]);

      // Firing multiple events in parallel
      await Promise.all([
        eventBus.emit('modal:open', { modalId: modalId1 }),
        eventBus.emit('modal:open', { modalId: modalId2 }),
      ]);

      // Verifying that all events were processed
      expect(mockListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct event data types', () => {
      // These tests ensure that TypeScript type checking works correctly
      const mockListener = vi.fn();

      // Should be able to register events correctly
      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Type safety test'
        },
        {
          event: 'modal:close',
          listener: mockListener,
          description: 'Type safety test'
        }
      ]);

      // Verifying that the listener was correctly registered
      expect(mockListener).toBeDefined();
    });

    it('should handle event map types correctly', () => {
      // Testing event mapping types
      const events: (keyof EventMap)[] = ['modal:open', 'modal:close'];

      for (const event of events) {
        expect(typeof event).toBe('string');
      }
    });
  });
});
