"""Servidor local da Enifler.

Serve a loja, mantÃ©m usuÃ¡rios/pedidos em SQLite e atua como proxy seguro para
a Paradise. A chave da API nunca e enviada ao navegador.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import threading
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timezone
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
ROOT = BASE_DIR / "enifler" / "www.enifler.com.br"
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "enifler.db"
DB_DRIVER = os.getenv("ENIFLER_DB_DRIVER", "sqlite").lower()
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
PARADISE_BASE_URL = os.getenv("PARADISE_BASE_URL", "https://multi.paradisepags.com/api/v1").rstrip("/")
PARADISE_API_KEY = os.getenv("PARADISE_API_KEY", "")
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
PARADISE_WEBHOOK_TOKEN = os.getenv("PARADISE_WEBHOOK_TOKEN", "")
NTFY_SERVER = os.getenv("NTFY_SERVER", "https://ntfy.sh").rstrip("/")
NTFY_TOPIC = os.getenv("NTFY_TOPIC", "")
NTFY_ACCESS_TOKEN = os.getenv("NTFY_ACCESS_TOKEN", "")
PORT = int(os.getenv("ENIFLER_PORT", "4173"))
SESSIONS: dict[str, int] = {}
ADMIN_SESSIONS: set[str] = set()
DEFAULT_ADMIN_PASSWORD_HASH = (
    "93f88ee6dce0b7e1417bf6a93289e51a:"
    "bc7c20edd58fe84d5e1f9b85c8337fe2ea3c4ecc7527c94bea816f0edfccc3802ea3d890f910bc5851029523d424e3169351a21ac5f6a439aa2283bfcf5c919a"
)
SESSION_MAX_AGE = 60 * 60 * 24 * 30

PRODUCT_SEED = {
    "5805519": ("PC Gamer Completo Ryzen 5 5600G, 16GB DDR4, SSD 480GB, 500W 80 Plus, 6UCY5D2A-E", 3433.41, "assets/products/5805519.png"),
    "5805518": ("PC Gamer Completo Ryzen 5 5600G, 16GB DDR4, SSD 480GB, 500W 80 Plus, K4DM83MJ-E", 3423.12, "assets/products/5805518.png"),
    "5805515": ("PC Gamer Completo Ryzen 5 4600G, 16GB DDR4, SSD 480GB, 400W 80 Plus, 8CMAOJEG-E", 3571.53, "assets/products/5805515.png"),
    "5805507": ("PC Gamer Ryzen 5 5600G, 16GB DDR4, SSD 480GB, 500W 80 Plus, D4XJYMIK-E", 2949.50, "assets/products/5805507.png"),
    "5805506": ("PC Gamer Ryzen 5 5600G, 16GB DDR4, SSD 480GB, 500W 80 Plus, K17YCP2E-E", 2939.22, "assets/products/5805506.png"),
    "5805502": ("PC Gamer Ryzen 5 4600G, 16GB DDR4, SSD 480GB, 400W 80 Plus, QEPF4Q9K-E", 3077.34, "assets/products/5805502.png"),
    "7613793": ("PC Gamer Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, LBN197R8G-E", 5365.97, "assets/products/7613793.jpg"),
    "7613791": ("PC Gamer Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, LBN197R8F-E", 5378.21, "assets/products/7613791.png"),
    "7613779": ("PC Gamer Completo Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, GDYN4MEAF-E", 5862.11, "assets/products/7613779.png"),
    "7613770": ("PC Gamer Completo Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, GDYN4MEAE-E", 5849.87, "assets/products/7613770.png"),
    "7613713": ("PC Gamer Completo Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, GDYN4MEAB-E", 5901.04, "assets/products/7613713.png"),
    "7613696": ("PC Gamer Completo Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, GDYN4MEAA-E", 5896.96, "assets/products/7613696.png"),
}

CATEGORY_LABELS = {
    "pc-gamer": "PC Gamer",
    "pc-gamer-completo": "PC Gamer Completo",
    "computadores": "Computadores",
    "hardware": "Hardware",
    "acessorios": "AcessÃ³rios",
    "monitor": "Monitores",
    "cadeira-gamer": "Cadeira Gamer",
    "kit-upgrade": "Kit Upgrade",
    "memoria": "MemÃ³ria",
    "gabinete": "Gabinete",
    "fonte": "Fonte",
    "headset": "Headset",
    "mouse": "Mouse",
    "mouse-pad": "Mouse Pad",
    "kit-mouse-teclado": "Kit Mouse e Teclado",
    "microfones": "Microfones",
    "controles-e-volantes": "Controles e Volantes",
    "consoles": "Consoles",
    "coolers": "Coolers",
    "eletronicos": "EletrÃ´nicos",
    "notebook": "Notebook",
    "hard-disk": "Hard Disk",
    "fitas-led": "Fitas LED",
    "pasta-termica": "Pasta TÃ©rmica",
}


def load_dotenv() -> None:
    path = BASE_DIR / ".env"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def resolve_local_path(value: str) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = BASE_DIR / path
    return path


def refresh_config() -> None:
    """Atualiza as configuraÃ§Ãµes depois de carregar o .env.

    Hoje a loja usa SQLite local para login, cadastro, pedidos e produtos.
    O seletor ENIFLER_DB_DRIVER fica centralizado aqui para facilitar a troca
    futura por Supabase/Postgres sem mexer nas telas.
    """

    global PARADISE_BASE_URL, PARADISE_API_KEY, PUBLIC_BASE_URL, PARADISE_WEBHOOK_TOKEN
    global NTFY_SERVER, NTFY_TOPIC, NTFY_ACCESS_TOKEN, PORT, DATA_DIR, DB_PATH, DB_DRIVER
    global SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

    DB_DRIVER = os.getenv("ENIFLER_DB_DRIVER", "sqlite").lower()
    SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    DATA_DIR = resolve_local_path(os.getenv("ENIFLER_DATA_DIR", "data"))
    DB_PATH = resolve_local_path(os.getenv("ENIFLER_DB_PATH", str(DATA_DIR / "enifler.db")))
    DATA_DIR = DB_PATH.parent
    PARADISE_BASE_URL = os.getenv("PARADISE_BASE_URL", PARADISE_BASE_URL).rstrip("/")
    PARADISE_API_KEY = os.getenv("PARADISE_API_KEY", "")
    PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
    PARADISE_WEBHOOK_TOKEN = os.getenv("PARADISE_WEBHOOK_TOKEN", "")
    NTFY_SERVER = os.getenv("NTFY_SERVER", "https://ntfy.sh").rstrip("/")
    NTFY_TOPIC = os.getenv("NTFY_TOPIC", "")
    NTFY_ACCESS_TOKEN = os.getenv("NTFY_ACCESS_TOKEN", "")
    PORT = int(os.getenv("ENIFLER_PORT", "4173"))


def connect() -> sqlite3.Connection:
    if DB_DRIVER != "sqlite":
        raise RuntimeError("Este servidor local estÃ¡ configurado para SQLite. Use ENIFLER_DB_DRIVER=sqlite por enquanto.")
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db


def supabase_is_configured() -> bool:
    has_placeholder = (
        "SEU-PROJETO" in SUPABASE_URL.upper()
        or "SUA_SERVICE_ROLE_KEY" in SUPABASE_SERVICE_ROLE_KEY.upper()
    )
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and not has_placeholder)


def require_supabase_config() -> None:
    if not supabase_is_configured():
        raise RuntimeError(
            "Supabase ainda nÃ£o configurado: informe SUPABASE_URL e "
            "SUPABASE_SERVICE_ROLE_KEY reais no arquivo .env."
        )


def supabase_request(table: str, method: str = "GET", query: str = "", payload=None):
    require_supabase_config()
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    if method in ("POST", "PATCH"):
        headers["Prefer"] = "return=representation"
    data = json.dumps(payload).encode() if payload is not None else None
    request = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{table}{query}",
        data=data,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            raw = response.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="ignore")
        try:
            error = json.loads(raw)
            message = error.get("message") or error.get("details") or raw
        except json.JSONDecodeError:
            message = raw
        raise RuntimeError(f"Erro no Supabase ({exc.code}): {message}")
    except (urllib.error.URLError, TimeoutError):
        raise RuntimeError("NÃ£o foi possÃ­vel conectar ao Supabase.")


def qs_filter(**filters) -> str:
    parts = [
        f"{urllib.parse.quote(key)}=eq.{urllib.parse.quote(str(value), safe='')}"
        for key, value in filters.items()
    ]
    return "?" + "&".join(parts) if parts else ""


def row_get(row, key, default=None):
    try:
        return row[key]
    except (KeyError, IndexError, TypeError):
        return default


def product_seed_rows():
    rows = []
    for product_id, (name, price, image) in PRODUCT_SEED.items():
        rows.append(
            {
                "id": product_id,
                "name": name,
                "image": image,
                "price": price,
                "category_slug": "pc-gamer",
                "category_name": "PC Gamer",
            }
        )
    imported_paths = [DATA_DIR / "old-products.json", BASE_DIR / "data" / "old-products.json"]
    known = {row["id"] for row in rows}
    for imported_path in dict.fromkeys(imported_paths):
        if not imported_path.exists():
            continue
        try:
            imported = json.loads(imported_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            imported = []
        for item in imported:
            product_id = str(item.get("id", "")).strip()
            if not product_id or product_id in known:
                continue
            try:
                price = round(float(item.get("price")), 2)
            except (TypeError, ValueError):
                continue
            category_slug = str(item.get("category_slug") or "outros").strip()
            rows.append(
                {
                    "id": product_id,
                    "name": str(item.get("name", "")).strip(),
                    "image": str(item.get("image") or "assets/products/placeholder.svg").strip(),
                    "price": price,
                    "category_slug": category_slug,
                    "category_name": str(item.get("category_name") or CATEGORY_LABELS.get(category_slug, "Outros")).strip(),
                }
            )
            known.add(product_id)
    return rows


def db_seed_products_supabase() -> None:
    now = datetime.now(timezone.utc).isoformat()
    existing_rows = supabase_request("products", "GET", "?select=id")
    existing_ids = {str(row["id"]) for row in existing_rows}
    pending = []
    for product in product_seed_rows():
        if product["id"] in existing_ids:
            continue
        pending.append(
            {
                "id": product["id"],
                "name": product["name"],
                "image": product["image"],
                "original_price": product["price"],
                "real_price": product["price"],
                "promo_percent": 0,
                "category_slug": product["category_slug"],
                "category_name": product["category_name"],
                "updated_at": now,
            }
        )
    for index in range(0, len(pending), 100):
        supabase_request("products", "POST", payload=pending[index:index + 100])


def db_seed_admin_supabase() -> None:
    rows = supabase_request("admin_users", "GET", "?select=id&email=eq.admin%40enifler.local")
    if rows:
        return
    supabase_request(
        "admin_users",
        "POST",
        payload={
            "name": "Administrador Enifler",
            "email": "admin@enifler.local",
            "password_hash": DEFAULT_ADMIN_PASSWORD_HASH,
            "active": True,
        },
    )


def sqlite_ensure_column(db: sqlite3.Connection, table: str, column: str, definition: str) -> None:
    columns = {row[1] for row in db.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in columns:
        db.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def setup_database() -> None:
    if DB_DRIVER == "supabase":
        if not supabase_is_configured():
            print(
                "Aviso: Supabase ainda sem credenciais reais. "
                "A loja abrirÃ¡, mas login, cadastro, pedidos e admin "
                "ficarÃ£o indisponÃ­veis atÃ© configurar o arquivo .env."
            )
            return
        db_seed_products_supabase()
        db_seed_admin_supabase()
        return
    DATA_DIR.mkdir(exist_ok=True)
    with connect() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                transaction_id TEXT,
                status TEXT NOT NULL,
                total REAL NOT NULL,
                payment_variant TEXT NOT NULL,
                customer_json TEXT NOT NULL,
                address_json TEXT NOT NULL,
                items_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                image TEXT NOT NULL,
                original_price REAL NOT NULL,
                real_price REAL NOT NULL,
                promo_percent REAL NOT NULL DEFAULT 0,
                category_slug TEXT NOT NULL DEFAULT 'pc-gamer',
                category_name TEXT NOT NULL DEFAULT 'PC Gamer',
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                last_login_at TEXT
            );
            """
        )
        now = datetime.now(timezone.utc).isoformat()
        sqlite_ensure_column(db, "products", "category_slug", "TEXT NOT NULL DEFAULT 'pc-gamer'")
        sqlite_ensure_column(db, "products", "category_name", "TEXT NOT NULL DEFAULT 'PC Gamer'")
        db.executemany(
            """INSERT OR IGNORE INTO products
               (id, name, image, original_price, real_price, promo_percent, category_slug, category_name, updated_at)
               VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)""",
            [(p["id"], p["name"], p["image"], p["price"], p["price"], p["category_slug"], p["category_name"], now) for p in product_seed_rows()],
        )
        db.execute(
            """INSERT OR IGNORE INTO admin_users(name, email, password_hash, active, created_at)
               VALUES (?, ?, ?, 1, ?)""",
            ("Administrador Enifler", "admin@enifler.local", DEFAULT_ADMIN_PASSWORD_HASH, now),
        )


