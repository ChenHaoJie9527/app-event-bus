import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { createEventBus, resetGlobalEventBus } from '../events';

import type { EventRegistrationTuple } from '../types';

describe('EventBus Integration Tests', () => {
  let eventBus: ReturnType<typeof createEventBus<EventRegistrationTuple>>;

  beforeEach(() => {
    resetGlobalEventBus();
    eventBus = createEventBus<EventRegistrationTuple>();
  });

  afterEach(() => {
    resetGlobalEventBus();
  });

  describe('Singleton Pattern Tests', () => {
    it('should always return the same instance', () => {
      const instance1 = createEventBus();
      const instance2 = createEventBus();
      const instance3 = createEventBus();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(instance3);
    });

    it('should reset global instance correctly', () => {
      const instance1 = createEventBus();
      resetGlobalEventBus();
      const instance2 = createEventBus();

      expect(instance1).not.toBe(instance2);
    });

    it('should register events to the same instance', () => {
      const instance1 = createEventBus();
      instance1.registerEvents([
        {
          event: 'test:event',
          listener: vi.fn(),
          description: 'Test handler',
        },
      ] as const);

      const instance2 = createEventBus();
      expect(instance2.isEventRegistered('test:event')).toBe(true);
    });
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
          description: 'Open handler',
        },
        {
          event: 'modal:close',
          listener: vi.fn(),
          description: 'Close handler',
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
    it('should create a singleton EventBus instance', () => {
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.emit).toBe('function');
      expect(typeof eventBus.on).toBe('function');
      expect(typeof eventBus.off).toBe('function');
      expect(typeof eventBus.registerEvents).toBe('function');

      // 测试单例模式
      const anotherInstance = createEventBus();
      expect(eventBus).toBe(anotherInstance);
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
    });
  });

  describe('Event Data Validation', () => {
    it('should pass correct data structure to listeners', async () => {
      const mockListener = vi.fn();
      const testData = {
        modalId: 'test-modal',
        title: 'Test Modal',
        content: 'Modal content',
        options: { width: 500, height: 300 },
      };

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: mockListener,
          description: 'Test handler',
        },
      ] as const);

      await eventBus.emit('modal:open', testData);

      expect(mockListener).toHaveBeenCalledWith(testData);
    });

    it('should handle different modal IDs correctly', async () => {
      const modal1Listener = vi.fn();
      const modal2Listener = vi.fn();

      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener: modal1Listener,
          description: 'Modal 1 handler',
        },
        {
          event: 'modal:open',
          listener: modal2Listener,
          description: 'Modal 2 handler',
        },
      ] as const);

      const data1 = { modalId: 'modal-1', title: 'First Modal' };
      const data2 = { modalId: 'modal-2', title: 'Second Modal' };

      await eventBus.emit('modal:open', data1);
      await eventBus.emit('modal:open', data2);

      expect(modal1Listener).toHaveBeenCalledTimes(2);
      expect(modal2Listener).toHaveBeenCalledTimes(2);
      expect(modal1Listener).toHaveBeenNthCalledWith(1, data1);
      expect(modal1Listener).toHaveBeenNthCalledWith(2, data2);
    });
  });

  describe('Listener Management', () => {
    it('should allow removing listeners', () => {
      const listener = vi.fn();
      const listenerId = eventBus.on('modal:open', listener);

      expect(eventBus.getListenerCount('modal:open')).toBe(1);

      const removed = eventBus.off('modal:open', listenerId);
      expect(removed).toBe(true);
      expect(eventBus.getListenerCount('modal:open')).toBe(0);
    });

    it('should handle removing non-existent listeners gracefully', () => {
      const removed = eventBus.off('modal:open', 'non-existent-id');
      expect(removed).toBe(false);
    });

    it('should return unique listener IDs', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const id1 = eventBus.on('modal:open', listener1);
      const id2 = eventBus.on('modal:open', listener2);

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should track listener count correctly', () => {
      expect(eventBus.getListenerCount('modal:open')).toBe(0);

      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      eventBus.on('modal:open', listener1);
      expect(eventBus.getListenerCount('modal:open')).toBe(1);

      eventBus.on('modal:open', listener2);
      expect(eventBus.getListenerCount('modal:open')).toBe(2);

      eventBus.on('modal:open', listener3);
      expect(eventBus.getListenerCount('modal:open')).toBe(3);
    });

    it('should clear all listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on('modal:open', listener1);
      eventBus.on('modal:close', listener2);

      expect(eventBus.getListenerCount('modal:open')).toBe(1);
      expect(eventBus.getListenerCount('modal:close')).toBe(1);

      eventBus.clear();

      expect(eventBus.getListenerCount('modal:open')).toBe(0);
      expect(eventBus.getListenerCount('modal:close')).toBe(0);
    });

    it('should clear specific event listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on('modal:open', listener1);
      eventBus.on('modal:close', listener2);

      expect(eventBus.getListenerCount('modal:open')).toBe(1);
      expect(eventBus.getListenerCount('modal:close')).toBe(1);

      eventBus.clearEvent('modal:open');

      expect(eventBus.getListenerCount('modal:open')).toBe(0);
      expect(eventBus.getListenerCount('modal:close')).toBe(1);
    });
  });

  describe('Concurrent Event Handling', () => {
    it('should handle concurrent events correctly', async () => {
      const listener = vi.fn();
      eventBus.registerEvents([
        {
          event: 'modal:open',
          listener,
          description: 'Concurrent test handler',
        },
      ] as const);

      const promises = [
        eventBus.emit('modal:open', { modalId: 'modal-1' }),
        eventBus.emit('modal:open', { modalId: 'modal-2' }),
        eventBus.emit('modal:open', { modalId: 'modal-3' }),
      ];

      await Promise.all(promises);

      expect(listener).toHaveBeenCalledTimes(3);
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

      const promises = [
        eventBus.emit('modal:open', { modalId: 'modal-1' }),
        eventBus.emit('modal:close', { modalId: 'modal-1' }),
        eventBus.emit('modal:open', { modalId: 'modal-2' }),
      ];

      await Promise.all(promises);

      expect(openListener).toHaveBeenCalledTimes(2);
      expect(closeListener).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in concurrent events', async () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Concurrent error');
      });
      const normalListener = vi.fn();

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

      const promises = [
        eventBus.emit('modal:open', { modalId: 'modal-1' }),
        eventBus.emit('modal:open', { modalId: 'modal-2' }),
      ];

      await expect(Promise.all(promises)).rejects.toThrow('Concurrent error');
      expect(errorListener).toHaveBeenCalledTimes(2);
      expect(normalListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large numbers of listeners efficiently', () => {
      const listeners = Array.from({ length: 1000 }, () => vi.fn());

      const startTime = performance.now();
      for (const listener of listeners) {
        eventBus.on('modal:open', listener);
      }
      const endTime = performance.now();

      expect(eventBus.getListenerCount('modal:open')).toBe(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('Type Safety Integration', () => {
    it('should enforce type safety for event data', () => {
      const typedEventBus = createEventBus([
        {
          event: 'modal:open',
          listener: (data: { modalId: string; title?: string }) => {
            console.log(data.modalId, data.title);
          },
          description: 'Test handler',
        },
      ] as const);

      // This should work
      typedEventBus.emit('modal:open', {
        modalId: 'test',
        title: 'Test Modal',
      });

      // This should work too (optional property)
      typedEventBus.emit('modal:open', { modalId: 'test' });
    });
  });

  describe('Type Inference System', () => {
    it('should correctly infer event types from registration', () => {
      const registrations = [
        {
          event: 'user:login',
          listener: (data: { userId: string; timestamp: Date }) => {
            console.log('User logged in:', data.userId);
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
            console.log('Order created:', data.orderId);
          },
          description: 'Order creation handler',
        },
        {
          event: 'notification:show',
          listener: (data: { message: string; type: string }) => {
            console.log('Notification:', data.message);
          },
          description: 'Notification handler',
        },
      ] as const;

      // Creating a singleton EventBus instance with inferred types
      const typedEventBus = createEventBus(registrations);

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

      const typedEventBus = createEventBus(registrations);

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

      const typedEventBus = createEventBus(registrations);

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

      const typedEventBus = createEventBus(registrations);

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

      const typedEventBus = createEventBus(registrations);

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
            console.log('User action analytics:', data.userId, data.action);
          },
          description: 'User action analytics',
        },
      ] as const;

      const typedEventBus = createEventBus(registrations);

      typedEventBus.emit('user:action', { userId: '123', action: 'login' });
      typedEventBus.emit('user:action', { userId: '123', action: 'logout' });

      expect(typedEventBus.isEventRegistered('user:action')).toBe(true);
    });

    it('should handle generic event names with specific data types', () => {
      const registrations = [
        {
          event: 'api:request',
          listener: (data: {
            endpoint: string;
            method: 'GET' | 'POST' | 'PUT' | 'DELETE';
            payload?: any;
            headers?: Record<string, string>;
          }) => {
            console.log('API request:', data.method, data.endpoint);
          },
          description: 'API request handler',
        },
      ] as const;

      const typedEventBus = createEventBus(registrations);

      typedEventBus.emit('api:request', {
        endpoint: '/api/users',
        method: 'GET',
        headers: { Authorization: 'Bearer token' },
      });

      typedEventBus.emit('api:request', {
        endpoint: '/api/users',
        method: 'POST',
        payload: { name: 'John Doe', email: 'john@example.com' },
      });

      expect(typedEventBus.isEventRegistered('api:request')).toBe(true);
    });
  });
});
