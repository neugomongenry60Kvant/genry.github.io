import http.server
import socketserver

class UnityRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers for compressed files
        if self.path.endswith(".gz"):
            self.send_header("Content-Encoding", "gzip")
        if self.path.endswith(".br"):
            self.send_header("Content-Encoding", "br")
        if self.path.endswith(".wasm") or self.path.endswith(".wasm.gz") or self.path.endswith(".wasm.br"):
            self.send_header("Content-Type", "application/wasm")
        super().end_headers()

PORT = 8000
with socketserver.TCPServer(("", PORT), UnityRequestHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
