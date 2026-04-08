import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { StringDecoder } from "node:string_decoder";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnvFile(path.join(__dirname, ".env.alipay.local"));

const PORT = Number(process.env.ALIPAY_PAY_PORT || 8788);
const ALIPAY_GATEWAY = process.env.ALIPAY_GATEWAY || "https://openapi.alipay.com/gateway.do";
const SITE_BASE_URL = process.env.SITE_BASE_URL || "http://127.0.0.1:4173/mini-js-games-hub-main";
const SERVER_BASE_URL = process.env.SERVER_BASE_URL || `http://127.0.0.1:${PORT}`;
const DATA_DIR = path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
const ANALYTICS_DB_PATH = path.join(DATA_DIR, "game-analytics.sqlite");
const db = new DatabaseSync(ANALYTICS_DB_PATH);
initAnalyticsDb();

const PLAN_MAP = {
  support_small: {
    amount: "6.66",
    subject: "小游戏站点支持",
    body: "单次支持，用于站点内容更新与日常维护",
  },
  support_medium: {
    amount: "19.90",
    subject: "小游戏内容赞助",
    body: "内容赞助，用于专题活动与新内容更新",
  },
  support_yearly: {
    amount: "99.00",
    subject: "小游戏年度支持",
    body: "年度支持，用于服务器、更新与持续运营投入",
  },
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", SERVER_BASE_URL);

  if (req.method === "GET" && url.pathname === "/pay-api/config") {
    return respondJson(res, 200, {
      ready: Boolean(getConfig().ready),
      missing: getConfig().missing,
    });
  }

  if (req.method === "GET" && url.pathname === "/stats-api/rankings") {
    return handleRankings(req, res, url);
  }

  if (req.method === "GET" && url.pathname === "/stats-api/recent-clicks") {
    return handleRecentClicks(req, res, url);
  }

  if (req.method === "POST" && url.pathname === "/stats-api/track-click") {
    return handleTrackClick(req, res);
  }

  if (req.method === "GET" && url.pathname === "/pay-api/wap-pay") {
    return handleWapPay(req, res, url);
  }

  if (req.method === "POST" && url.pathname === "/pay-api/alipay/notify") {
    return handleNotify(req, res);
  }

  return respondHtml(
    res,
    404,
    renderPage("Not Found", "<p>Payment endpoint not found.</p>")
  );
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Alipay pay server running at ${SERVER_BASE_URL}`);
});

function handleWapPay(req, res, url) {
  const config = getConfig();
  if (!config.ready) {
    return respondHtml(
      res,
      500,
      renderPage(
        "Alipay Config Missing",
        `<h1>支付宝支付未配置</h1><p>缺少必要环境变量：</p><pre>${escapeHtml(config.missing.join("\n"))}</pre><p>请先复制 <code>.env.alipay.example</code> 为 <code>.env.alipay.local</code> 并填写商户参数。</p>`
      )
    );
  }

  const plan = PLAN_MAP[url.searchParams.get("plan") || ""] || PLAN_MAP.support_small;
  const outTradeNo = `GAME-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

  const bizContent = {
    out_trade_no: outTradeNo,
    total_amount: plan.amount,
    subject: plan.subject,
    body: plan.body,
    product_code: "QUICK_WAP_WAY",
    quit_url: process.env.ALIPAY_QUIT_URL || `${SITE_BASE_URL}/index.html`,
    timeout_express: "15m",
  };

  const params = {
    app_id: config.appId,
    method: "alipay.trade.wap.pay",
    format: "JSON",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: formatTimestamp(new Date()),
    version: "1.0",
    notify_url: process.env.ALIPAY_NOTIFY_URL || `${SERVER_BASE_URL}/pay-api/alipay/notify`,
    return_url: process.env.ALIPAY_RETURN_URL || `${SITE_BASE_URL}/payment-success.html`,
    biz_content: JSON.stringify(bizContent),
  };

  params.sign = signParams(params, config.privateKey);

  return respondHtml(
    res,
    200,
    renderAutoSubmitForm(ALIPAY_GATEWAY, params)
  );
}

