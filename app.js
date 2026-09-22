/**
 * app.js - Aplikasi Utama Nested Fishbone Diagram
 */

import { layoutFishbone } from './fishbone-layout.js';
import { findPathToRoot, generateCausalityText } from './causality.js';
import { sampleData, treeToOutline, outlineToTree, diagramThemes } from './model.js';

// Application State
let currentTree = JSON.parse(JSON.stringify(sampleData));
let selectedNodeId = null;
let currentCausalityTab = 'forward'; // 'forward' | 'reverse'
let zoomScale = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startPan = { x: 0, y: 0 };
let activeModalAction = null; // 'add' | 'edit'

// DOM Elements
const svgEl = document.getElementById('fishbone-svg');
const viewportEl = document.getElementById('svg-viewport');
const outlineArea = document.getElementById('outline-editor');
const selectedToolbar = document.getElementById('selected-node-toolbar');
const selectedNodeLabel = document.getElementById('selected-node-label');
const causalityBody = document.getElementById('causality-body');
const forwardTabBtn = document.getElementById('tab-forward');
const reverseTabBtn = document.getElementById('tab-reverse');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalInput = document.getElementById('modal-input');
const modalOkBtn = document.getElementById('modal-ok');
const modalCancelBtn = document.getElementById('modal-cancel');

let idCounter = 1;

// ─── Render Diagram ────────────────────────────────────────────
export function renderDiagram() {
  viewportEl.innerHTML = '';

  const layout = layoutFishbone(currentTree);
  const activePath = selectedNodeId ? findPathToRoot(selectedNodeId, currentTree) : [];
  const activeNodeIds = new Set(activePath.map(n => n.id));

  // Auto-fit jika baru pertama kali
  if (panX === 0 && panY === 0 && zoomScale === 1) {
    fitView(layout.bounds);
  } else {
    updateTransform();
  }

  // 1. Defs (filter glow & fish head gradient sesuai tema diagram)
  const currentDiagKey = document.documentElement.getAttribute('data-diagram-theme') || 'pure_classic';
  const themeColors = diagramThemes[currentDiagKey] || diagramThemes.pure_classic;

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="fishHeadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${themeColors.headGradStart}" />
      <stop offset="100%" stop-color="${themeColors.headGradEnd}" />
    </linearGradient>
    <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
  viewportEl.appendChild(defs);

  // 2. Render Links (Spine, Ribs, Stems)
  const linksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  linksGroup.setAttribute('class', 'links-group');

  layout.links.forEach(link => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', link.x1);
    line.setAttribute('y1', link.y1);
    line.setAttribute('x2', link.x2);
    line.setAttribute('y2', link.y2);

    let cls = 'fishbone-link';
    if (link.isSpine) cls += ' spine';

    // Highlight jika link ini menghubungkan node di dalam activePath
    if (activeNodeIds.has(link.fromId) && (link.toId === 'root' || activeNodeIds.has(link.toId))) {
      cls += ' highlighted';
    } else if (link.isSpine && activePath.length > 0) {
      cls += ' highlighted';
    }

    line.setAttribute('class', cls);
    linksGroup.appendChild(line);
  });
  viewportEl.appendChild(linksGroup);

  // 3. Render Nodes (Badge Pills & Fish Head)
  const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodesGroup.setAttribute('class', 'nodes-group');

  layout.nodes.forEach(node => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    let cls = 'fishbone-node';
    if (node.isHead) cls += ' head';
    if (node.id === selectedNodeId) cls += ' selected';
    if (activeNodeIds.has(node.id)) cls += ' in-path';

    g.setAttribute('class', cls);
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    g.setAttribute('data-id', node.id);

    if (node.isHead) {
      // ── Kepala Ikan (Fish Head Shape) ──
      const hw = node.width;
      const hh = node.height / 2;

      // Badan kepala ikan (siluet aerodinamis mulus tanpa lekukan di depan)
      const headPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      headPath.setAttribute('class', 'fishbone-head-path');
      headPath.setAttribute('d', `
        M 0 ${-hh}
        Q ${hw * 0.6} ${-hh * 0.8} ${hw} 0
        Q ${hw * 0.6} ${hh * 0.8} 0 ${hh}
        Z
      `);
      headPath.setAttribute('transform', `translate(0, ${hh})`);
      g.appendChild(headPath);

      // Teks di dalam kepala ikan (terpusat elegan tanpa dekorasi wajah)
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'head-text');
      const lines = node.lines || [node.text];
      const lineHeight = 24;
      const startDy = -(lines.length - 1) * lineHeight / 2;

      lines.forEach((l, idx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', hw * 0.46);
        tspan.setAttribute('y', hh);
        tspan.setAttribute('dy', `${startDy + idx * lineHeight}px`);
        tspan.textContent = l;
        text.appendChild(tspan);
      });
      g.appendChild(text);

    } else {
      // ── Standard Badge Pill ──
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', node.width);
      rect.setAttribute('height', node.height);
      rect.setAttribute('rx', '6');
      rect.setAttribute('ry', '6');
      g.appendChild(rect);

      // Teks di dalam badge (Auto-wrap / Multiline)
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const lines = node.lines || [node.text];
      const lineHeight = 14;
      const startDy = -(lines.length - 1) * lineHeight / 2;

      lines.forEach((l, idx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', node.width / 2);
        tspan.setAttribute('y', node.height / 2 + 1);
        tspan.setAttribute('dy', `${startDy + idx * lineHeight}px`);
        tspan.textContent = l;
        text.appendChild(tspan);
      });
      g.appendChild(text);
    }

    // Event Klik Node
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      selectNode(node.id, node.text);
    });

    nodesGroup.appendChild(g);
  });
  viewportEl.appendChild(nodesGroup);

  updateCausalityUI(activePath);
}

