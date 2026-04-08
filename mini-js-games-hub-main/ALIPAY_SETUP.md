# 支付宝接入说明

这个站点当前采用的是“支付宝手机网站支付”方案，适合手机浏览器内直接跳转支付宝收银台完成付款。

## 已完成内容

- 首页右侧栏已加入支付宝支付入口
- 已提供 3 个支持计划档位
- 已提供本地 Node 支付服务：
  - `mini-js-games-hub-main/alipay-pay-server.mjs`
- 已提供支付返回页：
  - `mini-js-games-hub-main/payment-success.html`
- 已生成本地配置模板：
  - `mini-js-games-hub-main/.env.alipay.local`

## 你需要填写的核心参数

在 `mini-js-games-hub-main/.env.alipay.local` 里，至少补齐：

- `ALIPAY_APP_ID`
- `ALIPAY_PRIVATE_KEY_PATH`
- `ALIPAY_PUBLIC_KEY_PATH`

说明：

- `ALIPAY_PRIVATE_KEY_PATH`：
  你的应用私钥 PEM 文件路径
- `ALIPAY_PUBLIC_KEY_PATH`：
  支付宝公钥 PEM 文件路径

## 本地浏览器调试

当前本地站点地址：

- `http://127.0.0.1:4173/mini-js-games-hub-main/index.html`

当前本地支付服务端口：

- `http://127.0.0.1:8788`

启动命令：

```bash
./start-alipay-pay-server.sh
```

## 手机同 Wi-Fi 局域网调试

你当前电脑局域网 IP 为：

- `192.168.1.51`

如果要让手机访问，请把 `.env.alipay.local` 里这些地址改成：

```env
SITE_BASE_URL=http://192.168.1.51:4173/mini-js-games-hub-main
SERVER_BASE_URL=http://192.168.1.51:8788
ALIPAY_NOTIFY_URL=http://192.168.1.51:8788/pay-api/alipay/notify
ALIPAY_RETURN_URL=http://192.168.1.51:4173/mini-js-games-hub-main/payment-success.html
ALIPAY_QUIT_URL=http://192.168.1.51:4173/mini-js-games-hub-main/index.html
```

手机访问地址：

- `http://192.168.1.51:4173/mini-js-games-hub-main/index.html`

注意：

- 手机和电脑必须在同一个 Wi-Fi 下
- 如果手机打不开，通常是防火墙或路由器 AP 隔离导致

## 正式上线需要替换的地址

正式部署时，请把以下地址全部换成你的正式域名：

- `SITE_BASE_URL`
- `SERVER_BASE_URL`
- `ALIPAY_NOTIFY_URL`
- `ALIPAY_RETURN_URL`
- `ALIPAY_QUIT_URL`

其中：

- `notify_url` 必须是支付宝服务器可访问的公网地址
- `return_url` 是用户支付后跳回的前端页面
- `quit_url` 是用户主动退出支付后的回跳地址

## 当前实现说明

当前支付服务实现的是：

- 生成 `alipay.trade.wap.pay` 支付表单
- 跳转支付宝手机网站支付
- 预留异步通知验签入口

但正式上线前，建议再补这些内容：

- 订单表落库
- 支付记录持久化
- 异步通知成功后的订单状态更新
- 重复支付与幂等校验
- 后台管理查看支付记录

## 游戏点击排行与分析

当前本地服务还集成了游戏点击统计能力：

- 总榜接口：`/stats-api/rankings`
- 最近点击明细：`/stats-api/recent-clicks`

服务端会记录：

- 游戏 ID
- 游戏名称
- 来源
- 平台
- icon
- cover
- 点击 IP
- User-Agent
- 点击时间

数据库文件：

- `mini-js-games-hub-main/data/game-analytics.sqlite`
