#!/usr/bin/env python3
from __future__ import annotations

import json
import pathlib
import tempfile

from northpoint_target_26_3 import materialize_port, tree_digest


def write(path: pathlib.Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def fake_pipeline(path: pathlib.Path) -> None:
    write(path, '''#!/usr/bin/env python3
import argparse, json, pathlib
p=argparse.ArgumentParser(); p.add_argument('source'); p.add_argument('--loader'); p.add_argument('--output'); p.add_argument('--mod-id'); p.add_argument('--mod-name'); p.add_argument('--group'); p.add_argument('--mod-version'); a=p.parse_args()
out=pathlib.Path(a.output)
def w(rel,text):
 x=out/rel; x.parent.mkdir(parents=True,exist_ok=True); x.write_text(text,encoding='utf-8')
if a.loader == 'fabric':
 w('build.gradle', "plugins { id 'net.fabricmc.fabric-loom' version '${loom_version}' }\\nloom {\\n splitEnvironmentSourceSets()\\n mods {\\n  'fixture' {\\n   sourceSet sourceSets.main\\n   sourceSet sourceSets.client\\n  }\\n }\\n}\\ndependencies { implementation 'net.fabricmc:fabric-loader:${loader_version}' }\\ntasks.withType(JavaCompile).configureEach { options.release = 25 }\\n")
 w('gradle.properties','minecraft_version=26.3\\nloader_version=0.19.5\\nloom_version=1.17-SNAPSHOT\\nfabric_api_version=0.161.0+26.3\\nmod_version='+a.mod_version+'\\nmaven_group='+a.group+'\\narchives_base_name='+a.mod_id+'\\n')
 w('gradle/wrapper/gradle-wrapper.properties','distributionUrl=https\\\\://services.gradle.org/distributions/gradle-9.6.0-bin.zip\\n')
 w('src/main/java/com/example/modid/Stub.java','package com.example.modid; public class Stub {}\\n')
 w('src/client/java/com/example/modid/StubClient.java','package com.example.modid; public class StubClient {}\\n')
 w('src/main/resources/fabric.mod.json',json.dumps({'schemaVersion':1,'id':a.mod_id,'version':'${version}','name':a.mod_name,'environment':'*','depends':{'fabricloader':'>=0.19.5','minecraft':'~26.3','java':'>=25','fabric-api':'*'}},indent=2)+'\\n')
else:
 w('build.gradle', "plugins { id 'java-library'; id 'net.neoforged.moddev' version '2.0.147' }\\njava.toolchain.languageVersion = JavaLanguageVersion.of(25)\\n")
 w('gradle.properties','minecraft_version=26.3\\nminecraft_version_range=[26.3]\\nneo_version=26.3.0.7-beta\\nmod_id='+a.mod_id+'\\nmod_name='+a.mod_name+'\\nmod_license=All Rights Reserved\\nmod_version='+a.mod_version+'\\nmod_group_id='+a.group+'\\n')
 w('gradle/wrapper/gradle-wrapper.properties','distributionUrl=https\\\\://services.gradle.org/distributions/gradle-9.2.1-bin.zip\\n')
 w('src/main/java/com/example/examplemod/Stub.java','package com.example.examplemod; public class Stub {}\\n')
 w('src/main/templates/META-INF/neoforge.mods.toml','license="${mod_license}"\\n[[mods]]\\nmodId="${mod_id}"\\nversion="${mod_version}"\\ndisplayName="${mod_name}"\\n[[dependencies.${mod_id}]]\\nmodId="neoforge"\\nversionRange="[${neo_version},)"\\n[[dependencies.${mod_id}]]\\nmodId="minecraft"\\nversionRange="${minecraft_version_range}"\\n')
semantic_tasks = [{'id':'screen-private-renderables-access'}] if a.loader == 'fabric' else []
ledger_items = [{'id':'semantic:screen-private-renderables-access','source_count':1,'status':'missing','target_evidence':None,'notes':'screen renderables migration'}] if a.loader == 'fabric' else []
w('devkit-evidence/semantic-port-plan.json',json.dumps({'tasks':semantic_tasks},indent=2)+'\\n')
w('porting-ledger.json',json.dumps({'schema_version':1,'items':ledger_items},indent=2)+'\\n')
w('devkit-26.3-lock.json',json.dumps({'target':{'minecraft':'26.3','loader':a.loader,'java':25}},indent=2)+'\\n')
''')


def fabric_case(root: pathlib.Path, pipeline: pathlib.Path) -> None:
    source, output = root / "fabric-source", root / "fabric-target"
    write(source / "gradle.properties", "minecraft_version=1.21\nversion=1.2.3\ngroup=com.example\nmodmenu_version=11.0.1\ncustom_flag=enabled\n")
    write(source / "build.gradle", """plugins { id 'net.fabricmc.fabric-loom-remap' version '1.7.4' }
repositories {
    maven { url = 'https://maven.terraformersmc.com/releases' }
}
dependencies {
    minecraft "com.mojang:minecraft:${project.minecraft_version}"
    mappings "net.fabricmc:yarn:1.21+build.9:v2"
    implementation "net.fabricmc:fabric-loader:0.16.0"
    modImplementation "com.terraformersmc:modmenu:${project.modmenu_version}"
}
loom {
    accessWidenerPath = file("src/main/resources/mod-id.accesswidener")
}
""")
    write(source / "gradle/libs.versions.toml", "[versions]\nhelper = \"1.2.3\"\n")
    write(source / "libs/local-helper.jar", "local-jar-placeholder\n")
    write(source / "buildSrc/src/main/groovy/BuildHelpers.groovy", "class BuildHelpers {}\n")
    write(source / "gradlew", "#!/bin/sh\nexit 0\n")
    (source / "gradlew").chmod(0o755)
    write(source / "gradle/wrapper/gradle-wrapper.jar", "wrapper-placeholder\n")
    write(source / "src/main/resources/fabric.mod.json", json.dumps({
        "schemaVersion": 1, "id": "mod-id", "version": "${version}", "name": "Legacy Example",
        "authors": ["Fixture"], "entrypoints": {"main": ["com.example.ExampleMod"]},
        "depends": {"fabricloader": ">=0.16.0", "minecraft": "~1.21", "java": ">=21", "fabric-api": "*"},
    }, indent=2) + "\n")
    write(source / "src/main/resources/modid.mixins.json", '{"required":true,"compatibilityLevel":"JAVA_21","mixins":[]}\n')
    write(source / "src/main/resources/mod-id.accesswidener", "accessWidener\tv1  named\n")
    write(source / "src/main/java/com/example/LegacyRenderApi.java", """package com.example;
import com.mojang.blaze3d.GpuFormat;
import com.mojang.blaze3d.IndexType;
import com.mojang.blaze3d.PrimitiveTopology;
import com.mojang.blaze3d.buffers.GpuBuffer;
import com.mojang.blaze3d.buffers.GpuBufferSlice;
import com.mojang.blaze3d.buffers.Std140Builder;
import com.mojang.blaze3d.pipeline.BindGroupLayout;
import com.mojang.blaze3d.pipeline.BlendFunction;
import com.mojang.blaze3d.pipeline.ColorTargetState;
import com.mojang.blaze3d.pipeline.RenderPipeline;
import com.mojang.blaze3d.shaders.UniformType;
import com.mojang.blaze3d.systems.CommandEncoder;
import com.mojang.blaze3d.systems.GpuDevice;
import com.mojang.blaze3d.systems.RenderPass;
import com.mojang.blaze3d.systems.RenderSystem;
import com.mojang.blaze3d.textures.FilterMode;
import com.mojang.blaze3d.textures.GpuSampler;
import com.mojang.blaze3d.textures.GpuTexture;
import com.mojang.blaze3d.textures.GpuTextureView;
class LegacyRenderApi {
  Object layout = BindGroupLayout.builder()
      .withUniform("DynamicTransforms", UniformType.UNIFORM_BUFFER)
      .withSampler("Sampler0")
      .build();
  void render(RenderPass pass, GpuTextureView view, GpuSampler sampler) {
    pass.bindTexture("Sampler0", view, sampler);
  }
  static class OtherPass {
    void bindTexture(String name, Object view, Object sampler) {}
  }
  void unrelated(OtherPass pass) {
    pass.bindTexture("Sampler0", null, null);
  }
}
""")
    write(source / "src/main/java/com/example/LegacyTextInput.java", """package com.example;
import org.lwjgl.glfw.GLFW;
class LegacyTextInput {
  String migrate(long window, int key, int scan, String value) {
    GLFW.glfwSetClipboardString(window, value);
    String clipboard = GLFW.glfwGetClipboardString(window);
    String keyName = GLFW.glfwGetKeyName(key, scan);
    return clipboard + keyName;
  }
}
""")
    write(source / "src/main/java/com/example/LegacyAuthlib.java", """package com.example;
import com.mojang.authlib.yggdrasil.ProfileResult;
import com.mojang.authlib.yggdrasil.FriendsService;
import com.mojang.authlib.yggdrasil.YggdrasilAuthenticationService;
import com.mojang.authlib.minecraft.UserApiService;
import java.net.Proxy;
class LegacyAuthlib {
  ProfileResult profile;
  FriendsService friends;
  void rebuild(Proxy proxy, String token) {
    YggdrasilAuthenticationService service = new YggdrasilAuthenticationService(proxy);
    UserApiService api = service.createUserApiService(token);
    FriendsService currentFriends = service.createFriendsService(token);
  }
}
""")
    write(source / "src/main/java/com/example/LegacyInput.java", """package com.example;
import net.minecraft.client.input.KeyEvent;
class LegacyInput {
  int minecraftKeycode(KeyEvent event) {
    return event.scancode();
  }
  static class OtherEvent {
    int scancode() { return 7; }
  }
  int unrelated(OtherEvent event) {
    return event.scancode();
  }
}
""")
    write(source / "src/main/java/com/example/LegacyScreen.java", """package com.example;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.gui.components.Renderable;
import net.minecraft.client.gui.screens.Screen;
class LegacyScreen extends Screen {
  @Override
  public void extractRenderState(GuiGraphicsExtractor context, int mouseX, int mouseY, float delta) {
    for (Renderable drawable : this.renderables) {
      drawable.extractRenderState(context, mouseX, mouseY, delta);
    }
  }
}
""")
    write(source / "src/main/java/com/example/ExampleMod.java", """package com.example;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.core.BlockPos;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.item.AxeItem;
import net.minecraft.world.item.ItemStack;
import net.minecraft.network.protocol.game.ServerboundSwingPacket;
import com.mojang.blaze3d.platform.InputConstants;
import org.lwjgl.glfw.GLFW;
public class ExampleMod {
  ResourceLocation id;
  void migrate(net.minecraft.client.Minecraft client, net.minecraft.client.player.LocalPlayer player, BlockPos pos) {
    int key = GLFW.GLFW_KEY_I;
    int press = GLFW.GLFW_PRESS;
    int release = GLFW.GLFW_RELEASE;
    int repeat = GLFW.GLFW_REPEAT;
    Object keyboardType = InputConstants.Type.KEYSYM;
    boolean controlDown = GLFW.glfwGetKey(windowHandle, GLFW.GLFW_KEY_LEFT_CONTROL) == GLFW.GLFW_PRESS;
    int rightControl = InputConstants.KEY_RIGHT_CONTROL;
    int leftShift = InputConstants.KEY_LEFT_SHIFT;
    int rightShift = InputConstants.KEY_RIGHT_SHIFT;
    int enter = InputConstants.KEY_ENTER;
    Object current = client.screen;
    client.setScreen(null);
    net.minecraft.client.Minecraft.getInstance().gui.setOverlayMessage(net.minecraft.network.chat.Component.empty(), false);
    if (net.minecraft.client.Minecraft.getInstance().options.hideGui) return;
    collector.submitNameTag(pose, state.nameTagAttachment, 10, label, true, state.lightCoords, state.distanceToCameraSq, camera);
    Object center = pos.getCenter();
    ItemStack stack = player.getMainHandItem();
    boolean axe = stack.getItem() instanceof AxeItem;
    player.swing(InteractionHand.MAIN_HAND, true);
    player.connection.send(new ServerboundSwingPacket(InteractionHand.MAIN_HAND));
  }
}
""")
    before = tree_digest(source)
    manifest = materialize_port(source, output, "fabric", pipeline_script=pipeline)
    assert before == tree_digest(source) == manifest["source"]["sha256"]
    assert manifest["source"]["mod_id"] == "mod-id"
    assert json.loads((output / "src/main/resources/fabric.mod.json").read_text())["id"] == "mod-id"
    assert {
        "fabric-metadata-target-dependencies",
        "fabric-preserve-unsplit-source-layout",
        "fabric-preserve-access-widener-path",
        "resource-location-to-identifier",
        "legacy-mixin-java-level",
    } <= set(manifest["applied_rule_ids"])
    render_java = (output / "src/main/java/com/example/LegacyRenderApi.java").read_text()
    assert "com.mojang.renderpearl.api.GpuFormat" in render_java
    assert "com.mojang.renderpearl.api.pipeline.IndexType" in render_java
    assert "com.mojang.renderpearl.api.pipeline.PrimitiveTopology" in render_java
    assert "com.mojang.renderpearl.api.buffers.GpuBuffer;" in render_java
    assert "com.mojang.renderpearl.api.buffers.GpuBufferSlice;" in render_java
    assert "com.mojang.renderpearl.api.pipeline.BindGroupLayout" in render_java
    assert "com.mojang.renderpearl.api.pipeline.BlendFunction" in render_java
    assert "com.mojang.renderpearl.api.pipeline.ColorTargetState" in render_java
    assert "com.mojang.renderpearl.api.pipeline.RenderPipeline" in render_java
    assert "com.mojang.renderpearl.api.pipeline.UniformType" in render_java
    assert "com.mojang.renderpearl.api.commands.CommandEncoder" in render_java
    assert "com.mojang.renderpearl.api.commands.RenderPass" in render_java
    assert "com.mojang.renderpearl.api.device.GpuDevice" in render_java
    assert "com.mojang.renderpearl.api.textures.FilterMode" in render_java
    assert "com.mojang.renderpearl.api.textures.GpuSampler" in render_java
    assert "com.mojang.renderpearl.api.textures.GpuTexture;" in render_java
    assert "com.mojang.renderpearl.api.textures.GpuTextureView" in render_java
    assert "com.mojang.blaze3d.buffers.Std140Builder" in render_java
    assert "com.mojang.blaze3d.systems.RenderSystem" in render_java
    assert '.withUniform("Sampler0", UniformType.COMBINED_IMAGE_SAMPLER)' in render_java
    assert '.withSampler("Sampler0")' not in render_java
    assert 'pass.setUniform("Sampler0", view, sampler);' in render_java
    assert 'void bindTexture(String name, Object view, Object sampler)' in render_java
    assert 'pass.bindTexture("Sampler0", null, null);' in render_java
    assert "minecraft-26.3-renderpearl-api-relocations" in manifest["applied_rule_ids"]
    assert "minecraft-26.3-renderpearl-sampler-uniforms" in manifest["applied_rule_ids"]
    text_input_java = (output / "src/main/java/com/example/LegacyTextInput.java").read_text()
    assert "Minecraft.getInstance().keyboardHandler.setClipboard(value)" in text_input_java
    assert "Minecraft.getInstance().keyboardHandler.getClipboard()" in text_input_java
    assert "InputConstants.Type.KEYBOARD.getOrCreate(key).getDisplayName().getString()" in text_input_java
    assert "org.lwjgl.glfw.GLFW" not in text_input_java
    assert "minecraft-26.3-glfw-text-input-helpers" in manifest["applied_rule_ids"]
    auth_java = (output / "src/main/java/com/example/LegacyAuthlib.java").read_text()
    assert "com.mojang.authlib.services.ProfileResult" in auth_java
    assert "com.mojang.authlib.services.FriendsService" in auth_java
    assert "com.mojang.authlib.yggdrasil.ProfileResult" not in auth_java
    assert "com.mojang.authlib.yggdrasil.FriendsService" not in auth_java
    assert "com.mojang.authlib.services.MinecraftServicesDiscoveryService" in auth_java
    assert "MinecraftServicesDiscoveryService service = MinecraftServicesDiscoveryService.create(proxy);" in auth_java
    assert "service.createUserApiService(token)" in auth_java
    assert "service.createFriendsService(token)" in auth_java
    assert "com.mojang.authlib.yggdrasil.YggdrasilAuthenticationService" not in auth_java
    assert "minecraft-26.3-authlib-service-package-relocations" in manifest["applied_rule_ids"]
    assert "minecraft-26.3-authlib-discovery-service-constructor" in manifest["applied_rule_ids"]
    input_java = (output / "src/main/java/com/example/LegacyInput.java").read_text()
    assert "event.keycode()" in input_java
    assert "minecraftKeycode(KeyEvent event)" in input_java
    assert "int scancode() { return 7; }" in input_java
    assert "unrelated(OtherEvent event)" in input_java
    assert "return event.scancode();" in input_java
    assert "minecraft-26.3-keyevent-scancode-to-keycode" in manifest["applied_rule_ids"]
    java = (output / "src/main/java/com/example/ExampleMod.java").read_text()
    assert "Identifier" in java
    assert "InputConstants.KEY_I" in java and "org.lwjgl.glfw.GLFW" not in java
    assert "InputConstants.PRESS" in java
    assert "InputConstants.RELEASE" in java
    assert "InputConstants.REPEAT" in java
    assert "InputConstants.Type.KEYBOARD" in java
    assert "InputConstants.isKeyDown(InputConstants.KEY_LCONTROL)" in java
    assert "InputConstants.KEY_RCONTROL" in java
    assert "InputConstants.KEY_LSHIFT" in java
    assert "InputConstants.KEY_RSHIFT" in java
    assert "InputConstants.KEY_RETURN" in java
    assert "GLFW.GLFW_PRESS" not in java
    assert "InputConstants.Type.KEYSYM" not in java
    assert "client.gui.screen()" in java and "client.gui.setScreen(null)" in java
    assert ".gui.hud.setOverlayMessage(" in java
    assert "Minecraft.getInstance().gui.hud.isHidden()" in java
    assert "state.lightCoords, camera)" in java
    assert "state.lightCoords, state.distanceToCameraSq, camera)" not in java
    assert "Vec3.atCenterOf(pos)" in java
    assert "SwingAnimation.DEFAULT" in java
    assert "stack.is(ItemTags.AXES)" in java
    assert "AxeItem" not in java
    assert "ServerboundSwingPacket" not in java
    expected_java_rules = {
        "minecraft-26.3-renderpearl-api-relocations",
        "minecraft-26.3-renderpearl-sampler-uniforms",
        "minecraft-26.3-authlib-service-package-relocations",
        "minecraft-26.3-authlib-discovery-service-constructor",
        "minecraft-26.3-keyevent-scancode-to-keycode",
        "minecraft-26.3-glfw-key-to-inputconstants",
        "minecraft-26.3-sdl-input-core",
        "minecraft-26.3-glfw-text-input-helpers",
        "minecraft-gui-set-screen",
        "minecraft-gui-screen-accessor",
        "minecraft-gui-to-hud-overlay",
        "minecraft-options-hide-gui-to-hud-hidden",
        "minecraft-26.2-submit-name-tag-drop-distance",
        "minecraft-26.2-blockpos-center-to-vec3",
        "minecraft-26.3-swing-animation-argument",
        "minecraft-26.3-axeitem-to-item-tag",
        "minecraft-26.3-remove-serverbound-swing-packet",
    }
    assert expected_java_rules <= set(manifest["applied_rule_ids"]), manifest["applied_rule_ids"]
    screen_java = (output / "src/main/java/com/example/LegacyScreen.java").read_text()
    assert "super.extractRenderState(context, mouseX, mouseY, delta);" in screen_java
    assert "this.renderables" not in screen_java
    assert "net.minecraft.client.gui.components.Renderable" not in screen_java
    assert "minecraft-26.3-screen-renderables-to-super-extract" in manifest["applied_rule_ids"]
    assert manifest["resolved_semantic_ids"] == ["screen-private-renderables-access"]
    ledger = json.loads((output / "porting-ledger.json").read_text())
    screen_item = next(x for x in ledger["items"] if x["id"] == "semantic:screen-private-renderables-access")
    assert screen_item["status"] == "regenerated"
    assert screen_item["target_evidence"][0]["rule"] == "minecraft-26.3-screen-renderables-to-super-extract"
    assert json.loads((output / "src/main/resources/modid.mixins.json").read_text())["compatibilityLevel"] == "JAVA_25"
    assert (output / "src/main/resources/mod-id.accesswidener").read_text().strip() == "accessWidener\tv1  official"
    assert "fabric-empty-access-widener-official-namespace" in manifest["applied_rule_ids"]
    assert "gradle-9.6.0-bin.zip" in (output / "gradle/wrapper/gradle-wrapper.properties").read_text()
    target_props = (output / "gradle.properties").read_text()
    assert "minecraft_version=26.3" in target_props
    assert "modmenu_version=11.0.1" in target_props and "custom_flag=enabled" in target_props
    preserved = (output / "northpoint-preserved.gradle").read_text()
    assert "https://maven.terraformersmc.com/releases" in preserved
    assert "com.terraformersmc:modmenu:${project.modmenu_version}" in preserved
    assert 'loom {' in preserved
    assert 'accessWidenerPath = file("src/main/resources/mod-id.accesswidener")' in preserved
    assert "com.mojang:minecraft:" not in preserved
    assert "net.fabricmc:fabric-loader:" not in preserved
    assert "mappings " not in preserved
    assert "net.fabricmc:yarn:" not in preserved
    target_build = (output / "build.gradle").read_text()
    assert "splitEnvironmentSourceSets()" not in target_build
    assert "sourceSet sourceSets.client" not in target_build
    assert 'apply from: file("northpoint-preserved.gradle")' in target_build
    assert (output / "gradle/libs.versions.toml").is_file()
    assert (output / "libs/local-helper.jar").is_file()
    assert (output / "buildSrc/src/main/groovy/BuildHelpers.groovy").is_file()
    assert set(manifest["preserved_gradle_properties"]) >= {"modmenu_version", "custom_flag"}
    assert manifest["preserved_build_files"]["gradle"] == 1
    assert manifest["preserved_build_files"]["libs"] == 1
    assert manifest["preserved_build_files"]["buildSrc"] == 1
    assert manifest["preserved_gradle_blocks"] == {
        "repositories": 1,
        "dependencies": 1,
        "loom_access_widener": 1,
    }


def fabric_complex_screen_case(root: pathlib.Path, pipeline: pathlib.Path) -> None:
    source, output = root / "fabric-complex-source", root / "fabric-complex-target"
    write(source / "gradle.properties", "minecraft_version=26.2\nversion=1.0.0\ngroup=com.example\n")
    write(source / "src/main/resources/fabric.mod.json", json.dumps({
        "schemaVersion": 1, "id": "complexscreen", "version": "1.0.0", "name": "Complex Screen",
        "depends": {"fabricloader": ">=0.19.3", "minecraft": "~26.2", "java": ">=25"},
    }, indent=2) + "\n")
    write(source / "src/main/java/com/example/ComplexScreen.java", """package com.example;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.gui.components.Renderable;
import net.minecraft.client.gui.screens.Screen;
class ComplexScreen extends Screen {
  @Override
  public void extractRenderState(GuiGraphicsExtractor context, int mouseX, int mouseY, float delta) {
    for (Renderable drawable : this.renderables) {
      before(drawable);
      drawable.extractRenderState(context, mouseX, mouseY, delta);
    }
  }
  void before(Renderable drawable) {}
}
""")
    manifest = materialize_port(source, output, "fabric", pipeline_script=pipeline)
    java = (output / "src/main/java/com/example/ComplexScreen.java").read_text()
    assert "this.renderables" in java
    assert "minecraft-26.3-screen-renderables-to-super-extract" not in manifest["applied_rule_ids"]
    assert manifest["resolved_semantic_ids"] == []
    ledger = json.loads((output / "porting-ledger.json").read_text())
    screen_item = next(x for x in ledger["items"] if x["id"] == "semantic:screen-private-renderables-access")
    assert screen_item["status"] == "missing"


def fabric_non_official_access_widener_guard_case(root: pathlib.Path, pipeline: pathlib.Path) -> None:
    source, output = root / "fabric-named-aw-source", root / "fabric-named-aw-target"
    write(source / "gradle.properties", "minecraft_version=26.2\nversion=1.0.0\ngroup=com.example\n")
    write(source / "build.gradle", """plugins { id 'net.fabricmc.fabric-loom' version '1.16-SNAPSHOT' }
loom {
    accessWidenerPath = file("src/main/resources/unsafe.accesswidener")
}
""")
    write(source / "src/main/resources/fabric.mod.json", json.dumps({
        "schemaVersion": 1,
        "id": "unsafeaw",
        "version": "1.0.0",
        "name": "Unsafe Named Access Widener",
        "accessWidener": "unsafe.accesswidener",
        "depends": {"fabricloader": ">=0.19.2", "minecraft": "~26.2", "java": ">=25"},
    }, indent=2) + "\n")
    write(
        source / "src/main/resources/unsafe.accesswidener",
        "accessWidener\tv1\tnamed\naccessible class net/minecraft/client/gui/components/AbstractSelectionList$Entry\n",
    )
    write(source / "src/main/java/com/example/UnsafeAw.java", "package com.example; class UnsafeAw {}\n")
    manifest = materialize_port(source, output, "fabric", pipeline_script=pipeline)
    assert "fabric-preserve-access-widener-path" not in manifest["applied_rule_ids"]
    assert "loom_access_widener" not in manifest["preserved_gradle_blocks"]
    preserved_path = output / "northpoint-preserved.gradle"
    if preserved_path.is_file():
        assert "accessWidenerPath" not in preserved_path.read_text()


def neoforge_case(root: pathlib.Path, pipeline: pathlib.Path) -> None:
    source, output = root / "neo-source", root / "neo-target"
    write(source / "gradle.properties", """minecraft_version=1.21.1
minecraft_version_range=[1.21.1]
neo_version=21.1.251
loader_version_range=[1,)
mod_id=examplemod
mod_name=Example Mod
mod_license=All Rights Reserved
mod_version=1.0.0
mod_group_id=com.example.examplemod
""")
    write(source / "gradlew", "#!/bin/sh\nexit 0\n")
    (source / "gradlew").chmod(0o755)
    write(source / "gradle/wrapper/gradle-wrapper.jar", "wrapper-placeholder\n")
    write(source / "src/main/templates/custom/banner.txt", "preserve-template\n")
    write(source / "src/main/templates/META-INF/neoforge.mods.toml", """modLoader="javafml"
loaderVersion="${loader_version_range}"
license="${mod_license}"
authors="Fixture Author"
[[mods]]
modId="${mod_id}"
version="${mod_version}"
displayName="${mod_name}"
description='''Preserve me.'''
[[dependencies.${mod_id}]]
modId="neoforge"
type="required"
versionRange="[21.1.251,)"
ordering="NONE"
side="BOTH"
[[dependencies.${mod_id}]]
modId="minecraft"
type="required"
versionRange="[1.21.1]"
ordering="NONE"
side="BOTH"
""")
    write(source / "src/main/resources/assets/examplemod/lang/en_us.json", '{"item.examplemod.example":"Example"}\n')
    write(source / "src/main/java/com/example/examplemod/ExampleMod.java", """package com.example.examplemod;
import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.state.BlockBehaviour;
class ExampleMod {
 Object a = BLOCKS.registerSimpleBlock("example_block", BlockBehaviour.Properties.of().strength(2.0f));
 Object b = ITEMS.registerSimpleItem("example_item", new Item.Properties().stacksTo(1));
}
""")
    write(source / "src/main/java/com/example/examplemod/Config.java", "package com.example.examplemod; import net.minecraft.resources.ResourceLocation; class Config { ResourceLocation id; }\n")
    before = tree_digest(source)
    manifest = materialize_port(source, output, "neoforge", pipeline_script=pipeline)
    assert before == tree_digest(source) == manifest["source"]["sha256"]
    assert manifest["source"]["loader"] == "neoforge" and manifest["source"]["minecraft"] == "1.21.1"
    rules = set(manifest["applied_rule_ids"])
    assert {
        "neoforge-metadata-target-schema",
        "neoforge-register-simple-block-properties-factory",
        "neoforge-register-simple-item-properties-factory",
        "resource-location-to-identifier",
    } <= rules, rules
    java = (output / "src/main/java/com/example/examplemod/ExampleMod.java").read_text()
    assert 'registerSimpleBlock("example_block", p -> p.strength(2.0f))' in java
    assert 'registerSimpleItem("example_item", p -> p.stacksTo(1))' in java
    assert "Identifier" in (output / "src/main/java/com/example/examplemod/Config.java").read_text()
    meta = (output / "src/main/templates/META-INF/neoforge.mods.toml").read_text()
    assert "modLoader=" not in meta and "loaderVersion=" not in meta
    assert 'authors="Fixture Author"' in meta and "Preserve me." in meta
    assert 'versionRange="[${neo_version},)"' in meta
    assert 'versionRange="${minecraft_version_range}"' in meta
    props = (output / "gradle.properties").read_text()
    assert "neo_version=26.3.0.7-beta" in props
    assert "gradle-9.2.1-bin.zip" in (output / "gradle/wrapper/gradle-wrapper.properties").read_text()
    assert (output / "src/main/resources/assets/examplemod/lang/en_us.json").is_file()
    assert (output / "src/main/templates/custom/banner.txt").read_text() == "preserve-template\n"


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="northpoint-target-263-") as td:
        root = pathlib.Path(td)
        pipeline = root / "fake_port_pipeline.py"
        fake_pipeline(pipeline)
        fabric_case(root, pipeline)
        fabric_complex_screen_case(root, pipeline)
        fabric_non_official_access_widener_guard_case(root, pipeline)
        neoforge_case(root, pipeline)
    print("Northpoint 26.3 target materialization self-test: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
