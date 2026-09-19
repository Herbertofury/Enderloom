"use strict";
// Start the real agent against a deliberately loaded-but-uninitialized client.
// The old probe initializes it on its worker and fails this test before gameplay.
const fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert/strict');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..'), temp = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-probe-'));
const run = (exe, args, cwd = temp) => {
  const r = spawnSync(exe, args, { cwd, encoding: 'utf8', windowsHide: true, timeout: 15000 });
  assert(!r.error, r.error?.message); assert.equal(r.status, 0, `${exe}: ${r.stdout}\n${r.stderr}`); return r.stdout;
};
try {
  fs.mkdirSync(path.join(temp, 'net/minecraft/client'), { recursive: true });
  fs.mkdirSync(path.join(temp, 'fixture'));
  fs.writeFileSync(path.join(temp, 'fixture/State.java'), `package fixture;
public class State { public static volatile boolean started, release; public static volatile String thread; public static volatile int calls; }`);
  fs.writeFileSync(path.join(temp, 'net/minecraft/client/Minecraft.java'), `package net.minecraft.client;
public class Minecraft {
  static {
    fixture.State.thread = Thread.currentThread().getName(); fixture.State.started = true;
    while (!fixture.State.release) try { Thread.sleep(10); } catch (InterruptedException e) { throw new RuntimeException(e); }
  }
  private static final Minecraft INSTANCE = new Minecraft();
  public Object player, level, screen;
  public static Minecraft getInstance() { fixture.State.calls++; return INSTANCE; }
  public int getFps() { return 73; }
}`);
  fs.writeFileSync(path.join(temp, 'fixture/Main.java'), `package fixture;
import java.nio.file.*;
public class Main {
  public static void main(String[] ignored) throws Exception {
    State.release = false;
    Class.forName("net.minecraft.client.Minecraft", false, Main.class.getClassLoader());
    Thread.sleep(800);
    if (State.started) throw new AssertionError("Probe forced initialization on " + State.thread);
    Thread game = new Thread(() -> { try { Class.forName("net.minecraft.client.Minecraft"); } catch (Exception e) { throw new RuntimeException(e); } }, "fixture game");
    game.start();
    long deadline = System.nanoTime() + 2000000000L;
    while (!State.started && System.nanoTime() < deadline) Thread.sleep(10);
    if (!State.started) throw new AssertionError("Game initializer did not start");
    Thread.sleep(500);
    if (State.calls != 0) throw new AssertionError("Probe entered incomplete class");
    for (Thread thread : Thread.getAllStackTraces().keySet()) if (thread.getName().equals("Enderloom telemetry")) {
      if (thread.getState() == Thread.State.BLOCKED) throw new AssertionError("Probe blocked on game initialization");
    }
    State.release = true; game.join(2000);
    if (game.isAlive()) throw new AssertionError("Game startup deadlocked");
    deadline = System.nanoTime() + 4000000000L;
    Path samples = Path.of("enderloom-telemetry.jsonl");
    while (!Files.exists(samples) && System.nanoTime() < deadline) Thread.sleep(50);
    if (!Files.exists(samples) || !Files.readString(samples).contains("\\\"fps\\\":73")) throw new AssertionError("Probe never resumed telemetry");
    if (!"fixture game".equals(State.thread)) throw new AssertionError("Wrong initialization owner");
    System.out.println("PASS startup ownership, initialization-in-progress, telemetry resumption: " + System.getProperty("java.version"));
  }
}`);
  run('javac', ['--release', '17', '-d', temp, 'fixture/State.java', 'fixture/Main.java', 'net/minecraft/client/Minecraft.java']);
  for (const java of process.argv.slice(2).length ? process.argv.slice(2) : ['java']) {
    fs.rmSync(path.join(temp, 'enderloom-telemetry.jsonl'), { force: true });
    process.stdout.write(run(java, ['-javaagent:' + path.join(root, 'tools/minecraft-probe/dist/enderloom-probe.jar'), '-cp', temp, 'fixture.Main']));
  }
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
