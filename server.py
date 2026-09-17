import http.server
import socketserver
import json
import os
import urllib.parse

PORT = 8000
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DATA_FILE = os.path.join(DATA_DIR, 'candidates.json')

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f)

def read_candidates():
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def write_candidates(data):
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print('Error saving candidate to disk:', e)
        return False

class CandidateHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/candidates':
            candidates = read_candidates()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(candidates).encode('utf-8'))
            return
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/candidates':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length).decode('utf-8')
            try:
                record = json.loads(body)
                candidates = read_candidates()
                # Replace existing record if matching ID or sessionGuid, else prepend
                idx = -1
                for i, c in enumerate(candidates):
                    if c.get('id') == record.get('id') or c.get('sessionGuid') == record.get('sessionGuid'):
                        idx = i
                        break
                if idx >= 0:
                    candidates[idx] = record
                else:
                    candidates.insert(0, record)
                
                write_candidates(candidates)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'record': record}).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
            return
        super().do_POST()

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith('/api/candidates/'):
            cand_id = parsed.path.replace('/api/candidates/', '').strip()
            candidates = read_candidates()
            candidates = [c for c in candidates if c.get('id') != cand_id and c.get('sessionGuid') != cand_id]
            write_candidates(candidates)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'deleted', 'id': cand_id}).encode('utf-8'))
            return
        super().do_DELETE()

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), CandidateHandler) as httpd:
        print(f'VeriFace Server running on http://localhost:{PORT} with disk storage at {DATA_FILE}')
        httpd.serve_forever()
