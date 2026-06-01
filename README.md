# 考研每日计划与手机推送

这是一个为软件工程/计算机方向考研准备的个性化计划网页，支持：

- 本地生成每日学习计划
- 浏览器内查看今日任务和阶段路线
- PushPlus 手机推送
- GitHub Actions 云端定时推送

## 目录说明

- `index.html`：网页入口
- `styles.css`：页面样式
- `app.js`：网页逻辑
- `Send-DailyPlan.ps1`：本地发送脚本
- `Install-DailyPushTask.ps1`：本地定时任务安装脚本
- `cloud-send-daily-plan.js`：云端发送脚本
- `.github/workflows/daily-cloud-push.yml`：GitHub Actions 工作流
- `GITHUB_ACTIONS_SETUP.md`：云端推送配置说明

## 快速开始

1. 打开 `index.html`
2. 填写你的基础信息、当前进度和 PushPlus Token
3. 如果要本地推送：
   - 下载 `push-config.json`
   - 运行页面里的安装命令
4. 如果要云端推送：
   - 复制云端配置 JSON
   - 上传整个项目到 GitHub 仓库
   - 按 `GITHUB_ACTIONS_SETUP.md` 配置 Secret、Variable 和 Actions

## 云端推送说明

云端版适合“电脑关机也要推送”的场景。

- 调度方式：GitHub Actions `schedule`
- 检查频率：每 5 分钟一次
- 时区：`Asia/Shanghai`
- 手机推送渠道：当前默认 `PushPlus`
- 推荐配置方式：`Secret + Variable`，不需要把配置文件提交到仓库

## 当前个性化字段

网页会记录这些信息，并用于生成当天计划和手机推送内容：

- 每日可学习时长
- 当前最薄弱科目
- 数学、英语、408 基础水平
- 数学当前进度
- 英语当前进度
- 408 当前进度
- 当前任务偏向：补基础 / 做题巩固 / 错题复盘

## 备注

- GitHub Actions 的定时任务不是秒级精确，因此推荐把提醒时间设置为 5 分钟粒度，例如 `07:20`
- PushPlus Token 建议只放在 GitHub Secret 中，不要直接提交到公开仓库
