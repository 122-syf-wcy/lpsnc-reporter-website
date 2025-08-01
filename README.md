# 六盘水师范学院计算机科学学院记者团官网

这是六盘水师范学院计算机科学学院记者团的官方网站项目，基于 Hugo 静态网站生成器开发。

## 技术栈

- **静态网站生成器**：Hugo (v0.125+)
- **前端框架**：Tailwind CSS
- **部署平台**：GitHub Pages
- **版本控制**：Git

## 主要功能

- 响应式设计（适配移动端/PC）
- 新闻中心（校园要闻、教学科研等分类）
- 记者团风采展示
- 在线投稿系统
- 全站搜索功能

## 本地开发

1. 克隆仓库
```bash
git clone https://github.com/122-syf-wcy/lpsnc-reporter-website.git
cd lpsnc-reporter-website
```

2. 安装依赖
```bash
cd web
npm install
```

3. 启动开发服务器
```bash
hugo server --buildDrafts
```

4. 在浏览器中访问 `http://localhost:1313/` 查看网站

## 目录结构

```
web/                    # 前端代码
├── content/            # Markdown内容
│   ├── news/           # 新闻中心
│   ├── team/           # 记者团风采
│   └── join/           # 加入我们
├── themes/lpsnc-reporter/  # 自定义主题
│   ├── layouts/        # 模板
│   ├── assets/         # 静态资源
│   └── static/         # 图片/字体
└── hugo.toml           # Hugo配置文件

server/                 # 后端代码（如果需要）
```

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

[MIT](LICENSE)