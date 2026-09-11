"""
Random Relay - Automated Setup & Launcher
Bundles JS modules, syncs workspace, runs verification test suite,
starts local server and opens browser automatically.
"""

import os
import re
import sys
import shutil
import subprocess
import webbrowser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def print_banner():
    print("=" * 70)
    print("         RANDOM RELAY - AUTOMATED SETUP & LAUNCHER")
    print("   Reliable messaging, redesigned by probability.")
    print("=" * 70)
    print()

def build_bundle():
    print("[1/4] Building standalone JS bundle...")
    js_dir = os.path.join(BASE_DIR, "js")
    files = ['algorithms.js', 'audio.js', 'simulation.js', 'ui.js', 'app.js']
    
    bundle_content = [
        "/* Random Relay Messaging Simulator - Standalone Bundle */",
        "",
        "(function() {",
        "",
        "'use strict';",
        ""
    ]
    
    for filename in files:
        filepath = os.path.join(js_dir, filename)
        bundle_content.append(f"// --- {filename} ---")
        with open(filepath, 'r', encoding='utf-8') as f:
            code = f.read()
        
        # Remove imports and exports
        code = re.sub(r'import\s+.*?from\s+[\'"].*?[\'"];?\n?', '', code)
        code = re.sub(r'export\s+(const|function|class)\s+', r'\1 ', code)
        
        bundle_content.append(code.strip())
        bundle_content.append("")
        
    bundle_content.append("})();")
    bundle_content.append("")
    
    final_bundle = "\n".join(bundle_content)
    
    bundle_path = os.path.join(js_dir, "bundle.js")
    with open(bundle_path, 'w', encoding='utf-8') as f:
        f.write(final_bundle)
        
    dev_bundle_path = os.path.join(BASE_DIR, "develop", "js", "bundle.js")
    os.makedirs(os.path.dirname(dev_bundle_path), exist_ok=True)
    with open(dev_bundle_path, 'w', encoding='utf-8') as f:
        f.write(final_bundle)
        
    print(f"      [OK] Bundle generated cleanly ({len(final_bundle):,} bytes)")

def sync_develop():
    print("[2/4] Synchronizing develop workspace...")
    dev_dir = os.path.join(BASE_DIR, "develop")
    os.makedirs(dev_dir, exist_ok=True)
    os.makedirs(os.path.join(dev_dir, "css"), exist_ok=True)
    os.makedirs(os.path.join(dev_dir, "js"), exist_ok=True)

    shutil.copy2(os.path.join(BASE_DIR, "index.html"), os.path.join(dev_dir, "index.html"))
    shutil.copy2(os.path.join(BASE_DIR, "css", "styles.css"), os.path.join(dev_dir, "css", "styles.css"))

    js_files = ['algorithms.js', 'audio.js', 'simulation.js', 'ui.js', 'app.js', 'bundle.js']
    for f in js_files:
        shutil.copy2(os.path.join(BASE_DIR, "js", f), os.path.join(dev_dir, "js", f))

    for doc in ['agent.md', 'design.md']:
        src = os.path.join(BASE_DIR, "private", doc)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(dev_dir, doc))

    print("      [OK] Develop workspace synchronized.")

def run_tests():
    print("[3/4] Running automated test suite...")
    test_runner = os.path.join(BASE_DIR, "tests", "run_tests.py")
    ret = subprocess.call([sys.executable, test_runner])
    if ret == 0:
        print("      [OK] All verification tests passed with 100% success!")
    else:
        print("      [WARNING] Test suite reported warnings/failures.")

def launch_server():
    port = 8000
    print(f"[4/4] Launching local server on http://localhost:{port}...")
    print("      Opening browser window...")
    webbrowser.open(f"http://localhost:{port}/index.html")
    print("\nPress Ctrl+C to stop the server when finished.\n")
    try:
        subprocess.call([sys.executable, "-m", "http.server", str(port)], cwd=BASE_DIR)
    except KeyboardInterrupt:
        print("\nServer stopped.")

def main():
    print_banner()
    build_bundle()
    sync_develop()
    run_tests()
    launch_server()

if __name__ == "__main__":
    main()
