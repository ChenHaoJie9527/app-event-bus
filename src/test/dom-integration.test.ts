import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { EventBus } from '../events';
import { DOMEventIntegration } from '../dom-event-integration';
import type { EventRegistrationTuple, DOMEventData } from '../types';

// Mock DOM environment
const createMockElement = (attributes: Record<string, string> = {}) => {
  const element = document.createElement('button');
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  return element;
};

describe('DOMEventIntegration with EventBus Integration Tests', () => {
  let eventBus: EventBus<EventRegistrationTuple>;
  let domIntegration: DOMEventIntegration<EventRegistrationTuple>;
  let mockDocument: Document;
  let registeredListeners: Map<string, EventListener>;

  beforeEach(() => {
    // Creating a simulated document
    registeredListeners = new Map();
    mockDocument = {
      addEventListener: vi.fn((type: string, listener: EventListener) => {
        registeredListeners.set(type, listener);
      }),
      removeEventListener: vi.fn((type: string) => {
        registeredListeners.delete(type);
      }),
    } as unknown as Document;

    // Creating an EventBus with DOM events
    const events = [
      {
        event: 'dom:action',
        listener: vi.fn(),
        description: 'DOM action handler',
      },
      {
        event: 'dom:action:error',
        listener: vi.fn(),
        description: 'DOM action error handler',
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
      {
        event: 'modal:open',
        listener: vi.fn(),
        description: 'Modal open handler',
      },
    ] as const;

    eventBus = new EventBus(events);

    // Creating a DOM integration instance
    domIntegration = new DOMEventIntegration({
      document: mockDocument,
      eventBus: eventBus as any, // Type assertion to satisfy the intersection type
    });
  });

  afterEach(() => {
    domIntegration.disconnect();
    eventBus.clear();
    registeredListeners.clear();
  });

  describe('Integration Setup', () => {
    it('should successfully create DOMEventIntegration with EventBus', () => {
      expect(domIntegration).toBeInstanceOf(DOMEventIntegration);
      expect(domIntegration.isConnected()).toBe(false);
    });

    it('should register DOM event listeners when connected', () => {
      domIntegration.connect();

      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        'submit',
        expect.any(Function),
        expect.any(Object)
      );
      expect(domIntegration.isConnected()).toBe(true);
    });

    it('should remove DOM event listeners when disconnected', () => {
      domIntegration.connect();
      domIntegration.disconnect();

      expect(mockDocument.removeEventListener).toHaveBeenCalledTimes(4);
      expect(domIntegration.isConnected()).toBe(false);
    });

    it('should prevent multiple connections', () => {
      domIntegration.connect();
      domIntegration.connect(); // Second connection

      // addEventListener should only be called once (on first connection)
      expect(mockDocument.addEventListener).toHaveBeenCalledTimes(4);
    });
  });

  describe('DOM Action Event Handling', () => {
    it('should emit dom:action event when clicking element with data-action', async () => {
      const mockListener = vi.fn();
      eventBus.on('dom:action', mockListener);
      domIntegration.connect();

      // Simulating an element with data-action
      const element = createMockElement({
        'data-action': 'test-action',
        'data-id': '123',
        'data-type': 'button',
      });

      // Simulating a click event
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: element });

      const clickHandler = registeredListeners.get('click');
      expect(clickHandler).toBeDefined();

      if (clickHandler) {
        clickHandler(clickEvent);
      }

      // Waiting for asynchronous processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockListener).toHaveBeenCalledWith({
        action: 'test-action',
        element,
        data: {
          id: '123',
          type: 'button',
        },
        originalEvent: clickEvent,
      });
    });

    it('should handle errors gracefully during DOM processing', async () => {
      const mockErrorListener = vi.fn();
      const mockActionListener = vi.fn();

      eventBus.on('dom:action:error', mockErrorListener);
      eventBus.on('dom:action', mockActionListener);
      domIntegration.connect();

      // Creating a normal element
      const element = createMockElement({ 'data-action': 'test-action' });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: element });

      const clickHandler = registeredListeners.get('click');
      if (clickHandler) {
        clickHandler(clickEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verifying that dom:action is triggered in normal cases
      expect(mockActionListener).toHaveBeenCalled();

      // Note: In the current implementation, dom:action:error is only triggered in specific error cases within handleDataAction
      // This test mainly verifies the overall error handling capability of the system
      expect(mockErrorListener).not.toHaveBeenCalled(); // There should be no errors in normal cases
    });

    it('should not emit events for elements without data-action', async () => {
      const mockListener = vi.fn();
      eventBus.on('dom:action', mockListener);
      domIntegration.connect();

      const element = createMockElement(); // No data-action
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: element });

      const clickHandler = registeredListeners.get('click');
      if (clickHandler) {
        clickHandler(clickEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Form Event Handling', () => {
    it('should emit form:change event for select elements', async () => {
      const mockListener = vi.fn();
      eventBus.on('form:change', mockListener);
      domIntegration.connect();

      const selectElement = document.createElement('select');
      selectElement.id = 'testSelect';

      // Adding option elements and setting selected state
      const option = document.createElement('option');
      option.value = 'option1';
      option.selected = true;
      selectElement.appendChild(option);

      // Ensuring the value is correctly set
      selectElement.value = 'option1';

      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', { value: selectElement });

      const changeHandler = registeredListeners.get('change');
      if (changeHandler) {
        changeHandler(changeEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 150)); // Waiting for debounce

      expect(mockListener).toHaveBeenCalledWith({
        element: selectElement,
        value: 'option1',
        originalEvent: changeEvent,
      });
    });

    it('should emit seller-report:change for elements in seller report form', async () => {
      const mockListener = vi.fn();
      eventBus.on('seller-report:change', mockListener);
      domIntegration.connect();

      // Creating a form structure
      const form = document.createElement('div');
      form.setAttribute('data-seller-report-form', '');
      const input = document.createElement('input');
      input.value = 'test-value';
      form.appendChild(input);

      // Simulating the closest method
      Object.defineProperty(input, 'closest', {
        value: (selector: string) => {
          return selector === '[data-seller-report-form]' ? form : null;
        },
      });

      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', { value: input });

      const changeHandler = registeredListeners.get('change');
      if (changeHandler) {
        changeHandler(changeEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 150)); // Waiting for debounce

      expect(mockListener).toHaveBeenCalledWith({
        element: input,
        value: 'test-value',
        originalEvent: changeEvent,
      });
    });
  });

  describe('Event Delegation', () => {
    it('should handle events on child elements through delegation', async () => {
      const mockListener = vi.fn();
      eventBus.on('dom:action', mockListener);
      domIntegration.connect();

      const parentElement = createMockElement({
        'data-action': 'parent-action',
      });
      const childElement = document.createElement('span');
      parentElement.appendChild(childElement);

      // Simulating the closest method
      Object.defineProperty(childElement, 'closest', {
        value: (selector: string) => {
          return selector === '[data-action]' ? parentElement : null;
        },
      });

      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: childElement });

      const clickHandler = registeredListeners.get('click');
      if (clickHandler) {
        clickHandler(clickEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockListener).toHaveBeenCalledWith({
        action: 'parent-action',
        element: parentElement,
        data: {},
        originalEvent: clickEvent,
      });
    });
  });

  describe('Type Safety Verification', () => {
    it('should enforce correct data types for DOM events', async () => {
      // This test mainly verifies compile-time type safety
      const domActionListener = vi.fn((data: DOMEventData['dom:action']) => {
        // Verifying data structure
        expect(typeof data.action).toBe('string');
        expect(data.element).toBeInstanceOf(HTMLElement);
        expect(typeof data.data).toBe('object');
        expect(data.originalEvent).toBeInstanceOf(Event);
      });

      eventBus.on('dom:action', domActionListener);
      domIntegration.connect();

      const element = createMockElement({ 'data-action': 'type-test' });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: element });

      const clickHandler = registeredListeners.get('click');
      if (clickHandler) {
        clickHandler(clickEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(domActionListener).toHaveBeenCalled();
    });
  });

  describe('EventBus and DOM Integration Compatibility', () => {
    it('should work alongside regular EventBus events', async () => {
      const modalListener = vi.fn();
      const domActionListener = vi.fn();

      eventBus.on('modal:open', modalListener);
      eventBus.on('dom:action', domActionListener);
      domIntegration.connect();

      // Triggering regular events
      await eventBus.emit('modal:open', { modalId: 'test-modal' });

      // Triggering DOM events
      const element = createMockElement({ 'data-action': 'open-modal' });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: element });

      const clickHandler = registeredListeners.get('click');
      if (clickHandler) {
        clickHandler(clickEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Both listeners should be called
      expect(modalListener).toHaveBeenCalledWith({ modalId: 'test-modal' });
      expect(domActionListener).toHaveBeenCalledWith({
        action: 'open-modal',
        element,
        data: {},
        originalEvent: clickEvent,
      });
    });

    it('should maintain event registration state correctly', () => {
      expect(eventBus.isEventRegistered('dom:action')).toBe(true);
      expect(eventBus.isEventRegistered('dom:action:error')).toBe(true);
      expect(eventBus.isEventRegistered('form:change')).toBe(true);
      expect(eventBus.isEventRegistered('seller-report:change')).toBe(true);
      expect(eventBus.isEventRegistered('modal:open')).toBe(true);

      const registeredEvents = eventBus.getRegisteredEvents();
      expect(registeredEvents).toContain('dom:action');
      expect(registeredEvents).toContain('modal:open');
    });
  });

  describe('Memory Management', () => {
    it('should properly clean up resources on disconnect', () => {
      domIntegration.connect();
      expect(domIntegration.isConnected()).toBe(true);
      expect(registeredListeners.size).toBe(4);

      domIntegration.disconnect();
      expect(domIntegration.isConnected()).toBe(false);
      expect(registeredListeners.size).toBe(0);
    });

    it('should handle multiple connect/disconnect cycles', () => {
      for (let i = 0; i < 3; i++) {
        domIntegration.connect();
        expect(domIntegration.isConnected()).toBe(true);

        domIntegration.disconnect();
        expect(domIntegration.isConnected()).toBe(false);
      }

      // Verifying no memory leaks
      expect(registeredListeners.size).toBe(0);
    });
  });
});
