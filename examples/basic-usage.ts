import { EventBus } from '../src/events';

const appEvents = [
  {
    event: 'user:login',
    listener: (data: { userId: string; username: string }) => {
      console.log(`user login: ${data.username} (id: ${data.userId})`);
    },
    description: 'user login event',
  },
  {
    event: 'user:logout',
    listener: (data: { userId: string }) => {
      console.log(`user logout: ${data.userId}`);
    },
    description: 'user logout event',
  },
  {
    event: 'notification:show',
    listener: (data: {
      message: string;
      type: 'success' | 'error' | 'warning';
    }) => {
      console.log(`notification: [${data.type.toUpperCase()}] ${data.message}`);
    },
    description: 'show notification event',
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
      console.log(`dom action: ${data.action}`, data.data);
    },
    description: 'dom action event',
  },
  {
    event: 'dom:action:error',
    listener: (data: {
      error: Error;
      target: HTMLElement;
      originalEvent: Event;
    }) => {
      console.error('dom action error:', data.error.message);
    },
    description: 'dom action error event',
  },
] as const;

const eventBus = new EventBus(appEvents);

async function basicUsageExample() {
  console.log('=== basic usage example ===');

  await eventBus.emit('user:login', {
    userId: '123',
    username: 'John Doe',
  });

  await eventBus.emit('notification:show', {
    message: 'login success',
    type: 'success',
  });

  const notificationListener = eventBus.on('notification:show', (data) => {
    if (typeof document !== 'undefined') {
      const toast = document.createElement('div');
      toast.className = `toast toast-${data.type}`;
      toast.textContent = data.message;
      document.body.appendChild(toast);

      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    }
  });

  await eventBus.emit('notification:show', {
    message: 'this is a notification',
    type: 'warning',
  });

  eventBus.off('notification:show', notificationListener);

  await eventBus.emit('user:logout', { userId: '123' });
}

function setupDOMExample() {
  if (typeof document === 'undefined') {
    console.log('dom example needs to run in browser environment');
    return;
  }

  console.log('=== dom interaction example ===');

  const container = document.createElement('div');
  container.innerHTML = `
    <h3>EventBus dom integration example</h3>
    <button data-action="login" data-user-id="123" data-username="John Doe">
      login
    </button>
    <button data-action="logout" data-user-id="123">
      logout
    </button>
    <button data-action="show-notification" data-message="Hello World!" data-type="success">
      show notification
    </button>
    <select id="themeSelect">
      <option value="light">light theme</option>
      <option value="dark">dark theme</option>
    </select>
  `;

  document.body.appendChild(container);

  eventBus.on('dom:action', async (data) => {
    switch (data.action) {
      case 'login':
        await eventBus.emit('user:login', {
          userId: data.data.userId as string,
          username: data.data.username as string,
        });
        break;

      case 'logout':
        await eventBus.emit('user:logout', {
          userId: data.data.userId as string,
        });
        break;

      case 'show-notification':
        await eventBus.emit('notification:show', {
          message: data.data.message as string,
          type: data.data.type as 'success' | 'error' | 'warning',
        });
        break;

      default:
        console.log(`unhandled dom action: ${data.action}`);
        break;
    }
  });
}

function cleanup() {
  console.log('=== cleanup resources ===');

  if (typeof window !== 'undefined') {
    eventBus.disableDOMIntegration();
    console.log('dom integration disconnected');
  }

  eventBus.clear();
  console.log('EventBus cleaned');
}

export { eventBus, basicUsageExample, setupDOMExample, cleanup };

if (typeof window !== 'undefined') {
  basicUsageExample();
  setupDOMExample();

  window.addEventListener('beforeunload', cleanup);
} else {
  basicUsageExample().then(() => {
    console.log('basic example completed');
    cleanup();
  });
}
