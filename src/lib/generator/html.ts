import type {
  ProjectDocumentation,
  FileDocumentation,
  DocumentedSymbol,
  DocTag,
} from "../../types/index.js";

/**
 * 프로젝트 문서를 단일 HTML 페이지로 생성한다.
 * @param project - 프로젝트 문서 정보
 * @returns HTML 문자열
 */
export function generateHTML(project: ProjectDocumentation): string {
  const files = project.files.filter((f) => f.symbols.length > 0);
  const nav = renderNav(files);
  const content = files.map(renderFileHTML).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation — oxdoc</title>
  <style>${CSS}</style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>oxdoc</h1>
      <span class="version">v${project.metadata.version}</span>
    </div>
    <input type="text" id="search" placeholder="Search symbols..." autocomplete="off">
    <nav id="nav">${nav}</nav>
  </aside>
  <main>
    <header>
      <p class="meta">Generated at ${project.metadata.generatedAt} · ${project.files.length} files · ${project.files.reduce((s, f) => s + f.symbols.length, 0)} symbols</p>
    </header>
${content}
  </main>
  <script>${JS}</script>
</body>
</html>`;
}

function renderNav(files: FileDocumentation[]): string {
  return files
    .map((f) => {
      const id = slugify(f.filePath);
      const symbols = f.symbols
        .filter((s) => s.exported)
        .map(
          (s) =>
            `<li><a href="#${slugify(f.filePath + "-" + s.name)}" data-name="${s.name.toLowerCase()}">${escapeHtml(s.name)}</a></li>`,
        )
        .join("");
      return `<details open><summary><a href="#${id}">${escapeHtml(f.filePath)}</a></summary><ul>${symbols}</ul></details>`;
    })
    .join("");
}

function renderFileHTML(file: FileDocumentation): string {
  const id = slugify(file.filePath);
  const exported = file.symbols.filter((s) => s.exported);
  const internal = file.symbols.filter((s) => !s.exported);

  let html = `<section id="${id}" class="file-section">
  <h2>${escapeHtml(file.filePath)}</h2>`;

  if (file.fileDoc?.description) {
    html += `<p class="file-desc">${escapeHtml(file.fileDoc.description)}</p>`;
  }

  for (const sym of exported) {
    html += renderSymbolHTML(sym, file.filePath);
  }

  if (internal.length > 0) {
    html += `<h3 class="internal-header">Internal</h3>`;
    for (const sym of internal) {
      html += renderSymbolHTML(sym, file.filePath);
    }
  }

  html += `</section>`;
  return html;
}

function renderSymbolHTML(
  symbol: DocumentedSymbol,
  filePath: string,
): string {
  const id = slugify(filePath + "-" + symbol.name);
  const kindClass = symbol.kind;

  let html = `<article id="${id}" class="symbol ${kindClass}">
  <div class="symbol-header">
    <code class="signature">${escapeHtml(symbol.signature || symbol.name)}</code>
    <span class="kind-badge">${symbol.kind}</span>
  </div>`;

  if (symbol.doc) {
    if (symbol.doc.description) {
      html += `<p class="description">${escapeHtml(symbol.doc.description)}</p>`;
    }

    const params = symbol.doc.tags.filter((t) => t.tag === "param");
    if (params.length > 0) {
      html += `<div class="params"><h4>Parameters</h4><table><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>`;
      for (const p of params) {
        html += `<tr><td><code>${escapeHtml(p.name)}</code></td><td>${p.type ? `<code>${escapeHtml(p.type)}</code>` : "-"}</td><td>${escapeHtml(p.description)}</td></tr>`;
      }
      html += `</tbody></table></div>`;
    }

    const returns = symbol.doc.tags.find(
      (t) => t.tag === "returns" || t.tag === "return",
    );
    if (returns) {
      html += `<div class="returns"><h4>Returns</h4><p>${returns.type ? `<code>${escapeHtml(returns.type)}</code> ` : ""}${escapeHtml(returns.description)}</p></div>`;
    }

    const examples = symbol.doc.tags.filter((t) => t.tag === "example");
    for (const ex of examples) {
      html += `<div class="example"><h4>Example</h4><pre><code>${escapeHtml(extractExampleCode(ex))}</code></pre></div>`;
    }

    const deprecated = symbol.doc.tags.find((t) => t.tag === "deprecated");
    if (deprecated) {
      html += `<div class="deprecated">⚠️ Deprecated${deprecated.description ? `: ${escapeHtml(deprecated.description)}` : ""}</div>`;
    }

    const since = symbol.doc.tags.find((t) => t.tag === "since");
    if (since) {
      html += `<span class="since">Since ${escapeHtml(since.description)}</span>`;
    }
  }

  if (symbol.children && symbol.children.length > 0) {
    html += `<div class="members"><h4>Members</h4>`;
    for (const child of symbol.children) {
      html += `<div class="member">
        <code>${escapeHtml(child.signature || child.name)}</code>
        ${child.doc?.description ? `<p>${escapeHtml(child.doc.description)}</p>` : ""}
      </div>`;
    }
    html += `</div>`;
  }

  html += `</article>`;
  return html;
}

function extractExampleCode(tag: DocTag): string {
  const desc = tag.description.trim();
  const fenceMatch = desc.match(
    /```(?:ts|typescript|js|javascript)?\s*\n?([\s\S]*?)```/,
  );
  if (fenceMatch) return fenceMatch[1].trim();
  return desc;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CSS = `
:root {
  --bg: #0d1117;
  --bg-secondary: #161b22;
  --border: #30363d;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --accent: #58a6ff;
  --accent-subtle: #1f6feb33;
  --green: #3fb950;
  --yellow: #d29922;
  --red: #f85149;
  --code-bg: #1c2128;
  --sidebar-w: 280px;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  display: flex;
  min-height: 100vh;
  line-height: 1.6;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-w);
  height: 100vh;
  overflow-y: auto;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 16px;
}
.sidebar-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
.sidebar-header h1 { font-size: 18px; color: var(--accent); }
.version { font-size: 12px; color: var(--text-muted); }
#search {
  width: 100%;
  padding: 6px 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 13px;
  margin-bottom: 12px;
  outline: none;
}
#search:focus { border-color: var(--accent); }
nav details { margin-bottom: 4px; }
nav summary {
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 0;
  color: var(--text-muted);
  list-style: none;
}
nav summary::-webkit-details-marker { display: none; }
nav summary::before { content: "▸ "; }
nav details[open] > summary::before { content: "▾ "; }
nav summary a { color: inherit; text-decoration: none; }
nav summary a:hover { color: var(--accent); }
nav ul { list-style: none; padding-left: 12px; }
nav li { font-size: 12px; line-height: 1.8; }
nav li a { color: var(--text-muted); text-decoration: none; }
nav li a:hover { color: var(--accent); }
main {
  margin-left: var(--sidebar-w);
  padding: 32px 48px;
  max-width: 900px;
  flex: 1;
}
header { margin-bottom: 32px; }
.meta { font-size: 13px; color: var(--text-muted); }
.file-section { margin-bottom: 48px; }
.file-section h2 {
  font-size: 18px;
  color: var(--accent);
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 16px;
}
.file-desc { color: var(--text-muted); margin-bottom: 16px; }
.symbol {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.symbol-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.signature {
  font-size: 14px;
  background: var(--code-bg);
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
}
.kind-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--accent-subtle);
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}
.description { margin-bottom: 12px; color: var(--text); }
h4 { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px; }
th { text-align: left; padding: 6px 8px; border-bottom: 2px solid var(--border); color: var(--text-muted); }
td { padding: 6px 8px; border-bottom: 1px solid var(--border); }
td code, th code { font-size: 12px; }
.example pre {
  background: var(--code-bg);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}
.deprecated {
  background: #f8514922;
  border: 1px solid var(--red);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 8px;
}
.since { font-size: 11px; color: var(--text-muted); }
.internal-header { font-size: 14px; color: var(--text-muted); margin: 16px 0 8px; }
.member {
  padding: 8px;
  border-left: 2px solid var(--border);
  margin-bottom: 4px;
  margin-left: 8px;
}
.member code { font-size: 13px; }
.member p { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.returns, .params, .members { margin-bottom: 12px; }
@media (max-width: 768px) {
  .sidebar { display: none; }
  main { margin-left: 0; padding: 16px; }
}
`;

const JS = `
document.getElementById('search').addEventListener('input', function(e) {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('nav li').forEach(function(li) {
    const a = li.querySelector('a');
    li.style.display = a && a.dataset.name.includes(q) ? '' : 'none';
  });
  document.querySelectorAll('nav details').forEach(function(d) {
    const visible = d.querySelectorAll('li[style=""]').length > 0 || d.querySelectorAll('li:not([style])').length > 0;
    d.style.display = q === '' || visible ? '' : 'none';
    if (q) d.open = true;
  });
});
`;
