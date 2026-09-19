package enderloom.probe;

import java.lang.instrument.Instrumentation;
import java.lang.reflect.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.Executor;
import java.util.function.Consumer;

/** Read-only telemetry for Mojmap clients. No game rules, tick rate or renderer changes. */
public final class Probe {
    private static final List<Double> frames = new ArrayList<>();
    private static long previousFrame;
    private static boolean attached;
    private static boolean savedEnvironment;
    private static String lastCommand = "";
    private static volatile boolean automated;
    private static volatile String movement = "";
    private static volatile long moveUntil;
    public static void premain(String ignored, Instrumentation instrumentation) {
        Thread worker = new Thread(() -> observe(instrumentation), "Enderloom telemetry");
        worker.setDaemon(true);
        worker.start();
    }
    private static Object call(Object object, String method) throws Exception {
        return object.getClass().getMethod(method).invoke(object);
    }
    private static Object field(Object object, String name) throws Exception {
        return object.getClass().getField(name).get(object);
    }
    private static String quote(Object value) {
        if (value == null) return "null";
        return "\"" + value.toString().replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r") + "\"";
    }
    private static void observe(Instrumentation instrumentation) {
        Path target = Paths.get("enderloom-telemetry.jsonl");
        Object initializationInspector;
        Method needsInitialization;
        try {
            // Loading is not initialization. Calling getInstance while Minecraft is
            // initializing can deadlock its chat/resource classes against the main
            // thread. Only observe a class after the VM says initialization finished.
            // The agent opens this package to its own module; no JVM flags or game
            // bytecode changes are needed. Never fall back to forcing initialization.
            Class<?> unsafe = Class.forName("jdk.internal.misc.Unsafe");
            instrumentation.redefineModule(unsafe.getModule(), Set.of(), Map.of(),
                Map.of("jdk.internal.misc", Set.of(Probe.class.getModule())), Set.of(), Map.of());
            initializationInspector = unsafe.getMethod("getUnsafe").invoke(null);
            needsInitialization = unsafe.getMethod("shouldBeInitialized", Class.class);
        } catch (Throwable unsupported) {
            System.out.println("[Enderloom probe] Telemetry disabled: this JVM cannot safely inspect class initialization: " + unsupported);
            return;
        }
        Class<?> type = null;
        boolean initialized = false;
        for (int sample = 0; sample < 18000; sample++) {
            try {
                Thread.sleep(100);
                if (type == null) {
                    for (Class<?> candidate : instrumentation.getAllLoadedClasses()) {
                        if (candidate.getName().equals("net.minecraft.client.Minecraft")) { type = candidate; break; }
                    }
                    if (type == null) continue;
                }
                if (!initialized) {
                    if ((Boolean)needsInitialization.invoke(initializationInspector, type)) continue;
                    initialized = true;
                }
                Object minecraft = type.getMethod("getInstance").invoke(null);
                if (minecraft == null) continue;
                mailbox(minecraft);
                if (sample % 10 != 0) continue;
                int fps = ((Number)type.getMethod("getFps").invoke(minecraft)).intValue();
                Object player = field(minecraft, "player");
                Object level = field(minecraft, "level");
                Object screen = field(minecraft, "screen");
                // Loader event buses and mod inventories also belong to game startup.
                if (level != null) {
                    if (!attached) attachFrames(type);
                    if (!savedEnvironment) saveEnvironment(type, minecraft);
                }
                String dimension = level == null ? null : call(call(level, "dimension"), "location").toString();
                String item = player == null ? null : call(call(player, "getMainHandItem"), "getItem").toString();
                String coords = player == null ? "null" : "["+call(player,"getX")+","+call(player,"getY")+","+call(player,"getZ")+"]";
                String frameData;
                synchronized(frames) { frameData = frames.toString(); frames.clear(); }
                String line = "{\"at\":"+System.currentTimeMillis()+",\"fps\":"+fps+",\"frame_ms\":"+frameData+",\"dimension\":"+quote(dimension)+",\"held_item\":"+quote(item)+",\"position\":"+coords+",\"screen\":"+quote(screen == null ? null : call(call(screen,"getTitle"),"getString"))+"}\n";
                Files.write(target, line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            } catch (InterruptedException stop) { return; }
            catch (Throwable unavailable) {
                if (sample % 300 == 0) System.out.println("[Enderloom probe] Telemetry unavailable: " + unavailable.getClass().getSimpleName() + ": " + unavailable.getMessage());
            }
        }
    }
    private static void saveEnvironment(Class<?> type, Object minecraft) {
        try {
            Class<?> listType = Class.forName("net.neoforged.fml.ModList", true, type.getClassLoader());
            Object modList = listType.getMethod("get").invoke(null);
            List<?> mods = (List<?>)call(modList,"getMods");
            List<String> rows = new ArrayList<>();
            for (Object mod : mods) rows.add("{\"id\":"+quote(call(mod,"getModId"))+",\"version\":"+quote(call(mod,"getVersion"))+",\"name\":"+quote(call(mod,"getDisplayName"))+"}");
            Files.writeString(Paths.get("enderloom-loaded-mods.json"),"["+String.join(",",rows)+"]");
            savedEnvironment = true;
            ((Executor)minecraft).execute(() -> {
                try {
                    Class<?> gl = Class.forName("org.lwjgl.opengl.GL11",true,type.getClassLoader());
                    Method string = gl.getMethod("glGetString",int.class);
                    Object window = call(minecraft,"getWindow");
                    String json = "{\"java\":"+quote(System.getProperty("java.runtime.version"))+",\"java_vendor\":"+quote(System.getProperty("java.vendor"))+",\"os\":"+quote(System.getProperty("os.name"))+",\"os_version\":"+quote(System.getProperty("os.version"))+",\"processors\":"+Runtime.getRuntime().availableProcessors()+",\"max_heap_bytes\":"+Runtime.getRuntime().maxMemory()+",\"gpu_vendor\":"+quote(string.invoke(null,7936))+",\"gpu\":"+quote(string.invoke(null,7937))+",\"opengl\":"+quote(string.invoke(null,7938))+",\"width\":"+call(window,"getWidth")+",\"height\":"+call(window,"getHeight")+"}";
                    Files.writeString(Paths.get("enderloom-environment.json"),json);
                } catch(Throwable unavailable) { System.out.println("[Enderloom probe] GPU identity unavailable: "+unavailable); }
            });
        } catch(Throwable unavailable) { /* Runtime mod inventory is optional on unrecognized loaders. */ }
    }
    private static void attachFrames(Class<?> minecraft) {
        try {
            ClassLoader loader = minecraft.getClassLoader();
            Class<?> neo = Class.forName("net.neoforged.neoforge.common.NeoForge", true, loader);
            Object bus = neo.getField("EVENT_BUS").get(null);
            Class<?> api = Class.forName("net.neoforged.bus.api.IEventBus", true, loader);
            Class<?> event = Class.forName("net.neoforged.neoforge.client.event.RenderFrameEvent$Post", true, loader);
            Consumer<Object> listener = ignored -> {
                if (automated) try {
                    Object mc=minecraft.getMethod("getInstance").invoke(null);
                    if(field(mc,"screen")==null) call(field(mc,"mouseHandler"),"releaseMouse");
                } catch(Exception unavailable) { }
                long now = System.nanoTime();
                synchronized(frames) {
                    if (previousFrame != 0 && frames.size() < 30000) frames.add((now-previousFrame)/1000000.0);
                    previousFrame = now;
                }
            };
            api.getMethod("addListener", Class.class, Consumer.class).invoke(bus, event, listener);
            Consumer<Object> input = ev -> {
                if (!automated) return;
                try {
                    Object controls=call(ev,"getInput");String direction=System.currentTimeMillis()<moveUntil?movement:"";
                    for(String key:List.of("up","down","left","right","jumping","shiftKeyDown")) {
                        boolean down=key.equals("up")&&direction.equals("forward")||key.equals("down")&&direction.equals("back")||key.equals("left")&&direction.equals("left")||key.equals("right")&&direction.equals("right")||key.equals("jumping")&&direction.equals("jump");
                        controls.getClass().getField(key).setBoolean(controls,down);
                    }
                    controls.getClass().getField("forwardImpulse").setFloat(controls,direction.equals("forward")?1:direction.equals("back")?-1:0);
                    controls.getClass().getField("leftImpulse").setFloat(controls,direction.equals("left")?1:direction.equals("right")?-1:0);
                }catch(Exception failure){System.out.println("[Enderloom probe] Automated movement failed: "+failure);}
            };
            api.getMethod("addListener",Class.class,Consumer.class).invoke(bus,Class.forName("net.neoforged.neoforge.client.event.MovementInputUpdateEvent",true,loader),input);
            Consumer<Object> mouse = ev -> {
                if (!automated) return;
                try {Object mc=minecraft.getMethod("getInstance").invoke(null);if(field(mc,"screen")==null)ev.getClass().getMethod("setCanceled",boolean.class).invoke(ev,true);}catch(Exception ignored){}
            };
            api.getMethod("addListener",Class.class,Consumer.class).invoke(bus,Class.forName("net.neoforged.neoforge.client.event.InputEvent$MouseButton$Pre",true,loader),mouse);
            attached = true;
            System.out.println("[Enderloom probe] Render-frame telemetry attached (NeoForge).");
        } catch (Throwable unsupported) { /* Other loaders still expose explicitly supported observations. */ }
    }
    private static void mailbox(Object minecraft) throws Exception {
        Path path = Paths.get("enderloom-probe-command.txt");
        if (!Files.isRegularFile(path) || Files.size(path) > 512) return;
        String body = Files.readString(path);
        String[] parts = body.split("\n", 2);
        if (parts.length != 2 || parts[0].equals(lastCommand)) return;
        lastCommand = parts[0];
        String action = parts[1].trim();
        ((Executor)minecraft).execute(() -> {
            try {
                if(action.equals("automation on")||action.equals("automation off")) {
                    if(!attached)throw new IllegalStateException("Automated input requires the NeoForge test adapter");
                    automated=action.endsWith("on");movement="";
                    System.out.println("[Enderloom action "+parts[0]+"] OK "+action);return;
                }
                if(action.startsWith("move ")) {
                    String[] args=action.split(" ");long duration=Long.parseLong(args[2]);
                    if(!automated||duration<0||duration>10000||!List.of("forward","back","left","right","jump").contains(args[1]))throw new IllegalArgumentException("Use automated move direction 0–10000ms");
                    movement=args[1];moveUntil=System.currentTimeMillis()+duration;
                    System.out.println("[Enderloom action "+parts[0]+"] OK "+action);return;
                }
                if (field(minecraft,"player") == null || field(minecraft,"screen") != null) throw new IllegalStateException("Enter a world and close the menu before using game actions");
                String method = action.equals("attack") ? "startAttack" : action.equals("use") ? "startUseItem" : null;
                if (method == null) throw new IllegalArgumentException("Supported probe actions: attack, use");
                Object hit = field(minecraft,"hitResult");
                String target = hit == null ? "none" : call(hit,"getType").toString();
                Method callback = minecraft.getClass().getDeclaredMethod(method);
                callback.setAccessible(true);
                Object result = callback.invoke(minecraft);
                System.out.println("[Enderloom action " + parts[0] + "] OK " + action + " target=" + target + " result=" + result);
            } catch(Throwable failure) {
                System.out.println("[Enderloom action " + parts[0] + "] FAILED " + failure);
            }
        });
    }
}
