//! Bounded Spark sampler decoding for automatic reports and the standalone CLI.
use crate::error::{Error, Result};
use serde_json::{json, Value};
use std::{
    collections::{HashMap, HashSet},
    io::Read,
};
const MAX: usize = 32 * 1024 * 1024;
fn invalid() -> Error {
    Error::other("Invalid, inconsistent or oversized Spark profile")
}
#[derive(Clone)]
struct F<'a> {
    id: u64,
    wire: u8,
    bytes: &'a [u8],
    n: Option<f64>,
}
fn var(b: &[u8], p: &mut usize) -> Result<u64> {
    let mut n = 0u64;
    for shift in (0..70).step_by(7) {
        let c = *b.get(*p).ok_or_else(invalid)?;
        *p += 1;
        if shift == 63 && c > 1 {
            return Err(invalid());
        }
        n |= ((c & 127) as u64) << shift;
        if c & 128 == 0 {
            return Ok(n);
        }
    }
    Err(invalid())
}
fn fields(b: &[u8]) -> Result<Vec<F<'_>>> {
    let mut p = 0;
    let mut out = Vec::new();
    while p < b.len() {
        if out.len() > 500000 {
            return Err(invalid());
        }
        let tag = var(b, &mut p)?;
        let id = tag >> 3;
        let wire = (tag & 7) as u8;
        if id == 0 {
            return Err(invalid());
        }
        let mut f = F {
            id,
            wire,
            bytes: &[],
            n: None,
        };
        match wire {
            0 => f.n = Some(var(b, &mut p)? as f64),
            1 | 5 => {
                let size = if wire == 1 { 8 } else { 4 };
                let part = b.get(p..p + size).ok_or_else(invalid)?;
                f.n = Some(if wire == 1 {
                    f64::from_le_bytes(part.try_into().unwrap())
                } else {
                    f32::from_le_bytes(part.try_into().unwrap()) as f64
                });
                p += size;
            }
            2 => {
                let len = usize::try_from(var(b, &mut p)?).map_err(|_| invalid())?;
                let end = p.checked_add(len).ok_or_else(invalid)?;
                f.bytes = b.get(p..end).ok_or_else(invalid)?;
                p = end;
            }
            _ => return Err(invalid()),
        }
        out.push(f);
    }
    Ok(out)
}
fn msgs<'a>(f: &[F<'a>], id: u64) -> Result<Vec<Vec<F<'a>>>> {
    f.iter()
        .filter(|f| f.id == id && f.wire == 2)
        .map(|f| fields(f.bytes))
        .collect()
}
fn msg<'a>(f: &[F<'a>], id: u64) -> Result<Vec<F<'a>>> {
    f.iter()
        .find(|f| f.id == id && f.wire == 2)
        .map(|f| fields(f.bytes))
        .unwrap_or_else(|| Ok(vec![]))
}
fn txt(f: &[F<'_>], id: u64) -> String {
    f.iter()
        .find(|f| f.id == id && f.wire == 2)
        .map(|f| String::from_utf8_lossy(f.bytes).into_owned())
        .unwrap_or_default()
}
fn num(f: &[F<'_>], id: u64) -> Option<f64> {
    f.iter()
        .find(|f| f.id == id && f.n.is_some())
        .and_then(|f| f.n)
        .filter(|v| v.is_finite())
}
fn repeated(f: &[F<'_>], id: u64, doubles: bool) -> Result<Vec<f64>> {
    let mut out = vec![];
    for f in f.iter().filter(|f| f.id == id) {
        if let Some(n) = f.n {
            out.push(n);
        } else {
            let mut p = 0;
            while p < f.bytes.len() {
                if doubles {
                    let b = f.bytes.get(p..p + 8).ok_or_else(invalid)?;
                    out.push(f64::from_le_bytes(b.try_into().unwrap()));
                    p += 8;
                } else {
                    out.push(var(f.bytes, &mut p)? as f64);
                }
            }
        }
    }
    if out.iter().any(|n| !n.is_finite() || *n < 0.0) {
        return Err(invalid());
    }
    Ok(out)
}
struct Node {
    class: String,
    method: String,
    value: f64,
    refs: Vec<usize>,
}
fn node(f: &[F<'_>]) -> Result<Node> {
    let refs = repeated(f, 9, false)?
        .into_iter()
        .map(|n| {
            if n.fract() != 0.0 || n > 500000.0 {
                return Err(invalid());
            }
            Ok(n as usize)
        })
        .collect::<Result<Vec<_>>>()?;
    let value = repeated(f, 8, true)?.iter().sum::<f64>();
    Ok(Node {
        class: txt(f, 3),
        method: txt(f, 4),
        value: if value > 0.0 {
            value
        } else {
            num(f, 1).unwrap_or(0.0)
        },
        refs,
    })
}
fn flatten(f: &[F<'_>], nodes: &mut Vec<Node>, depth: usize) -> Result<usize> {
    if depth > 256 || nodes.len() > 500000 {
        return Err(invalid());
    }
    let id = nodes.len();
    let mut n = node(f)?;
    n.refs.clear();
    nodes.push(n);
    for child in msgs(f, 2)? {
        let child = flatten(&child, nodes, depth + 1)?;
        nodes[id].refs.push(child);
    }
    Ok(id)
}
pub fn spark(input: &[u8], title: &str) -> Result<Value> {
    if input.len() > MAX {
        return Err(invalid());
    }
    let decoded;
    let bytes = if input.starts_with(&[31, 139]) {
        let mut out = Vec::new();
        flate2::read::GzDecoder::new(input)
            .take((MAX + 1) as u64)
            .read_to_end(&mut out)?;
        if out.len() > MAX {
            return Err(invalid());
        }
        decoded = out;
        &decoded
    } else {
        input
    };
    let root = fields(bytes)?;
    let meta = msg(&root, 1)?;
    let sampler = meta.iter().any(|f| f.id == 2 && f.wire == 0);
    let platform = msg(&meta, if sampler { 7 } else { 2 })?;
    let stats = msg(&meta, if sampler { 8 } else { 3 })?;
    if txt(&platform, 2).is_empty() {
        return Err(invalid());
    }
    let mspt = msg(&msg(&stats, 5)?, 1)?;
    let mut result = json!({"kind":"spark","title":title,"platform":format!("{} {}",txt(&platform,2),txt(&platform,4)),"tps":num(&msg(&stats,4)?,1),"mspt_mean":num(&mspt,1),"mspt_p95":num(&mspt,5),"mspt_max":num(&mspt,2),"warnings":["Exclusive sample shares use Spark’s recorded class ownership. They include sampled waiting where the profiler includes it; they are not mod CPU utilization, FPS loss or a causal removal estimate.","Inclusive call frames overlap. Unmapped work remains unassigned."]});
    if !sampler {
        let mut heap=msgs(&root,2)?.into_iter().filter(|e|!txt(e,4).is_empty()).map(|e|json!({"type":txt(&e,4),"instances":num(&e,2).unwrap_or(0.0),"bytes":num(&e,3).unwrap_or(0.0)})).collect::<Vec<_>>();
        let total = heap
            .iter()
            .map(|e| e["bytes"].as_f64().unwrap_or(0.0))
            .sum::<f64>();
        for e in &mut heap {
            e["percent"] = json!(if total > 0.0 {
                e["bytes"].as_f64().unwrap_or(0.0) / total * 100.0
            } else {
                0.0
            });
        }
        heap.sort_by(|a, b| {
            b["bytes"]
                .as_f64()
                .unwrap_or(0.0)
                .total_cmp(&a["bytes"].as_f64().unwrap_or(0.0))
        });
        heap.truncate(300);
        result["mode"] = json!(if heap.is_empty() {
            "Health snapshot"
        } else {
            "Heap snapshot"
        });
        result["heap"] = json!(heap);
        return Ok(result);
    }
    let owners: HashMap<String, String> = msgs(&root, 3)?
        .iter()
        .map(|f| (txt(f, 1), txt(f, 2)))
        .collect();
    let raw = msgs(&root, 2)?;
    if raw.is_empty() {
        return Err(invalid());
    }
    let mut threads = vec![];
    let mut count = 0;
    for thread in raw.iter().take(256) {
        let raw_nodes = msgs(thread, 3)?;
        let mut nodes = raw_nodes
            .iter()
            .map(|n| node(n))
            .collect::<Result<Vec<_>>>()?;
        let mut roots = repeated(thread, 5, false)?
            .into_iter()
            .map(|n| n as usize)
            .collect::<Vec<_>>();
        if roots.is_empty()
            && raw_nodes
                .iter()
                .any(|n| n.iter().any(|f| f.id == 1 || f.id == 2))
        {
            nodes.clear();
            for n in &raw_nodes {
                roots.push(flatten(n, &mut nodes, 0)?);
            }
        }
        count += nodes.len();
        if count > 500000 || (!nodes.is_empty() && roots.is_empty()) {
            return Err(invalid());
        }
        let mut total = repeated(thread, 4, true)?.iter().sum::<f64>();
        if total <= 0.0 {
            total = num(thread, 2).unwrap_or(0.0);
        }
        if total <= 0.0 {
            for id in &roots {
                total += nodes.get(*id).ok_or_else(invalid)?.value;
            }
        }
        let mut stack = roots.iter().map(|i| (*i, false)).collect::<Vec<_>>();
        let mut visited = HashSet::new();
        let mut visits = 0;
        let mut mods: HashMap<String, f64> = HashMap::new();
        let mut frames = vec![];
        while let Some((id, exit)) = stack.pop() {
            if exit {
                visited.remove(&id);
                continue;
            }
            visits += 1;
            if visits > 1000000 || !visited.insert(id) {
                return Err(invalid());
            }
            let n = nodes.get(id).ok_or_else(invalid)?;
            if n.value < 0.0 || !n.value.is_finite() {
                return Err(invalid());
            }
            let children = n
                .refs
                .iter()
                .map(|i| nodes.get(*i).map(|n| n.value).ok_or_else(invalid))
                .collect::<Result<Vec<_>>>()?
                .iter()
                .sum::<f64>();
            let owner = owners
                .get(&n.class)
                .filter(|v| !v.is_empty())
                .map(String::as_str)
                .unwrap_or("Unassigned / runtime");
            *mods.entry(owner.into()).or_default() += (n.value - children).max(0.0);
            frames.push(json!({"method":format!("{}.{}",n.class,n.method),"source":owner,"inclusive":n.value,"percent":if total>0.0{n.value/total*100.0}else{0.0}}));
            stack.push((id, true));
            stack.extend(n.refs.iter().map(|i| (*i, false)));
        }
        let attributed = mods.values().sum::<f64>();
        if total > 0.0 && attributed > total * 1.005 {
            return Err(invalid());
        }
        if total > attributed {
            *mods.entry("Unassigned / runtime".into()).or_default() += total - attributed;
        }
        let mut mods=mods.into_iter().map(|(name,value)|json!({"name":name,"value":value,"percent":if total>0.0{value/total*100.0}else{0.0}})).collect::<Vec<_>>();
        mods.sort_by(|a, b| {
            b["value"]
                .as_f64()
                .unwrap_or(0.0)
                .total_cmp(&a["value"].as_f64().unwrap_or(0.0))
        });
        mods.truncate(300);
        frames.sort_by(|a, b| {
            b["inclusive"]
                .as_f64()
                .unwrap_or(0.0)
                .total_cmp(&a["inclusive"].as_f64().unwrap_or(0.0))
        });
        frames.truncate(100);
        threads.push(json!({"name":txt(thread,1),"total":total,"mods":mods,"frames":frames}));
    }
    threads.sort_by_key(|t| match t["name"].as_str().unwrap_or("") {
        "Server thread" => 0,
        "Render thread" => 1,
        _ => 2,
    });
    result["mode"] = json!(if num(&meta, 15) == Some(1.0) {
        "Allocation samples (bytes)"
    } else {
        "Execution samples (milliseconds)"
    });
    result["duration_ms"] = json!(num(&meta, 11).zip(num(&meta, 2)).map(|(e, s)| e - s));
    result["threads"] = json!(threads);
    Ok(result)
}
pub fn log(text: &str, title: &str) -> Value {
    let mut groups: HashMap<&str, Value> = HashMap::new();
    for (i, line) in text.lines().enumerate() {
        let low = line.to_lowercase();
        let category = if low.contains("can't keep up!") {
            "Server falling behind"
        } else if low.contains("watchdog") || low.contains("single server tick took") {
            "Long ticks / watchdog"
        } else if low.contains("outofmemoryerror") || low.contains("java heap space") {
            "Memory exhaustion"
        } else if low.contains("mixin") && (low.contains("failed") || low.contains("error")) {
            "Mixin failures"
        } else if low.contains("opengl") && low.contains("error")
            || low.contains("failed to compile") && low.contains("shader")
        {
            "Rendering / shader errors"
        } else if low.contains("/error") || low.contains("/fatal") {
            "Errors requiring review"
        } else {
            continue;
        };
        let group = groups
            .entry(category)
            .or_insert_with(|| json!({"category":category,"count":0,"examples":[]}));
        group["count"] = json!(group["count"].as_u64().unwrap() + 1);
        let examples = group["examples"].as_array_mut().unwrap();
        if examples.len() < 8 {
            examples.push(json!({"line":i+1,"text":line.chars().take(1600).collect::<String>()}));
        }
    }
    let mut findings = groups.into_values().collect::<Vec<_>>();
    findings.sort_by(|a, b| a["category"].as_str().cmp(&b["category"].as_str()));
    json!({"kind":"log","title":title,"findings":findings,"line_count":text.lines().count(),"spark_urls":[],"warnings":["Log symptoms do not establish which mod caused a hitch or how much FPS it cost. Inspect matching timestamps and profiler evidence."]})
}
