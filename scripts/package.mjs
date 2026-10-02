import { Arch, build, Platform } from "electron-builder";
import { copyFile, mkdtemp, mkdir, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const projectDirectory = process.cwd();
const temporaryOutput = await mkdtemp(path.join(os.tmpdir(), "marca-studio-build-"));
const releaseDirectory = path.join(projectDirectory, "release");

try {
  const targets = process.platform === "darwin"
    ? Platform.MAC.createTarget(["dmg"], Arch.universal)
    : Platform.current().createTarget();

  await build({
    targets,
    config: {
      directories: {
        output: temporaryOutput,
      },
    },
  });

  const outputFiles = (await readdir(temporaryOutput, { withFileTypes: true }))
    .filter((entry) => entry.isFile());
  const installers = outputFiles.filter((entry) => /\.(exe|dmg)$/i.test(entry.name));

  if (installers.length === 0) {
    throw new Error("El empaquetador terminó sin generar un instalador para esta plataforma.");
  }

  await mkdir(releaseDirectory, { recursive: true });
  await Promise.all(
    outputFiles.map((entry) =>
      copyFile(
        path.join(temporaryOutput, entry.name),
        path.join(releaseDirectory, entry.name),
      ),
    ),
  );
  console.log(`Instalador creado en ${releaseDirectory}`);
} finally {
  await rm(temporaryOutput, { recursive: true, force: true });
}
