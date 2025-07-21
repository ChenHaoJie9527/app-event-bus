// EventBus Demo Implementation
class DemoEventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return Math.random().toString(36).substr(2, 9);
  }

  async emit(event, data) {
    const eventListeners = this.listeners.get(event) || [];
    const promises = eventListeners.map((callback) => {
      try {
        const result = callback(data);
        return result instanceof Promise ? result : Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    });
    await Promise.all(promises);
  }

  off(eventName, listenerId) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const filteredListeners = eventListeners.filter(
        (listener, index) => index.toString() !== listenerId
      );
      if (filteredListeners.length === 0) {
        this.listeners.delete(eventName);
      } else {
        this.listeners.set(eventName, filteredListeners);
      }
      return filteredListeners.length < eventListeners.length;
    }
    return false;
  }

  clear() {
    this.listeners.clear();
  }
}

// Global demo instance
window.demoEventBus = new DemoEventBus();

// Utility functions
function logToOutput(outputId, message, type = 'info') {
  const output = document.getElementById(outputId);
  if (!output) return;

  const timestamp = new Date().toLocaleTimeString();
  const className =
    type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';

  output.innerHTML += `<span class="${className}">[${timestamp}] ${message}</span>\n`;
  output.scrollTop = output.scrollHeight;
}

function clearOutput(outputId) {
  const output = document.getElementById(outputId);
  if (output) {
    output.innerHTML = '';
  }
}

// Demo functions
window.runBasicDemo = async () => {
  const outputId = 'basic-output';
  clearOutput(outputId);
  logToOutput(outputId, '🚀 Starting basic event handling demo...');

  try {
    // Clear any existing listeners
    demoEventBus.clear();

    // Register listeners
    const loginListenerId = demoEventBus.on('user:login', (data) => {
      logToOutput(
        outputId,
        `✅ User logged in: ${data.userId} at ${new Date(data.timestamp).toLocaleString()}`
      );
    });

    const logoutListenerId = demoEventBus.on('user:logout', (data) => {
      logToOutput(
        outputId,
        `✅ User logged out: ${data.userId}${data.reason ? ` (${data.reason})` : ''}`
      );
    });

    logToOutput(
      outputId,
      `📝 Registered listeners for 'user:login' and 'user:logout' events`
    );

    // Emit login event
    logToOutput(outputId, '📤 Emitting user:login event...');
    await demoEventBus.emit('user:login', {
      userId: 'user123',
      timestamp: Date.now(),
    });

    // Emit logout event
    logToOutput(outputId, '📤 Emitting user:logout event...');
    await demoEventBus.emit('user:logout', {
      userId: 'user123',
      reason: 'User requested logout',
    });

    logToOutput(outputId, '🎉 Basic demo completed successfully!', 'success');
  } catch (error) {
    logToOutput(outputId, `❌ Error: ${error.message}`, 'error');
  }
};

