# 用 GitHub 云端打包 APK（不用装 Android Studio）

**适合**：访问不了 Google、装不上 Android Studio，但想拿到一个能装手机的 APK。

**原理**：把代码传到 GitHub，让 GitHub 的服务器帮你编译（它的机器在国外，下载依赖毫无障碍），编完把 APK 给你下载。**你的电脑上什么都不用装。**

**代价**：需要注册一个 GitHub 账号；全程在网页上点，大约 20 分钟（其中 10 分钟是等构建）。

---

## 先认几个按钮（界面是英文的）

GitHub 没有官方中文版。用 Chrome 右键「翻译成中文」也能看，但**翻译后按钮名字会变**，反而对不上。建议按下面这张表认：

| 你会看到 | 意思 | 什么时候用 |
|---|---|---|
| `Sign up` | 注册 | 第一次 |
| `+`（右上角） | 新建 | 建仓库 |
| `New repository` | 新仓库 | 建仓库 |
| `Repository name` | 仓库名 | 随便填 |
| `Create repository`（绿色按钮） | 创建 | 建仓库最后一步 |
| `uploading an existing file` | 上传已有文件 | 传代码 |
| `Add file` → `Upload files` | 添加文件 → 上传 | 传代码的另一入口 |
| `Commit changes`（绿色按钮） | 提交保存 | 每次改完都要点 |
| `Add file` → `Create new file` | 新建文件 | 加构建配置 |
| `Actions`（顶部标签） | 自动构建 | 看编译进度 |
| `Artifacts`（页面最底部） | 产物下载 | 取 APK |

看到一个不认识的就回来查这张表。

---

## 第 1 步 · 注册 GitHub

打开 https://github.com → Sign up → 邮箱 + 密码 → 验证邮箱。

> GitHub 在国内能打开，只是有时偏慢，多刷几次。

---

## 第 2 步 · 建一个仓库

登录后点右上角 **+** → **New repository**

- Repository name：填 `onelog`（随便）
- 选 **Public**（公开仓库的构建时长免费且不限量；仓库里只有代码，没有你的任何记录数据）
- 其它都不动 → **Create repository**

---

## 第 3 步 · 上传文件

在新仓库页面，点 **uploading an existing file** 这个链接（或 Add file → Upload files）。

然后：

1. 在电脑上打开 `C:\Users\yako\Downloads\life-log`
2. **进去之后全选里面的内容**（`Ctrl+A`）—— 注意是**文件夹里面的东西**，不是把 `life-log` 这个文件夹本身拖进去
3. 拖到网页的上传区域
4. 等文件列表出来 → 点绿色 **Commit changes**

> 上传的文件里包含 `native`、`test`、`index.html` 等，一共二十几个文件，很快。

---

## 第 4 步 · 添加构建配置

**这一步别跳过**——没有它 GitHub 不知道要编译什么。

1. 回到仓库首页，点 **Add file** → **Create new file**
2. 文件名那一栏，**完整输入**：

```
.github/workflows/build-apk.yml
```

（输入 `/` 的时候 GitHub 会自动帮你建目录，正常现象）

3. 把下面这段整个粘进去：

```yaml
name: Build APK

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: 取出代码
        uses: actions/checkout@v4

      - name: 装 Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: 安装依赖
        working-directory: native
        run: npm install

      - name: 复制网页文件到 www
        working-directory: native
        run: node sync-web.js

      - name: 生成安卓工程
        working-directory: native
        run: npx cap add android

      - name: 指定 SDK 路径
        run: echo "sdk.dir=${ANDROID_HOME:-$ANDROID_SDK_ROOT}" > native/android/local.properties

      - name: 同步插件
        working-directory: native
        run: npx cap sync android

      - name: 编译 APK
        working-directory: native/android
        run: chmod +x gradlew && ./gradlew assembleDebug --no-daemon

      - name: 上传安装包
        uses: actions/upload-artifact@v4
        with:
          name: onelog-apk
          path: native/android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error
```

4. 拉到下面点 **Commit changes**

提交的瞬间，构建就会自动开始。

---

## 第 5 步 · 等它编译（5–10 分钟）

1. 点仓库顶部的 **Actions** 标签
2. 会看到一个叫 **Build APK** 的运行记录，黄色小圆点在转 = 正在跑
3. 变成绿色 ✓ = 成功；红色 ✗ = 失败

**第一次跑基本都会失败**——版本号、依赖这些我没法在本地预先验证。失败是正常的，不是你的问题。

失败时：点进那个红色的运行 → 点左边红色的步骤 → 把报错最后 20 行截图发我。

---

## 第 6 步 · 下载 APK

成功的运行页面，拉到最底下有个 **Artifacts** 区域：

```
onelog-apk.zip
```

点它下载 → 解压 → 里面是 `app-debug.apk`。

---

## 第 7 步 · 装到手机

1. 把 `app-debug.apk` 传到手机（数据线 / 微信文件传输助手 / 网盘都行）
2. 手机上用文件管理器点开它
3. 提示「禁止安装未知来源应用」→ 点「设置」→ 允许这个来源 → 返回继续安装

装完桌面上就有「一天」了。

---

## 常见问题

**Q：会不会把我的记录数据传到 GitHub？**
不会。上传的只有代码（`app.js` / `styles.css` 这些），你的记录存在手机或浏览器的 localStorage 里，从来没进过代码仓库。

**Q：以后改了代码怎么办？**
在 GitHub 网页上直接改文件（或重新上传），提交后自动重新编译，再下一遍 APK。

**Q：能不能不公开仓库？**
可以，选 Private。私有仓库每月有 2000 分钟免费构建额度，一次构建约 5 分钟，够用很久。

**Q：构建产物能放多久？**
90 天。过期了重新跑一次 Actions 就行（Actions 页面点 **Re-run all jobs**）。

**Q：这个 APK 有签名吗？**
有，是自动生成的调试签名，自己装没问题。要上架应用商店才需要正式签名。

---

## 如果 GitHub 也打不开

那就是网络环境的问题，不是这个方案的问题。退回到网页版：

把 `life-log` 文件夹传到一个能访问的静态托管（国内的 Gitee Pages 也行），手机浏览器打开网址 → 添加到主屏幕。功能和 APK 版 95% 一样，只是没有后台通知。
