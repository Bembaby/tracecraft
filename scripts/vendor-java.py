"""Author-only packaging for the pinned, already built browser Java runtime.

Usage: python scripts/vendor-java.py PATH_TO_TEAVM_JAVAC_CHECKOUT [OUTPUT_DIRECTORY]
Requires its :compiler:createDist build and pinned dependency source JARs in Gradle.
This script never executes learner code. No JDK is required by the website user.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
import zipfile

revision = "208d4c97a602ba0df055f16e6882059fb69d0122"
jdk_revision = "6c48f4ed707bf0b15f9b6098de30db8aae6fa40f"
script_base = Path(__file__).resolve().parent
checkout = Path(sys.argv[1]).resolve()
checkout_revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=checkout, text=True).strip() if (checkout / ".git").exists() else (checkout / "SOURCE_REVISION.txt").read_text().strip()
if checkout_revision != revision:
    raise SystemExit("The compiler checkout does not match the pinned revision.")
destination = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("public/vendor/java")
destination.mkdir(parents=True, exist_ok=True)
generated = checkout / "compiler/build/generated/teavm/wasm-gc"
shutil.copy2(generated / "compiler.wasm", destination / "compiler.wasm")
for name in ["compile-classlib-teavm.bin", "runtime-classlib-teavm.bin"]:
    shutil.copy2(checkout / "compiler/build/classlib" / name, destination / name)
subprocess.run(["node", str(script_base / "java-runtime-patch.mjs"), str(generated / "compiler.wasm-runtime.js"), str(destination / "runtime.mjs")], check=True)

archive = destination / "corresponding-source.zip"
with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as output:
    output.writestr("teavm-javac/SOURCE_REVISION.txt", revision + "\n")
    for path in (script_base / "java-notices").iterdir():
        output.write(path, "tracecraft-build/java-notices/" + path.name)
    tracked = subprocess.check_output(["git", "ls-files"], cwd=checkout, text=True).splitlines() if (checkout / ".git").exists() else [p.relative_to(checkout).as_posix() for p in checkout.rglob("*") if p.is_file() and not any(part in {"build", ".gradle", ".git"} for part in p.relative_to(checkout).parts)]
    for name in tracked:
        path = checkout / name
        if path.is_file() and name != "SOURCE_REVISION.txt":
            output.write(path, "teavm-javac/" + name)
    with zipfile.ZipFile(checkout / f"javac/build/jdk-{jdk_revision}.zip") as source:
        prefix = f"jdk25u-{jdk_revision}/"
        included = ["src/jdk.compiler/", "src/java.compiler/", "src/jdk.internal.opt/", "src/java.base/share/classes/jdk/internal/jmod/", "make/langtools/tools/"]
        for entry in source.infolist():
            name = entry.filename.removeprefix(prefix)
            if entry.is_dir():
                continue
            if name in ["LICENSE", "ASSEMBLY_EXCEPTION", "ADDITIONAL_LICENSE_INFO"] or any(name.startswith(p) for p in included) or "/legal/" in name:
                content = source.read(entry)
                output.writestr("openjdk/" + name, content)
                if name in ["LICENSE", "ASSEMBLY_EXCEPTION", "ADDITIONAL_LICENSE_INFO"]:
                    (destination / ("OPENJDK-" + name + ".txt")).write_bytes(content)
    for path in (script_base / "java-source-inputs").iterdir():
        output.write(path, "tracecraft-build/java-source-inputs/" + path.name)
    generated_sources = checkout / "javac/build/generated/java"
    for path in generated_sources.rglob("*.java"):
        output.write(path, "generated-openjdk/" + path.relative_to(generated_sources).as_posix())
    for name in ["java-runtime-patch.mjs", "vendor-java.py", "java-classlib-paths.patch"]:
        output.write(script_base / name, "tracecraft-build/" + name)
    output.write(generated / "compiler.wasm-runtime.js", "upstream/compiler.wasm-runtime.js")
    gradle = Path.home() / ".gradle/caches/modules-2/files-2.1"
    for group, artifact, version in [("org.teavm", "teavm-classlib", "0.16.0"), ("org.teavm", "teavm-core", "0.16.0"), ("org.ow2.asm", "asm", "9.8")]:
        for path in (gradle / group / artifact / version).rglob("*-sources.jar"):
            output.write(path, "dependency-sources/" + path.name)
    asm = next((gradle / "org.ow2.asm/asm/9.8").rglob("*-sources.jar"))
    with zipfile.ZipFile(asm) as source:
        header = source.read("org/objectweb/asm/ClassReader.java").decode().split("package org.objectweb.asm;")[0]
        (destination / "ASM-LICENSE.txt").write_text(header, encoding="utf-8")

for name in ["APACHE-2.0.txt", "TEAVM-NOTICE.txt", "JZLIB-LICENSE.txt", "UNICODE-LICENSE.txt", "MPL-2.0.txt", "RHINO-THIRD-PARTY-NOTICES.txt", "JODA-NOTICE.txt"]:
    shutil.copy2(script_base / "java-notices" / name, destination / name)
notice = f"""TraceCraft browser Java runtime. Packaged October 29, 2026.

