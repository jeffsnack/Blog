/* ============================================
   Posts Index — 自動載入文章索引 & 標籤過濾
   ============================================ */

// ---- 文章資料（由 loadPosts() 自動填入） ----
let POSTS = [];
let _postsLoaded = false;
let _postsLoadPromise = null;

/**
 * 解析簡易 front-matter（--- 包裹的區段）
 * 回傳 { meta: {...}, content: "..." }
 */
function parseFrontMatterIndex(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { meta: {}, content: raw };

  const metaBlock = match[1];
  const meta = {};

  metaBlock.split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();

    // Handle arrays like [tag1, tag2]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    }
    meta[key] = val;
  });

  return { meta, content: raw.slice(match[0].length) };
}

/**
 * 估算閱讀時間
 */
function estimateReadTime(content) {
  const chars = content.replace(/\s/g, '').length;
  const minutes = Math.max(1, Math.ceil(chars / 500));
  return `${minutes} min read`;
}

/**
 * 載入所有文章的 front-matter
 * 流程：fetch manifest.json → 逐一 fetch .md → 解析 front-matter
 */
async function loadPosts() {
  if (_postsLoaded) return POSTS;
  if (_postsLoadPromise) return _postsLoadPromise;

  _postsLoadPromise = (async () => {
    try {
      const resp = await fetch('posts/manifest.json');
      if (!resp.ok) throw new Error('manifest.json not found');
      const slugs = await resp.json();

      const postPromises = slugs.map(async (slug) => {
        try {
          const mdResp = await fetch(`posts/${encodeURIComponent(slug)}.md`);
          if (!mdResp.ok) return null;
          const raw = await mdResp.text();
          const { meta, content } = parseFrontMatterIndex(raw);

          return {
            slug,
            title: meta.title || slug,
            date: meta.date || '',
            tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
            readTime: meta.readTime || estimateReadTime(content),
            summary: meta.summary || '',
          };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(postPromises);
      POSTS = results.filter(Boolean);

      // 按日期倒序排列（有日期的在前）
      POSTS.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      });

      _postsLoaded = true;
      return POSTS;
    } catch (err) {
      console.error('Failed to load posts:', err);
      POSTS = [];
      _postsLoaded = true;
      return POSTS;
    }
  })();

  return _postsLoadPromise;
}

// ---- Helper Functions ----

/** 取得所有唯一標籤 */
function getAllTags() {
  const tagSet = new Set();
  POSTS.forEach(p => p.tags.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

/** 依標籤過濾文章（null = 全部） */
function filterPostsByTag(tag) {
  if (!tag) return POSTS;
  return POSTS.filter(p => p.tags.includes(tag));
}

/** 格式化日期 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 依 slug 取得文章資料 */
function getPostBySlug(slug) {
  return POSTS.find(p => p.slug === slug) || null;
}

/** 建立文章卡片 HTML */
function createPostCardHTML(post) {
  const tagsHTML = post.tags
    .map(t => `<span class="tag">${t}</span>`)
    .join('');

  return `
    <a href="post.html?slug=${post.slug}" class="post-card">
      <div class="post-card-title">${post.title}</div>
      <div class="post-card-meta">
        <span>${formatDate(post.date)}</span>
        <span class="dot"></span>
        <span>${post.readTime}</span>
      </div>
      ${post.summary ? `<div class="post-card-summary">${post.summary}</div>` : ''}
      <div style="margin-top: 0.6rem">${tagsHTML}</div>
      <span class="post-card-arrow"><i class="bi bi-arrow-right-short"></i></span>
    </a>
  `;
}

/** 渲染文章列表到指定容器 */
function renderPosts(containerId, posts, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const list = limit ? posts.slice(0, limit) : posts;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-journal-text"></i>
        <p>目前還沒有文章，敬請期待！</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(createPostCardHTML).join('');
}

/** 渲染標籤過濾按鈕 */
function renderTagFilters(containerId, onFilter) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const tags = getAllTags();
  let activeTag = null;

  const allBtn = document.createElement('button');
  allBtn.className = 'tag active';
  allBtn.textContent = '全部';
  allBtn.addEventListener('click', () => {
    activeTag = null;
    updateActiveState();
    onFilter(null);
  });
  container.appendChild(allBtn);

  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag';
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      activeTag = tag;
      updateActiveState();
      onFilter(tag);
    });
    container.appendChild(btn);
  });

  function updateActiveState() {
    container.querySelectorAll('.tag').forEach(btn => {
      btn.classList.toggle(
        'active',
        (activeTag === null && btn.textContent === '全部') ||
        btn.textContent === activeTag
      );
    });
  }
}