window.runMultipleDemo = async () => {
  const outputId = 'multiple-output';
  clearOutput(outputId);
  logToOutput(outputId, '🚀 Starting multiple listeners demo...');

  try {
    // Clear any existing listeners
    demoEventBus.clear();

    // Register multiple listeners for the same event
    const id1 = demoEventBus.on('data:fetch', (data) => {
      logToOutput(
        outputId,
        `📡 Handler 1: Fetching data from ${data.endpoint}`
      );
    });

    const id2 = demoEventBus.on('data:fetch', async (data) => {
      logToOutput(
        outputId,
        `⏳ Handler 2 (async): Starting fetch from ${data.endpoint}...`
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      logToOutput(
        outputId,
        `✅ Handler 2 (async): Completed fetch from ${data.endpoint}`
      );
    });

    const id3 = demoEventBus.on('data:fetch', (data) => {
      logToOutput(
        outputId,
        `📊 Handler 3: Processing data from ${data.endpoint}`
      );
    });

    logToOutput(outputId, `📝 Registered 3 listeners for 'data:fetch' event`);

    // Emit event - all listeners execute concurrently
    logToOutput(
      outputId,
      '📤 Emitting data:fetch event (all handlers execute concurrently)...'
    );
    const startTime = Date.now();

    await demoEventBus.emit('data:fetch', {
      endpoint: '/api/users',
    });

    const endTime = Date.now();
    logToOutput(
      outputId,
      `⏱️ Total execution time: ${endTime - startTime}ms (concurrent execution)`
    );
    logToOutput(outputId, '🎉 Multiple listeners demo completed!', 'success');
  } catch (error) {
    logToOutput(outputId, `❌ Error: ${error.message}`, 'error');
  }
};

window.runErrorDemo = async () => {
  const outputId = 'error-output';
  clearOutput(outputId);
  logToOutput(outputId, '🚀 Starting error handling demo...');

  try {
    // Clear any existing listeners
    demoEventBus.clear();

    // Register a listener that throws an error
    demoEventBus.on('user:login', () => {
      logToOutput(outputId, '💥 Handler 1: About to throw an error...');
      throw new Error('Login failed - invalid credentials');
    });

    // Register a listener that executes normally
    demoEventBus.on('user:login', (data) => {
      logToOutput(
        outputId,
        `✅ Handler 2: This still executes despite the error: ${data.userId}`
      );
    });

    // Register another listener that also executes
    demoEventBus.on('user:login', (data) => {
      logToOutput(
        outputId,
        `✅ Handler 3: Also executing normally: ${data.userId}`
      );
    });

    logToOutput(
      outputId,
      `📝 Registered 3 listeners for 'user:login' event (1 will throw error)`
    );

    // Emit event - all listeners are called, even if one throws
    logToOutput(
      outputId,
      '📤 Emitting user:login event (error isolation test)...'
    );

    await demoEventBus.emit('user:login', {
      userId: 'user123',
      timestamp: Date.now(),
    });

    logToOutput(
      outputId,
      '🎉 Error handling demo completed! All listeners were called.',
      'success'
    );
  } catch (error) {
    logToOutput(
      outputId,
      `❌ Error caught in main execution: ${error.message}`,
      'error'
    );
  }
};

// UI Interaction functions
window.switchTab = (showId, hideId) => {
  // Hide all tab contents
  const allTabs = document.querySelectorAll('.tab-content');
  allTabs.forEach((tab) => tab.classList.remove('active'));

  // Remove active class from all tab buttons
  const allButtons = document.querySelectorAll('.tab-btn');
  allButtons.forEach((btn) => btn.classList.remove('active'));

  // Show selected tab content
  const showTab = document.getElementById(showId);
  if (showTab) {
    showTab.classList.add('active');
  }

  // Add active class to clicked button
  const clickedButton = event.target;
  clickedButton.classList.add('active');
};

window.scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

window.copyCode = (codeId) => {
  const codeElement = document.getElementById(codeId);
  if (!codeElement) return;

  const text = codeElement.textContent;

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast('Code copied to clipboard!');
      })
      .catch(() => {
        fallbackCopyTextToClipboard(text);
      });
  } else {
    fallbackCopyTextToClipboard(text);
  }
};

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    showToast('Code copied to clipboard!');
  } catch (err) {
    showToast('Failed to copy code');
  }

  document.body.removeChild(textArea);
}

function showToast(message) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--primary-color);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Mobile navigation
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking on a link
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document
    .querySelectorAll('.feature-card, .example-card, .api-card, .step')
    .forEach((el) => {
      observer.observe(el);
    });
});

// Performance monitoring
window.addEventListener('load', () => {
  // Log page load performance
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');

  const metrics = {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded:
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart,
    firstPaint: paint.find((entry) => entry.name === 'first-paint')?.startTime,
    firstContentfulPaint: paint.find(
      (entry) => entry.name === 'first-contentful-paint'
    )?.startTime,
  };

  console.log('Page Performance Metrics:', metrics);
});

// Error monitoring
window.addEventListener('error', (event) => {
  console.error('JavaScript Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
});

// Add CSS for demo output styling
const style = document.createElement('style');
style.textContent = `
  .demo-output .info { color: var(--text-color); }
  .demo-output .success { color: var(--success-color); }
  .demo-output .error { color: var(--error-color); }
  .demo-output .warning { color: var(--warning-color); }
  
  .nav-menu.active {
    display: flex;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--background-color);
    border-top: 1px solid var(--border-color);
    flex-direction: column;
    padding: 1rem;
    box-shadow: var(--shadow-lg);
  }
  
  .nav-toggle.active span:nth-child(1) {
    transform: rotate(-45deg) translate(-5px, 6px);
  }
  
  .nav-toggle.active span:nth-child(2) {
    opacity: 0;
  }
  
  .nav-toggle.active span:nth-child(3) {
    transform: rotate(45deg) translate(-5px, -6px);
  }
`;
document.head.appendChild(style);
