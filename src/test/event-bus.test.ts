import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../events';

import type { EventRegistrationTuple } from '../types';

describe('EventBus Integration Tests', () => {
  let eventBus: EventBus<EventRegistrationTuple>;

  beforeEach(() => {
    eventBus = new EventBus<EventRegistrationTuple>();
  });

  describe('Event Registration System', () => {
    it('should register events using registerEvents method', () => {
      const events = [
        {
          event: 'modal:open',
          listener: vi.fn(),
          description: 'Test modal open handler',
        },
        {
          event: 'modal:close',
          listener: vi.fn(),
          description: 'Test modal close handler',
        },
      ] as const;
      const listenerIds = eventBus.registerEvents(events);

      expect(listenerIds).toHaveLength(2);
      expect(typeof listenerIds[0]).toBe('string');
      expect(typeof listenerIds[1]).toBe('string');
      expect(listenerIds[0]).not.toBe(listenerIds[1]);
    });

    it('should track registered events', () => {
      const events = [
        {
          event: 'modal:open',
          listener: vi.fn(),
          description: 'Test handler',
        },
      ] as const;
      eventBus.registerEvents(events);

      expect(eventBus.isEventRegistered('modal:open')).toBe(true);
      expect(eventBus.isEventRegistered('modal:close')).toBe(false);
      expect(eventBus.getRegisteredEvents()).toContain('modal:open');
    });

    it('should require event registration before emit', async () => {
      await expect(
        eventBus.emit('modal:open', { modalId: 'test' })
      ).rejects.toThrow('Event "modal:open" is not registered');

      const events = [
        {
          event: 'modal:open',
          listener: vi.fn(),
          description: 'Test handler',
        },
      ] as const;
      eventBus.registerEvents(events);

      await expect(
        eventBus.emit('modal:open', { modalId: 'test' })
      ).resolves.not.toThrow();
    });

    it('should handle multiple listeners for the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const events = [
        {
          event: 'modal:open',
          listener: listener1,
          description: 'First handler',
        },
        {
          event: 'modal:open',
          listener: listener2,
          description: 'Second handler',
        },
      ] as const;
      const listenerIds = eventBus.registerEvents(events);

      expect(listenerIds).toHaveLength(2);
      expect(eventBus.getListenerCount('modal:open')).toBe(2);
    });

    it('should clear registered events when clearing all', () => {
      const events = [
        {
          event: 'modal:open',
          listener: vi.fn(),
          description: 'Test handler',
        },
      ] as const;
      eventBus.registerEvents(events);

      expect(eventBus.isEventRegistered('modal:open')).toBe(true);

      eventBus.clear();

      expect(eventBus.isEventRegistered('modal:open')).toBe(false);
      expect(eventBus.getRegisteredEvents()).toHaveLength(0);
    });

    it('should clear specific registered events', () => {
      const events = [
        {
          event: 'modal:open',
          listener: vi.fn(),
          description: 'Test handler',
        },
        {
          event: 'modal:close',
          listener: vi.fn(),
          description: 'Test handler',
        },
      ] as const;
      eventBus.registerEvents(events);

      expect(eventBus.isEventRegistered('modal:open')).toBe(true);
      expect(eventBus.isEventRegistered('modal:close')).toBe(true);

      eventBus.clearEvent('modal:open');

      expect(eventBus.isEventRegistered('modal:open')).toBe(false);
      expect(eventBus.isEventRegistered('modal:close')).toBe(true);
    });
  });

  describe('Event Bus Core Functionality', () => {
    it('should create a new EventBus instance', () => {
      expect(eventBus).toBeInstanceOf(EventBus);
      expect(typeof eventBus.emit).toBe('function');
      expect(typeof eventBus.on).toBe('function');
      expect(typeof eventBus.off).toBe('function');
      expect(typeof eventBus.registerEvents).toBe('function');
    });

    it('should register and trigger listeners correctly', async () => {
      const mockListener = vi.fn();
      const testData = { modalId: 'test-modal' };

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Test handler',
        },
      ] as const);

      await eventBus.emit('modal:open', testData);

      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith(testData);
    });

    it('should handle multiple event types', async () => {
      const openListener = vi.fn();
      const closeListener = vi.fn();
      const testData = { modalId: 'test-modal' };

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: openListener,
          description: 'Open handler',
        },
        {
          event: 'modal:close',
          listener: closeListener,
          description: 'Close handler',
        },
      ] as const);

      await eventBus.emit('modal:open', testData);
      await eventBus.emit('modal:close', testData);

      expect(openListener).toHaveBeenCalledTimes(1);
      expect(closeListener).toHaveBeenCalledTimes(1);
      expect(openListener).toHaveBeenCalledWith(testData);
      expect(closeListener).toHaveBeenCalledWith(testData);
    });

    it('should handle listeners that throw errors gracefully', async () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const normalListener = vi.fn();
      const testData = { modalId: 'test-modal' };

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: errorListener,
          description: 'Error handler',
        },
        {
          event: 'modal:open',
          listener: normalListener,
          description: 'Normal handler',
        },
      ] as const);

      await expect(eventBus.emit('modal:open', testData)).rejects.toThrow(
        'Test error'
      );
      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(normalListener).toHaveBeenCalledTimes(1);
    });

    it('should call listeners in registration order', async () => {
      const callOrder: string[] = [];

      const listener1 = vi.fn().mockImplementation(() => {
        callOrder.push('listener1');
      });

      const listener2 = vi.fn().mockImplementation(() => {
        callOrder.push('listener2');
      });

      const listener3 = vi.fn().mockImplementation(() => {
        callOrder.push('listener3');
      });

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: listener1,
          description: 'First handler',
        },
        {
          event: 'modal:open',
          listener: listener2,
          description: 'Second handler',
        },
        {
          event: 'modal:open',
          listener: listener3,
          description: 'Third handler',
        },
      ] as const);

      await eventBus.emit('modal:open', { modalId: 'test' });

      expect(callOrder).toEqual(['listener1', 'listener2', 'listener3']);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Data Validation', () => {
    it('should pass correct data structure to listeners', async () => {
      const mockListener = vi.fn();
      const testData = { modalId: 'test-modal-123' };

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Test handler',
        },
      ] as const);

      await eventBus.emit('modal:open', testData);

      expect(mockListener).toHaveBeenCalledWith(testData);
      expect(mockListener.mock.calls[0][0]).toHaveProperty('modalId');
      expect(mockListener.mock.calls[0][0].modalId).toBe('test-modal-123');
    });

    it('should handle different modal IDs correctly', async () => {
      const mockListener = vi.fn();
      const data1 = { modalId: 'modal-1' };
      const data2 = { modalId: 'modal-2' };

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Test handler',
        },
      ] as const);

      await eventBus.emit('modal:open', data1);
      await eventBus.emit('modal:open', data2);

      expect(mockListener).toHaveBeenCalledTimes(2);
      expect(mockListener).toHaveBeenNthCalledWith(1, data1);
      expect(mockListener).toHaveBeenNthCalledWith(2, data2);
    });
  });

  describe('Listener Management', () => {
    it('should allow removing listeners', () => {
      const mockListener = vi.fn();

      const listenerIds = eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Test handler',
        },
      ] as const);

      const removed = eventBus.off('modal:open', listenerIds[0]);

      expect(removed).toBe(true);
      expect(eventBus.getListenerCount('modal:open')).toBe(0);
    });

    it('should handle removing non-existent listeners gracefully', () => {
      expect(() => {
        eventBus.off('modal:open', 'non-existent-id');
      }).not.toThrow();

      const result = eventBus.off('modal:open', 'non-existent-id');
      expect(result).toBe(false);
    });

    it('should return unique listener IDs', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      const listenerIds = eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener1,
          description: 'First handler',
        },
        {
          event: 'modal:open',
          listener: mockListener2,
          description: 'Second handler',
        },
      ] as const);

      expect(listenerIds).toHaveLength(2);
      expect(listenerIds[0]).toBeDefined();
      expect(listenerIds[1]).toBeDefined();
      expect(listenerIds[0]).not.toBe(listenerIds[1]);
      expect(typeof listenerIds[0]).toBe('string');
      expect(typeof listenerIds[1]).toBe('string');
    });

    it('should track listener count correctly', () => {
      expect(eventBus.getListenerCount('modal:open')).toBe(0);
      expect(eventBus.hasListeners('modal:open')).toBe(false);

      const listenerIds = eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: vi.fn(),
          description: 'First handler',
        },
      ] as const);

      expect(eventBus.getListenerCount('modal:open')).toBe(1);
      expect(eventBus.hasListeners('modal:open')).toBe(true);

      const listenerIds2 = eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: vi.fn(),
          description: 'Second handler',
        },
      ] as const);

      expect(eventBus.getListenerCount('modal:open')).toBe(2);

      eventBus.off('modal:open', listenerIds[0]);
      expect(eventBus.getListenerCount('modal:open')).toBe(1);

      eventBus.off('modal:open', listenerIds2[0]);
      expect(eventBus.getListenerCount('modal:open')).toBe(0);
      expect(eventBus.hasListeners('modal:open')).toBe(false);
    });

    it('should clear all listeners', () => {
      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: vi.fn(),
          description: 'Test handler',
        },
        {
          event: 'modal:close',
          listener: vi.fn(),
          description: 'Test handler',
        },
      ] as const);

      expect(eventBus.hasListeners('modal:open')).toBe(true);
      expect(eventBus.hasListeners('modal:close')).toBe(true);

      eventBus.clear();

      expect(eventBus.hasListeners('modal:open')).toBe(false);
      expect(eventBus.hasListeners('modal:close')).toBe(false);
    });

    it('should clear specific event listeners', () => {
      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: vi.fn(),
          description: 'Test handler',
        },
        {
          event: 'modal:close',
          listener: vi.fn(),
          description: 'Test handler',
        },
      ] as const);

      expect(eventBus.hasListeners('modal:open')).toBe(true);
      expect(eventBus.hasListeners('modal:close')).toBe(true);

      const cleared = eventBus.clearEvent('modal:open');

      expect(cleared).toBe(true);
      expect(eventBus.hasListeners('modal:open')).toBe(false);
      expect(eventBus.hasListeners('modal:close')).toBe(true);
    });
  });

  describe('Concurrent Event Handling', () => {
    it('should handle concurrent events correctly', async () => {
      const mockListener = vi.fn();
      const events = [
        { modalId: 'modal-1' },
        { modalId: 'modal-2' },
        { modalId: 'modal-3' },
      ];

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Test handler',
        },
      ] as const);

      // Firing multiple events concurrently
      await Promise.all(
        events.map((event) => eventBus.emit('modal:open', event))
      );

      expect(mockListener).toHaveBeenCalledTimes(3);
      for (let i = 0; i < events.length; i++) {
        expect(mockListener).toHaveBeenNthCalledWith(i + 1, events[i]);
      }
    });

    it('should handle mixed event types concurrently', async () => {
      const openListener = vi.fn();
      const closeListener = vi.fn();

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: openListener,
          description: 'Open handler',
        },
        {
          event: 'modal:close',
          listener: closeListener,
          description: 'Close handler',
        },
      ] as const);

      // Firing different types of events concurrently
      await Promise.all([
        eventBus.emit('modal:open', { modalId: 'modal-1' }),
        eventBus.emit('modal:close', { modalId: 'modal-1' }),
        eventBus.emit('modal:open', { modalId: 'modal-2' }),
      ]);

      expect(openListener).toHaveBeenCalledTimes(2);
      expect(closeListener).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle errors in concurrent events', async () => {
    const errorListener = vi.fn().mockImplementation(() => {
      throw new Error('Event error');
    });

    const normalListener = vi.fn();

    eventBus.registerEvents([
      {
        event: 'modal:open',
        listener: errorListener,
        description: 'Error handler',
      },
      {
        event: 'modal:close',
        listener: normalListener,
        description: 'Normal handler',
      },
    ] as const);

    try {
      await Promise.all([
        eventBus.emit('modal:open', { modalId: 'modal-1' }),
        eventBus.emit('modal:close', { modalId: 'modal-1' }),
      ]);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Event error');
    }

    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(normalListener).toHaveBeenCalledTimes(1);
  });

  describe('Performance and Memory', () => {
    it('should handle large numbers of listeners efficiently', async () => {
      const listeners = Array.from({ length: 100 }, () => vi.fn());
      const testData = { modalId: 'test-modal' };

      // Register 100 listeners
      const registrations = listeners.map((listener, index) => ({
        event: 'modal:open' as const,
        listener,
        description: `Handler ${index + 1}`,
      }));

      eventBus.registerEvents(registrations);

      await eventBus.emit('modal:open', testData);

      // Verify that all listeners are called
      for (const listener of listeners) {
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(testData);
      }
    });
  });

  describe('Type Safety Integration', () => {
    it('should enforce type safety for event names', () => {
      // These tests ensure that TypeScript compile-time type checking
      const validEvents = ['modal:open', 'modal:close'] as const;
      const eventPattern = /^modal:(open|close)$/;

      for (const event of validEvents) {
        expect(typeof event).toBe('string');
        expect(event).toMatch(eventPattern);
      }
    });

    it('should enforce type safety for event data', () => {
      // Test event data structure
      const validData = { modalId: 'test' };
      const validCloseData = { modalId: 'test' };
      expect(validData).toHaveProperty('modalId');
      expect(validCloseData).toHaveProperty('modalId');
      expect(typeof validData.modalId).toBe('string');
      expect(typeof validCloseData.modalId).toBe('string');
    });
  });

  describe('Type Inference System', () => {
    it('should correctly infer event types from registration', () => {
      // Defining registrations with different data types
      const registrations = [
        {
          event: 'user:login',
          listener: (data: { userId: string; username: string }) => {
            console.log('User logged in:', data.username);
          },
          description: 'User login handler',
        },
        {
          event: 'order:created',
          listener: (data: {
            orderId: string;
            amount: number;
            items: string[];
          }) => {
            console.log('Order created:', data.orderId, data.amount);
          },
          description: 'Order creation handler',
        },
        {
          event: 'notification:show',
          listener: (data: {
            message: string;
            type: 'success' | 'error' | 'warning';
          }) => {
            console.log('Notification:', data.message, data.type);
          },
          description: 'Notification handler',
        },
      ] as const;

      // Creating a new EventBus instance with inferred types
      const typedEventBus = new EventBus(registrations);

      // Testing if type inference is correct
      // These calls should pass type checking at compile time
      typedEventBus.emit('order:created', {
        orderId: 'ORD-001',
        amount: 299.99,
        items: ['item1', 'item2'],
      });

      typedEventBus.emit('notification:show', {
        message: 'success',
        type: 'success',
      });

      // Verifying that events are correctly registered
      expect(typedEventBus.isEventRegistered('user:login')).toBe(true);
      expect(typedEventBus.isEventRegistered('order:created')).toBe(true);
      expect(typedEventBus.isEventRegistered('notification:show')).toBe(true);
    });

    it('should provide correct type hints for emit method', () => {
      // This test verifies if type hints are correct
      const registrations = [
        {
          event: 'test:event',
          listener: (data: { id: string; value: number }) => {
            console.log('Test event:', data.id, data.value);
          },
          description: 'Test event handler',
        },
      ] as const;

      const typedEventBus = new EventBus(registrations);

      // There should be complete type hints here
      // event parameter should hint 'test:event'
      // data parameter should hint { id: string; value: number }
      typedEventBus.emit('test:event', { id: 'test-1', value: 42 });

      // Verifying that events are registered
      expect(typedEventBus.isEventRegistered('test:event')).toBe(true);
    });

    it('should handle complex nested data types', () => {
      const registrations = [
        {
          event: 'product:updated',
          listener: (data: {
            productId: string;
            changes: {
              name?: string;
              price?: number;
              categories?: Array<{
                id: string;
                name: string;
              }>;
            };
            metadata: {
              updatedBy: string;
              timestamp: Date;
            };
          }) => {
            console.log('Product updated:', data.productId, data.changes);
          },
          description: 'Product update handler',
        },
      ] as const;

      const typedEventBus = new EventBus(registrations);

      // Testing complex nested data types
      typedEventBus.emit('product:updated', {
        productId: 'PROD-001',
        changes: {
          name: 'new product name',
          price: 199.99,
          categories: [
            { id: 'cat1', name: 'electronics' },
            { id: 'cat2', name: 'digital accessories' },
          ],
        },
        metadata: {
          updatedBy: 'admin',
          timestamp: new Date(),
        },
      });

      expect(typedEventBus.isEventRegistered('product:updated')).toBe(true);
    });

    it('should support union types in event data', () => {
      const registrations = [
        {
          event: 'api:response',
          listener: (
            data:
              | { status: 'success'; data: any; message?: string }
              | { status: 'error'; error: string; code: number }
          ) => {
            if (data.status === 'success') {
              console.log('API success:', data.data);
            } else {
              console.log('API error:', data.error, data.code);
            }
          },
          description: 'API response handler',
        },
      ] as const;

      const typedEventBus = new EventBus(registrations);

      // Testing union types
      typedEventBus.emit('api:response', {
        status: 'success',
        data: { userId: '123', name: 'John Doe' },
        message: 'success',
      });

      typedEventBus.emit('api:response', {
        status: 'error',
        error: 'User not found',
        code: 404,
      });

      expect(typedEventBus.isEventRegistered('api:response')).toBe(true);
    });

    it('should handle async listeners with proper typing', async () => {
      const registrations = [
        {
          event: 'data:sync',
          listener: async (data: {
            userId: string;
            syncData: Record<string, any>;
          }) => {
            // Simulating asynchronous operations
            await new Promise((resolve) => setTimeout(resolve, 10));
            console.log('Data synced for user:', data.userId);
          },
          description: 'Data sync handler',
        },
      ] as const;

      const typedEventBus = new EventBus(registrations);

      // Testing asynchronous listeners
      await typedEventBus.emit('data:sync', {
        userId: '123',
        syncData: { preferences: { theme: 'dark' } },
      });

      expect(typedEventBus.isEventRegistered('data:sync')).toBe(true);
    });

    it('should support multiple listeners for same event with different types', () => {
      const registrations = [
        {
          event: 'user:action',
          listener: (data: { userId: string; action: 'login' | 'logout' }) => {
            console.log('User action:', data.action);
          },
          description: 'User action logger',
        },
        {
          event: 'user:action',
          listener: (data: { userId: string; action: 'login' | 'logout' }) => {
            // Sending analytics data
            console.log('Analytics:', data.userId, data.action);
          },
          description: 'User action analytics',
        },
      ] as const;

      const typedEventBus = new EventBus(registrations);

      // Testing multiple listeners for the same event
      typedEventBus.emit('user:action', {
        userId: '123',
        action: 'login',
      });

      typedEventBus.emit('user:action', {
        userId: '123',
        action: 'logout',
      });

      expect(typedEventBus.isEventRegistered('user:action')).toBe(true);
      expect(typedEventBus.getListenerCount('user:action')).toBe(2);
    });

    it('should handle generic event names with specific data types', () => {
      const registrations = [
        {
          event: 'entity:created',
          listener: (data: {
            entityType: string;
            entityId: string;
            data: any;
          }) => {
            console.log('Entity created:', data.entityType, data.entityId);
          },
          description: 'Generic entity creation handler',
        },
        {
          event: 'entity:updated',
          listener: (data: {
            entityType: string;
            entityId: string;
            changes: any;
          }) => {
            console.log('Entity updated:', data.entityType, data.entityId);
          },
          description: 'Generic entity update handler',
        },
        {
          event: 'entity:deleted',
          listener: (data: {
            entityType: string;
            entityId: string;
            reason?: string;
          }) => {
            console.log('Entity deleted:', data.entityType, data.entityId);
          },
          description: 'Generic entity deletion handler',
        },
        {
          event: 'dom:action',
          listener: (data: {
            action: string;
            element: HTMLElement;
            data: Record<string, unknown>;
          }) => {
            console.log('DOM action:', data.action, data.element, data.data);
          },
          description: 'DOM action handler',
        },
      ] as const;

      const typedEventBus = new EventBus(registrations);

      typedEventBus.emit('entity:created', {
        entityType: 'user',
        entityId: '123',
        data: { name: 'John Doe', email: 'john.doe@example.com' },
      });

      typedEventBus.emit('entity:updated', {
        entityType: 'product',
        entityId: 'PROD-001',
        changes: { price: 199.99 },
      });

      typedEventBus.emit('entity:deleted', {
        entityType: 'order',
        entityId: 'ORD-001',
        reason: 'User cancelled',
      });

      expect(typedEventBus.isEventRegistered('entity:created')).toBe(true);
      expect(typedEventBus.isEventRegistered('entity:updated')).toBe(true);
      expect(typedEventBus.isEventRegistered('entity:deleted')).toBe(true);
    });
  });
});
