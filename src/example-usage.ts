// 事件系统使用示例
import type { AppEvents, EventMap } from './types';

// 模拟事件总线实现
class EventBus implements AppEvents {
  private listeners = new Map<
    string,
    Array<{ id: string; callback: (data: unknown) => void }>
  >();

  async emit<T extends keyof EventMap>(
    event: T,
    data: EventMap[T]
  ): Promise<void> {
    const eventListeners = this.listeners.get(event as string);
    if (eventListeners) {
      // 异步执行所有监听器
      await Promise.all(eventListeners.map(({ callback }) => callback(data)));
    }
  }

  on<T extends keyof EventMap>(
    event: T,
    listener: (data: EventMap[T]) => void
  ): void {
    const eventKey = event as string;
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, []);
    }

    const listenerId = Math.random().toString(36).substr(2, 9);
    const eventListeners = this.listeners.get(eventKey);
    if (eventListeners) {
      // 类型转换：将具体类型转换为 unknown
      eventListeners.push({
        id: listenerId,
        callback: listener as (data: unknown) => void,
      });
    }
  }

  off<T extends keyof EventMap>(
    eventName: T,
    _listener: (eventType: T, listenerId: string) => void
  ): void {
    const eventKey = eventName as string;
    const eventListeners = this.listeners.get(eventKey);
    if (eventListeners) {
      // 这里简化处理，实际实现可能需要更复杂的逻辑
      this.listeners.delete(eventKey);
    }
  }
}

// 使用示例
async function example() {
  const eventBus = new EventBus();
  // 监听用户登录事件 - TypeScript 会自动推断正确的类型
  eventBus.on('system:error:occurred', (_data) => {
    // data 的类型自动推断为 { error: string; context?: Record<string, unknown> }
    // 这里可以添加实际的业务逻辑
    // 例如：发送到日志系统、更新用户状态等
  });

  await eventBus.emit('system:error:occurred', {
    error: 'test',
    context: {
      message: 'test',
    },
  });
}

// 导出示例函数
export { example, EventBus };
