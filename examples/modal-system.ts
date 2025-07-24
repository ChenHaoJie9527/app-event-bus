import { EventBus } from '../src/events';
import { DOMEventIntegration } from '../src/dom-event-integration';

// modal window related events definition
const modalEvents = [
  {
    event: 'modal:open',
    listener: (data: { modalId: string; title?: string; content?: string }) => {
      console.log(`open modal window: ${data.modalId}`);
    },
    description: 'open modal window',
  },
  {
    event: 'modal:close',
    listener: (data: { modalId: string; reason?: string }) => {
      console.log(
        `close modal window: ${data.modalId}, reason: ${data.reason || 'user operation'}`
      );
    },
    description: 'close modal window',
  },
  {
    event: 'modal:confirm',
    listener: (data: { modalId: string; result: any }) => {
      console.log(`modal window confirm: ${data.modalId}`, data.result);
    },
    description: 'modal window confirm',
  },
  {
    event: 'form:submit',
    listener: (data: { formId: string; formData: Record<string, any> }) => {
      console.log(`form submit: ${data.formId}`, data.formData);
    },
    description: 'form submit event',
  },
  // DOM events
  {
    event: 'dom:action',
    listener: (data: {
      action: string;
      element: HTMLElement;
      data: Record<string, unknown>;
      originalEvent: Event;
    }) => {
      // default handling of DOM actions
      console.log('DOM action received:', data.action);
    },
    description: 'DOM action event',
  },
] as const;

// create EventBus instance
const modalEventBus = new EventBus(modalEvents);

// modal window manager class
class ModalManager {
  private modals = new Map<string, HTMLElement>();
  private eventBus: typeof modalEventBus;
  private domIntegration: DOMEventIntegration<typeof modalEvents> | null = null;

  constructor(eventBus: typeof modalEventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
    this.initDOMIntegration();
  }

  private setupEventListeners() {
    // listen to modal window events
    this.eventBus.on('modal:open', this.handleModalOpen.bind(this));
    this.eventBus.on('modal:close', this.handleModalClose.bind(this));
    this.eventBus.on('modal:confirm', this.handleModalConfirm.bind(this));
    this.eventBus.on('form:submit', this.handleFormSubmit.bind(this));

    // listen to DOM actions
    this.eventBus.on('dom:action', this.handleDOMAction.bind(this));
  }

  private initDOMIntegration() {
    if (typeof window !== 'undefined') {
      this.domIntegration = new DOMEventIntegration({
        document: window.document,
        eventBus: this.eventBus as any,
      });
      this.domIntegration.connect();
    }
  }

  private async handleDOMAction(data: {
    action: string;
    element: HTMLElement;
    data: Record<string, unknown>;
    originalEvent: Event;
  }) {
    const { action, data: actionData, element, originalEvent } = data;

    switch (action) {
      case 'open-modal':
        await this.eventBus.emit('modal:open', {
          modalId: actionData.modalId as string,
          title: actionData.title as string,
          content: actionData.content as string,
        });
        break;

      case 'close-modal':
        await this.eventBus.emit('modal:close', {
          modalId: actionData.modalId as string,
          reason: actionData.reason as string,
        });
        break;

      case 'submit-form': {
        // prevent default form submission
        originalEvent.preventDefault();

        const form = element.closest('form');
        if (form) {
          const formData = this.extractFormData(form);
          await this.eventBus.emit('form:submit', {
            formId: (actionData.formId as string) || form.id,
            formData,
          });
        }
        break;
      }

      case 'confirm-modal': {
        const modal = element.closest('.modal');
        if (modal) {
          const modalId = modal.getAttribute('data-modal-id') || '';
          const form = modal.querySelector('form');
          let result = {};

          if (form) {
            result = this.extractFormData(form);
          }

          await this.eventBus.emit('modal:confirm', {
            modalId,
            result,
          });
        }
        break;
      }

      default:
        console.log(`unhandled modal window action: ${action}`);
        break;
    }
  }

