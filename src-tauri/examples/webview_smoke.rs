// SPDX-License-Identifier: BSD-3-Clause
// Run against the embedded release assets with cargo's custom-protocol feature.
use tauri::webview::PageLoadEvent;

#[tauri::command]
fn smoke_result(error: Option<String>) {
    if let Some(message) = error {
        eprintln!("WebView smoke test failed: {message}");
        std::process::exit(1);
    } else {
        println!("Bundled FM21290 UI, EGS worklet PCM and Live FX gain verified.");
        std::process::exit(0);
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![smoke_result])
        .on_page_load(|webview, event| {
            if event.event() == PageLoadEvent::Finished {
                webview
                    .eval(include_str!("../../tests/webview-smoke.js"))
                    .unwrap();
            }
        })
        .run(tauri::generate_context!())
        .expect("Could not start FM21290 WebView smoke test");
}
