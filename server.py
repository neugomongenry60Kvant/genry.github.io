import http.server
import socketserver
import os

PORT = 8000

class BrotliHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Добавляем заголовок Content-Encoding для .br файлов
        if self.path.endswith('.br'):
            self.send_header('Content-Encoding', 'br')
        # Разрешаем кросс-доменные запросы (если нужно)
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def guess_type(self, path):
        # Корректные MIME-типы для Unity файлов
        if path.endswith('.wasm.br'):
            return 'application/wasm'
        if path.endswith('.data.br'):
            return 'application/octet-stream'
        if path.endswith('.framework.js.br') or path.endswith('.loader.js'):
            return 'application/javascript'
        return super().guess_type(path)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("", PORT), BrotliHTTPRequestHandler) as httpd:
        print(f"Сервер запущен на http://localhost:{PORT}/html")
        print("Файлы .br отдаются с Content-Encoding: br")
        httpd.serve_forever()