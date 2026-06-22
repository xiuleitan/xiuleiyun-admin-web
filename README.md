# xiuleiyun-admin-web

[English](README.en.md)

![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883)
![Vite 5](https://img.shields.io/badge/Vite-5.x-646cff)
![pnpm](https://img.shields.io/badge/pnpm-managed-green)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.x-409eff)

`xiuleiyun-admin-web` 是一个基于 Vue 3、Vite、Pinia 和 Element Plus 的管理后台前端项目，用于应用资源管理、应用上传、封面上传、节点状态查看、同步操作和登录鉴权等后台工作流。

## 功能

- 登录鉴权与本地 token 持久化。
- 应用列表展示、应用新增、修改、删除和手动同步。
- 应用安装包分片上传、封面上传和表单信息提交。
- 节点与 streamer 状态查看、断开 streamer 连接。
- 基于 Element Plus 的管理界面与加载/消息反馈。
- 通过环境变量配置后端 API 地址，避免把部署地址硬编码在源码中。

## 环境要求

- Node.js 18 或更高版本。
- pnpm 9 或兼容版本。

## 安装与配置

```sh
pnpm install
cp .env.example .env.local
```

编辑 `.env.local`，把 `VITE_API_BASE_URL` 改成实际后端服务地址。若前端和后端部署在同一个域名下，可以留空该值，让请求走当前站点源。

## 配置项

| 变量 | 必填 | 说明 | 示例 |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | 否 | 后端 API 的 origin。留空时使用当前站点 origin。 | `https://api.example.com` |

## 使用方法

启动开发服务器：

```sh
pnpm dev
```

构建生产版本：

```sh
pnpm build
```

本地预览构建结果：

```sh
pnpm preview
```

## 开发

代码检查：

```sh
pnpm lint
```

自动修复可修复的 ESLint 问题：

```sh
pnpm lint:fix
```

格式化源码：

```sh
pnpm format
```

## 隐私与安全

- `.env`、`.env.local` 等本地环境文件已被 `.gitignore` 忽略，请不要提交真实后端地址、账号、token 或其它敏感信息。
- `.env.example` 只保留占位配置，便于协作时复制生成本地配置。
- `dist/`、缓存、日志和临时目录会被忽略，避免把构建产物和本地运行状态提交到仓库。
- 该项目会在浏览器本地持久化登录 token，请只在可信环境中使用管理后台。

## 许可证

仓库当前未声明许可证。如需开源发布，请在发布前补充合适的 `LICENSE` 文件。
