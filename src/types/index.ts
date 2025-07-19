// 基础事件映射接口
export interface BaseEventMap {
  // 系统内置事件
  'system:error:occurred': { error: string; context?: Record<string, unknown> };
  'system:warning:logged': { message: string; level: 'warn' | 'error' };
}

// 完整的事件映射类型
export type EventMap = BaseEventMap;

export type AppEvents = {
  emit<T extends keyof EventMap>(event: T, data: EventMap[T]): Promise<void>;
  on<T extends keyof EventMap>(
    event: T,
    listener: (data: EventMap[T]) => void
  ): void;
  off<T extends keyof EventMap>(
    eventName: T,
    listener: (eventType: T, listenerId: string) => void
  ): void;
};