// ─── Selection & Causality ─────────────────────────────────────
function selectNode(nodeId, nodeText) {
  selectedNodeId = nodeId;
  selectedToolbar.classList.add('show');
  selectedNodeLabel.textContent = nodeText;

  renderDiagram();
}

function clearSelection() {
  selectedNodeId = null;
  selectedToolbar.classList.remove('show');
  renderDiagram();
}

function updateCausalityUI(path) {
  if (!path || path.length === 0) {
    causalityBody.innerHTML = `
      <div class="empty-state">
        👈 Klik salah satu node/penyebab di diagram untuk melihat rantai kausalitas ("Karena... maka..." & "Kenapa... karena...").
      </div>
    `;
    return;
  }

  const { forward, reverse } = generateCausalityText(path);

  if (currentCausalityTab === 'forward') {
    let fwdHtml = `<div class="causality-reverse-list">`;
    forward.forEach(item => {
      fwdHtml += `
        <div class="why-step">
          <span class="why-q">${item.cause}</span>
          <span class="why-a">👉 <strong>${item.effect}</strong></span>
        </div>
      `;
    });
    fwdHtml += `</div>`;
    causalityBody.innerHTML = fwdHtml;
  } else {
    let revHtml = `<div class="causality-reverse-list">`;
    reverse.forEach(item => {
      revHtml += `
        <div class="why-step">
          <span class="why-q">${item.question}</span>
          <span class="why-a">👉 <strong>${item.answer}</strong></span>
        </div>
      `;
    });
    revHtml += `</div>`;
    causalityBody.innerHTML = revHtml;
  }
}

function formatForwardText(text) {
  return text.replace(/"([^"]+)"/g, '<strong>$1</strong>');
}

// ─── Zoom & Pan ────────────────────────────────────────────────
function updateTransform() {
  viewportEl.setAttribute('transform', `translate(${panX}, ${panY}) scale(${zoomScale})`);
}

function fitView(bounds) {
  const container = document.getElementById('canvas-container');
  const cw = container.clientWidth || 900;
  const ch = container.clientHeight || 550;

  const bw = bounds.width;
  const bh = bounds.height;

  const scale = Math.min(cw / (bw + 120), ch / (bh + 120), 1.2);
  zoomScale = Math.max(0.15, scale);

  panX = (cw - bw * zoomScale) / 2 - bounds.minX * zoomScale;
  panY = (ch - bh * zoomScale) / 2 - bounds.minY * zoomScale;

  updateTransform();
}

