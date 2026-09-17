// Spark protocol fields: https://github.com/lucko/spark/tree/master/spark-common/src/main/proto/spark
// Original bounded decoder; unknown protobuf fields are skipped for forward compatibility.
export const MAX_EVIDENCE_BYTES = 32 * 1024 * 1024;
type Field = { id: number; wire: number; value: number | Uint8Array };
function varint(bytes: Uint8Array, position: { at: number }): number {
  let result = 0,
    shift = 0;
  for (let count = 0; count < 10; count++) {
    if (position.at >= bytes.length) throw new Error("Truncated Spark profile");
    const byte = bytes[position.at++];
    result += (byte & 127) * 2 ** shift;
    if (!(byte & 128)) return result;
    shift += 7;
  }
  throw new Error("Invalid Spark integer");
}
function fields(bytes: Uint8Array): Field[] {
  const result: Field[] = [],
    p = { at: 0 };
  while (p.at < bytes.length) {
    if (result.length > 500_000)
      throw new Error("Spark profile has too many fields");
    const tag = varint(bytes, p),
      id = Math.floor(tag / 8),
      wire = tag % 8;
    if (!id) throw new Error("Not a valid Spark protobuf profile");
    let value: number | Uint8Array;
    if (wire === 0) value = varint(bytes, p);
    else if (wire === 1 || wire === 5) {
      const length = wire === 1 ? 8 : 4;
      if (p.at + length > bytes.length)
        throw new Error("Truncated Spark number");
      const view = new DataView(bytes.buffer, bytes.byteOffset + p.at, length);
      value = wire === 1 ? view.getFloat64(0, true) : view.getFloat32(0, true);
      p.at += length;
    } else if (wire === 2) {
      const length = varint(bytes, p);
      if (
        !Number.isSafeInteger(length) ||
        length < 0 ||
        p.at + length > bytes.length
      )
        throw new Error("Truncated Spark field");
      value = bytes.subarray(p.at, p.at + length);
      p.at += length;
    } else throw new Error("Unsupported Spark wire encoding");
    result.push({ id, wire, value });
  }
  return result;
}
const messages = (f: Field[], id: number) =>
  f
    .filter((v) => v.id === id && v.value instanceof Uint8Array)
    .map((v) => fields(v.value as Uint8Array));
const message = (f: Field[], id: number) => messages(f, id)[0] ?? [];
const text = (f: Field[], id: number) =>
  new TextDecoder().decode(
    f.find((v) => v.id === id && v.value instanceof Uint8Array)?.value as
      | Uint8Array
      | undefined,
  );
const number = (f: Field[], id: number): number | null => {
  const v = f.find((v) => v.id === id && typeof v.value === "number")?.value;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};
function repeated(f: Field[], id: number, doubles = false): number[] {
  return f
    .filter((v) => v.id === id)
    .flatMap((v) => {
      if (typeof v.value === "number") return [v.value];
      const bytes = v.value,
        result: number[] = [],
        p = { at: 0 };
      if (doubles && bytes.length % 8)
        throw new Error("Invalid Spark sample values");
      while (p.at < bytes.length) {
        if (doubles) {
          result.push(
            new DataView(bytes.buffer, bytes.byteOffset + p.at, 8).getFloat64(
              0,
              true,
            ),
          );
          p.at += 8;
        } else result.push(varint(bytes, p));
      }
      return result;
    });
}
const sum = (v: number[]) =>
  v.reduce((n, x) => n + (Number.isFinite(x) && x > 0 ? x : 0), 0);
