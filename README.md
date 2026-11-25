# Tetorica FM21290 Synth for Desktop

Play and edit six-operator DX7 sounds with the YM21290 (EGS) and YM21280 (OPS) core. Use the keyboard, schedule register writes in JavaScript, and process the output with Live FX. The Tauri app embeds the [browser release](https://kyorohiro.github.io/hello_ymfm_wasm/synth-fm21290/). Cassette, SysEx, Code and register trace exports use the system save dialog.

## Run and build

Install Node.js, Python 3.11 or newer, Rust and the [Tauri desktop prerequisites](https://v2.tauri.app/start/prerequisites/) for your platform. From this repository run:

```sh
npm ci
npm test
npm run dev
```

On macOS, `npm run build -- --bundles app -- --locked` creates `src-tauri/target/release/bundle/macos/Tetorica FM21290 Synth.app`. The Build Desktop workflow builds macOS DMGs, Windows NSIS and Linux DEB/AppImage bundles. Use workflow_dispatch or a version tag to start it.

## Embedded release

The app opens the bundled Synth directly. Sound, examples, presets and the plain Code editor work locally. Optional Monaco completion uses the same CDN as the browser version.

```sh
npm run import:release -- /path/to/tetorica_fm21290_synth_VERSION_itch.zip --version 0.0.1
npm run check:release
cargo test --manifest-path src-tauri/Cargo.toml --locked
cargo run --release --locked --features custom-protocol --manifest-path src-tauri/Cargo.toml --example webview_smoke
```

The importer records the archive and file hashes in `release.lock.json`. The smoke test opens a native window, checks the default performance in Files, and measures FM and Live FX output in a real-time audio context with muted output. The save bridge has separate JavaScript and Rust tests.

See the [Synth guide](dist/synth-fm21290/README.md) and [register reference](dist/synth-fm21290/registers.md). License notices are included in the embedded release.
