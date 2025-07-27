import { useEffect, useState } from 'react';
import { usePrism } from '@/providers/PrismProvider';

const basicCode = `// Define event types
interface AppEventMap {
  'user:login': { userId: string; timestamp: number; };
  'user:logout': { userId: string; reason?: string; };
}

// Create typed EventBus
const eventBus = new EventBus<AppEventMap>();

// Register listeners
eventBus.on('user:login', (data) => {
  console.log('User logged in:', data.userId);
});
eventBus.on('user:logout', (data) => {
  console.log('User logged out:', data.userId);
});

// Emit events
await eventBus.emit('user:login', {
  userId: 'user123',
  timestamp: Date.now()
});`;

const multipleCode = `// Multiple listeners for same event
const id1 = eventBus.on('data:fetch', (data) => {
  console.log('Handler 1:', data.endpoint);
});

const id2 = eventBus.on('data:fetch', async (data) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('Handler 2 (async):', data.endpoint);
});

const id3 = eventBus.on('data:fetch', (data) => {
  console.log('Handler 3:', data.endpoint);
});

// All listeners execute concurrently
await eventBus.emit('data:fetch', {
  endpoint: '/api/users'
});`;

const errorCode = `// Listener that throws an error
eventBus.on('user:login', () => {
  throw new Error('Login failed');
});

// Listener that executes normally
eventBus.on('user:login', (data) => {
  console.log('This still executes:', data.userId);
});

// Both listeners are called
try {
  await eventBus.emit('user:login', {
    userId: 'user123',
    timestamp: Date.now()
  });
} catch (error) {
  console.log('Error caught:', error.message);
}`;