export interface SparkThread {
  name: string;
  total: number;
  mods: { name: string; value: number; percent: number }[];
  frames: {
    method: string;
    source: string;
    inclusive: number;
    percent: number;
  }[];
}
export interface EvidenceReport {
  id?: string;
  at?: number;
  instance_id?: string;
  title: string;
  kind: "spark" | "log";
  sha256?: string;
  url?: string;
  mode?: string;
  duration_ms?: number | null;
  platform?: string;
  tps?: number | null;
  mspt_mean?: number | null;
  mspt_p95?: number | null;
  mspt_max?: number | null;
  threads?: SparkThread[];
  warnings: string[];
  heap?: { type: string; instances: number; bytes: number; percent: number }[];
  findings?: {
    category: string;
    count: number;
    examples: { line: number; text: string }[];
    max_ms?: number;
  }[];
  spark_urls?: string[];
  line_count?: number;
}
export function sparkUrl(raw: string): string {
  raw = raw.trim();
  if (
    !/^https:\/\/spark\.lucko\.me\/[a-zA-Z0-9_-]{3,100}(?:[?#].*)?$/.test(raw)
  )
    throw new Error("Use a report link such as https://spark.lucko.me/Abc123");
  const url = new URL(raw);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "spark.lucko.me" ||
    url.port ||
    !/^\/[a-zA-Z0-9_-]{3,100}$/.test(url.pathname)
  )
    throw new Error("Use a report link such as https://spark.lucko.me/Abc123");
  return url.href;
}
export function analyzeSpark(bytes: Uint8Array, title: string): EvidenceReport {
  if (bytes.length > MAX_EVIDENCE_BYTES)
    throw new Error("Spark profile exceeds the 32 MiB analysis limit");
  const root = fields(bytes),
    metadata = message(root, 1),
    platform = message(metadata, 7),
    stats = message(metadata, 8);
  const rawThreads = messages(root, 2);
  if (!metadata.some((f) => f.id === 2 && f.wire === 0)) {
    const otherPlatform = message(metadata, 2),
      otherStats = message(metadata, 3);
    if (!text(otherPlatform, 2))
      throw new Error("Not a recognized Spark sampler, heap, or health report");
    const mspt = message(message(otherStats, 5), 1);
    const heap = rawThreads
      .filter((e) => text(e, 4))
      .map((e) => ({
        type: text(e, 4),
        instances: number(e, 2) || 0,
        bytes: number(e, 3) || 0,
        percent: 0,
      }));
    const total = sum(heap.map((e) => e.bytes));
    return {
      kind: "spark",
      title,
      mode: heap.length ? "Heap snapshot" : "Health snapshot",
      platform: `${text(otherPlatform, 2)} ${text(otherPlatform, 4)}`,
      tps: number(message(otherStats, 4), 1),
      mspt_mean: number(mspt, 1),
      mspt_p95: number(mspt, 5),
      mspt_max: number(mspt, 2),
      heap: heap
        .map((e) => ({ ...e, percent: total ? (e.bytes / total) * 100 : 0 }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 300),
      warnings: [
        "A snapshot describes the recorded moment. Heap size and tick duration do not establish a mod’s CPU cost or FPS loss.",
      ],
    };
  }
  if (!rawThreads.length)
    throw new Error("The Spark sampler report contains no sampled threads");
  const classSources = new Map(
    messages(root, 3).map((v) => [text(v, 1), text(v, 2)]),
  );
  const warnings = [
    "Percentages describe sampled work across the selected thread. They do not measure FPS loss or prove that removing a mod will recover that percentage.",
    "Mod totals use exclusive sampled work and Spark’s recorded class ownership. Unmapped frames stay unassigned; no package-name guesses.",
  ];
  if (!classSources.size)
    warnings.push(
      "This profile has no class ownership map. Per-mod attribution is unavailable.",
    );
  let nodeCount = 0;
  const threads = rawThreads.slice(0, 256).map((thread) => {
    const rawNodes = messages(thread, 3);
    const nodes = rawNodes.map((n) => ({
      className: text(n, 3),
      method: text(n, 4),
      value: sum(repeated(n, 8, true)) || number(n, 1) || 0,
      refs: repeated(n, 9),
    }));
    const roots = repeated(thread, 5);
    if (
      !roots.length &&
      rawNodes.some((n) => n.some((f) => f.id === 1 || f.id === 2))
    ) {
      nodes.length = 0;
      const flatten = (n: Field[], depth: number): number => {
        if (depth > 256 || nodes.length > 500_000)
          throw new Error("Legacy Spark stack exceeds the analysis limit");
        const id = nodes.length;
        nodes.push({
          className: text(n, 3),
          method: text(n, 4),
          value: number(n, 1) || 0,
          refs: [],
        });
        nodes[id].refs = messages(n, 2).map((child) =>
          flatten(child, depth + 1),
        );
        return id;
      };
      roots.push(...rawNodes.map((n) => flatten(n, 0)));
    }
    nodeCount += nodes.length;
    if (nodeCount > 500_000)
      throw new Error("Profile exceeds the 500,000 stack-node limit");
    if (!roots.length && nodes.length)
      throw new Error(
        "This profile uses an older stack layout. Open it in the full Spark viewer.",
      );
    const visited = new Set<number>(),
      stack = [...roots],
      mods = new Map<string, number>();
    let visits = 0;
    const frames: SparkThread["frames"] = [];
    let total = sum(repeated(thread, 4, true)) || number(thread, 2) || 0;
    if (!total) total = sum(roots.map((id) => nodes[id]?.value ?? 0));
    while (stack.length) {
      const id = stack.pop()!;
      if (id < 0) {
        visited.delete(-id - 1);
        continue;
      }
      if (++visits > 1_000_000)
        throw new Error("Spark stack expansion exceeds the analysis limit");
      if (!Number.isSafeInteger(id) || !nodes[id])
        throw new Error("Spark profile contains an invalid stack reference");
      if (visited.has(id))
        throw new Error("Spark profile contains cyclic stack references");
      visited.add(id);
      stack.push(-id - 1);
      const node = nodes[id];
      const childTime = sum(
        node.refs.map((ref) => {
          if (!nodes[ref])
            throw new Error(
              "Spark profile contains an invalid child reference",
            );
          return nodes[ref].value;
        }),
      );
      const source = classSources.get(node.className) || "Unassigned / runtime";
      const exclusive = Math.max(0, node.value - childTime);
      mods.set(source, (mods.get(source) || 0) + exclusive);
      frames.push({
        method: `${node.className}.${node.method}`,
        source,
        inclusive: node.value,
        percent: total ? (node.value / total) * 100 : 0,
      });
      stack.push(...node.refs);
    }
    const attributed = sum([...mods.values()]);
    if (total && attributed > total * 1.005)
      throw new Error(
        "Spark sample totals are inconsistent. Open the original profile in the full viewer to inspect its windows.",
      );
    if (total > attributed)
      mods.set(
        "Unassigned / runtime",
        (mods.get("Unassigned / runtime") || 0) + total - attributed,
      );
    return {
      name: text(thread, 1),
      total,
      mods: [...mods]
        .map(([name, value]) => ({
          name,
          value,
          percent: total ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 300),
      frames: frames.sort((a, b) => b.inclusive - a.inclusive).slice(0, 100),
    };
  });
  if (rawThreads.length > 256)
    warnings.push(
      "Only the first 256 threads were summarized. The complete report remains available in Spark.",
    );
  const mspt = message(message(stats, 5), 1),
    start = number(metadata, 2),
    end = number(metadata, 11);
  return {
    kind: "spark",
    title,
    warnings,
    mode:
      number(metadata, 15) === 1
        ? "Allocation samples (bytes)"
        : "Execution samples (milliseconds)",
    platform: `${text(platform, 2)} ${text(platform, 4)}`,
    duration_ms: start && end ? end - start : null,
    tps: number(message(stats, 4), 1),
    mspt_mean: number(mspt, 1),
    mspt_p95: number(mspt, 5),
    mspt_max: number(mspt, 2),
    threads,
  };
}
export function analyzeLog(body: string, title: string): EvidenceReport {
  const findings = new Map<
    string,
    {
      category: string;
      count: number;
      examples: { line: number; text: string }[];
      max_ms?: number;
    }
  >();
  const urls = new Set<string>();
  const lines = body.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const link of line.matchAll(
      /https:\/\/spark\.lucko\.me\/[A-Za-z0-9_-]{3,100}/g,
    ))
      urls.add(link[0]);
    const category = /Can't keep up!|Running \d+ms or \d+ ticks behind/i.test(
      line,
    )
      ? "Server falling behind"
      : /single server tick took|tick took \d|watchdog|server has not responded/i.test(
            line,
          )
        ? "Long ticks / watchdog"
        : /OutOfMemoryError|GC overhead limit|Java heap space/i.test(line)
          ? "Memory exhaustion"
          : /Pause (?:Young|Full|Remark)|\bGC\(\d+\).*Pause/.test(line)
            ? "GC pauses"
            : /OpenGL.*(?:error|out of memory)|GL_OUT_OF_MEMORY|Failed to compile.*shader/i.test(
                  line,
                )
              ? "Rendering / shader errors"
              : /Mixin.*(?:failed|error)|InvalidMixin|MixinApplyError/i.test(
                    line,
                  )
                ? "Mixin failures"
                : /\/(?:ERROR|FATAL)\]|\b(?:ERROR|FATAL)\b.*:/.test(line)
                  ? "Errors requiring review"
                  : "";
    if (!category) return;
    const group = findings.get(category) || {
      category,
      count: 0,
      examples: [],
    };
    group.count++;
    if (group.examples.length < 8)
      group.examples.push({ line: index + 1, text: line.slice(0, 1600) });
    if (category === "GC pauses" || category === "Long ticks / watchdog") {
      for (const match of line.matchAll(
        /([\d.]+)\s*(ms|milliseconds|seconds)/g,
      )) {
        const ms = Number(match[1]) * (match[2] === "seconds" ? 1000 : 1);
        if (Number.isFinite(ms)) group.max_ms = Math.max(group.max_ms || 0, ms);
      }
    }
    findings.set(category, group);
  });
  return {
    kind: "log",
    title,
    findings: [...findings.values()],
    spark_urls: [...urls],
    line_count: lines.length,
    warnings: [
      "Log messages identify symptoms, not per-mod CPU percentages or measured frame loss. FPS and frame-time attribution require a client profiler capture.",
      "Instance logs are read through Enderloom’s bounded, redacted log reader; very large logs may include only their tail. Line numbers refer to the analyzed text.",
    ],
  };
}
export async function boundedBytes(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const reader = stream.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_EVIDENCE_BYTES)
        throw new Error("Report exceeds the 32 MiB limit");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}
export async function unpackEvidence(bytes: Uint8Array): Promise<Uint8Array> {
  if (bytes[0] === 0x1f && bytes[1] === 0x8b)
    return boundedBytes(
      new Blob([bytes as BlobPart])
        .stream()
        .pipeThrough(new DecompressionStream("gzip")),
    );
  return bytes;
}
