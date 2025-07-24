type DomDependencies = {
  document: Document;
  eventBus: {
    emit(event: string, data: any): Promise<void>;
    on(event: string, listener: (data: any) => void | Promise<void>): string;
    off(eventName: string, listenerId: string): boolean;
  };
};

export class DOMEventIntegration {
  private dependencies: DomDependencies;
  private connected = false;
  private boundHandlers = new Map<string, EventListener>();

  constructor(dependencies: DomDependencies) {
    this.dependencies = dependencies;
  }

  connect() {
    if (this.connected) {
      return;
    }

    this.setupDOMEventListeners();
    this.connected = true;
  }

  disconnect() {
    if (!this.connected) {
      return;
    }

    this.boundHandlers.forEach((handler, eventType) => {
      this.dependencies.document.removeEventListener(eventType, handler);
    });
    this.boundHandlers.clear();
    this.connected = false;
  }

  private setupDOMEventListeners() {
    const clickHandler = this.createDelegatedHandler(
      'click',
      (target: HTMLElement, event: Event) => {
        if (target.dataset.action) {
          this.handleDataAction(target, event);
        }
      }
    );

    const changeHandler = this.createDelegatedHandler(
      'change',
      (target: HTMLElement, event: Event) => {
        if (target.dataset.action) {
          this.handleDataAction(target, event);
        } else if (target.matches('select[id$="Select"]')) {
          this.handleFormChange(target, event);
        } else if (target.closest('[data-seller-report-form]')) {
          this.handleSellerReportFormChange(target, event);
        }
      }
    );

    const keydownHandler = this.createDelegatedHandler(
      'keydown',
      (target: HTMLElement, event: Event) => {
        if (target.dataset.action) {
          this.handleDataAction(target, event);
        }
      }
    );

    const submitHandler = this.createDelegatedHandler(
      'submit',
      (target: HTMLElement, event: Event) => {
        if (target.dataset.action) {
          this.handleDataAction(target, event);
        }
      }
    );

    // Use passive listeners where possible for better performance
    this.dependencies.document.addEventListener('click', clickHandler, {
      passive: false,
    });
    this.dependencies.document.addEventListener('change', changeHandler, {
      passive: true,
    });
    this.dependencies.document.addEventListener('keydown', keydownHandler, {
      passive: true,
    });
    this.dependencies.document.addEventListener('submit', submitHandler, {
      passive: false,
    });

    // Store handlers for cleanup
    this.boundHandlers.set('click', clickHandler);
    this.boundHandlers.set('change', changeHandler);
    this.boundHandlers.set('keydown', keydownHandler);
    this.boundHandlers.set('submit', submitHandler);
  }

  private handleDataAction(target: HTMLElement, event: Event) {
    try {
      const action = target.dataset.action;
      if (!action) {
        return;
      }

      const actionData = this.parseDataAttributes(target);

      this.dependencies.eventBus.emit('dom:action', {
        action,
        element: target,
        data: actionData,
        originalEvent: event,
      });
    } catch (error) {
      console.error('Error handling DOM action:', error);
      this.dependencies.eventBus.emit('dom:action:error', {
        error: error as Error,
        target,
        originalEvent: event,
      });
    }
  }

  private parseDataAttributes(target: HTMLElement) {
    const data: Record<string, unknown> = {};
    for (const attr of target.attributes) {
      if (attr.name.startsWith('data-') && attr.name !== 'data-action') {
        const key = attr.name
          .slice(5)
          .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        data[key] = attr.value;
      }
    }
    return data;
  }

  private createDelegatedHandler(
    _eventType: string,
    handler: (target: HTMLElement, event: Event) => void
  ): EventListener {
    return (event: Event) => {
      const target = event.target as HTMLElement;
      if (target) {
        const actionElement = target.closest('[data-action]') as HTMLElement;
        if (actionElement) {
          handler(actionElement, event);
        } else {
          handler(target, event);
        }
      }
    };
  }

  private handleFormChange(target: HTMLElement, event: Event) {
    this.dependencies.eventBus.emit('form:change', {
      element: target,
      value: (target as HTMLSelectElement).value,
      originalEvent: event,
    });
  }

  private handleSellerReportFormChange(target: HTMLElement, event: Event) {
    this.dependencies.eventBus.emit('seller-report:change', {
      element: target,
      value: (target as HTMLInputElement).value,
      originalEvent: event,
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}