Compiler: konsoletyper/teavm-javac revision {revision}.
https://github.com/konsoletyper/teavm-javac/tree/{revision}
Copyright Alexey Andreev and contributors. Apache License 2.0.
TeaVM 0.16.0: https://github.com/konsoletyper/teavm/tree/0.16.0
See APACHE-2.0.txt and TEAVM-NOTICE.txt in this directory.

The compiler includes unmodified OpenJDK javac sources from jdk25u revision
{jdk_revision}, licensed GPL version 2 with Classpath Exception.
See OPENJDK-LICENSE.txt, OPENJDK-ASSEMBLY_EXCEPTION.txt and
OPENJDK-ADDITIONAL_LICENSE_INFO.txt. Corresponding sources, generated resource
sources, compiler glue, Gradle build files and local patch recipe are available
at corresponding-source.zip in this same directory, alongside the binaries.
The archive includes the compiler modules actually used, their build tools and
legal notices. It is not a full OpenJDK distribution. The unmodified upstream
Gradle recipe downloads the full pinned OpenJDK archive when rebuilding.
The included compiler source already contains the path patch. Apply
tracecraft-build/java-classlib-paths.patch only to a pristine upstream clone on
Windows to normalize archive
entry separators (ArchiveBuilder Apache-2.0 glue only). Build with Java 25 and
./gradlew :compiler:createDist, then run the included
TraceCraft packaging scripts. TraceCraft does not modify OpenJDK source files.

ASM 9.8 (direct) and 9.10.1 (TeaVM relocated): BSD 3-Clause, see ASM-LICENSE.txt.
Rhino 1.9.1 (relocated by TeaVM 0.16.0): Mozilla Public License 2.0,
see MPL-2.0.txt and RHINO-THIRD-PARTY-NOTICES.txt (MIT/BSD source exceptions).
Corresponding Rhino source JAR, exact release license, POM, and TeaVM relocation
build recipe are in corresponding-source.zip under tracecraft-build/java-source-inputs.
Rhino source comes from the official Maven org.mozilla:rhino:1.9.1 source artifact.
TeaVM relocates org.mozilla to org.teavm.rhino; no additional Rhino source edits
are made by TraceCraft.
Joda-Time 2.12.2 and hppc 0.10.0: Apache 2.0. See JODA-NOTICE.txt
and the source/POM inputs in the corresponding source archive.
JZlib 1.1.3: BSD-style, see JZLIB-LICENSE.txt.
CLDR data: Unicode license, see UNICODE-LICENSE.txt.

Modified ArchiveBuilder.java: TraceCraft normalizes Windows archive entry paths
to portable slash paths. Class bytes and OpenJDK sources are unchanged.

Modified runtime.mjs: TraceCraft replaces dynamic JavaScript code generation
with finite static closures for a strict content security policy. The original
runtime and patch script are included in the source archive. Learner WebAssembly
imports are further restricted by TraceCraft's Java program policy module.
No learner program is sent to an application API or remote execution service.

These notices apply to the vendored runtime components. They do not replace
TraceCraft's own license or apply an upstream license to independent lessons.
"""
(destination / "NOTICE.txt").write_text(notice, encoding="utf-8")
manifest = {"compilerRevision": revision, "teaVMVersion": "0.16.0", "openJDKRevision": jdk_revision, "files": {}}
for path in sorted(destination.iterdir()):
    if path.name == "manifest.json":
        continue
    manifest["files"][path.name] = {"bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
(destination / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"runtimeFiles": len(manifest["files"]), "sourceArchiveBytes": archive.stat().st_size}))
