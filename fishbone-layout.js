/**
 * fishbone-layout.js
 * Algoritma Layout Fishbone Bersarang Rekursif (Collision-Free Alternating Ishikawa Layout)
 *
 * Aturan Geometri Kausalitas:
 * 1. Kategori (Environment, Material, Person) SELALU PALING TINGGI dari seluruh parameter di cabangnya.
 * 2. Garis horizontal Parameter 3 SELALU DI TENGAH di antara Parameter 1 dan Parameter 2:
 *    Y_param3 = (Y_param1 + Y_param2) / 2 (menempel tepat di titik tengah diagonal Parameter 2).
 * 3. Parameter 4 selalu LEBIH TINGGI dari Parameter 2 (melangkah naik 55px lebih tinggi dari Parameter 2).
 * 4. Untuk sisi bawah (Bottom): simetris sebaliknya (makin dalam/rendah ke bawah).
 * 5. Auto-wrap teks panjang dengan batas maksimal badge 290px.
 * 6. Bentuk Kepala Ikan SVG presisi untuk Head Parameter.
 */

const BASE_BADGE_HEIGHT = 28;
const HEAD_MIN_HEIGHT = 240; // 3x lipat dari tinggi sebelumnya (80 * 3)
const HEAD_MIN_WIDTH = 260;
const CHAR_WIDTH = 7.2;
const PADDING_X = 14;
const MAX_CHARS_PER_LINE = 28;
const MAX_BADGE_WIDTH = 290;
const RIB_ANGLE = 60 * (Math.PI / 180); // 60 derajat
const DIAGONAL_STEP_H = 80; // Panjang diagonal sub-rib

/**
 * Memecah teks panjang menjadi beberapa baris (auto word-wrap)
 */
