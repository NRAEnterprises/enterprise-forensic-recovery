use sha2::{Digest, Sha256};
use std::env;
use std::fs::OpenOptions;
use std::io::{self, Read, Seek, SeekFrom, Write};
use std::path::Path;

pub mod cloud;

const CHUNK: usize = 1024 * 1024;

fn usage() -> ! {
    eprintln!("usage: recovery-native image <source> <output> [--resume] [--offset N]");
    std::process::exit(64);
}

fn parse_u64(value: Option<&String>, name: &str) -> u64 {
    value.unwrap_or_else(|| { eprintln!("missing {name}"); std::process::exit(64) }).parse().unwrap_or_else(|_| { eprintln!("invalid {name}"); std::process::exit(64) })
}

fn image(source: &Path, output: &Path, resume: bool, offset: u64) -> io::Result<()> {
    if source == output { return Err(io::Error::new(io::ErrorKind::InvalidInput, "source and output must differ")); }
    let mut input = OpenOptions::new().read(true).write(false).open(source)?;
    let source_len = input.metadata()?.len();
    let start = if resume { output.metadata().map(|m| m.len()).unwrap_or(offset) } else { offset };
    if start > source_len { return Err(io::Error::new(io::ErrorKind::InvalidInput, "resume offset exceeds source size")); }
    input.seek(SeekFrom::Start(start))?;
    let mut out = if start > 0 { OpenOptions::new().write(true).read(true).open(output)? } else { OpenOptions::new().create_new(true).write(true).read(true).open(output)? };
    out.seek(SeekFrom::Start(start))?;
    let mut hasher = Sha256::new();
    let mut buffer = vec![0u8; CHUNK];
    let mut position = start;
    let mut errors: Vec<serde_json::Value> = Vec::new();
    loop {
        match input.read(&mut buffer) {
            Ok(0) => break,
            Ok(count) => { if let Err(error) = out.write_all(&buffer[..count]) { errors.push(serde_json::json!({"offset": position, "bytes": count, "error": error.to_string()})); break; } hasher.update(&buffer[..count]); position += count as u64; }
            Err(error) => { errors.push(serde_json::json!({"offset": position, "error": error.to_string()})); break; }
        }
    }
    out.sync_all()?;
    let digest = format!("{:x}", hasher.finalize());
    let result = serde_json::json!({"source": source, "output": output, "sourceBytes": source_len, "copiedFrom": start, "copiedBytes": position.saturating_sub(start), "sha256OfCopiedRange": digest, "complete": position == source_len && errors.is_empty(), "errors": errors});
    println!("{}", serde_json::to_string_pretty(&result).unwrap());
    if position != source_len || !result["errors"].as_array().unwrap().is_empty() { std::process::exit(2); }
    Ok(())
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 4 || args[1] != "image" { usage(); }
    let resume = args.iter().any(|x| x == "--resume");
    let offset = args.iter().position(|x| x == "--offset").map(|i| parse_u64(args.get(i + 1), "offset")).unwrap_or(0);
    if let Err(error) = image(Path::new(&args[2]), Path::new(&args[3]), resume, offset) { eprintln!("image failed: {error}"); std::process::exit(1); }
}