function setupZoomPan() {
  const container = document.getElementById('canvas-container');

  container.addEventListener('mousedown', (e) => {
    if (e.target.closest('.fishbone-node')) return;
    isPanning = true;
    startPan = { x: e.clientX - panX, y: e.clientY - panY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = e.clientX - startPan.x;
    panY = e.clientY - startPan.y;
    updateTransform();
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
  });

  // Touch Support (Pan dengan 1 jari & Pinch-to-zoom dengan 2 jari)
  let initialPinchDist = null;
  let initialScale = zoomScale;

  container.addEventListener('touchstart', (e) => {
    if (e.target.closest('.fishbone-node')) return;
    if (e.touches.length === 1) {
      isPanning = true;
      startPan = { x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY };
    } else if (e.touches.length === 2) {
      isPanning = false;
      initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialScale = zoomScale;
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (isPanning && e.touches.length === 1) {
      panX = e.touches[0].clientX - startPan.x;
      panY = e.touches[0].clientY - startPan.y;
      updateTransform();
    } else if (e.touches.length === 2 && initialPinchDist) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / initialPinchDist;
      zoomScale = Math.min(Math.max(0.15, initialScale * ratio), 3.0);
      updateTransform();
    }
  }, { passive: false });

  container.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      isPanning = false;
      initialPinchDist = null;
    } else if (e.touches.length === 1) {
      initialPinchDist = null;
      isPanning = true;
      startPan = { x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY };
    }
  });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(0.2, zoomScale * zoomFactor), 3.0);

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    panX = mouseX - (mouseX - panX) * (newScale / zoomScale);
    panY = mouseY - (mouseY - panY) * (newScale / zoomScale);
    zoomScale = newScale;

    updateTransform();
  }, { passive: false });

  // Deselect saat klik background
  container.addEventListener('click', (e) => {
    if (!e.target.closest('.fishbone-node')) {
      clearSelection();
    }
  });

  // Zoom Buttons
  document.getElementById('zoom-in').addEventListener('click', () => {
    zoomScale = Math.min(3.0, zoomScale * 1.2);
    updateTransform();
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    zoomScale = Math.max(0.2, zoomScale / 1.2);
    updateTransform();
  });

  document.getElementById('zoom-reset').addEventListener('click', () => {
    const layout = layoutFishbone(currentTree);
    fitView(layout.bounds);
  });
}

// ─── Tree Editing Logic ────────────────────────────────────────
function findNodeById(current, id) {
  if (current.id === id) return current;
  if (current.children) {
    for (const child of current.children) {
      const res = findNodeById(child, id);
      if (res) return res;
    }
  }
  return null;
}

function removeNodeById(parent, id) {
  if (!parent.children) return false;
  const idx = parent.children.findIndex(c => c.id === id);
  if (idx !== -1) {
    parent.children.splice(idx, 1);
    return true;
  }
  for (const child of parent.children) {
    if (removeNodeById(child, id)) return true;
  }
  return false;
}

function syncFromTreeToOutline() {
  outlineArea.value = treeToOutline(currentTree);
}

function setupNodeActions() {
  document.getElementById('btn-add-child').addEventListener('click', () => {
    if (!selectedNodeId) return;
    activeModalAction = 'add';
    modalTitle.textContent = 'Tambah Sub-Penyebab / Cabang';
    modalInput.value = '';
    modalInput.placeholder = 'Contoh: Masalah Komponen';
    modalOverlay.classList.add('show');
    modalInput.focus();
  });

  document.getElementById('btn-edit-node').addEventListener('click', () => {
    if (!selectedNodeId) return;
    const node = findNodeById(currentTree, selectedNodeId);
    if (!node) return;
    activeModalAction = 'edit';
    modalTitle.textContent = 'Edit Teks Node';
    modalInput.value = node.text;
    modalOverlay.classList.add('show');
    modalInput.focus();
    modalInput.select();
  });

  document.getElementById('btn-delete-node').addEventListener('click', () => {
    if (!selectedNodeId) return;
    if (selectedNodeId === currentTree.id) {
      alert('Node Head (Masalah Utama) tidak dapat dihapus!');
      return;
    }
    if (confirm('Hapus node ini beserta seluruh sub-cabangnya?')) {
      removeNodeById(currentTree, selectedNodeId);
      selectedNodeId = null;
      selectedToolbar.classList.remove('show');
      syncFromTreeToOutline();
      renderDiagram();
    }
  });

  modalOkBtn.addEventListener('click', handleModalSubmit);
  modalCancelBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('show');
  });

  modalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleModalSubmit();
    if (e.key === 'Escape') modalOverlay.classList.remove('show');
  });
}

