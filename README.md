# www.qsocket.io

The static marketing site for [QSocket](https://github.com/qsocket/qsocket), built
with Vite + TypeScript + Tailwind CSS v4 and deployed to GitHub Pages.

The build output is plain HTML, CSS and JS. There is no backend component and no
runtime dependency on any service.

## Requirements

[Bun](https://bun.sh) 1.2 or newer, used as both the package manager and the
script runner.

## Getting started

```bash
bun install
bun run dev      # dev server with hot reload
```

## Building

```bash
./build.sh              # type-check, build into dist/
./build.sh --serve      # build, then preview dist/ locally
./build.sh --clean      # remove dist/ and node_modules/ first
./build.sh --reinstall  # reinstall dependencies even if they look current
./build.sh --help
```

`build.sh` installs dependencies, runs `tsc --noEmit`, builds with Vite, writes
`.nojekyll` into the output (GitHub Pages otherwise runs Jekyll over the tree and
drops any path starting with an underscore), and copies a root `CNAME` if one
exists.

The install step is skipped when `node_modules/` is newer than `package.json`
and `bun.lock`, so repeat builds do not pay for it. `SKIP_INSTALL=1` forces the
skip, `--reinstall` forces the install.

To build for a project page served from a subpath rather than a custom domain:

```bash
BASE_PATH=/www.qsocket.io/ ./build.sh
```

## Notes

- The page builds its DOM in TypeScript, so it needs JavaScript. `index.html`
  carries a `<noscript>` fallback with the install command and a link to the
  repository.
- UI icons are inline SVG (`src/lib/icons.ts`) rather than an icon font, so
  there is no render-blocking font request and no flash of fallback text.
- The connection-architecture diagram measures the rendered node positions and
  draws its connectors between them, which is what makes it correct at every
  viewport width in both the horizontal and stacked layouts.
