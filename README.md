# Marca Studio

Aplicación de escritorio para crear logos y aplicar marcas de agua a imágenes.

## Desarrollo

```sh
npm install
npm run dev
```

## Crear instaladores

```sh
npm run dist
```

El instalador de Windows se genera en `release/`. En una Mac, el mismo comando genera el instalador de macOS; desde Windows, puedes usar el workflow remoto descrito abajo.
El empaquetado usa una carpeta temporal del sistema y copia los artefactos terminados a `release/`, lo que evita errores de renombrado al compilar desde carpetas del Escritorio.

## Obtener el instalador de macOS desde Windows

El workflow `Build Marca Studio for macOS` compila una imagen universal para Intel y Apple Silicon en un runner de macOS de GitHub Actions. Se ejecuta al subir cambios a `main` o manualmente: abre la pestaña **Actions** del repositorio, selecciona el workflow y pulsa **Run workflow**. Cuando termine, descarga `marca-studio-macos-universal` desde los artefactos de esa ejecución.

La app no está firmada ni notarizada con una cuenta de desarrollador de Apple; para distribuirla fuera de pruebas, habrá que configurar firma y notarización.

## Funciones iniciales

- Importar varias imágenes y elegir cuáles exportar.
- Diseñar un logo con texto, iniciales, símbolos y colores.
- Descargar el logo como PNG transparente.
- Usar el estilo de marca de agua de la web, texto o un logo propio.
- Aumentar el tamaño de la marca hasta el 150%, arrastrarla sobre la vista previa y redimensionarla desde su esquina.
- Ajustar posición, tamaño y opacidad y exportar imágenes por lotes.

El procesamiento de imágenes se realiza localmente en el dispositivo.
