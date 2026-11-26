# 打包成手机 App（Capacitor）

把 `../index.html` 这套网页装进一个原生壳，得到一个可以装到安卓手机上的 App。

> ⚠️ 这个目录里的配置**没有在本机验证过**——我这边没有外网、没有 JDK、没有 Android SDK，装不了依赖也打不了包。下面的命令是按 Capacitor 8 的标准流程写的，第一次跑如果报错，把错误贴给我。
>
> 📋 第一次上手建议先看 [VERIFY.md](VERIFY.md)——那份是按「每一步只验证一件事」排的清单，挂了能立刻定位到哪一层。

---

## 一、它能带来什么

| | PWA（现在） | Capacitor 壳（这个） |
|---|---|---|
| 安装 | 添加到主屏幕 | 真正的 APK，独立图标 |
| 数据 | 浏览器存储，清缓存会丢 | WebView 独立存储，更稳 |
| 通知 | 无 | 每天 22:30 / 08:00 本地提醒 |
| 返回键 | 浏览器返回 | 原生返回：先关弹窗，再退 App |
| 联网 | 需要先有网址 | 完全离线，不依赖托管 |
| 手表数据 | 只能手动导文件 | 可读 Health Connect，点一下同步 |

---

## 二、前置环境（Windows）

1. **Node.js 18+** —— https://nodejs.org
2. **JDK 17** —— Android Studio 自带，或单独装
3. **Android Studio** —— 装的时候勾上 Android SDK（API 34+）和 Build-Tools

装完在终端里确认：

```powershell
node -v
java -version
```

---

## 三、构建步骤

```powershell
cd C:\Users\yako\Downloads\life-log\native

# 1. 装依赖（第一次，需要联网）
npm install

# 2. 把网页文件同步进 www/（会注入 native.js）
node sync-web.js

# 3. 生成安卓工程（第一次，只需跑一次）
npx cap add android

# 4. 同步 + 打开 Android Studio
npx cap sync android
npx cap open android
```

在 Android Studio 里：

- 等 Gradle 同步完（第一次要几分钟，要联网下依赖）
- 插上手机、开「USB 调试」，点绿色的 ▶ 运行
- 或者 `Build → Generate Signed Bundle / APK` 出正式安装包

**之后每次改了网页代码**，只需要：

```powershell
npm run sync
```

然后 Android Studio 里重新 Run 一次。

---

## 四、换成自己的名字和图标

| 项 | 位置 |
|---|---|
| 应用名 | `native/capacitor.config.json` 里的 `appName` |
| 包名 | 同上 `appId`（建议改成 `com.你的名字.onelog`，一次定好别再改） |
| 图标 | `android/app/src/main/res/mipmap-*/ic_launcher.png` |
| 启动背景色 | `android/app/src/main/res/values/styles.xml` |

---

## 五、关于华为手表的数据

**华为运动健康的数据不开放给个人开发者**（Health Kit 要企业资质），蓝牙直连也做不了（私有协议 + 单连接）。

所以有两条路，按自动化程度排：

### A. Health Connect 自动同步（推荐）

原理是一条链：

```
华为手表 ──蓝牙──> 华为运动健康 App ──> Health Sync ──> Health Connect ──> 本 App
                  （你自己装的）        （桥接，付费）
```

| 环节 | 要做什么 |
|---|---|
| 1. 华为运动健康 | 你已经在用，保持配对 |
| 2. Health Sync | 应用商店或 [healthsync.app](https://healthsync.app/about-cn/) 装，选「HUAWEI Health → Health Connect」。非华为手机可能要先装 HMS Core |
| 3. Health Connect | 安卓 14+ 系统自带；旧系统需从 Play 商店装「Health Connect by Android」 |
| 4. 本 App | 「我的 → Health Connect 自动同步 → 同步」 |

本 App 用的是 [`@capgo/capacitor-health`](https://www.npmjs.com/package/@capgo/capacitor-health)，已经在 `package.json` 里了，`npm install` 会自动装。

**第一次点「同步」会发生什么**：跳转到 Health Connect 的授权页，勾选睡眠 / 步数 / 静息心率 / 体重。之后每次同步只读这四类。

如果系统里没有 Health Connect，App 会直接提示「这台手机没有 Health Connect」——不会静默失败。

> ⚠️ 没在真机上验证过：插件装没装、权限弹窗长什么样、vivo 的 OriginOS 有没有把 Health Connect 裁掉，这些都要你装上才知道。报错把日志发我。

### B. 文件导出（保底，一定能用）

```
华为运动健康 App → 我的 → 隐私中心 / 数据管理 → 导出数据 → 生成 zip
```

拿到 zip 后，在 App 的「我的 → 导入手表 / 健康数据」里选它；解析不了就先解压，挑里面的 `.csv` / `.json` 再导入。

导入面板里可以手动指定「哪一列是时间、哪一列是数值」，所以列名对不上也能导。

---

## 六、Health Connect 的额外要求

Google 对健康类 App 有硬性要求，这个壳里已经处理了：

| 要求 | 状态 |
|---|---|
| 隐私政策页 | ✅ `native/privacypolicy.html`，构建时会被复制进 `www/` |
| 读权限声明 | ✅ 插件自带的 manifest 已经声明了 |
| 写权限 | 不需要（本 App 只读不写） |
| 用户授权 | 首次同步时弹 Health Connect 授权页 |

隐私政策页的内容是按这个 App 的实际情况写的（只读、不上传、无服务器）。如果你改了 App 的行为，记得同步改它。

> Health Connect 默认只能读最近 30 天。本 App 每次读 7 天，够用。要读更久得额外申请 `READ_HEALTH_DATA_HISTORY` 权限。

---

## 七、以后还能做到什么程度

1. **其他品牌手表** —— 只要数据能进 Health Connect（Garmin、Samsung、Zepp 都能），同一套同步代码直接可用，不用改。
2. **直接调华为 Health Kit** —— 需要企业开发者资质，个人拿不到，不建议。
3. **后台自动同步** —— 现在要手动点一下；可以加一个「打开 App 时自动同步」，需要处理授权状态缓存。
