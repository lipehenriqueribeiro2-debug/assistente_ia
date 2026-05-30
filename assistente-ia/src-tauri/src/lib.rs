use serde::Serialize;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::Emitter;

#[derive(Clone, Serialize)]
struct LogPayload {
    module: String,
    lines: Vec<String>,
}

fn format_ts() -> String {
    let d = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = d.as_secs();
    format!("{:02}:{:02}:{:02}", (secs / 3600) % 24, (secs / 60) % 60, secs % 60)
}

fn infer_module(msg: &str) -> &str {
    let lower = msg.to_lowercase();
    if lower.contains("infra") || lower.contains("automacao") || lower.contains("pipeline") {
        "orquestracao"
    } else if lower.contains("estudo") || lower.contains("potencia") || lower.contains("academico") {
        "estudos"
    } else if lower.contains("musica") || lower.contains("midia") || lower.contains("spotify") || lower.contains("audio") {
        "spotifySync"
    } else {
        "orquestracao"
    }
}

#[tauri::command]
async fn processar_comando(app: tauri::AppHandle, mensagem: String) -> Result<String, String> {
    let mod_id = infer_module(&mensagem).to_string();
    let ack = format!("Comando '{}' enviado para processamento.", mensagem);

    thread::spawn(move || {
        let steps = vec![
            format!("> [{}] INFO: Comando recebido: {}", format_ts(), mensagem),
            format!("> [{}] INFO: Iniciando ambiente local.", format_ts()),
            format!("> [{}] INFO: Executando pipeline.", format_ts()),
            format!("> [{}] OK: Processo concluído com sucesso.", format_ts()),
        ];

        for line in steps {
            let _ = app.emit(
                "log-stream",
                LogPayload {
                    module: mod_id.clone(),
                    lines: vec![line],
                },
            );
            thread::sleep(Duration::from_millis(400));
        }
    });

    Ok(ack)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![processar_comando])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
