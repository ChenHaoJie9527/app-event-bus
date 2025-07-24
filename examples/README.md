# EventBus 示例

这个目录包含了 EventBus 和 DOMEventIntegration 的使用示例。

## 示例列表

### 1. 基本使用示例 (`basic-usage.ts`)

展示了 EventBus 的基本功能：
- 创建和配置 EventBus
- 注册事件监听器
- 触发事件
- DOM 事件集成
- 资源清理

**特性：**
- ✅ 类型安全的事件定义
- ✅ DOM 事件自动处理
- ✅ 浏览器和 Node.js 环境兼容
- ✅ 完整的生命周期管理

**运行示例：**
```bash
# 在浏览器环境中
import { basicUsageExample, setupDOMExample } from './examples/basic-usage';
basicUsageExample();
setupDOMExample();

# 在 Node.js 环境中
npm run build
node dist/examples/basic-usage.js
```

### 2. 模态窗口系统 (`modal-system.ts`)

一个完整的模态窗口管理系统：
- 模态窗口的打开、关闭、确认
- 表单处理和验证
- DOM 事件和程序化事件的统一处理
- 动画和样式管理

**特性：**
- ✅ 完整的模态窗口生命周期
- ✅ 表单数据自动提取
- ✅ 事件委托和冒泡处理
- ✅ CSS 动画集成
- ✅ 内存泄漏防护

**使用方法：**
```typescript
import { createModalSystemExample } from './examples/modal-system';

// 在浏览器中运行
const modalManager = createModalSystemExample();

// 程序化打开模态窗口
modalManager.eventBus.emit('modal:open', {
  modalId: 'custom-modal',
  title: '自定义标题',
  content: '<p>自定义内容</p>'
});
```

### 3. React 集成示例 (`react-integration.tsx`)

展示如何在 React 应用中集成 EventBus：
- React Hook 封装
- 组件间通信
- DOM 事件和 React 事件的统一处理
- 计数器和待办事项示例

**特性：**
- ✅ React Hook 模式
- ✅ 类型安全的组件 Props
- ✅ 自动资源清理
- ✅ DOM 事件与 React 事件的无缝结合

**使用方法：**
```tsx
import { ReactEventBusApp } from './examples/react-integration';

function App() {
  return <ReactEventBusApp />;
}
```

## 通用特性

所有示例都展示了以下核心特性：

### 🎯 类型安全
```typescript
// 完整的 TypeScript 类型推导
const events = [
  {
    event: 'user:login',
    listener: (data: { userId: string; username: string }) => {
      // 完整的类型提示
    },
    description: '用户登录事件',
  },
] as const;

const eventBus = new EventBus(events);
// emit 时有完整的类型提示和验证
eventBus.emit('user:login', { userId: '123', username: '张三' });
```

### 🌐 DOM 事件集成
```html
<!-- HTML 中使用 data-action 属性 -->
<button data-action="user-login" data-user-id="123" data-username="张三">
  登录
</button>

<!-- 自动转换为 EventBus 事件 -->
```

### 🔄 事件流程
```
DOM 事件 → DOMEventIntegration → EventBus → 应用监听器
```

### 🧹 资源管理
```typescript
// 自动清理资源
eventBus.clear();
domIntegration.disconnect();
```

## 最佳实践

### 1. 事件命名规范
使用 `领域:动作` 的格式：
```typescript
'user:login'        // 用户登录
'modal:open'        // 模态窗口打开
'form:submit'       // 表单提交
'notification:show' // 显示通知
```

### 2. DOM 属性规范
使用 `data-action` 作为主要动作标识：
```html
<button data-action="open-modal" data-modal-id="user-form">
  打开用户表单
</button>
```

### 3. 错误处理
```typescript
// 监听错误事件
eventBus.on('dom:action:error', (data) => {
  console.error('DOM 事件处理错误:', data.error);
});
```

### 4. 性能优化
```typescript
// 使用防抖处理高频事件
import { debounce } from '../src/utils';

const debouncedHandler = debounce((data) => {
  // 处理逻辑
}, 300);
```

## 开发环境设置

### 安装依赖
```bash
npm install
# 或
pnpm install
```

### 构建项目
```bash
npm run build
```

### 运行测试
```bash
npm run test:watch
# 针对特定示例的测试
npx vitest run src/test/dom-integration.test.ts --environment=jsdom
```

### 类型检查
```bash
npx tsc --noEmit
```

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 故障排除

### 常见问题

1. **类型提示不正确**
   - 确保使用 `as const` 定义事件数组
   - 检查 TypeScript 版本 (推荐 5.0+)

2. **DOM 事件不触发**
   - 确认 `DOMEventIntegration` 已连接
   - 检查 `data-action` 属性拼写
   - 验证事件已在 EventBus 中注册

3. **内存泄漏**
   - 确保调用 `eventBus.clear()`
   - 确保调用 `domIntegration.disconnect()`
   - 在 React 中使用 `useEffect` 的清理函数

4. **React 集成问题**
   - 确保 React 版本 16.8+ (Hooks 支持)
   - 检查依赖数组的完整性
   - 避免在 render 中创建 EventBus 实例

## 贡献

欢迎提交更多示例！请确保：
- 代码有完整的类型定义
- 包含必要的注释和说明
- 遵循项目的代码规范
- 添加相应的测试用例 