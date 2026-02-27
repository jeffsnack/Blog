/* ============================================
   Post Loader — Markdown 文章載入 & 渲染
   使用 marked.js + Prism.js
   ============================================ */

/**
 * 解析簡易 front-matter (YAML between ---)
 * 回傳 { meta: {...}, content: "markdown body" }
 */
function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const metaBlock = match[1];
  const content = match[2];
  const meta = {};

  metaBlock.split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();

    // Handle arrays like [tag1, tag2]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    }

    meta[key] = val;
  });

  return { meta, content };
}

/**
 * 載入並渲染一篇 Markdown 文章
 * @param {string} slug — 文章 slug
 * @param {object} postData — 來自 posts-index.js 的文章資料
 */
async function loadAndRenderPost(slug, postData) {
  const headerEl = document.getElementById('post-header');
  const contentEl = document.getElementById('post-content');

  if (!headerEl || !contentEl) return;

  // Show loading state
  contentEl.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const resp = await fetch(`posts/${encodeURIComponent(slug)}.md`);
    if (!resp.ok) throw new Error(`文章不存在 (${resp.status})`);

    const raw = await resp.text();
    const { meta, content } = parseFrontMatter(raw);

    // Use postData from index, or fallback to front-matter
    const title = (postData && postData.title) || meta.title || slug;
    const date = (postData && postData.date) || meta.date || '';
    const tags = (postData && postData.tags) || meta.tags || [];
    const readTime = (postData && postData.readTime) || meta.readTime || '';

    // Render header
    const tagsHTML = (Array.isArray(tags) ? tags : [tags])
      .map(t => `<span class="tag">${t}</span>`)
      .join('');

    headerEl.innerHTML = `
      <h1 class="post-title">${title}</h1>
      <div class="post-meta">
        ${date ? `<span>${formatDate(date)}</span>` : ''}
        ${date && readTime ? '<span class="dot"></span>' : ''}
        ${readTime ? `<span>${readTime}</span>` : ''}
      </div>
      ${tagsHTML ? `<div style="margin-top: 0.5rem">${tagsHTML}</div>` : ''}
    `;

    // Configure marked
    marked.setOptions({
      breaks: true,
      gfm: true,
      highlight: function (code, lang) {
        if (Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      },
    });

    // Render markdown
    contentEl.innerHTML = marked.parse(content);

    // Re-run Prism on any code blocks that marked didn't highlight
    contentEl.querySelectorAll('pre code').forEach(block => {
      Prism.highlightElement(block);
    });

    // Add copy buttons to code blocks
    contentEl.querySelectorAll('pre').forEach(pre => {
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(() => {
          btn.innerHTML = '<i class="bi bi-check2"></i> Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
            btn.classList.remove('copied');
          }, 2000);
        });
      });
      pre.appendChild(btn);
    });

    // Build sidebar TOC from headings
    buildSidebarTOC(contentEl);

    // Update page title
    document.title = `${title} — Dyson's Notebook`;
  } catch (err) {
    // Hide TOC on error
    const tocContainer = document.getElementById('article-toc');
    if (tocContainer) tocContainer.style.display = 'none';

    contentEl.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle"></i>
        <p>無法載入文章：${err.message}</p>
        <a href="writing.html" class="back-link" style="justify-content: center; margin-top: 1rem;">
          <i class="bi bi-arrow-left"></i> 返回文章列表
        </a>
      </div>
    `;
  }
}

/**
 * 建立側邊欄目錄 (Table of Contents) 並追蹤閱讀進度
 * @param {HTMLElement} contentEl — 文章內容容器
 */
function buildSidebarTOC(contentEl) {
  const tocContainer = document.getElementById('article-toc');
  const tocList = document.getElementById('toc-list');
  if (!tocContainer || !tocList) return;

  // 抓取 h2 和 h3 標題
  const headings = contentEl.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    tocContainer.style.display = 'none';
    return;
  }

  // 為每個標題加 id（如果沒有）
  headings.forEach((h, i) => {
    if (!h.id) {
      h.id = 'heading-' + i;
    }
  });

  // 產生 TOC 列表
  let html = '';
  headings.forEach((h, i) => {
    const level = h.tagName.toLowerCase(); // h2 or h3
    const text = h.textContent.trim();
    const id = h.id;
    html += `<li class="toc-${level}" data-target="${id}"><a href="#${id}">${text}</a></li>`;
  });
  tocList.innerHTML = html;
  tocContainer.style.display = '';

  // 點擊平滑滾動
  tocList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      const targetY = target.getBoundingClientRect().top + window.pageYOffset - 20;
      const startY = window.pageYOffset;
      const diff = targetY - startY;
      const duration = Math.min(800, Math.max(300, Math.abs(diff) * 0.5));
      let start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        // easeInOutCubic
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        window.scrollTo(0, startY + diff * ease);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    });
  });

  // 使用 IntersectionObserver 追蹤目前閱讀到的標題
  const tocItems = tocList.querySelectorAll('li');
  let currentActive = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tocItems.forEach(item => {
          if (item.dataset.target === id) {
            item.classList.add('active');
            currentActive = item;
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-10% 0px -80% 0px',
    threshold: 0
  });

  headings.forEach(h => observer.observe(h));
}
