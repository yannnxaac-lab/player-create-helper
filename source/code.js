figma.showUI(__html__, {
  width: 420,
  height: 560,
  themeColors: true
});

postSelectionStatus();
figma.on("selectionchange", postSelectionStatus);

const DEFAULT_EXPORT_SETTINGS = [
  {
    format: "PNG",
    constraint: {
      type: "SCALE",
      value: 1
    }
  }
];

figma.ui.onmessage = async (message) => {
  if (message.type === "generate") {
    try {
      const result = await generateBatch(message);
      figma.notify(result.summary, { timeout: 4000 });
      figma.ui.postMessage({
        type: "done",
        summary: result.summary
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      figma.notify(text, { error: true, timeout: 5000 });
      figma.ui.postMessage({
        type: "error",
        message: text
      });
    }
  }

  if (message.type === "cancel") {
    figma.closePlugin();
  }
};

async function generateBatch(message) {
  const files = Array.isArray(message.files) ? message.files : [];
  if (!files.length) {
    throw new Error("请先上传至少一张专辑封面。");
  }

  const templates = resolveTemplates(figma.currentPage.selection);

  const pairBounds = getPairBounds(templates.img, templates.bg);
  const rowGap = Number.isFinite(message.rowGap) ? message.rowGap : 48;
  const startIndex = Number.isFinite(message.startIndex) ? message.startIndex : 1;
  const stepY = pairBounds.height + rowGap;
  const generated = [];
  const bgColorMix = clamp01(Number.isFinite(message.bgColorMix) ? message.bgColorMix : 0.22);

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const bytes = toUint8Array(file.bytes);
    if (!bytes.length) {
      throw new Error(`图片 ${file.name || index + 1} 读取失败，请重新上传。`);
    }

    const image = figma.createImage(bytes);
    const basename = buildBasename(file.name, startIndex + index);
    const rowOffset = stepY * (index + 1);

    const imgClone = templates.img.clone();
    imgClone.name = `${basename}-img`;
    imgClone.x = templates.img.x;
    imgClone.y = templates.img.y + rowOffset;
    applyExportSettings(imgClone);
    replaceNamedImageFill(imgClone, "封面", image.hash);

    const bgClone = templates.bg.clone();
    bgClone.name = `${basename}-bg`;
    bgClone.x = templates.bg.x;
    bgClone.y = templates.bg.y + rowOffset;
    applyExportSettings(bgClone);
    replaceNamedImageFill(bgClone, "封面", image.hash);
    tintBackground(bgClone, buildBackgroundPalette(file.color, bgColorMix));

    generated.push(imgClone, bgClone);
  }

  figma.currentPage.selection = generated;
  figma.viewport.scrollAndZoomIntoView(generated);

  return {
    summary: `已生成 ${files.length} 组 push 图，可直接在右侧导出面板批量导出 PNG。`
  };
}

function findTemplates(selection) {
  const matches = {
    img: [],
    bg: []
  };

  for (const node of selection) {
    walk(node, (current) => {
      if (current.name === "cf-img" && typeof current.clone === "function") {
        matches.img.push(current);
      }

      if (current.name === "cf-bg" && typeof current.clone === "function") {
        matches.bg.push(current);
      }
    });
  }

  return matches;
}

function resolveTemplates(selection) {
  const inspection = inspectSelection(selection);
  if (!inspection.ok) {
    throw new Error(inspection.message);
  }

  return {
    img: inspection.img,
    bg: inspection.bg
  };
}

function inspectSelection(selection) {
  if (!selection.length) {
    return {
      ok: false,
      message: "请先选中一组模板，或者它们的父级容器。",
      summary: "未选择任何图层。"
    };
  }

  const matches = findTemplates(selection);
  if (!matches.img.length || !matches.bg.length) {
    return {
      ok: false,
      message: "没有找到 cf-img 和 cf-bg。请直接选中这两个 frame，或选中同时包含它们的父级。",
      summary: `当前识别到 cf-img: ${matches.img.length} 个，cf-bg: ${matches.bg.length} 个。`
    };
  }

  if (matches.img.length > 1 || matches.bg.length > 1) {
    return {
      ok: false,
      message: `当前选区里有多套模板：cf-img ${matches.img.length} 个，cf-bg ${matches.bg.length} 个。请只选中一套模板，或者只选中这一套的父级。`,
      summary: `识别到多套模板：cf-img ${matches.img.length} 个，cf-bg ${matches.bg.length} 个。`
    };
  }

  const [img] = matches.img;
  const [bg] = matches.bg;
  if (!img.parent || img.parent !== bg.parent) {
    return {
      ok: false,
      message: "cf-img 和 cf-bg 不在同一个父级里。请把这一组模板放进同一个父级容器，或直接选中它们当前共同的父级。",
      summary: "已找到 cf-img 和 cf-bg，但它们不在同一个父级。"
    };
  }

  return {
    ok: true,
    img,
    bg,
    message: "",
    summary: `已识别模板：${img.name} + ${bg.name}，父级是 ${img.parent.name || "未命名容器"}。`
  };
}

function walk(node, visitor) {
  visitor(node);
  if ("children" in node) {
    for (const child of node.children) {
      walk(child, visitor);
    }
  }
}

function getPairBounds(imgNode, bgNode) {
  const minX = Math.min(imgNode.x, bgNode.x);
  const minY = Math.min(imgNode.y, bgNode.y);
  const maxX = Math.max(imgNode.x + imgNode.width, bgNode.x + bgNode.width);
  const maxY = Math.max(imgNode.y + imgNode.height, bgNode.y + bgNode.height);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function buildBasename(filename, fallbackIndex) {
  const safeName = String(filename || "")
    .replace(/\.[^.]+$/, "")
    .trim();

  if (!safeName) {
    return `cover-${String(fallbackIndex).padStart(2, "0")}`;
  }

  return safeName
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-");
}

function applyExportSettings(node) {
  if ("exportSettings" in node) {
    node.exportSettings = DEFAULT_EXPORT_SETTINGS;
  }
}

function replaceNamedImageFill(root, targetName, imageHash) {
  let replaced = 0;

  walk(root, (node) => {
    if (node.name !== targetName || !("fills" in node)) {
      return;
    }

    const nextFills = createImageFills(node.fills, imageHash);
    if (nextFills) {
      node.fills = nextFills;
      replaced += 1;
    }
  });

  if (!replaced) {
    throw new Error(`在 ${root.name} 里没有找到名为“${targetName}”的图片层。`);
  }
}

function createImageFills(fills, imageHash) {
  if (fills === figma.mixed) {
    return null;
  }

  if (!Array.isArray(fills)) {
    return [
      {
        type: "IMAGE",
        scaleMode: "FILL",
        imageHash
      }
    ];
  }

  let foundImagePaint = false;
  const nextFills = fills.map((paint) => {
    if (paint.type !== "IMAGE") {
      return paint;
    }

    foundImagePaint = true;
    const nextPaint = Object.assign({}, paint);
    nextPaint.imageHash = imageHash;
    return nextPaint;
  });

  if (foundImagePaint) {
    return nextFills;
  }

  const appendedFills = fills.slice();
  appendedFills.push({
    type: "IMAGE",
    scaleMode: "FILL",
    imageHash
  });
  return appendedFills;
}

function tintBackground(root, palette) {
  const target = findGradientTarget(root) || root;
  if (!("fills" in target)) {
    return;
  }

  if (target.fills === figma.mixed) {
    return;
  }

  const fills = Array.isArray(target.fills) ? target.fills : [];
  let updated = false;
  const nextFills = fills.map((paint) => {
    if (!String(paint.type).startsWith("GRADIENT_")) {
      return paint;
    }

    updated = true;
    const sourceStops = paint.gradientStops || [];
    const stops = buildGradientStops(sourceStops, palette);

    const nextPaint = Object.assign({}, paint);
    nextPaint.gradientStops = stops.length ? stops : [
      {
        position: 0,
        color: {
          r: palette.left.r,
          g: palette.left.g,
          b: palette.left.b,
          a: 1
        }
      },
      {
        position: 0.62,
        color: {
          r: palette.mid.r,
          g: palette.mid.g,
          b: palette.mid.b,
          a: 0.98
        }
      },
      {
        position: 1,
        color: {
          r: palette.right.r,
          g: palette.right.g,
          b: palette.right.b,
          a: 0.92
        }
      }
    ];
    return nextPaint;
  });

  if (updated) {
    target.fills = nextFills;
    return;
  }

  const appendedFills = fills.slice();
  appendedFills.push({
    type: "SOLID",
    color: {
      r: palette.mid.r,
      g: palette.mid.g,
      b: palette.mid.b
    },
    opacity: 1
  });
  target.fills = appendedFills;
}

function findGradientTarget(root) {
  if (hasGradientFill(root)) {
    return root;
  }

  let candidate = null;
  walk(root, (node) => {
    if (!candidate && hasGradientFill(node)) {
      candidate = node;
    }
  });

  return candidate;
}

function hasGradientFill(node) {
  if (!("fills" in node) || node.fills === figma.mixed || !Array.isArray(node.fills)) {
    return false;
  }

  return node.fills.some((paint) => String(paint.type).startsWith("GRADIENT_"));
}

function buildBackgroundPalette(color, mixAmount) {
  const base = normalizeColor(color);
  const tuned = softenColor(base, mixAmount);

  return {
    left: shiftLightness(tuned, -0.14, 0.08),
    mid: shiftLightness(tuned, -0.05, 0.03),
    right: shiftLightness(tuned, 0.08, -0.04)
  };
}

function softenColor(base, mixAmount) {
  const hsl = rgbToHsl(base);
  const paper = {
    r: 0.94,
    g: 0.93,
    b: 0.9
  };
  const softened = mixColor(base, paper, mixAmount * 0.55);
  const softenedHsl = rgbToHsl(softened);

  return hslToRgb({
    h: softenedHsl.h,
    s: clamp01(Math.max(softenedHsl.s, Math.min(0.72, hsl.s + 0.08))),
    l: clamp01(softenedHsl.l - 0.04)
  });
}

function buildGradientStops(sourceStops, palette) {
  const normalizedStops = sourceStops.length ? sourceStops : [
    { position: 0, color: { a: 1 } },
    { position: 0.62, color: { a: 0.98 } },
    { position: 1, color: { a: 0.92 } }
  ];

  return normalizedStops.map((stop) => {
    const gradientColor = interpolatePaletteColor(palette, stop.position);
    return {
      position: stop.position,
      color: {
        r: gradientColor.r,
        g: gradientColor.g,
        b: gradientColor.b,
        a: stop.color && typeof stop.color.a === "number" ? stop.color.a : 1
      }
    };
  });
}

function interpolatePaletteColor(palette, position) {
  const t = clamp01(position);
  if (t <= 0.62) {
    return interpolateColor(palette.left, palette.mid, t / 0.62);
  }

  return interpolateColor(palette.mid, palette.right, (t - 0.62) / 0.38);
}

function interpolateColor(a, b, amount) {
  return {
    r: mix(a.r, b.r, amount),
    g: mix(a.g, b.g, amount),
    b: mix(a.b, b.b, amount)
  };
}

function mixColor(a, b, amount) {
  return interpolateColor(a, b, amount);
}

function shiftLightness(color, deltaL, deltaS) {
  const hsl = rgbToHsl(color);
  return hslToRgb({
    h: hsl.h,
    s: clamp01(hsl.s + deltaS),
    l: clamp01(hsl.l + deltaL)
  });
}

function normalizeColor(color) {
  if (!color || typeof color !== "object") {
    return {
      r: 0.7,
      g: 0.7,
      b: 0.7
    };
  }

  return {
    r: clamp01(Number(color.r)),
    g: clamp01(Number(color.g)),
    b: clamp01(Number(color.b))
  };
}

function mix(a, b, amount) {
  return a + (b - a) * clamp01(amount);
}

function rgbToHsl(color) {
  const r = clamp01(color.r);
  const g = clamp01(color.g);
  const b = clamp01(color.b);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l };
  }

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let h = 0;

  if (max === r) {
    h = (g - b) / delta + (g < b ? 6 : 0);
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  return {
    h: h / 6,
    s,
    l
  };
}

function hslToRgb(color) {
  const h = ((color.h % 1) + 1) % 1;
  const s = clamp01(color.s);
  const l = clamp01(color.l);

  if (s === 0) {
    return { r: l, g: l, b: l };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: hueToRgb(p, q, h + 1 / 3),
    g: hueToRgb(p, q, h),
    b: hueToRgb(p, q, h - 1 / 3)
  };
}

function hueToRgb(p, q, t) {
  let value = t;
  if (value < 0) {
    value += 1;
  }
  if (value > 1) {
    value -= 1;
  }
  if (value < 1 / 6) {
    return p + (q - p) * 6 * value;
  }
  if (value < 1 / 2) {
    return q;
  }
  if (value < 2 / 3) {
    return p + (q - p) * (2 / 3 - value) * 6;
  }
  return p;
}

function clamp01(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function toUint8Array(data) {
  if (data instanceof Uint8Array) {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  if (Array.isArray(data)) {
    return new Uint8Array(data);
  }

  return new Uint8Array();
}

function postSelectionStatus() {
  const inspection = inspectSelection(figma.currentPage.selection);
  figma.ui.postMessage({
    type: "selection-status",
    ok: inspection.ok,
    summary: inspection.summary,
    message: inspection.message
  });
}