async function handleTrackClick(req, res) {
  const rawBody = await readRawBody(req);
  let payload = {};

  try {
    payload = JSON.parse(rawBody || "{}");
  } catch (error) {
    return respondJson(res, 400, { error: "Invalid JSON body" });
  }

  const gameId = String(payload.gameId || "").trim();
  const gameName = String(payload.gameName || "").trim();

  if (!gameId || !gameName) {
    return respondJson(res, 400, { error: "gameId and gameName are required" });
  }

  const requestIp = getRequestIp(req);
  const userAgent = String(req.headers["user-agent"] || "");
  const clickedAt = new Date().toISOString();

  const eventStmt = db.prepare(`
    INSERT INTO game_click_events (
      game_id, game_name, source, platform, icon, cover, ip_address, user_agent, clicked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  eventStmt.run(
    gameId,
    gameName,
    String(payload.source || ""),
    String(payload.platform || ""),
    String(payload.icon || ""),
    String(payload.cover || ""),
    requestIp,
    userAgent,
    clickedAt
  );

  const stmt = db.prepare(`
    INSERT INTO game_click_rankings (
      game_id, game_name, source, platform, icon, cover, clicks, updated_at, last_ip_address, last_user_agent, last_clicked_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?
    )
    ON CONFLICT(game_id) DO UPDATE SET
      game_name = excluded.game_name,
      source = excluded.source,
      platform = excluded.platform,
      icon = excluded.icon,
      cover = excluded.cover,
      clicks = game_click_rankings.clicks + 1,
      updated_at = excluded.updated_at,
      last_ip_address = excluded.last_ip_address,
      last_user_agent = excluded.last_user_agent,
      last_clicked_at = excluded.last_clicked_at
  `);

  stmt.run(
    gameId,
    gameName,
    String(payload.source || ""),
    String(payload.platform || ""),
    String(payload.icon || ""),
    String(payload.cover || ""),
    clickedAt,
    requestIp,
    userAgent,
    clickedAt
  );

  return respondJson(res, 200, { ok: true });
}

function handleRankings(req, res, url) {
  const limit = Math.max(1, Math.min(20, Number(url.searchParams.get("limit") || 8)));
  const stmt = db.prepare(`
    SELECT
      game_id AS gameId,
      game_name AS gameName,
      source,
      platform,
      icon,
      cover,
      clicks,
      updated_at AS updatedAt,
      last_ip_address AS lastIpAddress,
      last_user_agent AS lastUserAgent,
      last_clicked_at AS lastClickedAt
    FROM game_click_rankings
    ORDER BY clicks DESC, updated_at DESC
    LIMIT ?
  `);
  const rankings = stmt.all(limit);
  return respondJson(res, 200, { rankings });
}

function handleRecentClicks(req, res, url) {
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 20)));
  const stmt = db.prepare(`
    SELECT
      id,
      game_id AS gameId,
      game_name AS gameName,
      source,
      platform,
      icon,
      cover,
      ip_address AS ipAddress,
      user_agent AS userAgent,
      clicked_at AS clickedAt
    FROM game_click_events
    ORDER BY clicked_at DESC
    LIMIT ?
  `);
  const events = stmt.all(limit);
  return respondJson(res, 200, { events });
}

async function handleNotify(req, res) {
  const config = getConfig();
  const rawBody = await readRawBody(req);
  const notifyParams = Object.fromEntries(new URLSearchParams(rawBody));

  if (!config.alipayPublicKey) {
    console.warn("Alipay notify received but ALIPAY_PUBLIC_KEY is missing.");
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("success");
  }

  const isValid = verifyNotifySign(notifyParams, config.alipayPublicKey);
  if (!isValid) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("fail");
  }

  console.log("Alipay notify payload:", notifyParams);
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  return res.end("success");
}

function getConfig() {
  const appId = process.env.ALIPAY_APP_ID || "";
  const privateKey = readPemFromEnv("ALIPAY_PRIVATE_KEY", "ALIPAY_PRIVATE_KEY_PATH");
  const alipayPublicKey = readPemFromEnv("ALIPAY_PUBLIC_KEY", "ALIPAY_PUBLIC_KEY_PATH");
  const missing = [];

  if (!appId) missing.push("ALIPAY_APP_ID");
  if (!privateKey) missing.push("ALIPAY_PRIVATE_KEY or ALIPAY_PRIVATE_KEY_PATH");

  return {
    ready: missing.length === 0,
    missing,
    appId,
    privateKey,
    alipayPublicKey,
  };
}

function initAnalyticsDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_click_rankings (
      game_id TEXT PRIMARY KEY,
      game_name TEXT NOT NULL,
      source TEXT DEFAULT '',
      platform TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      cover TEXT DEFAULT '',
      clicks INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      last_ip_address TEXT DEFAULT '',
      last_user_agent TEXT DEFAULT '',
      last_clicked_at TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS game_click_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      game_name TEXT NOT NULL,
      source TEXT DEFAULT '',
      platform TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      cover TEXT DEFAULT '',
      ip_address TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      clicked_at TEXT NOT NULL
    );
  `);

  const rankingColumns = new Set(
    db.prepare("PRAGMA table_info(game_click_rankings)").all().map((row) => row.name)
  );

  if (!rankingColumns.has("last_ip_address")) {
    db.exec("ALTER TABLE game_click_rankings ADD COLUMN last_ip_address TEXT DEFAULT '';");
  }
  if (!rankingColumns.has("last_user_agent")) {
    db.exec("ALTER TABLE game_click_rankings ADD COLUMN last_user_agent TEXT DEFAULT '';");
  }
  if (!rankingColumns.has("last_clicked_at")) {
    db.exec("ALTER TABLE game_click_rankings ADD COLUMN last_clicked_at TEXT DEFAULT '';");
  }
}