function handleModalSubmit() {
  const val = modalInput.value.trim();
  if (!val) return;

  if (activeModalAction === 'add') {
    const parent = findNodeById(currentTree, selectedNodeId);
    if (parent) {
      if (!parent.children) parent.children = [];
      const newChild = {
        id: `node-${Date.now()}-${idCounter++}`,
        text: val,
        children: []
      };
      parent.children.push(newChild);
      selectedNodeId = newChild.id;
    }
  } else if (activeModalAction === 'edit') {
    const node = findNodeById(currentTree, selectedNodeId);
    if (node) node.text = val;
  }

  modalOverlay.classList.remove('show');
  syncFromTreeToOutline();
  renderDiagram();
}

// ─── Outline Editor Sync ───────────────────────────────────────
function setupOutlineSync() {
  syncFromTreeToOutline();

  let debounceTimer = null;
  outlineArea.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const parsed = outlineToTree(outlineArea.value);
      if (parsed) {
        currentTree = parsed;
        renderDiagram();
      }
    }, 300);
  });
}

// ─── Export Features (SVG & PNG) ───────────────────────────────
function setupExport() {
  document.getElementById('export-svg').addEventListener('click', () => {
    const layout = layoutFishbone(currentTree);
    const bounds = layout.bounds;
    const currentDiagKey = document.documentElement.getAttribute('data-diagram-theme') || 'pure_classic';
    const themeColors = diagramThemes[currentDiagKey] || diagramThemes.pure_classic;

    const cloneSvg = svgEl.cloneNode(true);
    cloneSvg.setAttribute('viewBox', `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`);
    cloneSvg.setAttribute('width', bounds.width);
    cloneSvg.setAttribute('height', bounds.height);

    // Style inline
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .fishbone-link { stroke: ${themeColors.lineColor}; stroke-width: 2.5; stroke-linecap: round; }
      .fishbone-link.spine { stroke-width: 4; }
      .fishbone-node rect { fill: ${themeColors.badgeBg}; stroke: ${themeColors.badgeBorder}; stroke-width: 1.5; rx: 6px; ry: 6px; }
      .fishbone-head-path { fill: url(#fishHeadGrad); stroke: ${themeColors.headStroke}; stroke-width: 2.5; }
      .fishbone-node text { fill: ${themeColors.badgeText}; font-size: 11.5px; font-weight: 600; font-family: sans-serif; text-anchor: middle; dominant-baseline: central; }
      .head-text { fill: ${themeColors.badgeText}; font-size: 16px; font-weight: 700; font-family: sans-serif; text-anchor: middle; dominant-baseline: central; }
      .fishbone-node tspan { text-anchor: middle; }
    `;
    cloneSvg.prepend(styleEl);

    // Hilangkan transformasi pan/zoom pada clone
    const cloneViewport = cloneSvg.querySelector('#svg-viewport');
    cloneViewport.removeAttribute('transform');

    const svgData = new XMLSerializer().serializeToString(cloneSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, 'fishbone-diagram.svg');
  });

  document.getElementById('export-png').addEventListener('click', () => {
    const layout = layoutFishbone(currentTree);
    const bounds = layout.bounds;
    const currentDiagKey = document.documentElement.getAttribute('data-diagram-theme') || 'pure_classic';
    const themeColors = diagramThemes[currentDiagKey] || diagramThemes.pure_classic;

    const cloneSvg = svgEl.cloneNode(true);
    cloneSvg.setAttribute('viewBox', `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`);
    cloneSvg.setAttribute('width', bounds.width);
    cloneSvg.setAttribute('height', bounds.height);

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .fishbone-link { stroke: ${themeColors.lineColor}; stroke-width: 2.5; stroke-linecap: round; }
      .fishbone-link.spine { stroke-width: 4; }
      .fishbone-node rect { fill: ${themeColors.badgeBg}; stroke: ${themeColors.badgeBorder}; stroke-width: 1.5; rx: 6px; ry: 6px; }
      .fishbone-head-path { fill: url(#fishHeadGrad); stroke: ${themeColors.headStroke}; stroke-width: 2.5; }
      .fishbone-node text { fill: ${themeColors.badgeText}; font-size: 11.5px; font-weight: 600; font-family: sans-serif; text-anchor: middle; dominant-baseline: central; }
      .head-text { fill: ${themeColors.badgeText}; font-size: 16px; font-weight: 700; font-family: sans-serif; text-anchor: middle; dominant-baseline: central; }
      .fishbone-node tspan { text-anchor: middle; }
    `;
    cloneSvg.prepend(styleEl);

    const cloneViewport = cloneSvg.querySelector('#svg-viewport');
    cloneViewport.removeAttribute('transform');

    const svgData = new XMLSerializer().serializeToString(cloneSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleFactor = 2; // Hi-DPI
      canvas.width = bounds.width * scaleFactor;
      canvas.height = bounds.height * scaleFactor;
      const ctx = canvas.getContext('2d');
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = isDark ? '#090d16' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((pngBlob) => {
        downloadBlob(pngBlob, 'fishbone-diagram.png');
        URL.revokeObjectURL(blobURL);
      });
    };
    img.src = blobURL;
  });

  document.getElementById('export-json').addEventListener('click', () => {
    const jsonStr = JSON.stringify(currentTree, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, 'fishbone-data.json');
  });

  document.getElementById('import-json-btn').addEventListener('click', () => {
    document.getElementById('import-json-input').click();
  });

  document.getElementById('import-json-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data && data.text) {
          currentTree = data;
          syncFromTreeToOutline();
          renderDiagram();
        } else {
          alert('Format JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Causality Tabs & Sidebar Toggle ───────────────────────────
function setupTabs() {
  forwardTabBtn.addEventListener('click', () => {
    currentCausalityTab = 'forward';
    forwardTabBtn.classList.add('active');
    reverseTabBtn.classList.remove('active');
    const activePath = selectedNodeId ? findPathToRoot(selectedNodeId, currentTree) : [];
    updateCausalityUI(activePath);
  });

  reverseTabBtn.addEventListener('click', () => {
    currentCausalityTab = 'reverse';
    reverseTabBtn.classList.add('active');
    forwardTabBtn.classList.remove('active');
    const activePath = selectedNodeId ? findPathToRoot(selectedNodeId, currentTree) : [];
    updateCausalityUI(activePath);
  });

  const sidebarEl = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');

  // Di mobile (layar <= 768px), sidebar awal dalam keadaan tertutup
  if (window.innerWidth <= 768) {
    sidebarEl.classList.add('collapsed');
  }

  document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
    const isCollapsed = sidebarEl.classList.toggle('collapsed');
    if (sidebarBackdrop) {
      if (!isCollapsed && window.innerWidth <= 768) {
        sidebarBackdrop.classList.add('show');
      } else {
        sidebarBackdrop.classList.remove('show');
      }
    }
  });

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
      sidebarEl.classList.add('collapsed');
      sidebarBackdrop.classList.remove('show');
    });
  }

  document.getElementById('btn-toggle-causality').addEventListener('click', () => {
    document.getElementById('causality-panel').classList.toggle('minimized');
  });
}