const Examples: React.FC = () => {
  const { highlight } = usePrism();

  // 每个示例的 tab 状态
  const [basicTab, setBasicTab] = useState<'code' | 'demo'>('code');
  const [multiTab, setMultiTab] = useState<'code' | 'demo'>('code');
  const [errorTab, setErrorTab] = useState<'code' | 'demo'>('code');

  // Demo 输出状态
  const [basicOutput, setBasicOutput] = useState<string>(
    'Click "Run Demo" to see the example in action...'
  );
  const [multiOutput, setMultiOutput] = useState<string>(
    'Click "Run Demo" to see multiple listeners in action...'
  );
  const [errorOutput, setErrorOutput] = useState<string>(
    'Click "Run Demo" to see error handling in action...'
  );

  useEffect(() => {
    highlight();
  }, [basicTab, multiTab, errorTab, highlight]);
  const mockEventBus = {
    listeners: new Map(),
    on: (event: string, handler: (data: any) => void) => {
      if (!mockEventBus.listeners.has(event)) {
        mockEventBus.listeners.set(event, []);
      }
      mockEventBus.listeners.get(event)?.push(handler);
      return Math.random().toString(36).substr(2, 9);
    },
    emit: async (event: string, data: any) => {
      const handlers = mockEventBus.listeners.get(event) || [];
      const results: any[] = [];

      for (const handler of handlers) {
        try {
          const result = await handler(data);
          results.push(result);
        } catch (error: any) {
          results.push({ error: error.message });
        }
      }

      return results;
    },
  };

  const runBasicDemo = async () => {
    setBasicOutput('Running demo...\n');

    // 清空之前的监听器
    mockEventBus.listeners.clear();

    // 注册监听器
    mockEventBus.on('user:login', (data: any) => {
      const message = `User logged in: ${data.userId}`;
      setBasicOutput((prev) => `${prev}${message}\n`);
      return message;
    });

    mockEventBus.on('user:logout', (data: any) => {
      const message = `User logged out: ${data.userId}`;
      setBasicOutput((prev) => `${prev}${message}\n`);
      return message;
    });

    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 触发事件
    await mockEventBus.emit('user:login', {
      userId: 'user123',
      timestamp: Date.now(),
    });

    setBasicOutput((prev) => `${prev}\nDemo completed! ✅`);
  };

  const runMultipleDemo = async () => {
    setMultiOutput('Running demo...\n');

    // 清空之前的监听器
    mockEventBus.listeners.clear();

    // 注册多个监听器
    mockEventBus.on('data:fetch', (data: any) => {
      const message = `Handler 1: ${data.endpoint}`;
      setMultiOutput((prev) => `${prev}${message}\n`);
      return message;
    });

    mockEventBus.on('data:fetch', async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const message = `Handler 2 (async): ${data.endpoint}`;
      setMultiOutput((prev) => `${prev}${message}\n`);
      return message;
    });

    mockEventBus.on('data:fetch', (data: any) => {
      const message = `Handler 3: ${data.endpoint}`;
      setMultiOutput((prev) => `${prev}${message}\n`);
      return message;
    });

    // 触发事件
    await mockEventBus.emit('data:fetch', {
      endpoint: '/api/users',
    });

    setMultiOutput((prev) => `${prev}\nAll handlers executed concurrently! ✅`);
  };

  const runErrorDemo = async () => {
    setErrorOutput('Running demo...\n');

    // 清空之前的监听器
    mockEventBus.listeners.clear();

    // 注册会抛出错误的监听器
    mockEventBus.on('user:login', () => {
      const message = 'Error: Login failed';
      setErrorOutput((prev) => `${prev}${message}\n`);
      throw new Error('Login failed');
    });

    // 注册正常执行的监听器
    mockEventBus.on('user:login', (data: any) => {
      const message = `This still executes: ${data.userId}`;
      setErrorOutput((prev) => `${prev}${message}\n`);
      return message;
    });

    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 触发事件并捕获错误
    try {
      await mockEventBus.emit('user:login', {
        userId: 'user123',
        timestamp: Date.now(),
      });
    } catch (error: any) {
      setErrorOutput((prev) => `${prev}Error caught: ${error.message}\n`);
    }

    setErrorOutput((prev) => `${prev}\nError handling demo completed! ✅`);
  };

  return (
    <section className="examples" id="examples">
      <div className="container">
        <h2 className="section-title">Live Examples</h2>

        {/* Basic Example */}
        <div className="example-card">
          <h3>Basic Event Handling</h3>
          <p>Simple event registration and emission with type safety.</p>
          <div className="example-content">
            <div className="code-tabs">
              <button
                className={`tab-btn${basicTab === 'code' ? ' active' : ''}`}
                onClick={() => setBasicTab('code')}
                type="button"
              >
                Code
              </button>
              <button
                className={`tab-btn${basicTab === 'demo' ? ' active' : ''}`}
                onClick={() => setBasicTab('demo')}
                type="button"
              >
                Demo
              </button>
            </div>
            <div
              className={`tab-content${basicTab === 'code' ? ' active' : ''}`}
              style={{ display: basicTab === 'code' ? 'block' : 'none' }}
            >
              <pre>
                <code className="language-typescript">{basicCode}</code>
              </pre>
            </div>
            <div
              className={`tab-content${basicTab === 'demo' ? ' active' : ''}`}
              style={{ display: basicTab === 'demo' ? 'block' : 'none' }}
            >
              <div className="demo-container">
                <button
                  className="demo-btn"
                  onClick={runBasicDemo}
                  type="button"
                >
                  Run Demo
                </button>
                <div className="demo-output" id="basic-output">
                  <pre
                    style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                  >
                    {basicOutput}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multiple Listeners Example */}
        <div className="example-card">
          <h3>Multiple Listeners</h3>
          <p>
            Register multiple listeners for the same event and see them execute
            concurrently.
          </p>
          <div className="example-content">
            <div className="code-tabs">
              <button
                className={`tab-btn${multiTab === 'code' ? ' active' : ''}`}
                onClick={() => setMultiTab('code')}
                type="button"
              >
                Code
              </button>
              <button
                className={`tab-btn${multiTab === 'demo' ? ' active' : ''}`}
                onClick={() => setMultiTab('demo')}
                type="button"
              >
                Demo
              </button>
            </div>
            <div
              className={`tab-content${multiTab === 'code' ? ' active' : ''}`}
              style={{ display: multiTab === 'code' ? 'block' : 'none' }}
            >
              <pre>
                <code className="language-typescript">{multipleCode}</code>
              </pre>
            </div>
            <div
              className={`tab-content${multiTab === 'demo' ? ' active' : ''}`}
              style={{ display: multiTab === 'demo' ? 'block' : 'none' }}
            >
              <div className="demo-container">
                <button
                  className="demo-btn"
                  onClick={runMultipleDemo}
                  type="button"
                >
                  Run Demo
                </button>
                <div className="demo-output" id="multiple-output">
                  <pre
                    style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                  >
                    {multiOutput}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Handling Example */}
        <div className="example-card">
          <h3>Error Handling</h3>
          <p>
            See how EventBus handles errors gracefully without stopping other
            listeners.
          </p>
          <div className="example-content">
            <div className="code-tabs">
              <button
                className={`tab-btn${errorTab === 'code' ? ' active' : ''}`}
                onClick={() => setErrorTab('code')}
                type="button"
              >
                Code
              </button>
              <button
                className={`tab-btn${errorTab === 'demo' ? ' active' : ''}`}
                onClick={() => setErrorTab('demo')}
                type="button"
              >
                Demo
              </button>
            </div>
            <div
              className={`tab-content${errorTab === 'code' ? ' active' : ''}`}
              style={{ display: errorTab === 'code' ? 'block' : 'none' }}
            >
              <pre>
                <code className="language-typescript">{errorCode}</code>
              </pre>
            </div>
            <div
              className={`tab-content${errorTab === 'demo' ? ' active' : ''}`}
              style={{ display: errorTab === 'demo' ? 'block' : 'none' }}
            >
              <div className="demo-container">
                <button
                  className="demo-btn"
                  onClick={runErrorDemo}
                  type="button"
                >
                  Run Demo
                </button>
                <div className="demo-output" id="error-output">
                  <pre
                    style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                  >
                    {errorOutput}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Examples;
