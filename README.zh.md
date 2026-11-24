# dsh-cmd-enter-send

把 DeepSeek Harness 输入框改成 **Cmd+Enter 发送、Enter 换行**。

[English →](README.md)

DSH 默认的键位是相反的：单独按 Enter 直接发送，Shift+Enter 才是换行。写多行
提示词时，每想换一行都得按住 Shift，一旦忘了就会把没写完的消息发出去。这个插件
把这两个键换过来，让 Enter 可以放心按，发送变成一个明确的动作。

## 键位

| 按键 | 行为 |
| --- | --- |
| `Enter` | 插入换行 |
| `Cmd+Enter`（macOS）/ `Ctrl+Enter`（Windows、Linux） | 发送消息 |
| `Shift+Enter` | 插入换行（保持不变） |
| `Esc` `Esc` | 停止正在生成的回复（保持不变） |

改动只作用于对话输入框。其他快捷键、命令菜单与引用菜单、输入法组词的行为都和
原来一致。

## 为什么不是一个设置项

DSH 的输入框把键位写死在
`@deepseek-ai/dsh-client-ui-conversation`（`src/client/input/editor/keymap.ts`：
单独 Enter 调 `handlers.submit()`，Shift+Enter 交给 Lexical 插换行）。快捷键目录
里把它们登记成 *fixed* 绑定，DSH 不允许改绑，所以没有任何设置项能表达这个交换。

插件的做法是在 `window` 上装一个捕获阶段的 `keydown` 监听器，它比输入框自己的
处理器更早执行。输入框里的裸 Enter 会被拦下来（`preventDefault` +
`stopPropagation`，输入框的 keymap 根本看不到它），然后向同一个元素重新派发一个
合成的 **Shift+Enter** —— 正是输入框放行给 Lexical 内置换行的那条分支。
Ctrl/Cmd+Enter 完全不动，仍然走 DSH 原本的发送路径。

因为它作用在 DOM 事件上、不碰 DSH 内部，所以不依赖模块注入顺序，退化也是安全的：
万一输入框的标记结构变了，监听器就不再命中，DSH 表现为原来的行为。

## 安装

从插件市场安装，或者让 DSH 直接指向这个仓库：

```sh
dsh plugin --profile web add github:ay27/dsh-cmd-enter-send
```

也可以装最新 Release 上的预构建 tarball，省去从源码构建的步骤：

```sh
dsh plugin --profile web add https://github.com/ay27/dsh-cmd-enter-send/releases/latest/download/dsh-cmd-enter-send.tgz
```

装完后重启 DSH（或重新加载窗口）。

## 卸载

```sh
dsh plugin remove dsh-cmd-enter-send
```

卸载后会立即恢复默认的 Enter 发送，没有需要清理的保存状态。

## 兼容性

基于 DSH `0.2.2-rc.5` 开发，要求 `>=0.2.2-rc.1 <0.3.0-0`。插件依赖 DSH 加在输入框
上的两个属性（`data-composer-input` 与 `data-composer-card`），如果将来某个版本改了
名字，插件会失效于"不再插手"而不是"输入出错"。

## 许可

[MIT](LICENSE)
