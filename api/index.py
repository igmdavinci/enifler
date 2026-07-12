"""Entrada serverless da Enifler para a Vercel.

A loja local continua usando server.py diretamente. Na Vercel, este arquivo
reaproveita o mesmo handler e restaura o caminho original das rotas /api/*,
que chegam aqui por rewrite configurado em vercel.json.
"""

from __future__ import annotations

import os
import sys
import urllib.parse
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Na Vercel o filesystem não é persistente. Use Supabase por padrão no deploy.
os.environ.setdefault("ENIFLER_DB_DRIVER", "supabase")
os.environ.setdefault("ENIFLER_DATA_DIR", "/tmp/enifler")

import server as enifler_server  # noqa: E402


enifler_server.load_dotenv()
enifler_server.refresh_config()
try:
    enifler_server.setup_database()
except Exception as exc:  # evita derrubar o cold start; as rotas retornam erro se o banco falhar.
    print(f"Aviso: não foi possível preparar o banco no cold start: {exc}")


class handler(enifler_server.StoreHandler):
    """Handler compatível com a Python Runtime da Vercel."""

    def _restore_rewritten_api_path(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
        route_values = params.pop("__enifler_path", None)
        if not route_values:
            return

        route = route_values[0].lstrip("/")
        restored_path = "/api" + (f"/{route}" if route else "")
        query = urllib.parse.urlencode(params, doseq=True)
        self.path = restored_path + (f"?{query}" if query else "")

    def do_GET(self):
        self._restore_rewritten_api_path()
        return super().do_GET()

    def do_POST(self):
        self._restore_rewritten_api_path()
        return super().do_POST()