def db_user_by_id(user_id):
    if DB_DRIVER == "supabase":
        rows = supabase_request("users", "GET", qs_filter(id=user_id) + "&select=id,name,email")
        return rows[0] if rows else None
    with connect() as db:
        return db.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,)).fetchone()


def db_user_by_email(email):
    if DB_DRIVER == "supabase":
        rows = supabase_request("users", "GET", qs_filter(email=email) + "&select=*")
        return rows[0] if rows else None
    with connect() as db:
        return db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def db_admin_by_email(email):
    if DB_DRIVER == "supabase":
        rows = supabase_request(
            "admin_users",
            "GET",
            qs_filter(email=email) + "&select=id,name,email,password_hash,active",
        )
        return rows[0] if rows else None
    with connect() as db:
        return db.execute(
            "SELECT id, name, email, password_hash, active FROM admin_users WHERE email = ?",
            (email,),
        ).fetchone()


def db_touch_admin_login(admin_id):
    now = datetime.now(timezone.utc).isoformat()
    if DB_DRIVER == "supabase":
        supabase_request("admin_users", "PATCH", qs_filter(id=admin_id), {"last_login_at": now})
        return
    with connect() as db:
        db.execute("UPDATE admin_users SET last_login_at = ? WHERE id = ?", (now, admin_id))


