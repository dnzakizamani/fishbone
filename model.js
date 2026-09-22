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

// Preset Template Populer Industri
export const diagramPresets = {
  sample: {
    name: 'Sample Referensi (GoJS)',
    data: sampleData
  },
  six_m: {
    name: 'Manufaktur (6M Ishikawa)',
    data: {
      id: 'node-head-6m',
      text: 'Produk Cacat Tinggi',
      children: [
        {
          id: 'cat-man',
          text: 'Manpower (Tenaga Kerja)',
          children: [
            {
              id: 'sub-man-1',
              text: 'Keterampilan Kurang',
              children: [
                { id: 'sub-man-11', text: 'Pelatihan Minim' }
              ]
            },
          ]
        },
        {
          id: 'cat-machine-6m',
          text: 'Machine (Mesin)',
          children: [
            {
              id: 'sub-mac-1',
              text: 'Perawatan Terlambat',
              children: [
                { id: 'sub-mac-11', text: 'Sparepart Kosong' }
              ]
            },
          ]
        },
        {
          id: 'cat-method',
          text: 'Method (Metode)',
          children: [
            {
              id: 'sub-met-1',
              text: 'SOP Tidak Standar',
              children: [
                { id: 'sub-met-11', text: 'Instruksi Ambigu' }
              ]
            }
          ]
        },
        {
          id: 'cat-material-6m',
          text: 'Material (Bahan Baku)',
          children: [
            {
              id: 'sub-mat-1',
              text: 'Kualitas Tidak Stabil',
              children: [
                { id: 'sub-mat-11', text: 'Supplier Baru' }
              ]
            }
          ]
        },
        {
          id: 'cat-measurement-6m',
          text: 'Measurement (Pengukuran)',
          children: [
            {
              id: 'sub-mes-1',
              text: 'Sensor Error',
              children: [
                { id: 'sub-mes-11', text: 'Suhu Melebihi Batas' }
              ]
            }
          ]
        },
        {
          id: 'cat-milieu',
          text: 'Milieu (Lingkungan)',
          children: [
            { id: 'sub-env-2', text: 'Pencahayaan Redup' }
          ]
        }
      ]
    }
  },
  four_p: {
    name: 'Software & Produk (4P)',
    data: {
      id: 'node-head-4p',
      text: 'Deploy Sistem Gagal',
      children: [
        {
          id: 'cat-people',
          text: 'People (Tim)',
          children: [
            {
              id: 'sub-peo-1',
              text: 'Komunikasi Meleset',
              children: [
                { id: 'sub-peo-11', text: 'Serah Terima Tidak Jelas' }
              ]
            }
          ]
        },
        {
          id: 'cat-platform',
          text: 'Platform (Infrastruktur)',
          children: [
            {
              id: 'sub-pla-1',
              text: 'Database Timeout',
              children: [
                { id: 'sub-pla-11', text: 'Koneksi Pool Penuh' }
              ]
            }
          ]
        },
        {
          id: 'cat-process-4p',
          text: 'Process (Alur Kerja)',
          children: [
            {
              id: 'sub-pro-1',
              text: 'CI/CD Pipeline Error',
              children: [
                { id: 'sub-pro-11', text: 'Unit Test Terlewat' }
              ]
            }
          ]
        },
        {
          id: 'cat-product',
          text: 'Product (Aplikasi)',
          children: [
            {
              id: 'sub-prd-1',
              text: 'Bug Regresi Fitur',
              children: [
                { id: 'sub-prd-11', text: 'Merge Conflict Tak Terlihat' }
              ]
            }
          ]
        }
      ]
    }
  }
};

/**
 * Membuat Laporan Markdown Rantai Kausalitas
 */
export function generateMarkdownReport(path, forwardPairs, reverseQuestions) {
  if (!path || path.length <= 1) return '';

  const leafNode = path[path.length - 1];
  const rootNode = path[0];

  let md = `## 🐟 Laporan Analisis Kausalitas (Ishikawa & 5 Whys)\n\n`;
  md += `- **Masalah / Akibat Utama**: \`${rootNode.text}\`\n`;
  md += `- **Akar Penyebab Terpilih (Leaf)**: \`${leafNode.text}\`\n`;
  md += `- **Kedalaman Level**: ${path.length - 1} tingkat\n\n`;

  md += `### 🔄 Rantai Sebab-Akibat (Maju: Karena ➔ Maka)\n`;
  forwardPairs.forEach((item, i) => {
    md += `${i + 1}. ${item.cause} ➔ **${item.effect}**\n`;
  });

  md += `\n### ❓ Analisis Penelusuran Mundur (5 Whys)\n`;
  reverseQuestions.forEach((item, i) => {
    md += `${i + 1}. **${item.question}**\n   👉 ${item.answer}\n`;
  });

  md += `\n*Dibuat dengan Fishbone Causality Studio (${new Date().toLocaleDateString('id-ID')})*\n`;
  return md;
}