export function wrapText(text, maxChars = MAX_CHARS_PER_LINE) {
  if (!text) return [''];
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return [trimmed];

  const words = trimmed.split(/\s+/);
  if (words.length <= 1) {
    const chunks = [];
    for (let i = 0; i < trimmed.length; i += maxChars) {
      chunks.push(trimmed.slice(i, i + maxChars));
    }
    return chunks;
  }

  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if ((currentLine + ' ' + word).length <= maxChars) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

export function measureNode(text, isHead = false) {
  const lines = wrapText(text, isHead ? 24 : MAX_CHARS_PER_LINE);
  const longest = Math.max(...lines.map(l => l.length));

  if (isHead) {
    const width = Math.max(longest * CHAR_WIDTH + 110, HEAD_MIN_WIDTH);
    const height = Math.max((lines.length * 20 + 50) * 3, HEAD_MIN_HEIGHT);
    return { width, height, lines };
  }

  const width = Math.min(MAX_BADGE_WIDTH, Math.max(longest * CHAR_WIDTH + PADDING_X * 2, 70));
  const height = Math.max(BASE_BADGE_HEIGHT, lines.length * 15 + 10);
  return { width, height, lines };
}

/**
 * Menghitung total panjatan vertikal maksimum dari sebuah node ke seluruh keturunannya
 */
function getMaxClimb(node, depth) {
  const children = node.children || [];
  if (children.length === 0) {
    return (depth % 2 === 1) ? DIAGONAL_STEP_H : 0;
  }
  if (depth % 2 === 1) {
    // Diagonal node: naik DIAGONAL_STEP_H ditambah panjatan anak-anaknya dari titik tengah
    const childMax = Math.max(...children.map(c => getMaxClimb(c, depth + 1)));
    return (DIAGONAL_STEP_H / 2) + childMax;
  } else {
    // Horizontal node: anak-anaknya diagonal menanjak
    return Math.max(...children.map(c => getMaxClimb(c, depth + 1)));
  }
}

/**
 * 1. Bottom-Up Subtree Metrics
 */
function computeSubtreeMetrics(node, depth, side) {
  const isHead = (depth === 0);
  const dims = measureNode(node.text, isHead);
  node._w = dims.width;
  node._h = dims.height;
  node._lines = dims.lines;
  node._depth = depth;
  node._side = side;

  const children = node.children || [];

  if (children.length === 0) {
    if (depth % 2 === 1) {
      node._heightSpan = DIAGONAL_STEP_H;
      node._widthSpan = node._w + 40;
    } else {
      node._heightSpan = node._h + 16;
      node._widthSpan = node._w + 70;
    }
    return;
  }

  let sumChildHeight = 0;
  let maxChildHeight = 0;
  let sumChildWidth = 0;
  let maxChildWidth = 0;

  children.forEach(c => {
    computeSubtreeMetrics(c, depth + 1, side);
    sumChildHeight += c._heightSpan;
    maxChildHeight = Math.max(maxChildHeight, c._heightSpan);
    sumChildWidth += c._widthSpan;
    maxChildWidth = Math.max(maxChildWidth, c._widthSpan);
  });

  if (depth % 2 === 1) {
    if (depth === 1) {
      // Rib Kategori Utama:
      // Hitung panjatan maksimum seluruh anak dan cucunya agar KATEGORI SELALU PALING TINGGI
      let maxChildReach = 50;
      let currentDistY = 50;

      children.forEach(child => {
        const slotH = child._heightSpan;
        const midDistY = currentDistY + slotH / 2;
        currentDistY += slotH;

        const childClimb = getMaxClimb(child, 2);
        maxChildReach = Math.max(maxChildReach, midDistY + childClimb);
      });

      node._heightSpan = Math.max(maxChildReach + 60, sumChildHeight + 60, 160);
    } else {
      node._heightSpan = DIAGONAL_STEP_H;
    }
    const diagDx = node._heightSpan / Math.tan(RIB_ANGLE);
    node._widthSpan = diagDx + maxChildWidth + 40;
  } else {
    // HORIZONTAL
    const maxChildW = children.length > 0 ? Math.max(...children.map(c => c._w)) : 0;
    const requiredClearance = (maxChildW / 2) + 40;
    const stemLen = children.length > 0 ? Math.max(requiredClearance + 60 + children.length * 40, node._w + 50, 130) : 70;
    node._widthSpan = stemLen + maxChildWidth + 40;
    node._heightSpan = Math.max(maxChildHeight + 20, node._h + 18);
  }
}

/**
 * 2. Layout Utama Diagram
 */
export function layoutFishbone(rootData) {
  const root = JSON.parse(JSON.stringify(rootData));
  const headDims = measureNode(root.text, true);
  root._w = headDims.width;
  root._h = headDims.height;
  root._lines = headDims.lines;

  const nodes = [];
  const links = [];

  const spineY = 600;
  const headX = 3000;

  // Root (Head Parameter - Kepala Ikan)
  root.x = headX;
  root.y = spineY - root._h / 2;
  root.centerX = headX + root._w / 2;
  root.centerY = spineY;
  nodes.push({
    id: root.id,
    text: root.text,
    lines: root._lines,
    x: root.x,
    y: root.y,
    width: root._w,
    height: root._h,
    depth: 0,
    isHead: true
  });

  if (!root.children || root.children.length === 0) {
    return {
      nodes,
      links: [],
      bounds: { minX: headX - 250, minY: spineY - 120, maxX: headX + root._w + 50, maxY: spineY + 120, width: 450, height: 240 },
      spine: { x1: headX - 250, y1: spineY, x2: headX, y2: spineY }
    };
  }

  // Pisahkan kategori Level 1: Top (-1) dan Bottom (+1)
  const topCategories = [];
  const bottomCategories = [];

  root.children.forEach((cat, idx) => {
    const side = (idx % 2 === 0) ? -1 : 1;
    computeSubtreeMetrics(cat, 1, side);
    if (side === -1) {
      topCategories.push(cat);
    } else {
      bottomCategories.push(cat);
    }
  });

  // Susun per kolom pasangan (Top & Bottom)
  const numColumns = Math.max(topCategories.length, bottomCategories.length);
  let currentSpineX = headX - 170;

  for (let col = 0; col < numColumns; col++) {
    let colMinX = currentSpineX;

    // A. Top Category (Diagonal ke ATAS-KIRI)
    if (col < topCategories.length) {
      const topCat = topCategories[col];
      const attachX = currentSpineX;
      const topMinX = layoutSubtree(topCat, attachX, spineY, 1, -1, 'root', nodes, links);
      colMinX = Math.min(colMinX, topMinX);
    }

    // B. Bottom Category (Diagonal ke BAWAH-KIRI, stagger 40px)
    if (col < bottomCategories.length) {
      const botCat = bottomCategories[col];
      const attachX = currentSpineX - 40;
      const botMinX = layoutSubtree(botCat, attachX, spineY, 1, 1, 'root', nodes, links);
      colMinX = Math.min(colMinX, botMinX);
    }

    // Pindah ke kiri untuk kolom berikutnya dengan jarak aman 85px
    currentSpineX = colMinX - 85;
  }

  const spineStartX = currentSpineX - 70;
  const tailDepth = 55;
  const tailSpread = 45;

  // Garis spine horizontal utama
  links.push({
    id: 'spine',
    fromId: null,
    toId: root.id,
    x1: spineStartX,
    y1: spineY,
    x2: headX,
    y2: spineY,
    isSpine: true
  });

  // Safety pass
  resolveCollisions(nodes);

  // Bounding box (memperhitungkan sirip ekor di kiri)
  let minX = spineStartX - tailDepth - 30;
  let maxX = headX + root._w + 50;
  let minY = spineY - tailSpread - 20;
  let maxY = spineY + tailSpread + 20;

  nodes.forEach(n => {
    minX = Math.min(minX, n.x - 25);
    maxX = Math.max(maxX, n.x + n.width + 25);
    minY = Math.min(minY, n.y - 25);
    maxY = Math.max(maxY, n.y + n.height + 25);
  });

  return {
    nodes,
    links,
    bounds: { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY },
    spine: { x1: spineStartX, y1: spineY, x2: headX, y2: spineY },
    tail: { x: spineStartX, y: spineY, depth: tailDepth, spread: tailSpread }
  };
}

/**
 * 3. Layout Rekursif Berselang-seling
 */
function layoutSubtree(node, attachX, attachY, depth, side, parentId, nodes, links, inheritedTargetY = null) {
  const isDiagonal = (depth % 2 === 1);
  const children = node.children || [];

  if (isDiagonal) {
    // ─── DIAGONAL (60°, ke arah side) ───
    let H;
    if (depth === 1) {
      // Kategori utama
      H = node._heightSpan;
    } else if (inheritedTargetY !== null) {
      // Jika ada target Y agar lebih tinggi dari diagonal sebelumnya
      H = Math.abs(inheritedTargetY - attachY);
    } else {
      H = DIAGONAL_STEP_H;
    }

    const dx = H / Math.tan(RIB_ANGLE);
    const endX = attachX - dx;
    const endY = attachY + side * H;

    node.x = endX - node._w / 2;
    node.y = side === -1 ? endY - node._h - 6 : endY + 6;
    node.centerX = node.x + node._w / 2;
    node.centerY = node.y + node._h / 2;

    nodes.push({
      id: node.id,
      text: node.text,
      lines: node._lines,
      x: node.x,
      y: node.y,
      width: node._w,
      height: node._h,
      depth: depth,
      side: side,
      parentId: parentId
    });

    links.push({
      id: `link-${node.id}`,
      fromId: node.id,
      toId: parentId,
      x1: attachX,
      y1: attachY,
      x2: endX,
      y2: endY,
      isDiagonal: true,
      side: side,
      depth: depth
    });

    let minX = Math.min(node.x, endX);

    if (children.length === 0) return minX;

    if (depth === 1) {
      // Depth 1 (Kategori): anak-anak Level 2 didistribusikan sepanjang rib miring
      let currentDistY = 50;

      children.forEach(child => {
        const slotH = child._heightSpan;
        const midDistY = currentDistY + slotH / 2;
        currentDistY += slotH;

        const childAttachY = attachY + side * midDistY;
        const childAttachX = attachX - midDistY / Math.tan(RIB_ANGLE);

        const childMinX = layoutSubtree(child, childAttachX, childAttachY, depth + 1, side, node.id, nodes, links);
        minX = Math.min(minX, childMinX);
      });
    } else {
      // Depth > 1 (Sub-diagonal, misalnya Parameter 2):
      // Garis horizontal anak (Parameter 3) SELALU DI TENGAH di antara attachY (Param 1) dan endY (Param 2)!
      const midY = (attachY + endY) / 2;
      const midX = (attachX + endX) / 2;

      children.forEach((child) => {
        // Child horizontal menempel tepat di titik tengah diagonal Parameter 2
        // Dan kita teruskan target Y untuk Parameter 4 (endY + side * 55px) agar lebih tinggi dari Parameter 2!
        const targetNextDiagY = endY + side * 55;
        const childMinX = layoutSubtree(child, midX, midY, depth + 1, side, node.id, nodes, links, targetNextDiagY);
        minX = Math.min(minX, childMinX);
      });
    }

    return minX;

  } else {
    // ─── HORIZONTAL (Lurus ke kiri) ───
    const hasChildren = (children.length > 0);
    let stemLen;
    let requiredClearance = 40;

    if (hasChildren) {
      // Hitung lebar maksimal anak agar garis horizontal cukup panjang
      // dan tidak ada kotak badge anak yang menabrak rib induk
      const maxChildW = Math.max(...children.map(c => c._w));
      requiredClearance = (maxChildW / 2) + 40;
      stemLen = Math.max(requiredClearance + 60 + children.length * 40, node._w + 50, 130);
    } else {
      stemLen = 70;
    }

    const stemEndX = attachX - stemLen;
    const stemY = attachY;

    node.x = stemEndX - node._w;
    node.y = stemY - node._h / 2;
    node.centerX = node.x + node._w / 2;
    node.centerY = node.y + node._h / 2;

    nodes.push({
      id: node.id,
      text: node.text,
      lines: node._lines,
      x: node.x,
      y: node.y,
      width: node._w,
      height: node._h,
      depth: depth,
      side: side,
      parentId: parentId
    });

    links.push({
      id: `link-${node.id}`,
      fromId: node.id,
      toId: parentId,
      x1: attachX,
      y1: stemY,
      x2: node.x + node._w,
      y2: stemY,
      isHorizontal: true,
      side: side,
      depth: depth
    });

    let minX = node.x;

    if (!hasChildren) return minX;

    // Anak-anak DIAGONAL menempel di garis horizontal ini
    // Pastikan titik perlekatan (childAttachX) minimal berjarak requiredClearance dari rib induk (attachX)
    children.forEach((child, idx) => {
      const childAttachX = Math.min(attachX - requiredClearance, stemEndX + 35 + idx * 40);
      const childAttachY = stemY;

      // Teruskan inheritedTargetY jika ada agar Parameter 4 lebih tinggi dari Parameter 2
      const childMinX = layoutSubtree(child, childAttachX, childAttachY, depth + 1, side, node.id, nodes, links, inheritedTargetY);
      minX = Math.min(minX, childMinX);
    });

    return minX;
  }
}

/**
 * 4. Pemeriksaan Tabrakan & Safety Pass
 */
export function checkCollisions(nodes) {
  const collisions = [];
  const minMarginX = 14;
  const minMarginY = 12;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];

      const overlapX = (a.width / 2 + b.width / 2 + minMarginX) - Math.abs((a.x + a.width / 2) - (b.x + b.width / 2));
      const overlapY = (a.height / 2 + b.height / 2 + minMarginY) - Math.abs((a.y + a.height / 2) - (b.y + b.height / 2));

      if (overlapX > 0 && overlapY > 0) {
        collisions.push({ a, b, overlapX, overlapY });
      }
    }
  }
  return collisions;
}

function resolveCollisions(nodes) {
  for (let iter = 0; iter < 10; iter++) {
    const collisions = checkCollisions(nodes);
    if (collisions.length === 0) break;

    collisions.forEach(({ a, b, overlapX, overlapY }) => {
      if (a.isHead || b.isHead) return;

      if (overlapY < overlapX) {
        const shift = overlapY / 2 + 2;
        if (a.y < b.y) { a.y -= shift; b.y += shift; }
        else { a.y += shift; b.y -= shift; }
      } else {
        const shift = overlapX / 2 + 4;
        if (a.x < b.x) { a.x -= shift; }
        else { b.x -= shift; }
      }
    });
  }
}
