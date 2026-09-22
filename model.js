/**
 * model.js - Struktur Data & Parser Outline
 */

export const sampleData = {
  id: 'node-head',
  text: 'Head Parameter',
  children: [
    {
      id: 'cat-env',
      text: 'Environment',
      children: [
        {
          id: 'env-p1',
          text: 'Parameter - 1',
          children: [
            {
              id: 'env-p2',
              text: 'Parameter - 2',
              children: [
                {
                  id: 'env-p3',
                  text: 'Parameter - 3',
                  children: [
                    { id: 'env-p4', text: 'Parameter - 4' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'cat-machine',
      text: 'Machine',
      children: [
        {
          id: 'mac-p1',
          text: 'Param1',
          children: [
            { id: 'mac-p12', text: 'Param12' }
          ]
        }
      ]
    },
    {
      id: 'cat-material',
      text: 'Material',
      children: [
        {
          id: 'mat-p6',
          text: 'Parameter 6',
          children: [
            { id: 'mat-p61', text: 'Parameter 61' }
          ]
        }
      ]
    },
    {
      id: 'cat-measurement',
      text: 'Measurement',
      children: [
        {
          id: 'meas-rp',
          text: 'Raw parameter',
          children: [
            {
              id: 'meas-rp1',
              text: 'Raw parameter1',
              children: [
                { id: 'meas-rp2', text: 'Raw parameter2' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'cat-person',
      text: 'Person',
      children: [
        {
          id: 'per-rp1',
          text: 'Raw Parameter1',
          children: [
            { id: 'per-rp2', text: 'Raw Parameter2' }
          ]
        }
      ]
    },
    {
      id: 'cat-process',
      text: 'process',
      children: [
        {
          id: 'prc-p1',
          text: 'Proc Param1',
          children: [
            { id: 'prc-p2', text: 'Proc Param2' }
          ]
        }
      ]
    }
  ]
};

export function treeToOutline(node, depth = 0) {
  const indent = '  '.repeat(depth);
  let res = `${indent}${node.text}\n`;
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      res += treeToOutline(child, depth + 1);
    }
  }
  return res;
}

let idCounter = 1;
export function outlineToTree(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return null;

  function getIndent(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  const rootLine = lines[0];
  const root = {
    id: 'node-root',
    text: rootLine.trim(),
    children: []
  };

  const stack = [{ node: root, indent: getIndent(rootLine) }];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const textVal = line.trim();
    const indent = getIndent(line);
    const newNode = {
      id: `node-${Date.now()}-${idCounter++}`,
      text: textVal,
      children: []
    };

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent.children.push(newNode);
    stack.push({ node: newNode, indent });
  }

  return root;
}

// Koleksi Tema Visual Diagram
export const diagramThemes = {
  amber: {
    name: 'Modern Amber',
    badgeBg: '#f59e0b',
    badgeBorder: '#d97706',
    badgeText: '#ffffff',
    headGradStart: '#ea580c',
    headGradEnd: '#f97316',
    headStroke: '#c2410c',
    lineColor: '#334155'
  },
  pure_classic: {
    name: 'Klasik Asli (Garis Hitam)',
    badgeBg: '#ffffff',
    badgeBorder: '#000000',
    badgeText: '#000000',
    headGradStart: '#ffffff',
    headGradEnd: '#ffffff',
    headStroke: '#000000',
    lineColor: '#000000'
  },
  classic: {
    name: 'Classic Ishikawa',
    badgeBg: '#2563eb',
    badgeBorder: '#1d4ed8',
    badgeText: '#ffffff',
    headGradStart: '#1e3a8a',
    headGradEnd: '#3b82f6',
    headStroke: '#172554',
    lineColor: '#1e293b'
  },
  corporate: {
    name: 'Corporate Blue',
    badgeBg: '#0284c7',
    badgeBorder: '#0369a1',
    badgeText: '#ffffff',
    headGradStart: '#075985',
    headGradEnd: '#38bdf8',
    headStroke: '#0c4a6e',
    lineColor: '#475569'
  },
  emerald: {
    name: 'Forest Emerald',
    badgeBg: '#10b981',
    badgeBorder: '#059669',
    badgeText: '#ffffff',
    headGradStart: '#047857',
    headGradEnd: '#34d399',
    headStroke: '#064e3b',
    lineColor: '#334155'
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    badgeBg: '#a855f7',
    badgeBorder: '#9333ea',
    badgeText: '#ffffff',
    headGradStart: '#ec4899',
    headGradEnd: '#8b5cf6',
    headStroke: '#be185d',
    lineColor: '#06b6d4'
  },
  minimalist: {
    name: 'Minimalist Mono',
    badgeBg: '#0f172a',
    badgeBorder: '#334155',
    badgeText: '#ffffff',
    headGradStart: '#334155',
    headGradEnd: '#0f172a',
    headStroke: '#020617',
    lineColor: '#0f172a'
  }
};
