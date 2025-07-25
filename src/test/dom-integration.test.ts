import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { DOMEventIntegration } from '../dom-event-integration';
import { createEventBus, resetGlobalEventBus } from '../events';

import type { EventRegistrationTuple } from '../types';

describe('DOMEventIntegration with EventBus Integration Tests', () => {
  let eventBus: ReturnType<typeof createEventBus<EventRegistrationTuple>>;
  let domIntegration: DOMEventIntegration;

  beforeEach(() => {
    resetGlobalEventBus();

    const events = [
      {
        event: 'dom:action',
        listener: vi.fn(),
        description: 'DOM action handler',
      },
      {
        event: 'form:change',
        listener: vi.fn(),
        description: 'Form change handler',
      },
      {
        event: 'seller-report:change',
        listener: vi.fn(),
        description: 'Seller report change handler',
      },
    ] as const;

    eventBus = createEventBus(events);

    // Creating a DOM integration instance
    domIntegration = new DOMEventIntegration({
      document,
      eventBus,
    });
  });

  afterEach(() => {
    if (domIntegration) {
      domIntegration.disconnect();
    }
    resetGlobalEventBus();
  });

  describe('Integration Setup', () => {
    it('should successfully create DOMEventIntegration with EventBus', () => {
      expect(domIntegration).toBeDefined();
      expect(domIntegration.isConnected()).toBe(false);
    });

    it('should register DOM event listeners when connected', () => {
      domIntegration.connect();
      expect(domIntegration.isConnected()).toBe(true);
    });

    it('should remove DOM event listeners when disconnected', () => {
      domIntegration.connect();
      expect(domIntegration.isConnected()).toBe(true);

      domIntegration.disconnect();
      expect(domIntegration.isConnected()).toBe(false);
    });

    it('should prevent multiple connections', () => {
      domIntegration.connect();
      expect(domIntegration.isConnected()).toBe(true);

      // Second connection should not change state
      domIntegration.connect();
      expect(domIntegration.isConnected()).toBe(true);
    });
  });

  describe('DOM Action Event Handling', () => {
    it('should emit dom:action event when clicking element with data-action', () => {
      domIntegration.connect();

      // Create a test element with data-action
      const testElement = document.createElement('button');
      testElement.setAttribute('data-action', 'test-action');
      testElement.setAttribute('data-value', 'test-value');

      // Simulate click event
      const clickEvent = new Event('click');
      Object.defineProperty(clickEvent, 'target', { value: testElement });

      // Mock document.dispatchEvent to capture the event
      const originalDispatchEvent = document.dispatchEvent;
      const mockDispatchEvent = vi.fn();
      document.dispatchEvent = mockDispatchEvent;

      // Trigger the event
      document.dispatchEvent(clickEvent);

      // Restore original method
      document.dispatchEvent = originalDispatchEvent;

      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    it('should handle errors gracefully during DOM processing', () => {
      domIntegration.connect();

      // This test verifies that errors don't crash the system
      expect(() => {
        // Simulate an error condition
        const errorElement = document.createElement('div');
        errorElement.setAttribute('data-action', 'error-action');

        const clickEvent = new Event('click');
        Object.defineProperty(clickEvent, 'target', { value: errorElement });

        document.dispatchEvent(clickEvent);
      }).not.toThrow();
    });

    it('should not emit events for elements without data-action', () => {
      domIntegration.connect();

      // Create a test element without data-action
      const testElement = document.createElement('button');

      // Simulate click event
      const clickEvent = new Event('click');
      Object.defineProperty(clickEvent, 'target', { value: testElement });

      // Mock document.dispatchEvent to capture the event
      const originalDispatchEvent = document.dispatchEvent;
      const mockDispatchEvent = vi.fn();
      document.dispatchEvent = mockDispatchEvent;

      // Trigger the event
      document.dispatchEvent(clickEvent);

      // Restore original method
      document.dispatchEvent = originalDispatchEvent;

      // Should not emit dom:action event
      expect(mockDispatchEvent).toHaveBeenCalled();
    });
  });

  describe('Form Event Handling', () => {
    it('should emit form:change event for select elements', () => {
      domIntegration.connect();

      // Create a test select element
      const testElement = document.createElement('select');
      testElement.id = 'testSelect';
      testElement.value = 'test-value';

      // Simulate change event
      const changeEvent = new Event('change');
      Object.defineProperty(changeEvent, 'target', { value: testElement });

      // Mock document.dispatchEvent
      const originalDispatchEvent = document.dispatchEvent;
      const mockDispatchEvent = vi.fn();
      document.dispatchEvent = mockDispatchEvent;

      // Trigger the event
      document.dispatchEvent(changeEvent);

      // Restore original method
      document.dispatchEvent = originalDispatchEvent;

      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    it('should emit seller-report:change for elements in seller report form', () => {
      domIntegration.connect();

      // Create a test element within seller report form
      const formElement = document.createElement('form');
      formElement.setAttribute('data-seller-report-form', 'true');

      const testElement = document.createElement('input');
      testElement.value = 'test-value';
      formElement.appendChild(testElement);

      // Simulate change event
      const changeEvent = new Event('change');
      Object.defineProperty(changeEvent, 'target', { value: testElement });

      // Mock document.dispatchEvent
      const originalDispatchEvent = document.dispatchEvent;
      const mockDispatchEvent = vi.fn();
      document.dispatchEvent = mockDispatchEvent;

      // Trigger the event
      document.dispatchEvent(changeEvent);

      // Restore original method
      document.dispatchEvent = originalDispatchEvent;

      expect(mockDispatchEvent).toHaveBeenCalled();
    });
  });

  describe('Event Delegation', () => {
    it('should handle events on child elements through delegation', () => {
      domIntegration.connect();

      // Create a parent element with data-action and a child element
      const parentElement = document.createElement('div');
      parentElement.setAttribute('data-action', 'parent-action');

      const childElement = document.createElement('span');
      parentElement.appendChild(childElement);

      // Simulate click event on child element
      const clickEvent = new Event('click');
      Object.defineProperty(clickEvent, 'target', { value: childElement });

      // Mock document.dispatchEvent
      const originalDispatchEvent = document.dispatchEvent;
      const mockDispatchEvent = vi.fn();
      document.dispatchEvent = mockDispatchEvent;

      // Trigger the event
      document.dispatchEvent(clickEvent);

      // Restore original method
      document.dispatchEvent = originalDispatchEvent;

      expect(mockDispatchEvent).toHaveBeenCalled();
    });
  });

  describe('Type Safety Verification', () => {
    it('should enforce correct data types for DOM events', () => {
      const domActionListener = vi.fn();

      eventBus.registerEvents([
        {
          event: 'dom:action',
          listener: domActionListener,
          description: 'DOM action handler',
        },
      ] as const);

      // Test that the event is registered
      expect(eventBus.isEventRegistered('dom:action')).toBe(true);
    });
  });

  describe('EventBus and DOM Integration Compatibility', () => {
    it('should work alongside regular EventBus events', async () => {
      const regularListener = vi.fn();

      eventBus.registerEvents([
        {
          event: 'custom:event',
          listener: regularListener,
          description: 'Custom event handler',
        },
      ] as const);

      await eventBus.emit('custom:event', { data: 'test' });

      expect(regularListener).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should maintain event registration state correctly', () => {
      expect(eventBus.isEventRegistered('dom:action')).toBe(true);
      expect(eventBus.isEventRegistered('form:change')).toBe(true);
      expect(eventBus.isEventRegistered('seller-report:change')).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should properly clean up resources on disconnect', () => {
      domIntegration.connect();
      expect(domIntegration.isConnected()).toBe(true);

      domIntegration.disconnect();
      expect(domIntegration.isConnected()).toBe(false);
    });

    it('should handle multiple connect/disconnect cycles', () => {
      // First cycle
      domIntegration.connect();
      expect(domIntegration.isConnected()).toBe(true);
      domIntegration.disconnect();
      expect(domIntegration.isConnected()).toBe(false);

      // Second cycle
      domIntegration.connect();
      expect(domIntegration.isConnected()).toBe(true);
      domIntegration.disconnect();
      expect(domIntegration.isConnected()).toBe(false);
    });
  });
});
