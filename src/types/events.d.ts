// 用户自定义事件类型扩展
// 第三方用户只需要在这个文件中添加自己的事件类型即可

declare module 'small-event-system' {
  interface BaseEventMap {
    // 在这里添加你的自定义事件
    // 示例：
    // 'my-app:user:registered': {
    //   userId: string;
    //   email: string;
    //   registrationDate: Date;
    // };
  }
}
