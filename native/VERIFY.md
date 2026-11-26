# 真机验证清单

目标：在你自己的 vivo 手机上，把 `native/` 编译出来、装上、跑通健康数据同步。

**先说清楚**：这套东西我这边一步都没编译过（没 JDK、没 Android SDK、没外网）。第一次构建大概率会遇到 1–2 个版本或路径问题，这是正常的，把报错发我就能修。

---

## 阶段 0 · 什么都不装，先确认三件事（5 分钟）

| # | 做什么 | 怎么算通过 |
|---|---|---|
| 0.1 | 设置里搜 `Health Connect` 或 `健康连接` | 能搜到 → 后面的路能走；搜不到 → 先看下方「分支 B」 |
| 0.2 | 设置 → 关于手机 → 版本信息 → 看 Android 版本 | ≥ 14 → 大概率内置 |
| 0.3 | 华为运动健康能正常同步手表数据 | 打开能看到昨天的步数 → 数据源没问题 |

**分支 A**：有 Health Connect → 继续阶段 1
**分支 B**：没有 → 这套自动同步做不了，回到文件导出（TCX 导入仍然可用）

---

## 阶段 1 · 装环境（首次 40–90 分钟，主要花在下载）

### 1.1 Node.js

装 [Node.js LTS](https://nodejs.org)（20 或更高），装完开个**新的** PowerShell 窗口：

```powershell
node -v
npm -v
```

两个都要出版本号。出不来就是没加到 PATH，重装勾上 "Add to PATH"。

### 1.2 Android Studio

装 [Android Studio](https://developer.android.com/studio)，安装向导里勾上：

- Android SDK
- Android SDK Platform（至少 API 35）
- Android SDK Build-Tools
- Android SDK Platform-Tools（`adb` 就在这里面）

装完打开一次，让它把 SDK 下完。

> JDK 不用单独装，Android Studio 自带。命令行构建时它会去用自带的 JDK。

### 1.3 手机准备

1. 设置 → 关于手机 → 版本信息 → 连点「软件版本号」7 次，提示进入开发者模式
2. 设置 → 系统管理 → 开发者选项 → 打开「USB 调试」
3. 数据线连电脑，手机上弹「允许 USB 调试吗」→ 勾「始终允许」→ 确定
4. 验证：

```powershell
adb devices
```

看到一行 `<序列号>  device` 就对了（不是 `unauthorized`）。

> `adb` 找不到命令的话，它在 `C:\Users\你的用户名\AppData\Local\Android\Sdk\platform-tools\` 下面，把这一行加到系统 PATH，或者直接用完整路径调用。

---

## 阶段 2 · 构建（首次 10–20 分钟）

### 方式 A：双击脚本（推荐给不想碰命令行的）

装完 Node 和 Android Studio 之后，直接**双击 `build-apk.bat`**。

它会依次做：装依赖 → 复制网页 → 生成安卓工程 → 同步插件 → 编译 APK，最后告诉你 apk 文件在哪。

- 屏幕最后出现 `BUILD OK` 和一串路径 = 成功
- 出现 `BUILD FAILED` = 把窗口截图发我

> 脚本里的提示是英文的——中文在 cmd 里会因为编码问题乱码，所以故意写成 ASCII。

### 方式 B：手动敲命令

```powershell
cd C:\Users\yako\Downloads\life-log\native

npm install
node sync-web.js
npx cap add android
npx cap sync android
npx cap open android
```

逐步看结果：

| 命令 | 通过标志 | 常见失败 |
|---|---|---|
| `npm install` | 出现 `added N packages` | 网络超时 → 换 npm 镜像；`ERESOLVE` → 版本冲突，发我 |
| `node sync-web.js` | 打印 `✓ www/ 已就绪` | 极少失败 |
| `npx cap add android` | 生成 `android/` 目录 | 缺 `@capacitor/android` |
| `npx cap sync android` | 打印 `Sync finished` | 插件版本与 Capacitor 主版本不一致 |
| `npx cap open android` | 打开 Android Studio | 没装 Android Studio |

Android Studio 里：

1. 等右下角 Gradle 同步跑完（第一次 5–10 分钟，要下依赖）
2. 顶部设备下拉框里选中你的手机
3. 点绿色 ▶

**只想出安装包、不想每次插线**：

```powershell
cd android
.\gradlew.bat assembleDebug
```

> 报 `JAVA_HOME is not set` 的话：在 Android Studio 底部的 Terminal 里跑这条命令（它自带 JDK 环境），或者把 `JAVA_HOME` 指向 `C:\Program Files\Android\Android Studio\jbr`。

产物在 `android\app\build\outputs\apk\debug\app-debug.apk`，用数据线拷到手机，文件管理器里点开安装（需要允许「安装未知来源应用」）。

---

## 阶段 3 · 分阶段验证

**按顺序做，每步挂了下一步不用试**——这样可以精确定位问题在哪一层。

### 3.1 能不能起来（不涉及健康数据）

| # | 操作 | 期望 | 挂了看哪 |
|---|---|---|---|
| 1 | 打开 App | 直接进「今天」页，有 21 天示例数据 | 白屏 → 见「抓日志」 |
| 2 | 点 ＋ 记一条睡眠 | 保存成功，卡片变化 | 按钮无反应 → JS 报错 |
| 3 | 完全退出 App，重开 | 刚记的那条还在 | 数据丢了 → localStorage 问题 |
| 4 | 按返回键 | 弹窗先关；不在首页先回首页；再按才退出 | 直接退了 → `native.js` 没加载 |
| 5 | 设置 → 深色模式 | 界面变暗，状态栏跟着变 | 状态栏没变 → `@capacitor/status-bar` 没装 |

> 第 3 步很关键。WebView 的 localStorage 在 Capacitor 里本该稳定，但「杀掉进程就丢」是有可能发生的（尤其系统清理），这一步能提前暴露。

### 3.2 Health Connect 在不在

| # | 操作 | 期望 | 含义 |
|---|---|---|---|
| 6 | 我的 → 手表数据 → 点「同步」 | **弹出 Health Connect 授权页** | ✅ 系统支持，继续 |
| | | 提示「这台手机没有 Health Connect」 | ❌ 系统不支持，到此为止 |
| | | 提示「这个功能要在安卓 App 里用」 | ❌ 插件没装进 APK |

这一步同时验证了三件事：插件注册、`isAvailable()`、以及系统有没有 Health Connect。

### 3.3 授权与读取

| # | 操作 | 期望 | 挂了看哪 |
|---|---|---|---|
| 7 | 授权页里勾选「睡眠 / 步数 / 静息心率 / 体重」→ 允许 | 回到 App | — |
| 8 | 看 toast | 「同步了 N 条」或「没有新数据」 | 「没有新数据」= 授权成功但 HC 里没数据 |
| 9 | 时间轴 | 出现「走了 N 步」「睡了 X 小时」 | 说明 Health Sync 没把华为数据写进 HC |

**第 9 步是真正的分水岭**：App 侧到这里就全通了，剩下是 Health Sync 有没有把数据搬过来。

如果第 9 步空着：
- 打开 Health Sync，看它的同步日志里有没有 HUAWEI Health → Health Connect 的成功记录
- 确认勾选了 Steps / Sleep 这两项
- 有些设置需要等 15 分钟一次同步周期

### 3.4 TCX 与补心率

| # | 操作 | 期望 |
|---|---|---|
| 10 | 我的 → 导入手表数据 → 选 `20260922户外跑步.tcx` | 出现卡片：5.00 km / 40 分钟 / 7'58" |
| 11 | 点「导入 1 条」 | 时间轴出现这条跑步 |
| 12 | 点这条跑步 → 查看详情 | 每公里配速、海拔、轨迹都在 |
| 13 | 点「从 Health Connect 补心率」 | 心率卡片出现，曲线和 bpm 区间 |
| 14 | 看心率点数 | 点很稀（<10 个）说明 Health Sync 只同步了汇总 |

---

## 抓日志

### WebView 的 console（最有用）

1. 手机用 USB 连着电脑
2. 电脑 Chrome 打开 `chrome://inspect`
3. 找到你的 App → 点 `inspect`
4. 看 Console 面板

我代码里埋了这些日志，出问题时它们会直接告诉你原因：

```js
console.warn('[health]', e)     // 同步失败的具体错误
console.warn('[AI]', err)       // AI 解析失败
console.warn(err)               // 导入失败
```

### 原生层报错

```powershell
adb logcat -s Capacitor:V
```

或者全量的：

```powershell
adb logcat > log.txt
```

（跑完 Ctrl+C，把 log.txt 里含 `Capacitor` / `Health` / `Exception` 的行发我）

---

## 卡住了发我什么

| 卡在哪 | 发什么 |
|---|---|
| `npm install` | 最后 20 行报错 |
| `cap add/sync` | 完整报错 |
| Gradle 同步 | Android Studio 底部 Build 窗口的红色部分 |
| App 白屏 | chrome://inspect 里 Console 的第一条红色报错 |
| 同步没数据 | toast 文案 + Health Sync 里的同步记录截图 |

---

## 预期时间

| 阶段 | 首次 | 之后 |
|---|---|---|
| 装环境 | 40–90 分钟（下载为主） | — |
| 构建 | 10–20 分钟 | 1 分钟 |
| 验证 | 20 分钟 | — |
| 改代码后重新装 | — | `npm run sync` + Run，约 2 分钟 |

---

## 如果连环境都不想装

那有三个替代：

1. **只想知道 Health Connect 在不在** → 阶段 0，5 分钟，不用装任何东西
2. **只想用起来** → 把网页版传到静态托管，加到主屏幕，先当记录工具用；健康数据走文件导入
3. **先攒数据** → 继续用现在的 PWA 记录，等哪天想折腾了再打包

这套代码不会因为晚几天打包就失效。
