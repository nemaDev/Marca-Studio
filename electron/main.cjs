const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1060,
    minHeight: 700,
    backgroundColor: "#111211",
    title: "Marca Studio",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (!app.isPackaged) {
    window.loadURL("http://127.0.0.1:5173");
  } else {
    window.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

ipcMain.handle("images:save", async (_event, images) => {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("No hay imágenes para guardar.");
  }

  const result = await dialog.showOpenDialog({
    title: "Elige dónde guardar las imágenes",
    properties: ["openDirectory", "createDirectory"],
  });

  if (result.canceled || !result.filePaths[0]) {
    return { canceled: true };
  }

  const directory = result.filePaths[0];
  const saved = [];
  const usedNames = new Set();

  for (const image of images) {
    if (
      typeof image?.name !== "string" ||
      !image.name.trim() ||
      !(image.data instanceof Uint8Array)
    ) {
      throw new Error("Se recibió una imagen con datos inválidos.");
    }

    const originalName = path.basename(image.name);
    const extension = path.extname(originalName);
    const stem = path.basename(originalName, extension);
    let safeName = originalName;
    let suffix = 2;

    while (usedNames.has(safeName.toLowerCase()) || await fileExists(path.join(directory, safeName))) {
      safeName = `${stem} (${suffix})${extension}`;
      suffix += 1;
    }

    usedNames.add(safeName.toLowerCase());
    await fs.writeFile(path.join(directory, safeName), image.data, { flag: "wx" });
    saved.push(safeName);
  }

  return { canceled: false, saved };
});

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