def db_update_admin_password_hash(admin_id, password_hash_value):
    if DB_DRIVER == "supabase":
        supabase_request("admin_users", "PATCH", qs_filter(id=admin_id), {"password_hash": password_hash_value})
        return
    with connect() as db:
        db.execute("UPDATE admin_users SET password_hash = ? WHERE id = ?", (password_hash_value, admin_id))


def db_insert_user(name, email, password_hash_value):
    created_at = datetime.now(timezone.utc).isoformat()
    if DB_DRIVER == "supabase":
        try:
            rows = supabase_request(
                "users",
                "POST",
                payload={"name": name, "email": email, "password_hash": password_hash_value, "created_at": created_at},
            )
        except RuntimeError as exc:
            if "duplicate" in str(exc).lower() or "unique" in str(exc).lower() or "(409)" in str(exc):
                raise sqlite3.IntegrityError from exc
            raise
        return rows[0]["id"]
    with connect() as db:
        cursor = db.execute(
            "INSERT INTO users(name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (name, email, password_hash_value, created_at),
        )
        return cursor.lastrowid


def db_product_rows():
    if DB_DRIVER == "supabase":
        return supabase_request(
            "products",
            "GET",
            "?select=id,name,image,original_price,real_price,promo_percent,category_slug,category_name,updated_at&order=created_order.asc.nullslast,id.asc",
        )
    with connect() as db:
        return db.execute(
            "SELECT id, name, image, original_price, real_price, promo_percent, category_slug, category_name, updated_at FROM products ORDER BY rowid"
        ).fetchall()


def db_product_by_id(product_id):
    if DB_DRIVER == "supabase":
        rows = supabase_request("products", "GET", qs_filter(id=product_id) + "&select=*")
        return rows[0] if rows else None
    with connect() as db:
        return db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()


def db_update_product(product_id, real_price, promo_percent):
    updated_at = datetime.now(timezone.utc).isoformat()
    if DB_DRIVER == "supabase":
        supabase_request(
            "products",
            "PATCH",
            qs_filter(id=product_id),
            {"real_price": real_price, "promo_percent": promo_percent, "updated_at": updated_at},
        )
        return
    with connect() as db:
        db.execute(
            "UPDATE products SET real_price = ?, promo_percent = ?, updated_at = ? WHERE id = ?",
            (real_price, promo_percent, updated_at, product_id),
        )


