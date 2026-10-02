import { useEffect, useMemo, useRef, useState } from "react";
import {
  Aperture,
  ArrowDownToLine,
  Check,
  ChevronDown,
  Circle,
  ImagePlus,
  Layers2,
  Plus,
  RotateCcw,
  Shapes,
  Sparkles,
  Stamp,
  Type,
  Upload,
  X,
} from "lucide-react";

const initialLogo = {
  name: "TU MARCA",
  subtitle: "FOTOGRAFÍA",
  initials: "TM",
  symbol: "circle",
  color: "#f4d35e",
  textColor: "#ffffff",
};

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function drawLogo(context, centerX, centerY, size, logo) {
  const markSize = size * 0.28;
  const color = logo.color;

  context.save();
  context.translate(centerX, centerY);
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillStyle = color;
  if (logo.symbol === "square") {
    context.beginPath();
    context.roundRect(-markSize / 2, -size * 0.46, markSize, markSize, markSize * 0.12);
    context.fill();
  } else if (logo.symbol === "star") {
    context.font = `700 ${markSize}px Georgia, serif`;
    context.fillText("✦", 0, -size * 0.32);
  } else if (logo.symbol === "none") {
    context.font = `700 ${markSize * 0.78}px Arial, sans-serif`;
    context.fillText(logo.initials.slice(0, 3), 0, -size * 0.32);
  } else {
    context.beginPath();
    context.arc(0, -size * 0.32, markSize / 2, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#171816";
    context.font = `700 ${markSize * 0.56}px Arial, sans-serif`;
    context.fillText(logo.initials.slice(0, 2), 0, -size * 0.32);
  }

  context.fillStyle = logo.textColor;
  context.font = `700 ${Math.max(12, size * 0.13)}px Arial, sans-serif`;
  context.fillText(logo.name || "TU MARCA", 0, size * 0.08);
  if (logo.subtitle) {
    context.fillStyle = color;
    context.font = `500 ${Math.max(9, size * 0.065)}px Arial, sans-serif`;
    context.letterSpacing = `${Math.max(1, size * 0.012)}px`;
    context.fillText(logo.subtitle, 0, size * 0.22);
  }
  context.restore();
}

function drawWebStyle(context, width, height, settings) {
  const minDimension = Math.min(width, height);
  const text = settings.text || "#Prohibida su reproducción";
  const step = Math.max(24, Math.round((minDimension * settings.size) / 160));
  const lineWidth = Math.max(1.5, width / 600);
  const fontSize = Math.max(10, Math.round((minDimension * settings.size) / 800));

  context.save();
  context.globalAlpha = settings.opacity / 100;
  context.lineJoin = "round";

  const drawMesh = (color, strokeWidth) => {
    context.strokeStyle = color;
    context.lineWidth = strokeWidth;
    context.beginPath();
    for (let x = -height; x <= width + height; x += step) {
      context.moveTo(x, 0);
      context.lineTo(x + height, height);
    }
    for (let x = 0; x <= width + height; x += step) {
      context.moveTo(x, 0);
      context.lineTo(x - height, height);
    }
    context.stroke();
  };

  drawMesh("rgba(0,0,0,0.25)", lineWidth * 1.8);
  drawMesh("rgba(255,255,255,0.7)", lineWidth);

  context.font = `500 ${fontSize}px sans-serif`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.lineWidth = lineWidth;
  context.strokeStyle = "rgba(0,0,0,0.35)";
  context.fillStyle = "rgba(255,255,255,0.75)";
  const textWidth = context.measureText(text).width;
  const stepX = textWidth + fontSize * 2.2;
  const stepY = fontSize * 4.2;
  let row = 0;
  for (let y = fontSize * 1.6; y < height; y += stepY, row += 1) {
    const startX = (row % 2 ? -stepX / 2 : 0) + fontSize;
    for (let x = startX; x < width; x += stepX) {
      context.strokeText(text, x, y);
      context.fillText(text, x, y);
    }
  }

  const barHeight = height * 0.52;
  const barY = height * 0.2;
  let barFontSize = Math.max(10, Math.round((minDimension * settings.size) / 670));
  context.font = `400 ${barFontSize}px sans-serif`;
  const normalWidth = context.measureText("para uso ").width;
  context.font = `800 ${barFontSize}px sans-serif`;
  const boldWidth = context.measureText("exclusivo").width;
  barFontSize = Math.max(
    10,
    Math.round(barFontSize * Math.min(1, (barHeight * 0.82) / (normalWidth + boldWidth))),
  );
  const barWidth = Math.round(barFontSize * 1.9);

  [0.21, 0.78].forEach((fraction) => {
    const centerX = fraction * width;
    const centerY = barY + barHeight / 2;
    context.fillStyle = "#45b6e0";
    context.beginPath();
    context.roundRect(centerX - barWidth / 2, barY, barWidth, barHeight, barWidth / 2);
    context.fill();
    context.save();
    context.translate(centerX, centerY);
    context.rotate(-Math.PI / 2);
    context.fillStyle = "#ffffff";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.font = `400 ${barFontSize}px sans-serif`;
    const firstWidth = context.measureText("para uso ").width;
    context.font = `800 ${barFontSize}px sans-serif`;
    const secondWidth = context.measureText("exclusivo").width;
    const startX = -(firstWidth + secondWidth) / 2;
    context.font = `400 ${barFontSize}px sans-serif`;
    context.fillText("para uso ", startX, 0);
    context.font = `800 ${barFontSize}px sans-serif`;
    context.fillText("exclusivo", startX + firstWidth, 0);
    context.restore();
  });
  context.restore();
}

function getMarkBounds(context, width, height, settings, logo, position) {
  const size = Math.min(width, height) * (settings.size / 100);
  const centerX = width * position.x;
  const centerY = height * position.y;

  if (settings.mode === "logo") {
    context.save();
    context.textAlign = "center";
    context.font = `700 ${Math.max(12, size * 0.13)}px Arial, sans-serif`;
    const nameWidth = context.measureText(logo.name || "TU MARCA").width;
    context.font = `500 ${Math.max(9, size * 0.065)}px Arial, sans-serif`;
    const subtitleWidth = context.measureText(logo.subtitle || "").width;
    context.restore();
    const markWidth = Math.max(nameWidth, subtitleWidth, size * 0.28) + size * 0.16;
    const markHeight = size * 0.84;
    return {
      left: centerX - markWidth / 2,
      right: centerX + markWidth / 2,
      top: centerY - markHeight / 2,
      bottom: centerY + markHeight / 2,
      centerX,
      centerY,
      size,
    };
  }

  context.save();
  context.font = `600 ${size}px Arial, sans-serif`;
  const textWidth = context.measureText(settings.text || "Tu marca").width;
  context.restore();
  const markWidth = Math.max(textWidth, size * 0.5) + size * 0.18;
  const markHeight = size * 1.25;
  return {
    left: centerX - markWidth / 2,
    right: centerX + markWidth / 2,
    top: centerY - markHeight / 2,
    bottom: centerY + markHeight / 2,
    centerX,
    centerY,
    size,
  };
}

function drawWatermark(context, width, height, settings, logo, position, selected = false) {
  if (settings.mode === "web") {
    drawWebStyle(context, width, height, settings);
    return null;
  }

  context.save();
  context.globalAlpha = settings.opacity / 100;
  const bounds = getMarkBounds(context, width, height, settings, logo, position);
  if (settings.mode === "logo") {
    drawLogo(context, bounds.centerX, bounds.centerY, bounds.size, logo);
  } else {
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `600 ${bounds.size}px Arial, sans-serif`;
    context.lineJoin = "round";
    context.strokeStyle = "rgba(0, 0, 0, 0.42)";
    context.lineWidth = Math.max(2, bounds.size * 0.07);
    context.strokeText(settings.text || "Tu marca", bounds.centerX, bounds.centerY);
    context.fillStyle = settings.color;
    context.fillText(settings.text || "Tu marca", bounds.centerX, bounds.centerY);
  }
  context.restore();

  if (selected) {
    context.save();
    context.strokeStyle = "rgba(245, 218, 131, 0.88)";
    context.lineWidth = 1;
    context.setLineDash([5, 4]);
    context.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
    context.setLineDash([]);
    context.fillStyle = "#f4d35e";
    context.strokeStyle = "#171816";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(bounds.right, bounds.bottom, 6, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
  }
  return bounds;
}

async function loadImage(file) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  await image.decode();
  return { image, url };
}

async function renderWatermarkedImage(file, settings, logo, position) {
  const { image, url } = await loadImage(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error(`No se pudo procesar ${file.name}.`);
    context.drawImage(image, 0, 0);

    drawWatermark(context, canvas.width, canvas.height, settings, logo, position);

    const type = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error(`No se pudo exportar ${file.name}.`))),
        type,
        0.94,
      );
    });
    const extension = type === "image/png" ? ".png" : type === "image/webp" ? ".webp" : ".jpg";
    const stem = file.name.replace(/\.[^.]+$/, "");
    return { name: `${stem}-marca${extension}`, blob };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function App() {
  const fileInput = useRef(null);
  const canvasRef = useRef(null);
  const fileUrls = useRef(new Set());
  const canvasLayout = useRef(null);
  const pointerAction = useRef(null);
  const [files, setFiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeId, setActiveId] = useState(null);
  const [mode, setMode] = useState("web");
  const [logo, setLogo] = useState(initialLogo);
  const [markPosition, setMarkPosition] = useState({ x: 0.84, y: 0.84 });
  const [settings, setSettings] = useState({
    text: "#Prohibida su reproducción",
    color: "#ffffff",
    opacity: 72,
    size: 24,
  });
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);

  const activeFile = files.find((file) => file.id === activeId);
  const activePreview = useMemo(
    () => activeFile?.url ?? null,
    [activeFile],
  );

  useEffect(() => {
    if (!activePreview || !canvasRef.current) return undefined;
    let canceled = false;
    const image = new Image();
    const canvas = canvasRef.current;
    const redraw = () => {
      if (canceled) return;
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0 || !image.complete || !image.naturalWidth) return;
      const scale = Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      const context = canvas.getContext("2d");
      context.scale(ratio, ratio);
      context.fillStyle = "#1b1c1a";
      context.fillRect(0, 0, bounds.width, bounds.height);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const offsetX = (bounds.width - drawWidth) / 2;
      const offsetY = (bounds.height - drawHeight) / 2;
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      context.save();
      context.translate(offsetX, offsetY);
      context.beginPath();
      context.rect(0, 0, drawWidth, drawHeight);
      context.clip();
      const markBounds = drawWatermark(
        context,
        drawWidth,
        drawHeight,
        { ...settings, mode },
        logo,
        markPosition,
        mode !== "web",
      );
      context.restore();
      if (markBounds) {
        contextLayout(markBounds, offsetX, offsetY, drawWidth, drawHeight, scale, image.naturalWidth, image.naturalHeight);
      } else {
        canvasLayout.current = null;
      }
    };
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    image.onload = redraw;
    image.src = activePreview;
    redraw();
    return () => {
      canceled = true;
      observer.disconnect();
      image.onload = null;
    };
  }, [activePreview, logo, markPosition, mode, settings]);

  const contextLayout = (markBounds, offsetX, offsetY, drawWidth, drawHeight, scale, naturalWidth, naturalHeight) => {
    canvasLayout.current = {
      markBounds: {
        left: markBounds.left + offsetX,
        right: markBounds.right + offsetX,
        top: markBounds.top + offsetY,
        bottom: markBounds.bottom + offsetY,
        centerX: markBounds.centerX + offsetX,
        centerY: markBounds.centerY + offsetY,
      },
      image: { left: offsetX, top: offsetY, width: drawWidth, height: drawHeight, scale, naturalWidth, naturalHeight },
    };
  };

  useEffect(() => () => {
    fileUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const addFiles = (fileList) => {
    const selected = Array.from(fileList);
    const accepted = selected.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (accepted.length === 0) {
      setNotice("Elige imágenes JPG, PNG o WEBP para continuar.");
      return;
    }
    const imported = accepted.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    imported.forEach((file) => fileUrls.current.add(file.url));
    setFiles((current) => [...current, ...imported]);
    setSelectedIds((current) => new Set([...current, ...imported.map((file) => file.id)]));
    setActiveId((current) => current || imported[0].id);
    const skipped = selected.length - accepted.length;
    setNotice(`${imported.length} imagen${imported.length === 1 ? "" : "es"} añadida${imported.length === 1 ? "" : "s"}${skipped ? `; ${skipped} archivo${skipped === 1 ? "" : "s"} omitido${skipped === 1 ? "" : "s"} por formato no compatible` : ""}.`);
  };

  const updateSetting = (key, value) => setSettings((current) => ({ ...current, [key]: value }));
  const updateLogo = (key, value) => setLogo((current) => ({ ...current, [key]: value }));

  const exportLogo = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1200;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("No se pudo preparar el logo.");
      drawLogo(context, 600, 600, 720, logo);
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error("No se pudo exportar el logo."))),
          "image/png",
        );
      });
      const name = `${(logo.name || "mi-logo").replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase() || "mi-logo"}.png`;
      if (window.marcaStudio?.saveImages) {
        const result = await window.marcaStudio.saveImages([
          { name, data: new Uint8Array(await blob.arrayBuffer()) },
        ]);
        setNotice(result.canceled ? "Exportación cancelada." : "Logo guardado en PNG transparente.");
      } else {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = name;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice("Logo descargado en PNG transparente.");
      }
    } catch (error) {
      console.error(error);
      setNotice(error instanceof Error ? error.message : "No se pudo exportar el logo.");
    }
  };

  const setPositionPreset = (position) => {
    const positions = {
      "superior izquierda": { x: 0.14, y: 0.14 },
      "superior derecha": { x: 0.86, y: 0.14 },
      centro: { x: 0.5, y: 0.5 },
      "inferior izquierda": { x: 0.14, y: 0.86 },
      "inferior derecha": { x: 0.86, y: 0.86 },
    };
    setMarkPosition(positions[position]);
  };

  const toggleSelected = (id) => {
    setSelectedIds((current) => {
      const updated = new Set(current);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  };

  const toggleAllSelected = () => {
    setSelectedIds((current) => current.size === files.length ? new Set() : new Set(files.map((file) => file.id)));
  };

  const getCanvasPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onCanvasPointerDown = (event) => {
    if (mode === "web" || !canvasLayout.current) return;
    const point = getCanvasPoint(event);
    const { markBounds, image } = canvasLayout.current;
    const overHandle = Math.hypot(point.x - markBounds.right, point.y - markBounds.bottom) < 13;
    const overMark = point.x >= markBounds.left - 8 && point.x <= markBounds.right + 8
      && point.y >= markBounds.top - 8 && point.y <= markBounds.bottom + 8;
    if (!overHandle && !overMark && (
      point.x < image.left || point.x > image.left + image.width
      || point.y < image.top || point.y > image.top + image.height
    )) return;

    const x = Math.min(1, Math.max(0, (point.x - image.left) / image.width));
    const y = Math.min(1, Math.max(0, (point.y - image.top) / image.height));
    pointerAction.current = {
      type: overHandle ? "resize" : "move",
      startSize: settings.size,
      startDistance: Math.hypot(point.x - markBounds.centerX, point.y - markBounds.centerY),
    };
    canvasRef.current.setPointerCapture(event.pointerId);
    if (!overHandle) setMarkPosition({ x, y });
  };

  const onCanvasPointerMove = (event) => {
    const action = pointerAction.current;
    const layout = canvasLayout.current;
    if (!layout) return;
    const point = getCanvasPoint(event);
    const { markBounds, image } = layout;
    if (!action) {
      const handleDistance = Math.hypot(point.x - markBounds.right, point.y - markBounds.bottom);
      const overMark = point.x >= markBounds.left && point.x <= markBounds.right
        && point.y >= markBounds.top && point.y <= markBounds.bottom;
      if (canvasRef.current) canvasRef.current.style.cursor = handleDistance < 13 ? "nwse-resize" : overMark && mode !== "web" ? "grab" : "default";
      return;
    }
    if (action.type === "move") {
      setMarkPosition({
        x: Math.min(1, Math.max(0, (point.x - image.left) / image.width)),
        y: Math.min(1, Math.max(0, (point.y - image.top) / image.height)),
      });
    } else if (action.startDistance > 0) {
      const distance = Math.hypot(point.x - markBounds.centerX, point.y - markBounds.centerY);
      updateSetting("size", Math.max(2, Math.min(150, Math.round(action.startSize * distance / action.startDistance))));
    }
  };

  const onCanvasPointerUp = (event) => {
    pointerAction.current = null;
    if (canvasRef.current?.hasPointerCapture(event.pointerId)) canvasRef.current.releasePointerCapture(event.pointerId);
  };

  const removeFile = (id) => {
    const removed = files.find((file) => file.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.url);
      fileUrls.current.delete(removed.url);
    }
    const remaining = files.filter((file) => file.id !== id);
    setFiles(remaining);
    setSelectedIds((current) => {
      const updated = new Set(current);
      updated.delete(id);
      return updated;
    });
    if (activeId === id) setActiveId(remaining[0]?.id || null);
  };

  const exportImages = async () => {
    const selectedFiles = files.filter((file) => selectedIds.has(file.id));
    if (selectedFiles.length === 0 || exporting) return;
    setExporting(true);
    setNotice("");
    try {
      const rendered = await Promise.all(
        selectedFiles.map(({ file }) => renderWatermarkedImage(file, { ...settings, mode }, logo, markPosition)),
      );
      if (window.marcaStudio?.saveImages) {
        const images = await Promise.all(
          rendered.map(async ({ name, blob }) => ({ name, data: new Uint8Array(await blob.arrayBuffer()) })),
        );
        const result = await window.marcaStudio.saveImages(images);
        if (result.canceled) {
          setNotice("Exportación cancelada.");
        } else {
          setNotice(`${result.saved.length} imagen${result.saved.length === 1 ? "" : "es"} guardada${result.saved.length === 1 ? "" : "s"} correctamente.`);
        }
      } else {
        rendered.forEach(({ name, blob }) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = name;
          anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        setNotice(`${rendered.length} imagen${rendered.length === 1 ? "" : "es"} exportada${rendered.length === 1 ? "" : "s"}.`);
      }
    } catch (error) {
      console.error(error);
      setNotice(error instanceof Error ? error.message : "No se pudieron exportar las imágenes.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Marca Studio inicio">
          <span className="brand-mark"><Aperture size={19} strokeWidth={1.8} /></span>
          <span>marca<span className="brand-light">studio</span></span>
        </a>
        <div className="topbar-center"><span className="status-dot" /> Tus imágenes se procesan en este dispositivo</div>
        <div className="topbar-actions">
          <button className="icon-button" title="Restablecer ajustes" onClick={() => { setLogo(initialLogo); setMode("web"); setMarkPosition({ x: 0.84, y: 0.84 }); setSettings({ text: "#Prohibida su reproducción", color: "#ffffff", opacity: 72, size: 24 }); }}>
            <RotateCcw size={16} />
          </button>
          <button className="export-button" disabled={!selectedIds.size || exporting} onClick={exportImages}>
            {exporting ? <span className="spinner" /> : <ArrowDownToLine size={16} />}
            {exporting ? "Exportando..." : "Exportar"}{selectedIds.size > 0 && <span className="export-count">{selectedIds.size}</span>}
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="asset-panel">
          <div className="panel-heading">
            <div><span className="section-kicker">PROYECTO</span><h1>Mis imágenes <span className="image-count">{files.length}</span></h1></div>
            <button className="small-icon-button" title="Añadir imágenes" onClick={() => fileInput.current?.click()}><Plus size={17} /></button>
          </div>
          <input ref={fileInput} hidden type="file" accept="image/*" multiple onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} />
          <button className="dropzone" onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }}>
            <span className="drop-icon"><ImagePlus size={20} /></span>
            <span className="drop-title">Añadir imágenes</span>
            <span className="drop-note">Arrastra aquí o explora tus archivos</span>
            <span className="drop-formats">JPG · PNG · WEBP</span>
          </button>
          {files.length > 0 ? (
            <div className="image-list">
              <div className="list-label"><span>ARCHIVOS · {files.length}</span><button className="select-all-button" onClick={toggleAllSelected}>{selectedIds.size === files.length ? "NINGUNA" : "TODAS"}</button></div>
              {files.map((item, index) => (
                <div className={`image-item ${item.id === activeId ? "active" : ""}`} key={item.id}>
                  <button className="image-select" aria-label={`Vista previa de ${item.name}`} onClick={() => setActiveId(item.id)}>
                    <span className="thumb-wrap"><img src={item.url} alt="" />{item.id === activeId && <span className="thumb-check"><Check size={11} /></span>}</span>
                    <span className="image-info"><span className="image-name">{item.name}</span><span className="image-size">{formatBytes(item.size)} <span className="image-index">· {String(index + 1).padStart(2, "0")}</span></span></span>
                  </button>
                  <button className={`selection-check ${selectedIds.has(item.id) ? "checked" : ""}`} aria-label={`${selectedIds.has(item.id) ? "Quitar" : "Incluir"} ${item.name} de la exportación`} aria-pressed={selectedIds.has(item.id)} onClick={() => toggleSelected(item.id)}>{selectedIds.has(item.id) && <Check size={10} />}</button>
                  <button className="remove-file" aria-label={`Quitar ${item.name}`} onClick={() => removeFile(item.id)}><X size={13} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-assets"><Layers2 size={19} strokeWidth={1.4} /><p>Tus imágenes aparecerán aquí</p><span>Empieza añadiendo una o varias fotos</span></div>
          )}
          <div className="local-note"><span className="lock-dot" />Archivos privados. Nunca salen de tu dispositivo.</div>
        </aside>

        <section className="canvas-area">
          <div className="canvas-toolbar">
            <div className="canvas-breadcrumb"><span>ESPACIO DE TRABAJO</span><ChevronDown size={13} /></div>
            {activeFile && <div className="canvas-filename"><span className="live-dot" />{activeFile.name}</div>}
            <div className="canvas-zoom"><span>AJUSTAR</span><span className="zoom-divider" /><span>{activeFile ? `${activeFile.file.type.split("/")[1]?.toUpperCase()} · ${activeFile.file.size ? `${(activeFile.file.size / (1024 * 1024)).toFixed(1)} MB` : ""}` : "SIN IMAGEN"}</span></div>
          </div>
          <div className={`canvas-stage ${activeFile ? "has-image" : ""}`}>
            {activeFile ? (
              <>
              <canvas
                ref={canvasRef}
                className="preview-canvas"
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onPointerCancel={onCanvasPointerUp}
                aria-label="Vista previa editable. Arrastra la marca para moverla y el control de la esquina para cambiar su tamaño."
              />
              {mode !== "web" && <span className="canvas-help">ARRASTRA PARA MOVER · ESQUINA PARA REDIMENSIONAR</span>}
              </>
            ) : (
              <div className="canvas-empty">
                <div className="empty-art"><span className="art-frame"><span className="art-sun" /><span className="art-mountain" /><span className="art-mountain second" /></span><span className="art-sparkle"><Sparkles size={18} /></span></div>
                <h2>Un buen trabajo merece <em>tu firma.</em></h2>
                <p>Añade una imagen para ver tu marca de agua en acción.</p>
                <button className="browse-button" onClick={() => fileInput.current?.click()}><Upload size={15} />Elegir imágenes</button>
              </div>
            )}
          </div>
          <div className="canvas-footer"><span><span className="footer-dot" />VISTA PREVIA EN VIVO</span>{activeFile && <span>La imagen original permanece intacta</span>}</div>
        </section>

        <aside className="tools-panel">
          <div className="tools-title"><div><span className="section-kicker">PERSONALIZA</span><h2>Tu marca</h2></div><button className="more-button" title="Restablecer logo" onClick={() => setLogo(initialLogo)}><RotateCcw size={15} /></button></div>
          <div className="mode-tabs">
            <button className={mode === "web" ? "selected" : ""} onClick={() => setMode("web")}><Stamp size={14} /> Estilo web</button>
            <button className={mode === "logo" ? "selected" : ""} onClick={() => setMode("logo")}><Shapes size={14} /> Logo</button>
            <button className={mode === "text" ? "selected" : ""} onClick={() => setMode("text")}><Type size={14} /> Texto</button>
          </div>
          {mode === "logo" ? (
            <>
              <div className="logo-preview"><div className="logo-preview-content" style={{ color: logo.textColor }}><span className={`logo-symbol symbol-${logo.symbol}`} style={{ color: logo.color, borderColor: logo.color }}>{logo.symbol === "star" ? "✦" : logo.symbol === "none" ? logo.initials.slice(0, 2) : logo.symbol === "square" ? <span /> : <span style={{ backgroundColor: logo.color }}>{logo.initials.slice(0, 2)}</span>}</span><span className="logo-name-preview">{logo.name || "TU MARCA"}</span><span className="logo-sub-preview" style={{ color: logo.color }}>{logo.subtitle || " "}</span></div><span className="preview-caption">VISTA PREVIA DE TU LOGO</span></div>
              <button className="logo-download" onClick={exportLogo}><ArrowDownToLine size={13} /> Descargar logo <span>PNG transparente</span></button>
              <div className="control-group">
                <label htmlFor="logo-name">Nombre de marca</label>
                <input id="logo-name" className="text-input" maxLength={24} value={logo.name} onChange={(event) => updateLogo("name", event.target.value.toUpperCase())} placeholder="Tu marca" />
              </div>
              <div className="control-row">
                <div className="control-group"><label htmlFor="logo-initials">Iniciales</label><input id="logo-initials" className="text-input short-input" maxLength={3} value={logo.initials} onChange={(event) => updateLogo("initials", event.target.value.toUpperCase())} /></div>
                <div className="control-group"><label htmlFor="logo-subtitle">Subtítulo</label><input id="logo-subtitle" className="text-input" maxLength={22} value={logo.subtitle} onChange={(event) => updateLogo("subtitle", event.target.value.toUpperCase())} placeholder="Opcional" /></div>
              </div>
              <div className="control-group">
                <span className="field-label">Símbolo</span>
                <div className="shape-options">
                  <button className={logo.symbol === "circle" ? "chosen" : ""} title="Círculo con iniciales" onClick={() => updateLogo("symbol", "circle")}><Circle size={17} /></button>
                  <button className={logo.symbol === "square" ? "chosen" : ""} title="Cuadrado" onClick={() => updateLogo("symbol", "square")}><span className="square-symbol" /></button>
                  <button className={logo.symbol === "star" ? "chosen" : ""} title="Estrella" onClick={() => updateLogo("symbol", "star")}><Sparkles size={17} /></button>
                  <button className={logo.symbol === "none" ? "chosen" : ""} title="Solo iniciales" onClick={() => updateLogo("symbol", "none")}><Type size={17} /></button>
                </div>
              </div>
              <div className="control-row color-row">
                <label className="color-control"><span>Color del acento</span><span className="color-picker" style={{ backgroundColor: logo.color }}><input type="color" aria-label="Color del acento" value={logo.color} onChange={(event) => updateLogo("color", event.target.value)} /></span></label>
                <label className="color-control"><span>Color del texto</span><span className="color-picker" style={{ backgroundColor: logo.textColor }}><input type="color" aria-label="Color del texto" value={logo.textColor} onChange={(event) => updateLogo("textColor", event.target.value)} /></span></label>
              </div>
            </>
          ) : mode === "text" ? (
            <>
              <div className="control-group">
                <label htmlFor="watermark-text">Texto de la marca de agua</label>
                <input id="watermark-text" className="text-input" maxLength={60} value={settings.text} onChange={(event) => updateSetting("text", event.target.value)} placeholder="Escribe tu texto" />
              </div>
              <label className="color-control text-color-control"><span>Color del texto</span><span className="color-picker" style={{ backgroundColor: settings.color }}><input type="color" aria-label="Color del texto" value={settings.color} onChange={(event) => updateSetting("color", event.target.value)} /></span></label>
            </>
          ) : (
            <div className="web-style-card">
              <span className="web-style-icon"><Stamp size={17} /></span>
              <span className="web-style-title">Estilo de la web</span>
              <span className="web-style-description">Malla de protección, texto repetido y bandas celestes, como en la marca de agua que ya usas.</span>
              <div className="control-group">
                <label htmlFor="web-watermark-text">Texto repetido</label>
                <input id="web-watermark-text" className="text-input" maxLength={60} value={settings.text} onChange={(event) => updateSetting("text", event.target.value)} />
              </div>
            </div>
          )}
          <div className="panel-rule" />
          <div className="control-group">
            <div className="slider-heading"><label htmlFor="size-slider">{mode === "web" ? "Densidad del estilo" : "Tamaño de la marca"}</label><span>{settings.size}%</span></div>
            <input id="size-slider" className="range-input" type="range" min="2" max="150" value={settings.size} style={{ "--range-progress": `${((settings.size - 2) / 148) * 100}%` }} onChange={(event) => updateSetting("size", Number(event.target.value))} />
            <div className="range-labels"><span>Discreto</span><span>{mode === "web" ? "Más denso" : "Muy grande"}</span></div>
          </div>
          <div className="control-group opacity-group">
            <div className="slider-heading"><label htmlFor="opacity-slider">Opacidad</label><span>{settings.opacity}%</span></div>
            <input id="opacity-slider" className="range-input" type="range" min="10" max="100" value={settings.opacity} onChange={(event) => updateSetting("opacity", Number(event.target.value))} />
            <div className="range-labels"><span>Sutil</span><span>Sólida</span></div>
          </div>
          <div className="control-group position-group">
            <span className="field-label">Posición</span>
            <div className="position-grid">
              {["superior izquierda", "superior derecha", "centro", "inferior izquierda", "inferior derecha"].map((position) => {
                const preset = {
                  "superior izquierda": { x: 0.14, y: 0.14 },
                  "superior derecha": { x: 0.86, y: 0.14 },
                  centro: { x: 0.5, y: 0.5 },
                  "inferior izquierda": { x: 0.14, y: 0.86 },
                  "inferior derecha": { x: 0.86, y: 0.86 },
                }[position];
                const isActive = Math.abs(markPosition.x - preset.x) < 0.01 && Math.abs(markPosition.y - preset.y) < 0.01;
                return <button key={position} disabled={mode === "web"} aria-label={position} title={position} className={`position-cell ${isActive ? "position-active" : ""}`} onClick={() => setPositionPreset(position)}><span /></button>;
              })}
            </div>
            <span className="position-hint">{mode === "web" ? "Incluida en toda la imagen" : "También puedes arrastrar la marca"}</span>
          </div>
          <div className="panel-rule lower-rule" />
          <div className="batch-note"><span className="batch-icon"><Sparkles size={15} /></span><p>Se exportarán <strong>{selectedIds.size} de {files.length} imágenes seleccionadas</strong>.</p></div>
        </aside>
      </div>

      {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Cerrar mensaje"><X size={14} /></button></div>}
      <div className="bottom-bar"><span><Aperture size={13} /> MARCA STUDIO <span className="bottom-version">BETA</span></span><span>HECHO PARA CUIDAR LO QUE CREAS <span className="bottom-star">✳</span></span></div>
    </main>
  );
}

export default App;
