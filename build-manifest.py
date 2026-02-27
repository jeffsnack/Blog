"""
build-manifest.py — 自動掃描 posts/ 資料夾並生成 manifest.json
使用方式：在專案根目錄執行 python build-manifest.py
"""
import os
import json

POSTS_DIR = os.path.join(os.path.dirname(__file__), 'posts')
MANIFEST_PATH = os.path.join(POSTS_DIR, 'manifest.json')

def build():
    slugs = []
    for f in sorted(os.listdir(POSTS_DIR), reverse=True):
        if f.endswith('.md'):
            slugs.append(f[:-3])  # 去掉 .md 副檔名

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as fp:
        json.dump(slugs, fp, ensure_ascii=False, indent=2)

    print(f'✅ manifest.json 已更新，共 {len(slugs)} 篇文章：')
    for s in slugs:
        print(f'   - {s}')

if __name__ == '__main__':
    build()
