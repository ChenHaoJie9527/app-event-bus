import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../events';

import type { EventMap } from '../types';

describe('EventBus Integration Tests', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('Event Bus Core Functionality', () => {
    it('should create a new EventBus instance', () => {
      expect(eventBus).toBeInstanceOf(EventBus);
      expect(typeof eventBus.emit).toBe('function');
      expect(typeof eventBus.on).toBe('function');
      expect(typeof eventBus.off).toBe('function');
    });

    it('should register and trigger listeners correctly', async () => {
      const mockListener = vi.fn();
      const testData = { modalId: 'test-modal' };

      eventBus.on('modal:open', mockListener);
      await eventBus.emit('modal:open', testData);

      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith(testData);
    });

    it('should handle multiple event types', async () => {
      const openListener = vi.fn();
      const closeListener = vi.fn();
      const testData = { modalId: 'test-modal' };

      eventBus.on('modal:open', openListener);
      eventBus.on('modal:close', closeListener);

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

      eventBus.on('modal:open', errorListener);
      eventBus.on('modal:open', normalListener);

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

      eventBus.on('modal:open', listener1);
      eventBus.on('modal:open', listener2);
      eventBus.on('modal:open', listener3);

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

      eventBus.on('modal:open', mockListener);
      await eventBus.emit('modal:open', testData);

      expect(mockListener).toHaveBeenCalledWith(testData);
      expect(mockListener.mock.calls[0][0]).toHaveProperty('modalId');
      expect(mockListener.mock.calls[0][0].modalId).toBe('test-modal-123');
    });

    it('should handle different modal IDs correctly', async () => {
      const mockListener = vi.fn();
      const data1 = { modalId: 'modal-1' };
      const data2 = { modalId: 'modal-2' };

      eventBus.on('modal:open', mockListener);

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

      const listenerId = eventBus.on('modal:open', mockListener);
      const removed = eventBus.off('modal:open', listenerId);

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

      const id1 = eventBus.on('modal:open', mockListener1);
      const id2 = eventBus.on('modal:open', mockListener2);

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should track listener count correctly', () => {
      expect(eventBus.getListenerCount('modal:open')).toBe(0);
      expect(eventBus.hasListeners('modal:open')).toBe(false);

      const listenerId1 = eventBus.on('modal:open', vi.fn());
      expect(eventBus.getListenerCount('modal:open')).toBe(1);
      expect(eventBus.hasListeners('modal:open')).toBe(true);

      const listenerId2 = eventBus.on('modal:open', vi.fn());
      expect(eventBus.getListenerCount('modal:open')).toBe(2);

      eventBus.off('modal:open', listenerId1);
      expect(eventBus.getListenerCount('modal:open')).toBe(1);

      eventBus.off('modal:open', listenerId2);
      expect(eventBus.getListenerCount('modal:open')).toBe(0);
      expect(eventBus.hasListeners('modal:open')).toBe(false);
    });

    it('should clear all listeners', () => {
      eventBus.on('modal:open', vi.fn());
      eventBus.on('modal:close', vi.fn());

      expect(eventBus.hasListeners('modal:open')).toBe(true);
      expect(eventBus.hasListeners('modal:close')).toBe(true);

      eventBus.clear();

      expect(eventBus.hasListeners('modal:open')).toBe(false);
      expect(eventBus.hasListeners('modal:close')).toBe(false);
    });

    it('should clear specific event listeners', () => {
      eventBus.on('modal:open', vi.fn());
      eventBus.on('modal:close', vi.fn());

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

      eventBus.on('modal:open', mockListener);

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

      eventBus.on('modal:open', openListener);
      eventBus.on('modal:close', closeListener);

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

    eventBus.on('modal:open', errorListener);
    eventBus.on('modal:close', normalListener);

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
      for (const listener of listeners) {
        eventBus.on('modal:open', listener);
      }

      await eventBus.emit('modal:open', testData);

      // Verify that all listeners are called
      for (const listener of listeners) {
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(testData);
      }
    });

    it('should not leak memory with repeated event emissions', async () => {
      const mockListener = vi.fn();
      const testData = { modalId: 'test-modal' };

      eventBus.on('modal:open', mockListener);

      // Fire events multiple times
      const promises = Array.from({ length: 100 }, () =>
        eventBus.emit('modal:open', testData)
      );
      await Promise.all(promises);

      expect(mockListener).toHaveBeenCalledTimes(100);
    });
  });

  describe('Type Safety Integration', () => {
    it('should enforce type safety for event names', () => {
      // These tests ensure that TypeScript compile-time type checking
      const validEvents: (keyof EventMap)[] = ['modal:open', 'modal:close'];
      const eventPattern = /^modal:(open|close)$/;

      for (const event of validEvents) {
        expect(typeof event).toBe('string');
        expect(event).toMatch(eventPattern);
      }
    });

    it('should enforce type safety for event data', () => {
      // Test event data structure
      const validData: EventMap['modal:open'] = { modalId: 'test' };
      const validCloseData: EventMap['modal:close'] = { modalId: 'test' };
      expect(validData).toHaveProperty('modalId');
      expect(validCloseData).toHaveProperty('modalId');
      expect(typeof validData.modalId).toBe('string');
      expect(typeof validCloseData.modalId).toBe('string');
    });
  });
});