def db_product_price_map():
    if DB_DRIVER == "supabase":
        return {row["id"]: row for row in supabase_request("products", "GET", "?select=id,name,real_price,promo_percent")}
    with connect() as db:
        return {
            row["id"]: row for row in db.execute(
                "SELECT id, name, real_price, promo_percent FROM products"
            ).fetchall()
        }


def db_insert_order(order_id, user_id, transaction_id, status, total, variant, customer, address, items):
    created_at = datetime.now(timezone.utc).isoformat()
    if DB_DRIVER == "supabase":
        supabase_request(
            "orders",
            "POST",
            payload={
                "id": order_id,
                "user_id": user_id,
                "transaction_id": transaction_id,
                "status": status,
                "total": total,
                "payment_variant": variant,
                "customer_json": customer,
                "address_json": address,
                "items_json": items,
                "created_at": created_at,
            },
        )
        return
    with connect() as db:
        db.execute(
            """INSERT INTO orders(id, user_id, transaction_id, status, total, payment_variant,
               customer_json, address_json, items_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                order_id, user_id, transaction_id, status, total, variant,
                json.dumps(customer, ensure_ascii=False), json.dumps(address, ensure_ascii=False),
                json.dumps(items, ensure_ascii=False), created_at,
            ),
        )


def db_order_by_transaction_user(transaction_id, user_id):
    if DB_DRIVER == "supabase":
        rows = supabase_request(
            "orders",
            "GET",
            qs_filter(transaction_id=transaction_id, user_id=user_id) + "&select=id",
        )
        return rows[0] if rows else None
    with connect() as db:
        return db.execute(
            "SELECT id, status FROM orders WHERE transaction_id = ? AND user_id = ?", (transaction_id, user_id)
        ).fetchone()


def db_order_by_transaction(transaction_id):
    if DB_DRIVER == "supabase":
        rows = supabase_request(
            "orders", "GET", qs_filter(transaction_id=transaction_id) + "&select=id,status"
        )
        return rows[0] if rows else None
    with connect() as db:
        return db.execute(
            "SELECT id, status FROM orders WHERE transaction_id = ?", (transaction_id,)
        ).fetchone()


def db_update_order_status(order_id, status):
    if DB_DRIVER == "supabase":
        supabase_request("orders", "PATCH", qs_filter(id=order_id), {"status": status})
        return
    with connect() as db:
        db.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))


def db_user_orders(user_id):
    if DB_DRIVER == "supabase":
        return supabase_request(
            "orders",
            "GET",
            qs_filter(user_id=user_id) + "&select=id,transaction_id,status,total,payment_variant,customer_json,address_json,items_json,created_at&order=created_at.desc",
        )
    with connect() as db:
        return db.execute(
            """
            SELECT id, transaction_id, status, total, payment_variant,
                   customer_json, address_json, items_json, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            (user_id,),
        ).fetchall()


def db_admin_orders():
    if DB_DRIVER == "supabase":
        orders = supabase_request(
            "orders",
            "GET",
            "?select=id,transaction_id,status,total,payment_variant,customer_json,items_json,created_at,user_id&order=created_at.desc",
        )
        user_ids = sorted({str(row["user_id"]) for row in orders})
        users = {}
        if user_ids:
            query = "?select=id,name,email&id=in.(" + ",".join(urllib.parse.quote(user_id) for user_id in user_ids) + ")"
            users = {str(row["id"]): row for row in supabase_request("users", "GET", query)}
        for row in orders:
            user = users.get(str(row["user_id"]), {})
            row["registered_name"] = user.get("name", "")
            row["registered_email"] = user.get("email", "")
        return orders
    with connect() as db:
        return db.execute(
            """
            SELECT o.id, o.transaction_id, o.status, o.total, o.payment_variant,
                   o.customer_json, o.items_json, o.created_at,
                   u.id AS user_id, u.name AS registered_name, u.email AS registered_email
            FROM orders o
            JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
            """
        ).fetchall()


def db_clear_admin_orders():
    if DB_DRIVER == "supabase":
        supabase_request("orders", "DELETE", "?id=not.is.null")
        return
    with connect() as db:
        db.execute("DELETE FROM orders")


def password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"{salt.hex()}:{digest.hex()}"


