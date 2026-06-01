# GitHub Actions 云端推送说明

## 目标
让你的考研计划在电脑关机时也能每天自动推送到手机。

## 你需要做的事
1. 在网页里填写你的学习信息和 `PushPlus Token`
2. 复制云端配置 JSON
3. 把当前整个项目上传到 GitHub 仓库
4. 在 GitHub 仓库里新增 Secret：
   - 名称：`PUSHPLUS_TOKEN`
   - 值：你的 PushPlus token
5. 在 GitHub 仓库里新增 Variable：
   - 名称：`KAOYAN_PROFILE_JSON`
   - 值：网页里导出的整段云端配置 JSON
6. 确保仓库的 GitHub Actions 已开启

## 工作流文件
- `.github/workflows/daily-cloud-push.yml`

## 触发方式
- 每 5 分钟运行一次
- 到达你在配置 JSON 里设定的 `notifyTime` 后发送当天计划

## 说明
- 工作流使用 GitHub 官方 `schedule` 触发器
- 定时触发并不保证精确到秒，所以这里采用“每 5 分钟检查一次”的稳妥方案
- 建议你把提醒时间设置成类似 `07:20`、`08:00` 这种 5 分钟整数时间

## 本地预览
如果你本地装了 Node，也可以先预览消息内容：

```bash
node cloud-send-daily-plan.js --preview
```

如果你希望本地预览时不放配置文件，也可以先设置环境变量后再运行。