  private handleModalOpen(data: {
    modalId: string;
    title?: string;
    content?: string;
  }) {
    if (typeof document === 'undefined') {
      return;
    }

    // create modal window HTML
    const modal = this.createModalHTML(data.modalId, data.title, data.content);
    document.body.appendChild(modal);
    this.modals.set(data.modalId, modal);

    // add style class to show modal window
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  private handleModalClose(data: { modalId: string; reason?: string }) {
    const modal = this.modals.get(data.modalId);
    if (modal) {
      modal.classList.remove('show');

      // wait for animation to complete and remove
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
        this.modals.delete(data.modalId);
      }, 300);
    }
  }

  private handleModalConfirm(data: { modalId: string; result: any }) {
    console.log('modal window confirm result:', data);

    // close modal window
    this.eventBus.emit('modal:close', {
      modalId: data.modalId,
      reason: 'confirmed',
    });
  }

  private handleFormSubmit(data: {
    formId: string;
    formData: Record<string, any>;
  }) {
    console.log('handle form submit:', data);

    // simulate API call
    setTimeout(() => {
      console.log('form submit success');

      // if the form is in the modal window, close the modal window
      if (data.formId.startsWith('modal-')) {
        const modalId = data.formId.replace('modal-', '');
        this.eventBus.emit('modal:close', {
          modalId,
          reason: 'form-submitted',
        });
      }
    }, 1000);
  }

  private createModalHTML(
    modalId: string,
    title?: string,
    content?: string
  ): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('data-modal-id', modalId);

    modal.innerHTML = `
      <div class="modal-backdrop" data-action="close-modal" data-modal-id="${modalId}" data-reason="backdrop-click"></div>
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title || 'modal window'}</h5>
            <button type="button" class="modal-close" data-action="close-modal" data-modal-id="${modalId}" data-reason="close-button">
              ×
            </button>
          </div>
          <div class="modal-body">
            ${content || this.getDefaultModalContent(modalId)}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-action="close-modal" data-modal-id="${modalId}" data-reason="cancel">
              cancel
            </button>
            <button type="button" class="btn btn-primary" data-action="confirm-modal" data-modal-id="${modalId}">
              confirm
            </button>
          </div>
        </div>
      </div>
    `;

    return modal;
  }

  private getDefaultModalContent(modalId: string): string {
    switch (modalId) {
      case 'user-form':
        return `
          <form id="modal-user-form">
            <div class="form-group">
              <label for="username">username:</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
              <label for="email">email:</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="role">role:</label>
              <select id="role" name="role">
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </form>
        `;

      case 'confirm-delete':
        return '<p>are you sure you want to delete this project? this operation cannot be undone.</p>';

      default:
        return '<p>this is a default modal window content.</p>';
    }
  }

  private extractFormData(form: HTMLFormElement): Record<string, any> {
    const formData = new FormData(form);
    const data: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  // cleanup resources
  destroy() {
    if (this.domIntegration) {
      this.domIntegration.disconnect();
    }

    // cleanup all modal windows
    for (const [modalId] of this.modals) {
      this.eventBus.emit('modal:close', { modalId, reason: 'destroy' });
    }

    this.eventBus.clear();
  }
}

// example usage
function createModalSystemExample() {
  if (typeof document === 'undefined') {
    console.log('modal window example needs to run in browser environment');
    return null;
  }

  // add basic styles
  const style = document.createElement('style');
  style.textContent = `
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    .modal.show {
      opacity: 1;
      visibility: visible;
    }
    
    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }
    
    .modal-dialog {
      position: relative;
      margin: 50px auto;
      max-width: 500px;
      transform: translateY(-50px);
      transition: transform 0.3s ease;
    }
    
    .modal.show .modal-dialog {
      transform: translateY(0);
    }
    
    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-title {
      margin: 0;
      font-size: 18px;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }
    
    .modal-body {
      padding: 20px;
    }
    
    .modal-footer {
      padding: 20px;
      border-top: 1px solid #eee;
      text-align: right;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 8px;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: bold;
    }
    
    .form-group input,
    .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);

  // create modal window manager
  const modalManager = new ModalManager(modalEventBus);

  // create example buttons
  const container = document.createElement('div');
  container.innerHTML = `
    <h2>modal window system example</h2>
    <p>click the button below to test the modal window functionality:</p>
    
    <button data-action="open-modal" data-modal-id="user-form" data-title="user form" class="btn btn-primary">
      open user form
    </button>
    
    <button data-action="open-modal" data-modal-id="confirm-delete" data-title="confirm delete" class="btn btn-secondary">
      confirm delete dialog
    </button>
    
    <button data-action="open-modal" data-modal-id="simple-modal" data-title="simple modal window" data-content="<p>this is a simple modal window content.</p>" class="btn btn-primary">
      simple modal window
    </button>
  `;

  document.body.appendChild(container);

  return modalManager;
}

// export
export { modalEvents, modalEventBus, ModalManager, createModalSystemExample };