def password_matches(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split(":", 1)
        digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def valid_cpf(value: str) -> bool:
    digits = re.sub(r"\D", "", value)
    if len(digits) != 11 or digits == digits[0] * 11:
        return False
    for size in (9, 10):
        total = sum(int(digits[index]) * (size + 1 - index) for index in range(size))
        check = (total * 10) % 11
        if check == 10:
            check = 0
        if check != int(digits[size]):
            return False
    return True


def cookie_secret() -> bytes:
    secret = os.getenv("ENIFLER_COOKIE_SECRET") or SUPABASE_SERVICE_ROLE_KEY or SECRET_KEY or "enifler-local-cookie-secret"
    return secret.encode()


def signed_cookie(prefix: str, value) -> str:
    raw = f"{prefix}:{value}"
    signature = hmac.new(cookie_secret(), raw.encode(), hashlib.sha256).hexdigest()
    return f"{raw}:{signature}"


def read_signed_cookie(raw: str, prefix: str):
    try:
        cookie_prefix, value, signature = raw.split(":", 2)
    except (ValueError, AttributeError):
        return None
    if cookie_prefix != prefix:
        return None
    body = f"{cookie_prefix}:{value}"
    expected = hmac.new(cookie_secret(), body.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return None
    return value


class StoreHandler(SimpleHTTPRequestHandler):
    server_version = "EniflerLocal/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def send_json(self, payload, status=HTTPStatus.OK, cookie=None):
        raw = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(raw)

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            return json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            raise ValueError("JSON invÃ¡lido")

    def current_user(self):
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        token = cookie.get("enifler_session")
        if token:
            signed_user_id = read_signed_cookie(token.value, "user")
            if signed_user_id:
                return db_user_by_id(signed_user_id)
        user_id = SESSIONS.get(token.value) if token else None
        if not user_id:
            return None
        return db_user_by_id(user_id)

    def is_admin(self):
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        token = cookie.get("enifler_admin")
        if token and read_signed_cookie(token.value, "admin"):
            return True
        return bool(token and token.value in ADMIN_SESSIONS)

    def require_admin(self):
        if not self.is_admin():
            self.send_json({"error": "Acesso administrativo nÃ£o autorizado."}, HTTPStatus.UNAUTHORIZED)
            return False
        return True

    def require_user(self):
        user = self.current_user()
        if not user:
            self.send_json({"error": "FaÃ§a login para continuar."}, HTTPStatus.UNAUTHORIZED)
        return user

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/":
            self.send_response(HTTPStatus.FOUND)
            self.send_header("Location", "/pc-gamer.html")
            self.end_headers()
            return
        if parsed.path in ("/admin", "/admin/"):
            self.send_response(HTTPStatus.FOUND)
            self.send_header("Location", "/admin.html")
            self.end_headers()
            return
        if parsed.path == "/api/auth/me":
            user = self.current_user()
            self.send_json({"user": dict(user) if user else None})
            return
        if parsed.path == "/api/account":
            user = self.require_user()
            if user:
                self.account_profile(user)
            return
        if parsed.path == "/api/products":
            self.list_public_products()
            return
        if parsed.path == "/api/address/cep":
            cep = urllib.parse.parse_qs(parsed.query).get("cep", [""])[0]
            self.lookup_cep(cep)
            return
        if parsed.path == "/api/payments/status":
            user = self.require_user()
            if not user:
                return
            transaction_id = urllib.parse.parse_qs(parsed.query).get("id", [""])[0]
            if not re.fullmatch(r"[A-Za-z0-9_-]{1,100}", transaction_id):
                self.send_json({"error": "TransaÃ§Ã£o invÃ¡lida."}, HTTPStatus.BAD_REQUEST)
                return
            self.proxy_transaction_status(transaction_id, user["id"])
            return
        if parsed.path == "/api/admin/session":
            self.send_json({"authenticated": self.is_admin()})
            return
        if parsed.path == "/api/admin/customers":
            if self.require_admin():
                self.list_admin_customers()
            return
        if parsed.path == "/api/admin/products":
            if self.require_admin():
                self.list_admin_products()
            return
        super().do_GET()

    def route_path(self) -> str:
        """Retorna a rota real, mesmo quando a Vercel chega via rewrite.

        Em alguns deployments serverless, o POST pode chegar como
        /api?__enifler_path=auth/login em vez de /api/auth/login.
        Normalizar aqui evita falso 404 nas ações de login, cadastro,
        checkout e painel admin.
        """

        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
        route_values = params.get("__enifler_path")
        if route_values:
            route = route_values[0].lstrip("/")
            path = "/api" + (f"/{route}" if route else "")
        else:
            path = parsed.path
        if path != "/":
            path = path.rstrip("/")
        return path

    def do_POST(self):
        route = self.route_path()
        try:
            payload = self.read_json()
        except ValueError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            return
        if route == "/api/auth/register":
            self.register(payload)
        elif route == "/api/auth/login":
            self.login(payload)
        elif route == "/api/auth/logout":
            self.logout()
        elif route == "/api/payments/pix":
            user = self.require_user()
            if user:
                self.create_pix(payload, user)
        elif route == "/api/payments/webhook":
            self.payment_webhook(payload)
        elif route == "/api/admin/login":
            self.admin_login(payload)
        elif route == "/api/admin/logout":
            self.admin_logout()
        elif route == "/api/admin/products/update":
            if self.require_admin():
                self.update_admin_product(payload)
        elif route == "/api/admin/customers/clear":
            if self.require_admin():
                self.clear_admin_customers()
        else:
            self.send_json({"error": f"Rota nÃ£o encontrada: {route}"}, HTTPStatus.NOT_FOUND)

    def register(self, payload):
        name = str(payload.get("name", "")).strip()
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        confirmation = str(payload.get("confirmation", ""))
        if len(name.split()) < 2:
            self.send_json({"error": "Informe seu nome completo."}, HTTPStatus.BAD_REQUEST)
            return
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            self.send_json({"error": "Informe um e-mail vÃ¡lido."}, HTTPStatus.BAD_REQUEST)
            return
        if len(password) < 8:
            self.send_json({"error": "A senha precisa ter pelo menos 8 caracteres."}, HTTPStatus.BAD_REQUEST)
            return
        if password != confirmation:
            self.send_json({"error": "As senhas nÃ£o coincidem."}, HTTPStatus.BAD_REQUEST)
            return
        try:
            user_id = db_insert_user(name, email, password_hash(password))
        except sqlite3.IntegrityError:
            self.send_json({"error": "Este e-mail jÃ¡ estÃ¡ cadastrado."}, HTTPStatus.CONFLICT)
            return
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        self.start_session(user_id, name, email, HTTPStatus.CREATED)

    def login(self, payload):
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        try:
            user = db_user_by_email(email)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        if not user or not password_matches(password, row_get(user, "password_hash")):
            self.send_json({"error": "E-mail ou senha incorretos."}, HTTPStatus.UNAUTHORIZED)
            return
        self.start_session(row_get(user, "id"), row_get(user, "name"), row_get(user, "email"))

    def start_session(self, user_id, name, email, status=HTTPStatus.OK):
        token = signed_cookie("user", user_id)
        cookie = f"enifler_session={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age={SESSION_MAX_AGE}"
        self.send_json({"user": {"id": user_id, "name": name, "email": email}}, status, cookie)

    def logout(self):
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        token = cookie.get("enifler_session")
        if token:
            SESSIONS.pop(token.value, None)
        self.send_json({"ok": True}, cookie="enifler_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0")

    def admin_login(self, payload):
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        try:
            admin = db_admin_by_email(email)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        is_active = bool(row_get(admin, "active")) if admin else False
        if not admin or not is_active:
            self.send_json({"error": "E-mail ou senha de administrador incorretos."}, HTTPStatus.UNAUTHORIZED)
            return
        try:
            db_touch_admin_login(row_get(admin, "id"))
        except RuntimeError:
            pass
        token = signed_cookie("admin", row_get(admin, "id"))
        cookie = f"enifler_admin={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age={SESSION_MAX_AGE}"
        self.send_json({"authenticated": True}, cookie=cookie)

    def admin_logout(self):
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        token = cookie.get("enifler_admin")
        if token:
            ADMIN_SESSIONS.discard(token.value)
        self.send_json({"ok": True}, cookie="enifler_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0")

    def product_rows(self):
        return db_product_rows()

    def lookup_cep(self, value):
        cep = re.sub(r"\D", "", str(value))
        if len(cep) != 8:
            self.send_json({"error": "Informe um CEP com 8 nÃºmeros."}, HTTPStatus.BAD_REQUEST)
            return
        request = urllib.request.Request(
            f"https://viacep.com.br/ws/{cep}/json/",
            headers={"Accept": "application/json", "User-Agent": "Enifler/1.0"},
        )
        try:
            with urllib.request.urlopen(request, timeout=8) as response:
                data = json.loads(response.read())
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            self.send_json({"error": "NÃ£o foi possÃ­vel consultar o CEP agora."}, HTTPStatus.BAD_GATEWAY)
            return
        if data.get("erro"):
            self.send_json({"error": "CEP nÃ£o encontrado."}, HTTPStatus.NOT_FOUND)
            return
        self.send_json(
            {
                "zip": data.get("cep", cep),
                "street": data.get("logradouro", ""),
                "complement": data.get("complemento", ""),
                "district": data.get("bairro", ""),
                "city": data.get("localidade", ""),
                "state": data.get("uf", ""),
            }
        )

    def list_public_products(self):
        products = []
        for row in self.product_rows():
            sale_price = round(row["real_price"] * (1 - row["promo_percent"] / 100), 2)
            products.append(
                {
                    "id": row["id"],
                    "name": row["name"],
                    "image": row["image"],
                    "price": sale_price,
                    "realPrice": round(row["real_price"], 2),
                    "promoPercent": row["promo_percent"],
                    "categorySlug": row_get(row, "category_slug", "pc-gamer"),
                    "categoryName": row_get(row, "category_name", "PC Gamer"),
                }
            )
        self.send_json({"products": products})

    def list_admin_products(self):
        products = []
        for row in self.product_rows():
            products.append(
                {
                    "id": row["id"],
                    "name": row["name"],
                    "image": row["image"],
                    "originalPrice": round(row["original_price"], 2),
                    "realPrice": round(row["real_price"], 2),
                    "promoPercent": row["promo_percent"],
                    "categorySlug": row_get(row, "category_slug", "pc-gamer"),
                    "categoryName": row_get(row, "category_name", "PC Gamer"),
                    "salePrice": round(row["real_price"] * (1 - row["promo_percent"] / 100), 2),
                    "updatedAt": row["updated_at"],
                }
            )
        self.send_json({"products": products})

    def account_profile(self, user):
        try:
            rows = db_user_orders(user["id"])
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        orders = []
        for row in rows:
            customer_raw = row_get(row, "customer_json")
            address_raw = row_get(row, "address_json")
            items_raw = row_get(row, "items_json")
            customer = customer_raw if isinstance(customer_raw, dict) else json.loads(customer_raw)
            address = address_raw if isinstance(address_raw, dict) else json.loads(address_raw)
            items = items_raw if isinstance(items_raw, list) else json.loads(items_raw)
            orders.append(
                {
                    "orderId": row_get(row, "id"),
                    "transactionId": row_get(row, "transaction_id"),
                    "status": row_get(row, "status"),
                    "total": row_get(row, "total"),
                    "paymentVariant": row_get(row, "payment_variant"),
                    "createdAt": row_get(row, "created_at"),
                    "customer": {
                        "name": customer.get("name") or row_get(user, "name"),
                        "email": row_get(user, "email"),
                        "phone": customer.get("phone") or address.get("phone"),
                        "document": customer.get("document"),
                    },
                    "address": address,
                    "items": items,
                }
            )
        self.send_json(
            {
                "user": {
                    "id": row_get(user, "id"),
                    "name": row_get(user, "name"),
                    "email": row_get(user, "email"),
                },
                "orders": orders,
            }
        )

    def update_admin_product(self, payload):
        product_id = str(payload.get("id", ""))
        action = str(payload.get("action", "save"))
        try:
            product = db_product_by_id(product_id)
            if not product:
                self.send_json({"error": "Produto nÃ£o encontrado."}, HTTPStatus.NOT_FOUND)
                return
            if action == "restore":
                real_price = row_get(product, "original_price")
                promo_percent = 0
            else:
                try:
                    submitted_price = round(float(payload.get("realPrice")), 2)
                    hidden_percent = float(payload.get("hiddenPercent", 0) or 0)
                    promo_percent = float(payload.get("promoPercent", 0) or 0)
                except (TypeError, ValueError):
                    self.send_json({"error": "Informe valores numÃ©ricos vÃ¡lidos."}, HTTPStatus.BAD_REQUEST)
                    return
                if submitted_price <= 0 or not 0 <= hidden_percent <= 90 or not 0 <= promo_percent <= 90:
                    self.send_json({"error": "PreÃ§o deve ser positivo e descontos devem ficar entre 0% e 90%."}, HTTPStatus.BAD_REQUEST)
                    return
                real_price = round(submitted_price * (1 - hidden_percent / 100), 2)
            db_update_product(product_id, real_price, promo_percent)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        self.send_json(
            {
                "ok": True,
                "product": {
                    "id": product_id,
                    "realPrice": real_price,
                    "promoPercent": promo_percent,
                    "salePrice": round(real_price * (1 - promo_percent / 100), 2),
                },
            }
        )

    def list_admin_customers(self):
        try:
            rows = db_admin_orders()
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        orders = []
        customer_ids = set()
        total_received = 0.0
        pending = 0
        for row in rows:
            customer_raw = row_get(row, "customer_json")
            items_raw = row_get(row, "items_json")
            customer = customer_raw if isinstance(customer_raw, dict) else json.loads(customer_raw)
            items = items_raw if isinstance(items_raw, list) else json.loads(items_raw)
            customer_ids.add(row["user_id"])
            if row["status"] == "COMPLETED":
                total_received += row["total"]
            if row["status"] == "PENDING":
                pending += 1
            orders.append(
                {
                    "orderId": row["id"],
                    "transactionId": row["transaction_id"],
                    "status": row["status"],
                    "total": row["total"],
                    "paymentVariant": row["payment_variant"],
                    "createdAt": row["created_at"],
                    "customer": {
                        "name": customer.get("name") or row["registered_name"],
                        "registeredEmail": row["registered_email"],
                        "paymentEmail": customer.get("email"),
                        "document": customer.get("document"),
                        "ddd": customer.get("ddd"),
                        "mobile": customer.get("mobile"),
                    },
                    "items": items,
                }
            )
        self.send_json(
            {
                "orders": orders,
                "stats": {
                    "customers": len(customer_ids),
                    "orders": len(orders),
                    "pending": pending,
                    "received": round(total_received, 2),
                },
            }
        )

    def clear_admin_customers(self):
        try:
            db_clear_admin_orders()
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        self.send_json({"ok": True})

    def validate_checkout(self, payload):
        address = payload.get("address") or {}
        customer = payload.get("customer") or {}
        variant = payload.get("variant")
        items = payload.get("items") or []
        required_address = ("zip", "street", "number", "district", "city", "state", "phone")
        if any(not str(address.get(field, "")).strip() for field in required_address):
            raise ValueError("Preencha todos os campos obrigatÃ³rios do endereÃ§o.")
        if variant not in ("pix", "pix2"):
            raise ValueError("Selecione uma forma de PIX.")
        name = str(customer.get("name", "")).strip()
        document = re.sub(r"\D", "", str(customer.get("document", "")))
        customer_phone = re.sub(r"\D", "", str(customer.get("phone") or address.get("phone") or ""))
        if len(name.split()) < 2:
            raise ValueError("Informe seu nome completo.")
        if len(customer_phone) < 10:
            raise ValueError("Informe um telefone vÃƒÂ¡lido.")
        if not valid_cpf(document):
            raise ValueError("Informe um CPF vÃ¡lido.")
        customer["phone"] = customer_phone
        clean_items = []
        subtotal = 0.0
        try:
            product_prices = db_product_price_map()
        except RuntimeError as exc:
            raise ValueError(str(exc))
        for item in items:
            product_id = str(item.get("id", ""))
            qty = max(1, min(int(item.get("qty", 1)), 20))
            if product_id not in product_prices:
                raise ValueError("HÃ¡ um produto invÃ¡lido no carrinho.")
            product = product_prices[product_id]
            product_name = product["name"]
            price = round(product["real_price"] * (1 - product["promo_percent"] / 100), 2)
            subtotal += price * qty
            clean_items.append({"id": product_id, "name": product_name, "quantity": qty, "price": price})
        if not clean_items:
            raise ValueError("Seu carrinho estÃ¡ vazio.")
        return address, customer, variant, clean_items, round(subtotal * 0.85, 2)

    def create_pix(self, payload, user):
        try:
            address, customer, variant, items, total = self.validate_checkout(payload)
        except (ValueError, TypeError) as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            return
        if variant == "pix2":
            order_id = f"ENF-{datetime.now():%Y%m%d}-{secrets.token_hex(5).upper()}"
            try:
                db_insert_order(order_id, user["id"], None, "REFUSED", total, variant, customer, address, items)
            except RuntimeError as exc:
                self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
                return
            self.send_json(
                {
                    "orderId": order_id,
                    "status": "REFUSED",
                    "code": "PIX2_REFUSED",
                    "message": "Pagamento recusado, tente outra forma de pagamento ou tente denovo em alguns minutos",
                },
                HTTPStatus.CREATED,
            )
            return
        if not PARADISE_API_KEY:
            self.send_json(
                {"error": "Chave da API Paradise ainda nao configurada no arquivo .env.", "code": "PAYMENT_NOT_CONFIGURED"},
                HTTPStatus.SERVICE_UNAVAILABLE,
            )
            return
        order_id = f"ENF-{datetime.now():%Y%m%d}-{secrets.token_hex(5).upper()}"
        email = user["email"]
        phone = str(customer.get("phone") or address["phone"])
        request_body = {
            "amount": int(round(total * 100)),
            "description": ", ".join(item["name"] for item in items)[:255],
            "reference": order_id,
            "source": "api_externa",
            "customer": {
                "name": str(customer["name"]).strip(),
                "email": email,
                "phone": phone,
                "document": re.sub(r"\D", "", str(customer["document"])),
            },
        }
        webhook_url = self.payment_webhook_url()
        if webhook_url:
            request_body["postback_url"] = webhook_url
        try:
            response = self.paradise_request("/transaction.php", "POST", request_body)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        transaction_id = response.get("transaction_id")
        if not transaction_id or not response.get("qr_code"):
            self.send_json({"error": response.get("message") or "A operadora nao retornou um PIX valido."}, HTTPStatus.BAD_GATEWAY)
            return
        try:
            db_insert_order(order_id, user["id"], str(transaction_id), "PENDING", total, variant, customer, address, items)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        self.send_ntfy_notification(
            "PIX gerado", f"Pedido {order_id} criado: R$ {total:.2f}".replace(".", ",")
        )
        self.send_json(
            {
                "orderId": order_id,
                "transactionId": str(transaction_id),
                "status": self.normalize_payment_status(response.get("status")),
                "pix": {"code": response["qr_code"], "image": response.get("qr_code_base64")},
            },
            HTTPStatus.CREATED,
        )

    def proxy_transaction_status(self, transaction_id, user_id):
        try:
            order = db_order_by_transaction_user(transaction_id, user_id)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        if not order:
            self.send_json({"error": "Pedido nÃ£o encontrado."}, HTTPStatus.NOT_FOUND)
            return
        try:
            response = self.paradise_request(
                f"/query.php?action=get_transaction&id={urllib.parse.quote(transaction_id)}", "GET"
            )
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        status = self.normalize_payment_status(response.get("status"))
        try:
            db_update_order_status(order["id"], status)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        if status == "COMPLETED" and row_get(order, "status") != "COMPLETED":
            self.send_ntfy_notification("PIX pago", f"Pedido {order['id']} foi pago.")
        self.send_json({"status": status, "payedAt": response.get("updated_at")})

    def payment_webhook_url(self):
        if not PUBLIC_BASE_URL or not PARADISE_WEBHOOK_TOKEN:
            return None
        token = urllib.parse.quote(PARADISE_WEBHOOK_TOKEN, safe="")
        return f"{PUBLIC_BASE_URL}/api/payments/webhook?token={token}"

    def payment_webhook(self, payload):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        received_token = query.get("token", [""])[0]
        if not PARADISE_WEBHOOK_TOKEN or not hmac.compare_digest(received_token, PARADISE_WEBHOOK_TOKEN):
            self.send_json({"error": "Webhook nao autorizado."}, HTTPStatus.UNAUTHORIZED)
            return
        transaction_id = str(payload.get("transaction_id") or "").strip()
        if not transaction_id:
            self.send_json({"error": "Webhook sem transaction_id."}, HTTPStatus.BAD_REQUEST)
            return
        try:
            order = db_order_by_transaction(transaction_id)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        if not order:
            # Responde 200 para evitar novas tentativas de eventos que nao pertencem a loja.
            self.send_json({"received": True, "ignored": True})
            return
        status = self.normalize_payment_status(payload.get("status"))
        try:
            db_update_order_status(row_get(order, "id"), status)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
            return
        if status == "COMPLETED" and row_get(order, "status") != "COMPLETED":
            self.send_ntfy_notification("PIX pago", f"Pedido {row_get(order, 'id')} foi pago.")
        self.send_json({"received": True})

    def send_ntfy_notification(self, title, message):
        if not NTFY_TOPIC:
            return
        headers = {"Title": title, "Priority": "default", "Content-Type": "text/plain; charset=utf-8"}
        if PUBLIC_BASE_URL:
            headers["Click"] = f"{PUBLIC_BASE_URL}/admin"
        if NTFY_ACCESS_TOKEN:
            headers["Authorization"] = f"Bearer {NTFY_ACCESS_TOKEN}"
        topic = urllib.parse.quote(NTFY_TOPIC, safe="")
        request = urllib.request.Request(
            f"{NTFY_SERVER}/{topic}", data=message.encode("utf-8"), headers=headers, method="POST"
        )
        try:
            with urllib.request.urlopen(request, timeout=8):
                pass
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            print(f"Aviso: falha ao enviar notificacao ntfy: {exc}")

    @staticmethod
    def normalize_payment_status(status):
        return {
            "approved": "COMPLETED",
            "pending": "PENDING",
            "processing": "PENDING",
            "under_review": "PENDING",
            "failed": "FAILED",
            "refunded": "REFUNDED",
            "chargeback": "CHARGED_BACK",
        }.get(str(status or "").lower(), str(status or "PENDING").upper())

    def paradise_request(self, path, method, payload=None):
        headers = {
            "X-API-Key": PARADISE_API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        data = json.dumps(payload).encode() if payload is not None else None
        request = urllib.request.Request(f"{PARADISE_BASE_URL}{path}", data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                return json.loads(response.read())
        except urllib.error.HTTPError as exc:
            try:
                error = json.loads(exc.read())
                message = error.get("message") or error.get("errorDescription") or error.get("error")
            except (json.JSONDecodeError, AttributeError):
                message = None
            raise RuntimeError(message or f"A operadora recusou a solicitaÃ§Ã£o ({exc.code}).")
        except (urllib.error.URLError, TimeoutError):
            raise RuntimeError("NÃ£o foi possÃ­vel conectar Ã  operadora de pagamentos.")


if __name__ == "__main__":
    load_dotenv()
    # Atualiza as credenciais apÃ³s carregar o arquivo .env.
    refresh_config()
    setup_database()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), StoreHandler)
    url = f"http://127.0.0.1:{PORT}/index.html"
    print(f"Enifler disponÃ­vel em {url}")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