function readPemFromEnv(valueKey, pathKey) {
  if (process.env[valueKey]) {
    return process.env[valueKey].replace(/\\n/g, "\n");
  }
  if (process.env[pathKey]) {
    const resolvedPath = path.resolve(process.env[pathKey]);
    if (fs.existsSync(resolvedPath)) {
      return fs.readFileSync(resolvedPath, "utf8");
    }
    return "";
  }
  return "";
}

function signParams(params, privateKey) {
  const signContent = buildSignContent(params);
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signContent, "utf8");
  signer.end();
  return signer.sign(privateKey, "base64");
}

function verifyNotifySign(params, publicKey) {
  const { sign, sign_type, ...rest } = params;
  if (!sign) return false;
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(buildSignContent(rest), "utf8");
  verifier.end();
  return verifier.verify(publicKey, sign, "base64");
}

function buildSignContent(params) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

function renderAutoSubmitForm(action, params) {
  const inputs = Object.entries(params)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(String(value))}" />`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>正在跳转支付宝收银台</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif; margin: 0; background: #f7f8f5; color: #1c1c1c; display: grid; place-items: center; min-height: 100vh; }
      .card { width: min(92vw, 520px); background: #fff; border-radius: 20px; padding: 28px; box-shadow: 0 18px 40px rgba(0,0,0,.08); }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { margin: 0; line-height: 1.7; color: #585858; }
      button { margin-top: 16px; border: 0; border-radius: 999px; padding: 12px 18px; background: #1677ff; color: #fff; font-weight: 700; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>正在跳转支付宝收银台</h1>
      <p>如果页面没有自动跳转，请点击下方按钮继续支付。</p>
      <form id="alipayForm" action="${escapeHtml(action)}" method="post">
        ${inputs}
        <button type="submit">继续支付</button>
      </form>
    </div>
    <script>document.getElementById("alipayForm").submit();</script>
  </body>
</html>`;
}

function renderPage(title, body) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif; margin: 0; background: #f7f8f5; color: #1c1c1c; display: grid; place-items: center; min-height: 100vh; }
      .card { width: min(92vw, 720px); background: #fff; border-radius: 20px; padding: 28px; box-shadow: 0 18px 40px rgba(0,0,0,.08); }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p, pre { line-height: 1.7; color: #585858; white-space: pre-wrap; }
      code { background: #f2f4f7; padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="card">${body}</div>
  </body>
</html>`;
}

function respondJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload));
}

function respondHtml(res, status, html) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(html);
}

function formatTimestamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function loadEnvFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separator = trimmed.indexOf("=");
    if (separator === -1) return;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder("utf8");
    let body = "";
    req.on("data", (chunk) => {
      body += decoder.write(chunk);
    });
    req.on("end", () => {
      body += decoder.end();
      resolve(body);
    });
    req.on("error", reject);
  });
}

function getRequestIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").trim();
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const remoteAddress = req.socket?.remoteAddress || "";
  return remoteAddress.replace(/^::ffff:/, "");
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
