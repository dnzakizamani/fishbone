/**
 * test.js - Self-check logika inti fishhh
 * Menjalankan uji kausalitas, parser outline, layout fishbone, collision check, dan hirarki ketinggian diagonal.
 */

import assert from 'node:assert';
import { findPathToRoot, generateCausalityText } from './causality.js';
import { layoutFishbone, checkCollisions } from './fishbone-layout.js';
import { sampleData, treeToOutline, outlineToTree, diagramThemes } from './model.js';

console.log('--- RUNNING FISHHH TESTS ---');

// 1. Test Causality Traversal Deep Nested (Leaf -> Root)
const path = findPathToRoot('env-p4', sampleData);
assert.strictEqual(path.length, 6, 'Path to Parameter - 4 should have 6 nodes (deep nested)');
assert.strictEqual(path[0].id, 'node-head');
assert.strictEqual(path[1].id, 'cat-env');
assert.strictEqual(path[2].id, 'env-p1');
assert.strictEqual(path[3].id, 'env-p2');
assert.strictEqual(path[4].id, 'env-p3');
assert.strictEqual(path[5].id, 'env-p4');

const causality = generateCausalityText(path);
assert.strictEqual(causality.forward.length, 5, 'Forward causality must have 5 pairwise steps');
assert.strictEqual(causality.forward[0].cause, 'Karena "Parameter - 4"');
assert.strictEqual(causality.forward[0].effect, 'maka "Parameter - 3".');
assert.strictEqual(causality.forward[4].cause, 'Karena "Environment"');
assert.strictEqual(causality.forward[4].effect, 'maka "Head Parameter".');

assert.strictEqual(causality.reverse.length, 5);
assert.strictEqual(causality.reverse[0].question, 'Kenapa "Head Parameter"?');
assert.strictEqual(causality.reverse[0].answer, 'Karena "Environment".');
assert.strictEqual(causality.reverse[4].question, 'Kenapa "Parameter - 3"?');
assert.strictEqual(causality.reverse[4].answer, 'Karena "Parameter - 4".');
console.log('✔ Causality logic on deep nested branch passed (paired forward & reverse)');

// 2. Test Outline Roundtrip
const outlineText = treeToOutline(sampleData);
assert.ok(outlineText.includes('Head Parameter'));
assert.ok(outlineText.includes('Parameter - 4'));

const parsedTree = outlineToTree(outlineText);
assert.strictEqual(parsedTree.text, 'Head Parameter');
assert.strictEqual(parsedTree.children.length, sampleData.children.length);
console.log('✔ Outline parser roundtrip passed');

// 3. Test Fishbone Alternating Layout
const layout = layoutFishbone(sampleData);
assert.ok(layout.nodes.length >= 17, `Expected >= 17 nodes, got ${layout.nodes.length}`);
assert.ok(layout.links.length >= 17, `Expected >= 17 links, got ${layout.links.length}`);
assert.ok(layout.bounds.width > 0, 'Bounding box width must be positive');
assert.ok(layout.bounds.height > 0, 'Bounding box height must be positive');

// Pastikan tinggi kepala ikan 3x lipat (>= 240px)
const headNode = layout.nodes.find(n => n.isHead);
assert.ok(headNode, 'Head node must exist');
assert.ok(headNode.height >= 240, `Head node height must be at least 240px (got ${headNode.height}px)`);
console.log(`✔ Fish head height verified 3x scaled: ${headNode.height}px (width: ${headNode.width}px)`);

// Pastikan tidak ada koordinat NaN
layout.nodes.forEach(n => {
  assert.ok(!Number.isNaN(n.x) && !Number.isNaN(n.y), `Node ${n.id} coordinate contains NaN`);
  assert.ok(n.width > 0 && n.height > 0, `Node ${n.id} dimensions invalid`);
});

layout.links.forEach(l => {
  assert.ok(!Number.isNaN(l.x1) && !Number.isNaN(l.y1), `Link ${l.id} contains NaN coords`);
  assert.ok(!Number.isNaN(l.x2) && !Number.isNaN(l.y2), `Link ${l.id} contains NaN coords`);
});
console.log('✔ Fishbone layout geometry passed');

// 4. Test Zero Collisions
const collisions = checkCollisions(layout.nodes);
if (collisions.length > 0) {
  console.error('Collisions found:', collisions.map(c => `[${c.a.text}] vs [${c.b.text}]`));
}
assert.strictEqual(collisions.length, 0, `Found ${collisions.length} overlapping nodes`);
console.log('✔ Zero-collision guarantee passed on alternating nested fishbone');

// 5. Test Hierarki Ketinggian: Environment PALING TINGGI, lalu Parameter 4, lalu Parameter 2
const nodeEnv = layout.nodes.find(n => n.id === 'cat-env');
const nodeParam1 = layout.nodes.find(n => n.id === 'env-p1');
const nodeParam2 = layout.nodes.find(n => n.id === 'env-p2');
const nodeParam3 = layout.nodes.find(n => n.id === 'env-p3');
const nodeParam4 = layout.nodes.find(n => n.id === 'env-p4');
assert.ok(nodeEnv && nodeParam1 && nodeParam2 && nodeParam3 && nodeParam4, 'All env nodes must exist');

// Di sistem koordinat SVG, Y lebih kecil = posisi lebih tinggi di layar
assert.ok(nodeEnv.y < nodeParam4.y, `Environment (y=${nodeEnv.y}) must be higher than Parameter 4 (y=${nodeParam4.y})`);
assert.ok(nodeParam4.y < nodeParam2.y, `Parameter 4 (y=${nodeParam4.y}) must be higher than Parameter 2 (y=${nodeParam2.y})`);

// 6. Test Parameter 3 SELALU DI TENGAH di antara Parameter 1 dan Parameter 2
assert.ok(nodeParam2.y < nodeParam3.y && nodeParam3.y < nodeParam1.y,
  `Parameter 3 (y=${nodeParam3.y}) must be between Parameter 2 (y=${nodeParam2.y}) and Parameter 1 (y=${nodeParam1.y})`);
console.log(`✔ Hierarchy verified: Environment (${nodeEnv.y}) > Param 4 (${nodeParam4.y}) > Param 2 (${nodeParam2.y}) > Param 3 (${nodeParam3.y}) > Param 1 (${nodeParam1.y})`);

// 7. Test Ketersediaan Koleksi Tema Diagram
const expectedThemes = ['amber', 'pure_classic', 'classic', 'corporate', 'emerald', 'cyberpunk', 'minimalist'];
expectedThemes.forEach(themeKey => {
  assert.ok(diagramThemes[themeKey], `Theme ${themeKey} must be defined in diagramThemes`);
  assert.ok(diagramThemes[themeKey].badgeBg, `Theme ${themeKey} must define badgeBg`);
});
console.log('✔ All 7 diagram themes validated (including pure_classic with black lines & white badges)');

console.log('ALL FISHHH TESTS PASSED! 🎉');
