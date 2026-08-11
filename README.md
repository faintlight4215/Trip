# 新疆 15 日自驾攻略

GitHub Pages 安全公开版。

- 入口：`index.html`
- 高德 Web Key 由浏览器加载，并应在高德控制台绑定 `faintlight4215.github.io`
- 高德安全密钥只保存在 Cloudflare Worker Secret 中，不进入仓库
- 每日攻略、路线顺序、海拔、气温和准备事项可正常浏览
- 内嵌地图通过 Cloudflare Worker 安全代理访问高德服务

在仓库的 **Settings → Pages** 中选择 **Deploy from a branch**，发布 `main` 分支根目录。
