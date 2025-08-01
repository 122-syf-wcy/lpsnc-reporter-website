# 记者团官网部署指南

## 🚀 部署方式选择

### 1️⃣ 静态网站部署 (推荐)
适合当前Hugo网站的最佳部署方式：

#### GitHub Pages
```bash
# 1. 推送到 GitHub
git add .
git commit -m "准备部署"
git push origin main

# 2. 启用 GitHub Pages
# 在 GitHub 仓库 Settings → Pages → Source 选择 GitHub Actions
```

#### Netlify
```bash
# 1. 连接 GitHub 仓库
# 2. 构建设置:
Build command: hugo --gc --minify
Publish directory: public
Environment variables: HUGO_VERSION=0.148.2
```

#### Vercel
```bash
# 1. 连接 GitHub 仓库  
# 2. 框架预设选择 Hugo
# 3. 自动部署
```

### 2️⃣ 服务器部署

#### 使用 Docker (推荐)
```dockerfile
# Dockerfile
FROM klakegg/hugo:0.148.2-ext-alpine AS builder
WORKDIR /src
COPY . .
RUN hugo --gc --minify

FROM nginx:alpine
COPY --from=builder /src/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

#### 传统服务器部署
```bash
# 1. 安装 Hugo
wget https://github.com/gohugoio/hugo/releases/download/v0.148.2/hugo_extended_0.148.2_linux-amd64.tar.gz
tar -xzf hugo_extended_0.148.2_linux-amd64.tar.gz
sudo mv hugo /usr/local/bin/

# 2. 安装 Node.js 和依赖
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install

# 3. 构建网站
hugo --gc --minify --environment production

# 4. 配置 Nginx
sudo cp nginx.conf /etc/nginx/sites-available/reporter-website
sudo ln -s /etc/nginx/sites-available/reporter-website /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 🔧 环境配置

### .env 文件配置
```bash
# 复制环境配置模板
cp .env.example .env

# 编辑配置文件
nano .env
```

### 必需配置项
```env
# 基本信息
SITE_URL=https://your-domain.com
SITE_NAME=六盘水师范学院计算机科学学院记者团

# Google Analytics (可选)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# 域名配置
DOMAIN=yourdomain.com
```

## 🌐 域名和 HTTPS

### 1. 域名配置
```bash
# DNS 记录设置
A    @    your-server-ip
CNAME www  yourdomain.com
```

### 2. SSL 证书 (Let's Encrypt)
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 性能优化

### CDN 配置 (可选)
```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const cache = caches.default
  const cacheKey = new Request(request.url, request)
  
  let response = await cache.match(cacheKey)
  
  if (!response) {
    response = await fetch(request)
    
    const headers = {
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
    
    response = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: { ...response.headers, ...headers }
    })
    
    event.waitUntil(cache.put(cacheKey, response.clone()))
  }
  
  return response
}
```

## 🔄 自动化部署

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy Hugo site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.148.2
    steps:
      - name: Install Hugo CLI
        run: |
          wget -O ${{ runner.temp }}/hugo.deb https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb \
          && sudo dpkg -i ${{ runner.temp }}/hugo.deb
          
      - name: Checkout
        uses: actions/checkout@v3
        with:
          submodules: recursive
          
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build with Hugo
        env:
          HUGO_ENVIRONMENT: production
          HUGO_ENV: production
        run: |
          hugo \
            --gc \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/"
            
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v1
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v1
```

## 🛠️ 维护和监控

### 日志监控
```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 性能监控
```bash
# 安装监控工具
sudo apt install htop iotop nethogs

# 实时监控
htop  # CPU和内存
iotop # 磁盘I/O
nethogs # 网络使用
```

### 备份策略
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/website"
SITE_DIR="/var/www/reporter-website"

# 创建备份
tar -czf "$BACKUP_DIR/website_backup_$DATE.tar.gz" -C "$SITE_DIR" .

# 保留最近30天的备份
find "$BACKUP_DIR" -name "website_backup_*.tar.gz" -mtime +30 -delete

echo "备份完成: website_backup_$DATE.tar.gz"
```

## 📝 部署检查清单

### 部署前检查
- [ ] .env 文件配置正确
- [ ] Google Analytics ID 设置
- [ ] 域名 DNS 记录配置
- [ ] SSL 证书申请
- [ ] 服务器防火墙配置

### 部署后检查
- [ ] 网站能正常访问
- [ ] HTTPS 正常工作
- [ ] 所有页面加载正常
- [ ] 管理员后台可访问
- [ ] 联系表单功能正常
- [ ] 移动端显示正常

### 性能检查
- [ ] Google PageSpeed Insights 评分
- [ ] GTmetrix 性能测试
- [ ] Lighthouse 审核通过
- [ ] CDN 加速生效

## 🚨 故障排除

### 常见问题
1. **404 错误**: 检查 baseURL 配置
2. **CSS 不加载**: 检查资源路径
3. **HTTPS 混合内容**: 确保所有资源使用 HTTPS
4. **构建失败**: 检查 Hugo 版本和依赖

### 紧急联系
- 技术支持: tech@yourschool.edu.cn
- 服务器管理: admin@yourschool.edu.cn