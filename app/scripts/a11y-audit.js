/**
 * Auditoría rápida de accesibilidad (WCAG 2.2 AA) para la versión web.
 *
 * Uso: abre la app en el navegador (npm run web), entra en una pantalla y
 * pega este archivo en la consola de las herramientas de desarrollo.
 * Comprueba:
 *  - contraste de texto (4.5:1, o 3:1 en texto grande)
 *  - controles interactivos sin nombre accesible
 *  - objetivos táctiles menores de 24x24 px (WCAG 2.5.8)
 *  - campos de formulario sin etiqueta
 * Los iconos decorativos (aria-hidden) se excluyen.
 */
(() => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(',').map((x) => parseFloat(x)); return { r, g, b, a }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
  const bgOf = (el) => { for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0.5) return c; } return { r: 255, g: 255, b: 255, a: 1 }; };
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.opacity !== '0'; };
  const decorative = (el) => !!el.closest('[aria-hidden="true"]');
  const name = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim();
  const issues = { contrast: [], noName: [], smallTarget: [], unlabeledInput: [] };
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el) || decorative(el)) continue;
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) continue;
    const s = getComputedStyle(el); const fg = parse(s.color); if (!fg) continue;
    const size = parseFloat(s.fontSize); const bold = parseInt(s.fontWeight, 10) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const r = ratio(fg, bgOf(el)); const min = large ? 3 : 4.5;
    if (r < min) { const text = el.textContent.trim().slice(0, 40); const key = text + '|' + r.toFixed(2); if (!seen.has(key)) { seen.add(key); issues.contrast.push(r.toFixed(2) + ' < ' + min + ' :: "' + text + '" (' + s.color + ')'); } }
  }
  for (const el of document.querySelectorAll('button, a[href], [role=button], [role=link], [role=checkbox], [role=radio], [role=tab], input, [tabindex]:not([tabindex="-1"])')) {
    if (!visible(el)) continue;
    const label = name(el);
    if (!label && el.tagName !== 'INPUT') issues.noName.push(el.outerHTML.slice(0, 140));
    const r = el.getBoundingClientRect();
    if ((r.width < 24 || r.height < 24) && el.tagName !== 'INPUT') issues.smallTarget.push(Math.round(r.width) + 'x' + Math.round(r.height) + ' :: ' + label.slice(0, 40));
  }
  for (const input of document.querySelectorAll('input, textarea')) {
    if (!visible(input)) continue;
    if (!input.getAttribute('aria-label') && !input.labels?.length && !input.getAttribute('aria-labelledby')) issues.unlabeledInput.push(input.outerHTML.slice(0, 120));
  }
  return { page: location.pathname, headings: document.querySelectorAll('[role=heading], h1, h2, h3').length, counts: Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, v.length])), issues: Object.fromEntries(Object.entries(issues).filter(([, v]) => v.length).map(([k, v]) => [k, v.slice(0, 5)])) };
})()
