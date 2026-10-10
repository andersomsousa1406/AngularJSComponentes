"""Teste integrado da demo em um Chrome real via Chrome DevTools Protocol."""

import asyncio
import json
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import aiohttp


ROOT = Path(__file__).resolve().parents[1]
CHROME_CANDIDATES = (
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format, *_args):
        pass


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def find_browser():
    for candidate in CHROME_CANDIDATES:
        if candidate.exists():
            return candidate
    executable = shutil.which("chrome") or shutil.which("msedge")
    if executable:
        return Path(executable)
    raise RuntimeError("Chrome ou Edge nao encontrado.")


class CdpClient:
    def __init__(self, websocket):
        self.websocket = websocket
        self.message_id = 0
        self.exceptions = []
        self.requests = []

    async def call(self, method, params=None):
        self.message_id += 1
        expected_id = self.message_id
        await self.websocket.send_json({
            "id": expected_id,
            "method": method,
            "params": params or {},
        })

        while True:
            message = await self.websocket.receive_json()
            if message.get("method") == "Runtime.exceptionThrown":
                details = message.get("params", {}).get("exceptionDetails", {})
                self.exceptions.append(details.get("text", "Erro JavaScript desconhecido"))
            if message.get("method") == "Network.requestWillBeSent":
                request = message.get("params", {}).get("request", {})
                if request.get("url"):
                    self.requests.append(request["url"])
            if message.get("id") == expected_id:
                if "error" in message:
                    raise RuntimeError(message["error"])
                return message.get("result", {})

    async def evaluate(self, expression):
        response = await self.call("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": True,
        })
        if response.get("exceptionDetails"):
            raise RuntimeError(response["exceptionDetails"])
        return response.get("result", {}).get("value")


async def wait_for_debugger(session, debug_port):
    endpoint = f"http://127.0.0.1:{debug_port}/json/list"
    for _ in range(100):
        try:
            async with session.get(endpoint) as response:
                targets = await response.json()
                pages = [target for target in targets if target.get("type") == "page"]
                if pages:
                    return pages[0]["webSocketDebuggerUrl"]
        except (aiohttp.ClientError, json.JSONDecodeError):
            pass
        await asyncio.sleep(0.05)
    raise RuntimeError("Chrome nao abriu a porta de depuracao.")


