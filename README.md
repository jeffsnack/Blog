# Dyson's Notebook Blog 📓

一個筆記風格的靜態網頁部落格，使用純 HTML + Bootstrap 5 構建，支援 Markdown 寫作與語法高亮。

## 🚀 快速開始

### 在本地預覽

由於使用 `fetch()` 載入 Markdown 檔案，需要一個 local server：

```bash
# 方法 1: VS Code Live Server 擴充套件（推薦）
# 安裝 Live Server → 右鍵 index.html → Open with Live Server

# 方法 2: Python
python -m http.server 8000

# 方法 3: Node.js
npx serve .
```

### 新增文章

1. 在 `posts/` 資料夾中建立新的 `.md` 檔案（如 `my-new-post.md`）
2. 在檔案開頭加入 front-matter：
   ```markdown
   ---
   title: 文章標題
   date: 2026-03-01
   tags: [標籤1, 標籤2]
   readTime: 5 min read
   ---

   你的 Markdown 內容...
   ```
3. 在 `js/posts-index.js` 的 `POSTS` 陣列中新增一筆資料：
   ```javascript
   {
     slug: 'my-new-post',       // 與 .md 檔名相同
     title: '文章標題',
     date: '2026-03-01',
     tags: ['標籤1', '標籤2'],
     readTime: '5 min read',
     summary: '文章摘要...',
   },
   ```
4. Push 到 GitHub，GitHub Pages 會自動部署

## 📁 專案結構

```
Blog/
├── index.html              ← 首頁（自我介紹 + 最新文章）
├── writing.html            ← 文章列表頁（含標籤過濾）
├── post.html               ← 文章內容頁（動態載入 .md）
├── css/
│   └── style.css           ← 全站樣式（筆記本主題 + 深/淺模式）
├── js/
│   ├── theme-toggle.js     ← 深淺模式切換（localStorage 記住偏好）
│   ├── posts-index.js      ← 文章索引資料 + 標籤過濾功能
│   └── post-loader.js      ← Markdown 渲染 + Prism 語法高亮
├── posts/                  ← Markdown 文章存放區
│   └── hello-world.md
├── assets/
│   └── images/             ← 圖片資源
└── README.md
```

## 🛠 技術棧

| 項目 | 技術 |
|------|------|
| UI 框架 | Bootstrap 5.3 |
| 圖標 | Bootstrap Icons |
| 字型 | Caveat (手寫)、Noto Serif TC (中文)、Fira Code (程式碼) |
| Markdown | marked.js (前端渲染) |
| 語法高亮 | Prism.js + Autoloader |
| 部署 | GitHub Pages |

## 🌗 主題切換

- 支援日間 / 夜間模式
- 偏好儲存在 `localStorage`
- 首次造訪會跟隨系統偏好 (`prefers-color-scheme`)

## 🏷️ 標籤系統

- 文章可以加多個標籤
- Writing 頁面提供標籤過濾按鈕
- 標籤從 `posts-index.js` 自動收集

## 📄 部署到 GitHub Pages

1. 建立 GitHub repo（如 `jeffsnack.github.io` 或其他名稱）
2. 將所有檔案 push 上去
3. 到 repo Settings → Pages → Source 選擇 `main` branch / `/ (root)`
4. 等待幾分鐘，網站就上線了

---

## 🎨 備用風格：漸層柔和風格 (Gradient Soft Theme)

> 以下記錄截圖中參考的設計語言，未來想換膚時可以參考。

### 設計特徵

- **背景**：淡紫粉色漸層 (`linear-gradient(135deg, #e8dff5, #fce4ec, #fff3e0)`)
- **側邊欄**：半透明毛玻璃效果 (`backdrop-filter: blur(10px)`)，白色帶透明度
- **卡片**：白色半透明背景，圓角 16px，柔和陰影
- **文字**：深灰 `#2d2d2d`，副標題 `#666`
- **強調色**：橙紅 `#e85d3a`（連結、品牌色）
- **整體風格**：柔和、現代、通透感

### 建議 CSS 變數值