// ─── Theme Management (Light/Dark Mode + Diagram Styles) ───────
function setupTheme() {
  const themeBtn = document.getElementById('btn-toggle-theme');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  const diagramThemeSelect = document.getElementById('diagram-theme-select');

  // 1. UI Theme (Light / Dark)
  const savedTheme = localStorage.getItem('fishbone_theme') || 'light';
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('fishbone_theme', newTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeIcon) themeIcon.textContent = '☀️';
      if (themeText) themeText.textContent = 'Light Mode';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeIcon) themeIcon.textContent = '🌙';
      if (themeText) themeText.textContent = 'Dark Mode';
    }
  }

  // 2. Diagram Color Themes (Default: Pure Classic - Garis Hitam & Kotak Putih)
  const savedDiagramTheme = localStorage.getItem('fishbone_diagram_theme') || 'pure_classic';
  if (diagramThemeSelect) {
    diagramThemeSelect.value = savedDiagramTheme;
    document.documentElement.setAttribute('data-diagram-theme', savedDiagramTheme);
    diagramThemeSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      document.documentElement.setAttribute('data-diagram-theme', selected);
      localStorage.setItem('fishbone_diagram_theme', selected);
      renderDiagram();
    });
  }
}

// ─── Init ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  setupZoomPan();
  setupOutlineSync();
  setupNodeActions();
  setupExport();
  setupTabs();

  renderDiagram();
});
