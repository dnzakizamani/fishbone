/**
 * causality.js
 * Logika traversal kausalitas:
 * 1. Forward: Pasangan bertingkat "Karena [sebab], maka [akibat]." (Leaf -> Root)
 * 2. Reverse (5 Whys): Pasangan bertingkat "Kenapa [akibat]? Karena [sebab]." (Root -> Leaf)
 */

export function findPathToRoot(nodeId, root) {
  const path = [];
  function search(current, targetId, currentPath) {
    if (!current) return false;
    const nextPath = [...currentPath, current];
    if (current.id === targetId) {
      path.push(...nextPath);
      return true;
    }
    if (current.children && current.children.length > 0) {
      for (const child of current.children) {
        if (search(child, targetId, nextPath)) return true;
      }
    }
    return false;
  }
  search(root, nodeId, []);
  return path;
}

export function generateCausalityText(path) {
  if (!path || path.length === 0) return { forward: [], reverse: [] };
  if (path.length === 1) {
    return {
      forward: [{
        cause: `Fokus Masalah`,
        effect: `"${path[0].text}" (Belum ada sub-penyebab dipilih)`
      }],
      reverse: [{
        question: `Fokus Masalah: "${path[0].text}"`,
        answer: `(Belum ada sub-penyebab dipilih)`
      }]
    };
  }

  // Forward: Leaf -> ... -> Root ("Karena X, maka Y.") per pasangan terstruktur
  const reversedPath = [...path].reverse();
  const forward = [];
  for (let i = 0; i < reversedPath.length - 1; i++) {
    forward.push({
      cause: `Karena "${reversedPath[i].text}"`,
      effect: `maka "${reversedPath[i + 1].text}".`
    });
  }

  // Reverse: Root -> ... -> Leaf ("Kenapa Y? Karena X.") per pasangan 5 Whys
  const reverse = [];
  for (let i = 0; i < path.length - 1; i++) {
    reverse.push({
      question: `Kenapa "${path[i].text}"?`,
      answer: `Karena "${path[i + 1].text}".`
    });
  }

  return { forward, reverse };
}