```css
:root {
  /* Gradient Soft — 漸層柔和風格 */
  --bg-primary: linear-gradient(135deg, #e8dff5 0%, #fce4ec 50%, #fff3e0 100%);
  --bg-sidebar: rgba(255, 255, 255, 0.6);
  --bg-sidebar-backdrop: blur(12px);
  --bg-card: rgba(255, 255, 255, 0.7);
  --bg-card-hover: rgba(255, 255, 255, 0.85);
  --text-primary: #2d2d2d;
  --text-secondary: #666666;
  --text-muted: #999999;
  --accent: #e85d3a;
  --accent-hover: #d14e2d;
  --border-color: rgba(0, 0, 0, 0.06);
  --shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* body 需改用 background-image */
body {
  background-image: var(--bg-primary);
  background-attachment: fixed;
  min-height: 100vh;
}

/* sidebar 加毛玻璃效果 */
.sidebar {
  background: var(--bg-sidebar);
  backdrop-filter: var(--bg-sidebar-backdrop);
  -webkit-backdrop-filter: var(--bg-sidebar-backdrop);
  border-right: 1px solid var(--border-color);
}

/* Alive badge 綠色圓點 */
.alive-badge {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.8);
}
```

### 對應的深色漸層版本

```css
[data-theme="dark"] {
  --bg-primary: linear-gradient(135deg, #1a1025 0%, #2a1520 50%, #201810 100%);
  --bg-sidebar: rgba(30, 25, 35, 0.8);
  --bg-card: rgba(40, 35, 45, 0.7);
  --bg-card-hover: rgba(50, 45, 55, 0.85);
  --text-primary: #e8e0f0;
  --text-secondary: #a89bb8;
  --text-muted: #6d6078;
  --accent: #f0845a;
  --accent-hover: #ffa070;
  --border-color: rgba(255, 255, 255, 0.06);
}
```

---

## ✒️ 備用字型：筆記本手寫風格 (Notebook Handwriting Font)

> 目前使用 Inter + Noto Sans TC（無襯線體）。以下記錄之前使用的手寫 / 書卷風字型，想換回時可直接替換。

### 字型組合

| 用途 | 字型 | Google Fonts |
|------|------|-------------|
| 英文標題 / 品牌名 | **Caveat** (手寫風) | `family=Caveat:wght@400;600;700` |
| 中文內文 | **Noto Serif TC** (襯線體) | `family=Noto+Serif+TC:wght@400;600;700` |
| 程式碼 | Fira Code (不變) | `family=Fira+Code:wght@400;500` |

### 替換步驟

**1. 修改 Google Fonts import（`css/style.css` 頂部）**

```css
/* 手寫風 */
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Noto+Serif+TC:wght@400;600;700&family=Fira+Code:wght@400;500&display=swap');

/* 現代無襯線（目前使用） */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
```

**2. 修改 body font-family**

```css
/* 手寫風 */
body { font-family: 'Noto Serif TC', 'Georgia', serif; }

/* 現代無襯線（目前使用） */
body { font-family: 'Inter', 'Noto Sans TC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
```

**3. 修改所有標題 font-family**

搜尋所有 `font-family: 'Inter', 'Noto Sans TC', sans-serif;` 並替換：

```css
/* 手寫風 */
font-family: 'Caveat', cursive;

/* 現代無襯線（目前使用） */
font-family: 'Inter', 'Noto Sans TC', sans-serif;
```

涉及選擇器：`.sidebar-brand`、`h1-h6`、`.hero-title`、`.post-card-title`、`.section-title`、`.post-header .post-title`

**4. 調整字級對照表**

| 選擇器 | 手寫風字級 | 無襯線字級 |
|--------|-----------|-----------|
| `h1` | `2.6rem` | `2rem` |
| `h2` | `2rem` | `1.5rem` |
| `h3` | `1.6rem` | `1.25rem` |
| `.hero-title` | `3rem` | `2.2rem` |
| `.sidebar-brand` | `1.8rem` | `1.4rem` |
| `.post-card-title` | `1.4rem` | `1.15rem` |
| `.section-title` | `1.8rem` | `1.5rem` |
| `.post-header .post-title` | `2.6rem` | `2rem` |
