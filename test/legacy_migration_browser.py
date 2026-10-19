"""Valida os componentes migrados em um navegador real."""

import asyncio
import json
import subprocess
import sys
import tempfile
import threading
from functools import partial
from http.server import ThreadingHTTPServer

from browser_benchmark import CdpClient, QuietHandler, ROOT, find_browser, free_port, wait_for_debugger
import aiohttp


async def run_test(debug_port, page_url):
    async with aiohttp.ClientSession() as session:
        websocket_url = await wait_for_debugger(session, debug_port)
        async with session.ws_connect(websocket_url, max_msg_size=8 * 1024 * 1024) as websocket:
            cdp = CdpClient(websocket)
            await cdp.call("Runtime.enable")
            await cdp.call("Page.enable")
            await cdp.call("Network.enable")
            await cdp.call("Page.navigate", {"url": page_url})

            rendered = None
            for _ in range(200):
                rendered = await cdp.evaluate("""
                  (function () {
                    var root = document.querySelector('legacy-demo-root');
                    if (!root || !root.querySelector('.gc-demo')) return null;
                    return {
                      styles: document.querySelectorAll('[data-easy-component-style]').length,
                      grids: root.querySelectorAll('gc-data-grid').length,
                      components: root.querySelectorAll('[data-easy-scope]').length,
                      bootstrapButtonHeight: Math.round(root.querySelector('.btn').getBoundingClientRect().height)
                    };
                  }())
                """)
                if rendered:
                    break
                await asyncio.sleep(0.05)

            assert rendered, "A demonstracao migrada nao montou."
            assert rendered["styles"] == 10, rendered
            assert rendered["grids"] >= 2, rendered
            assert rendered["components"] >= 10, rendered
            assert rendered["bootstrapButtonHeight"] >= 30, "Bootstrap 3 nao foi aplicado."

            services = await cdp.evaluate("""
              (function () {
                var injector = angular.element(document.querySelector('legacy-demo-root')).injector();
                var names = ['GcApi', 'GcControllerActions', 'GcCrudStore', 'GcDeviceBridge', 'GcRfid', 'GcSpeech', 'GcSpeedTest'];
                return names.map(function (name) { return { name: name, available: injector.has(name) }; });
              }())
            """)
            assert all(item["available"] for item in services), services

            behavior = await cdp.evaluate("""
              (function () {
                var root = document.querySelector('legacy-demo-root');
                var scope = angular.element(root).isolateScope();
                var before = EasyComponents.metrics().totals.active;
                scope.vm.openDialog();
                scope.$root.$digest();
                var opened = !!root.querySelector('.gc-confirm');
                root.querySelector('.gc-confirm .btn-primary').click();
                scope.$root.$digest();
                var closed = !root.querySelector('.gc-confirm');

                var grid = root.querySelector('gc-data-grid');
                var gridScope = angular.element(grid).isolateScope();
                gridScope.vm.sort(gridScope.vm.columns[1]);
                gridScope.$root.$digest();

                return {
                  opened: opened,
                  closed: closed,
                  message: scope.vm.message,
                  sortedBy: gridScope.vm.sortKey,
                  activeBefore: before,
                  activeAfter: EasyComponents.metrics().totals.active
                };
              }())
            """)
            assert behavior["opened"] and behavior["closed"], behavior
            assert behavior["message"] == "Operacao confirmada.", behavior
            assert behavior["sortedBy"] == "NOME", behavior
            assert behavior["activeAfter"] == behavior["activeBefore"], behavior

            confirmation_queue = await cdp.evaluate("""
              (async function () {
                var root = document.querySelector('legacy-demo-root');
                var injector = angular.element(root).injector();
                var scope = injector.get('$rootScope').$new();
                var element = injector.get('$compile')('<gc-confirm-dialog></gc-confirm-dialog>')(scope);
                angular.element(document.body).append(element);
                scope.$digest();
                var queue = element.isolateScope().vm.dialogs;
                var received = null;
                var dialog = queue.add(2, 'Contrato declarativo', 'Pergunta', [queue.obtn_ok], [function (event, button) {
                  received = { type: event.type, ret: button.ret };
                }]);
                scope.$digest();
                var mounted = element[0].querySelector('.gc-confirm');
                var title = mounted.querySelector('.modal-title').textContent;
                mounted.querySelector('.modal-footer button').click();
                await new Promise(function (resolve) { setTimeout(resolve, 50); });
                scope.$digest();
                var closed = !element[0].querySelector('.gc-confirm');
                scope.$destroy(); element.remove();
                return { title: title, received: received, closed: closed, stateClosed: dialog.closed };
              }())
            """)
            assert confirmation_queue["title"] == "Contrato declarativo", confirmation_queue
            assert confirmation_queue["received"] == {"type": "click", "ret": "1"}, confirmation_queue
            assert confirmation_queue["closed"] and confirmation_queue["stateClosed"], confirmation_queue

            lifecycle = await cdp.evaluate("""
              (function () {
                var root = document.querySelector('legacy-demo-root');
                var injector = angular.element(root).injector();
                var rootScope = injector.get('$rootScope');
                var compile = injector.get('$compile');
                var host = angular.element('<div></div>');
                angular.element(document.body).append(host);
                var before = EasyComponents.metrics().components.gcFileManager;
                var createdBefore = before.created;
                var destroyedBefore = before.destroyed;
                var activeBefore = before.active;
                for (var index = 0; index < 100; index += 1) {
                  var scope = rootScope.$new();
                  var element = compile('<gc-file-manager></gc-file-manager>')(scope);
                  host.append(element);
                  scope.$digest();
                  scope.$destroy();
                  element.remove();
                }
                host.remove();
                var after = EasyComponents.metrics().components.gcFileManager;
                return {
                  created: after.created - createdBefore,
                  destroyed: after.destroyed - destroyedBefore,
                  activeBefore: activeBefore,
                  activeAfter: after.active
                };
              }())
            """)
            assert lifecycle["created"] == 100, lifecycle
            assert lifecycle["destroyed"] == 100, lifecycle
            assert lifecycle["activeAfter"] == lifecycle["activeBefore"], lifecycle

            accessibility = await cdp.evaluate("""
              (function () {
                var violations = [];
                document.querySelectorAll('button').forEach(function (element) {
                  var name = (element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent || '').trim();
                  if (!name) violations.push('botao sem nome');
                });
                document.querySelectorAll('input').forEach(function (element) {
                  if (!element.getAttribute('aria-label') && !element.closest('label')) violations.push('campo sem rotulo');
                });
                return violations;
              }())
            """)
            assert not accessibility, accessibility

            await cdp.call("HeapProfiler.enable")
            await cdp.call("HeapProfiler.collectGarbage")
            heap_before = (await cdp.call("Runtime.getHeapUsage"))["usedSize"]
            for _ in range(100):
                await cdp.evaluate("""
                  (function () {
                    var root = document.querySelector('legacy-demo-root');
                    var scope = angular.element(root).isolateScope();
                    scope.vm.openDialog(); scope.$root.$digest();
                    scope.vm.closeDialog(); scope.$root.$digest();
                  }())
                """)
            await cdp.call("HeapProfiler.collectGarbage")
            heap_after = (await cdp.call("Runtime.getHeapUsage"))["usedSize"]
            growth = heap_after - heap_before
            assert growth <= max(1024 * 1024, heap_before * 0.15), f"Possivel vazamento: {growth} bytes."

            component_requests = [url for url in cdp.requests if "/legacy-migration/components/" in url]
            assert not component_requests, component_requests
            assert not cdp.exceptions, cdp.exceptions

            await cdp.call("Page.navigate", {"url": page_url.replace("/legacy-migration/", "/test/legacy-engine-contract.html")})
            engine = None
            for _ in range(200):
                engine = await cdp.evaluate("window.legacyEngineContract || null")
                if engine:
                    break
                await asyncio.sleep(0.05)
            assert engine and engine["passed"], engine
            assert len(engine["registered"]) == 21, engine["registered"]

            inventory = json.loads((ROOT / "legacy-migration/parity/legacy-api.generated.json").read_text(encoding="utf-8"))
            parity = {}
            expected_lazy = {
                "Consulta.js": {
                    "consultando", "disabled", "element_button_search", "element_form_group",
                    "element_input", "element_input_group", "selecionado", "validar_apagar",
                },
                "TabelaJS.js": {"_modal"},
            }
            for source_name, contract_name in (("Consulta.js", "consulta"), ("TabelaJS.js", "tabela")):
                expected = inventory["files"][source_name]
                actual = engine[contract_name]
                expected_paths = expected["methods"] + expected["properties"]
                missing = [path for path in expected_paths if path not in actual]
                assert set(missing) == expected_lazy[source_name], {"source": source_name, "unexpected": missing}
                parity[source_name] = {
                    "expected": len(expected_paths),
                    "availableAtInitialization": len(expected_paths) - len(missing),
                    "unverifiedUntilUse": missing,
                    "namesAvailableAtInitialization": len(expected_paths) - len(missing),
                }

            return {"rendered": rendered, "services": services, "behavior": behavior, "confirmationQueue": confirmation_queue, "lifecycle": lifecycle, "accessibility": accessibility, "heapGrowth": growth, "componentRequests": component_requests, "legacyEngine": {"registeredFactories": len(engine["registered"]), "parity": parity}}


def main():
    browser = find_browser()
    http_port = free_port()
    debug_port = free_port()
    server = ThreadingHTTPServer(("127.0.0.1", http_port), partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()

    with tempfile.TemporaryDirectory(prefix="easy-components-legacy-") as profile:
        process = subprocess.Popen([
            str(browser), "--headless=new", "--disable-gpu", "--disable-extensions",
            "--no-first-run", "--no-default-browser-check", "--enable-precise-memory-info",
            f"--remote-debugging-port={debug_port}", f"--user-data-dir={profile}", "about:blank"
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            report = asyncio.run(run_test(debug_port, f"http://127.0.0.1:{http_port}/legacy-migration/"))
            print(json.dumps(report, indent=2, ensure_ascii=False))
            print("\nTeste da migracao aprovado.")
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
            server.shutdown()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Teste da migracao falhou: {error}", file=sys.stderr)
        raise
