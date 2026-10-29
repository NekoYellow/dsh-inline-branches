<h1 align="center">
  <img src="./icon.svg" width="72" height="72" alt="dsh-inline-branches 图标"><br>
  dsh-inline-branches
</h1>

<p align="center"><strong>把对话的轮次变成嵌套文件夹。</strong>在任意轮次下放一条追问，点一下就能像 Finder 一样展开/收起；不新建 Session。</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="#安装">安装</a> ·
  <a href="#使用">使用</a> ·
  <a href="#实现方式">实现方式</a> ·
  <a href="#已知限制">已知限制</a>
</p>

<p align="center"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-2f6fed"></p>

![对话树导航面板](./figures/tree-bar.png)

<p align="center"><em>轮次按层级嵌套；标题栏的「对话树」会把同一结构列成导航。</em></p>

## 它做什么

平时，一个 Session 的轮次是从上到下一行行排开的，就像同一个文件夹里平铺的文件。这个插件让一个轮次可以变成「文件夹」：挂在它下面的追问就是子轮次，缩进排在它下面；点一下箭头，就能像 Finder 一样展开或收起整棵子树。

就这么一件事。没有 fork，也没有新建 Session —— 还是同一批轮次，只是以树的形式展示。消息仍由原生 Chat 渲染，Markdown、工具卡片、审批和图片都不受影响。

## 环境要求

- 带 Web UI 的 DeepSeek Harness Desktop，针对 **0.2.1-rc.3** 开发。
- 无构建步骤、无运行时依赖、无网络请求。

## 安装

### 在 Web UI 中

1. 在侧边栏打开 **Plugins**。
2. 点 **Add plugin**。
3. 粘贴仓库地址，或本地目录的绝对路径，确认安装。

安装器会把 `dsh-inline-branches` 加入当前 profile 并默认启用。

### 用命令行

```bash
git clone https://github.com/NekoYellow/dsh-inline-branches.git
dsh plugin --profile desktop add "$PWD/dsh-inline-branches"
```

也可以直接从仓库安装：

```bash
dsh plugin --profile desktop add https://github.com/NekoYellow/dsh-inline-branches
```

如果你用的不是 `desktop` profile，替换成实际名称。安装默认会启用这个 bundle；如果标题栏没有出现 **对话树**，重启 Harness。

本插件没有发布到 npm，请从本仓库安装。

## 使用

1. 完成一轮对话，该轮下方会出现「＋ 子对话」。
2. 点它进入这一轮的子对话；输入框上方的提示条会说明新消息会挂到哪里。
3. 照常在主输入框里提问：下一条（以及停留期间之后的每一条）都会缩进挂在它下面。在子轮次上再点「＋ 子对话」就能继续往下嵌。
4. 点文件夹行的箭头，就能像 Finder 一样显示/隐藏它下面的整棵子树。
5. 点提示条里的「返回主线」回到顶层；标题栏的「对话树」会把同一棵树列成导航，点任意一行跳过去。

![在已完成的轮次下开启子对话](./figures/new-sub-conversation.png)

<p align="center"><em>进入子对话：输入框上方的提示条会说明新消息归属，并提供「返回主线」。</em></p>

## 实现方式

整棵「树」都是客户端对现有会话的一层展示：

| 部分 | 机制 |
|---|---|
| 父子关系 | `localStorage` 键 `dsh.inline-tree.v3` —— `{ [sessionId]: { parents: { [轮次]: 父轮次 } } }` |
| 折叠状态 | `localStorage` 键 `dsh.inline-tree.collapsed.v1` |
| 排序与缩进 | 每个会话注入一段 `<style>`：按树的先序给每个 `[data-chat-turn]` 设置 `order`，按深度设置 `margin-left`；祖先被收起时设为 `display: none` |
| 渲染层 | 原生 Chat 的 flow 槽位是 `display: contents`，因此轮次就是对话列的 flex 项 |
| 入口 | Client 槽位：`conversation.session.header.actions`（对话树按钮）、`conversation.chat.turnTail`（文件夹行）、`conversation.input.dock`（进入子对话的提示条）、`shell.overlay`（导航面板） |
| Host 侧 | `index.js` 只导出一个空的 `apply()`；bundle patch 需要一行 Host 入口，但没有任何 Host 逻辑 |

进入某个子对话后，标题栏组件会监听会话的轮次列表，把新出现的轮次记到当前文件夹下 —— 所以不需要 fork 或新 Session。父子关系存在浏览器里，因此只对当前浏览器生效：会话日志仍是线性的，换设备或清除站点数据后，轮次还在，树不跟随。

插件还会按内置中英文的 `aria-label` 隐藏原生 **在新对话中分支** 按钮，避免两种分支模型混淆。

## 数据与隐私

- 只在浏览器 `localStorage` 里保存轮次编号和父轮次编号。
- 不写会话日志，也不发网络请求。
- 清除站点数据会丢失树的布局，轮次本身不受影响。

## 兼容性

树是纯 CSS 叠加在 Chat DOM 上的，因此依赖当前 DSH 版本的一些实现细节：

- 轮次元素上的 `data-chat-turn`；
- Chat flow 槽位为 `display: contents`，轮次因此是 flex 项；
- running/older 行的 `tnXGgG_*` class 名；
- 上面列出的槽位名，以及原生分支按钮的本地化 `aria-label`。

如果 DSH 升级改掉这些，嵌套可能失效，需要等插件适配。插件不改会话数据，欢迎提 PR 适配新版本。

## 已知限制

- **没有上下文隔离。** 子对话只是追加在当前会话里的普通轮次，模型按时间顺序看到它们，而不是拼在父轮次处。这是「不新建 Session」的代价。
- **只是展示层。** 父子关系存在浏览器里，会话日志仍是线性的，换设备不跟随。
- **轮次编号仍是线性的。** 子轮次保留自己的轮次编号，也会作为普通轮次出现在上下文里。
- **只列已加载的轮次。** 导航树只显示当前已加载的轮次；更早的轮次需要先让主对话加载。
- **「已进入的文件夹」只在内存里。** 刷新页面后会回到主线。
- **原生分支按钮被隐藏。** 内置的「在新对话中分支」被隐藏，避免和子对话混淆。

## 卸载

- 在 **Plugins** 里移除，或运行 `dsh plugin --profile desktop remove dsh-inline-branches`。
- 可选：清除 Web UI origin 下的 `dsh.inline-tree.v3` 和 `dsh.inline-tree.collapsed.v1`。

## 开发

插件是纯 JavaScript，由 Client 模块加载器直接加载 —— 没有打包步骤，也没有依赖。

```
client.js           全部 UI：store、树模型、注入的 CSS、React 组件
index.js            Host 侧：空的 apply()
cordis.patch.yml    插入 inline-branches 行的 bundle patch
locale/en.json      Plugin Manager 元数据（标题/描述）
locale/zh.json
icon.svg            Plugin Manager 图标
figures/            本文使用的截图
```

用 **Add plugin → 本地路径** 把一个 profile 指向这个目录；修改 `client.js` 后重启或重新安装，以加载新的 Client 模块。

## License

[MIT](./LICENSE)