async def run_browser_test(debug_port, page_url):
    async with aiohttp.ClientSession() as session:
        websocket_url = await wait_for_debugger(session, debug_port)
        async with session.ws_connect(websocket_url, max_msg_size=8 * 1024 * 1024) as websocket:
            cdp = CdpClient(websocket)
            await cdp.call("Runtime.enable")
            await cdp.call("Page.enable")
            await cdp.call("Network.enable")
            await cdp.call("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 1,
                "mobile": True,
            })
            await cdp.call("Page.navigate", {"url": page_url})

            result = None
            for _ in range(300):
                result = await cdp.evaluate("""
                  (function () {
                    var element = document.querySelector('performance-lab');
                    if (!element || !window.angular) return null;
                    var scope = angular.element(element).isolateScope();
                    return scope && scope.vm && scope.vm.result || null;
                  }())
                """)
                if result:
                    break
                await asyncio.sleep(0.05)

            if not result:
                raise AssertionError("O benchmark nao terminou dentro de 15 segundos.")

            benchmarks = [result]
            await cdp.call("HeapProfiler.enable")
            await cdp.call("HeapProfiler.collectGarbage")
            heap_samples = [(await cdp.call("Runtime.getHeapUsage"))["usedSize"]]

            for _ in range(2):
                await cdp.evaluate("""
                  (function () {
                    var scope = angular.element(document.querySelector('performance-lab')).isolateScope();
                    scope.vm.run();
                    return true;
                  }())
                """)

                repeated_result = None
                for _ in range(300):
                    repeated_result = await cdp.evaluate("""
                      (function () {
                        var scope = angular.element(document.querySelector('performance-lab')).isolateScope();
                        return !scope.vm.running && scope.vm.result || null;
                      }())
                    """)
                    if repeated_result:
                        break
                    await asyncio.sleep(0.05)

                if not repeated_result:
                    raise AssertionError("Uma rodada repetida do benchmark nao terminou.")
                benchmarks.append(repeated_result)
                await cdp.call("HeapProfiler.collectGarbage")
                heap_samples.append((await cdp.call("Runtime.getHeapUsage"))["usedSize"])

            showcase = await cdp.evaluate("""
              (function () {
                var host = document.querySelector('component-showcase');
                var scope = angular.element(host).isolateScope();
                var tabs = host.querySelectorAll('.ui-tabs__nav button');
                function select(index) {
                  tabs[index].click();
                  scope.$root.$digest();
                }

                var result = { tabCount: tabs.length };
                select(1);
                result.data = {
                  stats: host.querySelectorAll('stat-card').length,
                  rows: host.querySelectorAll('.data-table tbody tr').length,
                  selects: host.querySelectorAll('records-table ui-select').length,
                  paginations: host.querySelectorAll('records-table ui-pagination').length
                };

                select(2);
                result.cards = {
                  products: host.querySelectorAll('product-card').length,
                  lists: host.querySelectorAll('user-list').length,
                  accordions: host.querySelectorAll('accordion-list').length
                };
                host.querySelector('.product-card .ui-button').click();
                scope.$root.$digest();
                result.modalOpened = !!host.querySelector('.ui-modal__dialog');
                scope.vm.closeModal();
                scope.$root.$digest();

                select(3);
                result.forms = {
                  forms: host.querySelectorAll('demo-form').length,
                  nestedSelects: host.querySelectorAll('demo-form ui-select').length
                };
                select(0);
                result.base = {
                  buttons: host.querySelectorAll('ui-button').length,
                  badges: host.querySelectorAll('ui-badge').length,
                  alerts: host.querySelectorAll('ui-alert').length,
                  selects: host.querySelectorAll('.showcase-selects ui-select').length
                };
                host.querySelector('.showcase-panel ui-button .ui-button').click();
                scope.$root.$digest();
                result.toasts = host.querySelectorAll('.toast-stack__item').length;
                result.styleCount = document.querySelectorAll('[data-easy-component-style]').length;
                return result;
              }())
            """)

            navigation = await cdp.evaluate("""
              new Promise(function (resolve) {
                document.documentElement.style.scrollBehavior = 'auto';
                window.scrollTo(0, document.getElementById('recursos').offsetTop + 100);
                window.dispatchEvent(new Event('scroll'));
                window.requestAnimationFrame(function () {
                  window.setTimeout(function () {
                    var root = angular.element(document.querySelector('app-root')).isolateScope().vm;
                    resolve({
                      scrolled: root.scrolled,
                      progress: root.scrollProgress,
                      activeSection: root.activeSection,
                      backToTop: root.showBackTop
                    });
                  }, 100);
                });
              })
            """)

            await cdp.evaluate("""
              (function () {
                document.querySelector('.counter button[aria-label="Aumentar"]').click();
                return true;
              }())
            """)
            await asyncio.sleep(0.1)

            rendered = await cdp.evaluate("""
              (function () {
                function text(selector) {
                  var element = document.querySelector(selector);
                  return element ? element.textContent.trim() : null;
                }
                return {
                  counter: text('.counter__value'),
                  nestedChild: text('.counter value-display strong'),
                  sibling: text('.data-flow value-display strong'),
                  styleCount: document.querySelectorAll('[data-easy-component-style]').length,
                  benchmarkNodes: document.querySelectorAll('benchmark-probe').length,
                  viewportWidth: document.documentElement.clientWidth,
                  contentWidth: document.documentElement.scrollWidth
                };
              }())
            """)

            assert all(item["passed"] for item in benchmarks), "Scopes ou nos DOM ficaram retidos."
            assert all(item["compiled"] == 3000 for item in benchmarks)
            assert all(item["bindingUpdates"] == 12000 for item in benchmarks)
            assert all(item["duration"] > 0 for item in benchmarks), "A duracao real deve ser maior que zero."
            assert all(item["scopeDelta"] == 0 for item in benchmarks)
            assert all(item["remainingNodes"] == 0 for item in benchmarks)
            assert rendered["benchmarkNodes"] == 0
            assert rendered["styleCount"] >= 4
            assert rendered["counter"] == "3"
            assert rendered["nestedChild"] == "3"
            assert rendered["sibling"] == "3"
            assert rendered["viewportWidth"] == 390
            assert rendered["contentWidth"] <= rendered["viewportWidth"], (
                "A demonstracao possui overflow horizontal no layout mobile."
            )
            assert showcase["tabCount"] == 4
            assert showcase["data"] == {"stats": 4, "rows": 4, "selects": 1, "paginations": 1}, showcase["data"]
            assert showcase["cards"] == {"products": 3, "lists": 1, "accordions": 1}, showcase["cards"]
            assert showcase["modalOpened"], "O card de produto nao abriu o modal."
            assert showcase["forms"] == {"forms": 1, "nestedSelects": 1}, showcase["forms"]
            assert showcase["base"]["buttons"] >= 9
            assert showcase["base"]["badges"] >= 6
            assert showcase["base"]["alerts"] == 3
            assert showcase["base"]["selects"] == 2
            assert showcase["toasts"] == 1
            assert showcase["styleCount"] >= 25
            assert navigation["scrolled"]
            assert navigation["progress"] > 0
            assert navigation["activeSection"] != "inicio"
            assert navigation["backToTop"]
            assert not cdp.exceptions, "Erros JavaScript: " + ", ".join(cdp.exceptions)

            component_requests = [url for url in cdp.requests if "/components/" in url]
            assert not component_requests, (
                "Partes de componentes ainda foram requisitadas: " + ", ".join(component_requests)
            )
            assert any(url.endswith('/example/dist/app.bundle.js') for url in cdp.requests)

            heap_growth = heap_samples[-1] - heap_samples[0]
            allowed_growth = max(2 * 1024 * 1024, heap_samples[0] * 0.20)
            assert heap_growth <= allowed_growth, (
                f"Heap cresceu {heap_growth} bytes apos aquecimento; limite: {allowed_growth:.0f}."
            )

            return {
                "benchmarks": benchmarks,
                "memory": {
                    "forcedGcSamples": heap_samples,
                    "growthAfterWarmup": heap_growth,
                    "allowedGrowth": round(allowed_growth),
                },
                "rendered": rendered,
                "showcase": showcase,
                "navigation": navigation,
                "network": {
                    "totalRequests": len(cdp.requests),
                    "componentPartRequests": component_requests,
                },
            }


def main():
    browser = find_browser()
    http_port = free_port()
    debug_port = free_port()
    handler = partial(QuietHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", http_port), handler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()

    with tempfile.TemporaryDirectory(prefix="easy-components-chrome-") as profile:
        process = subprocess.Popen(
            [
                str(browser),
                "--headless=new",
                "--disable-gpu",
                "--disable-extensions",
                "--no-first-run",
                "--no-default-browser-check",
                "--enable-precise-memory-info",
                "--js-flags=--expose-gc",
                f"--remote-debugging-port={debug_port}",
                f"--user-data-dir={profile}",
                "about:blank",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        try:
            page_url = f"http://127.0.0.1:{http_port}/example/"
            report = asyncio.run(run_browser_test(debug_port, page_url))
            print(json.dumps(report, indent=2, ensure_ascii=False))
            print("\nTeste de navegador aprovado.")
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
        print(f"Teste de navegador falhou: {error}", file=sys.stderr)
        raise
