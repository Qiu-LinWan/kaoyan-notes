const fs = require("fs");
const path = require("path");

const configPath = process.env.CLOUD_PUSH_CONFIG || path.join(process.cwd(), "cloud-push-config.json");
const pushToken = process.env.PUSHPLUS_TOKEN || "";
const configJson = process.env.KAOYAN_PROFILE_JSON || "";
const previewOnly = process.argv.includes("--preview");
const config = loadConfig();

if (!previewOnly && !pushToken) {
  throw new Error("缺少 PUSHPLUS_TOKEN 环境变量。");
}

const now = new Date();
const currentTime = formatTimeToShanghai(now);
const notifyTime = config.notifyTime || "07:20";

if (!previewOnly) {
  const currentMinutes = timeToMinutes(currentTime);
  const notifyMinutes = timeToMinutes(notifyTime);
  const sendWindowMinutes = 10;

  if (currentMinutes < notifyMinutes || currentMinutes > notifyMinutes + sendWindowMinutes) {
    console.log(
      `当前上海时间 ${currentTime}，不在提醒时间 ${notifyTime} 后 ${sendWindowMinutes} 分钟内，本次跳过。`
    );
    process.exit(0);
  }
}

const phase = getPhase(config.examYear, now);
const weights = getSubjectWeights(config, phase.key);
const content = buildPlanText(config, phase, weights, now);
const title = `考研计划：${formatDateToShanghai(now).slice(5)}`;

if (previewOnly) {
  console.log(title);
  console.log("");
  console.log(content);
  process.exit(0);
}

sendPushPlus(title, content, pushToken)
  .then(() => {
    console.log(`发送完成：${title}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

function loadConfig() {
  if (configJson) {
    return JSON.parse(configJson);
  }

  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  throw new Error("既没有 KAOYAN_PROFILE_JSON 环境变量，也没有本地 cloud-push-config.json。");
}

function getPhase(examYear, date) {
  const local = getShanghaiParts(date);
  const year = local.year;
  const month = local.month;

  if (year <= examYear - 1 && month <= 8) {
    return { key: "foundation", name: "基础重建期" };
  }
  if ((year === examYear - 1 && month >= 9) || (year === examYear && month <= 2)) {
    return { key: "growth", name: "系统推进期" };
  }
  if (year === examYear && month >= 3 && month <= 6) {
    return { key: "strengthen", name: "强化提分期" };
  }
  return { key: "sprint", name: "冲刺整合期" };
}

function getSubjectWeights(profile, phaseKey) {
  const weights = {
    math: 0.42,
    english: 0.24,
    major: 0.34
  };

  weights[profile.weakestSubject] += 0.08;
  Object.keys(weights).forEach((key) => {
    if (key !== profile.weakestSubject) {
      weights[key] -= 0.04;
    }
  });

  if (phaseKey === "foundation") {
    weights.math += 0.03;
    weights.english += 0.01;
    weights.major -= 0.04;
  }

  const sum = Object.values(weights).reduce((acc, value) => acc + value, 0);
  Object.keys(weights).forEach((key) => {
    weights[key] = weights[key] / sum;
  });

  return weights;
}

function buildPlanText(profile, phase, weights, date) {
  const parts = getShanghaiParts(date);
  const isWeekend = parts.weekday === 0 || parts.weekday === 6;
  const totalHours = Number(isWeekend ? profile.weekendHours : profile.weekdayHours);
  const subjects = ["math", "english", "major"];
  const lines = [];

  lines.push(`[${profile.studentName || "同学"}] 今日考研计划`);
  lines.push(`日期：${formatDateToShanghai(date)}`);
  lines.push(`阶段：${phase.name}`);
  lines.push(`建议总时长：${totalHours} 小时`);
  lines.push("");

  subjects.forEach((subjectKey) => {
    const minutes = Math.max(40, Math.round((totalHours * 60 * weights[subjectKey]) / 10) * 10);
    lines.push(`${getSubjectTitle(subjectKey)}：${minutes} 分钟`);
    lines.push(`重点：${getFocusTopic(subjectKey, profile[`${subjectKey}Level`] || "weak")}`);
    lines.push(`进度：${getProgressHint(profile, subjectKey)}`);
    lines.push(`要求：${getTaskLine(subjectKey, phase.key, profile.studyMode || "foundation")}`);
    lines.push("");
  });

  lines.push("复盘：30 分钟");
  lines.push("要求：回看今天不会的题，写出错因，明天优先重做。");
  lines.push("");
  lines.push("提醒：408 先按 数据结构 -> 计组 -> 操作系统 -> 计网 的顺序学。");
  return lines.join("\n");
}

function getSubjectTitle(subjectKey) {
  return {
    math: "数学",
    english: "英语",
    major: "408专业课"
  }[subjectKey] || "学习任务";
}

function getFocusTopic(subjectKey, level) {
  const map = {
    math: [
      "高数基础概念：极限、导数、微分",
      "高数基础计算：导数、积分入门",
      "线性代数入门：矩阵与行列式"
    ],
    english: [
      "考研核心词汇基础记忆",
      "长难句拆分训练",
      "阅读句子主干识别"
    ],
    major: [
      "数据结构入门：线性表",
      "栈、队列与递归",
      "树与二叉树基础"
    ]
  };

  const index = level === "weak" ? 0 : level === "basic" ? 1 : 2;
  return map[subjectKey][index];
}

function getTaskLine(subjectKey, phaseKey, studyMode) {
  const taskMap = {
    math: "看基础课并完成 10 到 15 道基础题，再整理错题和 A4 纸框架",
    english: "背单词、精读长难句，并完成 1 篇短阅读或真题阅读片段",
    major: "按顺序学知识点，做 3 到 5 道基础题，并手写一段核心逻辑"
  };

  const phaseMap = {
    foundation: {
      math: "先求理解，不追求难题",
      english: "先把词汇和句子吃透",
      major: "不要跳章节，学完立刻复盘"
    },
    growth: {
      math: "开始二刷薄弱点",
      english: "开始贴近真题文风",
      major: "整理框架图，避免只刷课"
    },
    strengthen: {
      math: "强化错题回做和稳定性",
      english: "关注选项干扰和写作衔接",
      major: "加入阶段检测和典型题"
    },
    sprint: {
      math: "按考试速度训练",
      english: "保持真题手感",
      major: "围绕真题和错题查漏补缺"
    }
  };

  return `${taskMap[subjectKey]}；${getStudyModeHint(studyMode, subjectKey)}；${phaseMap[phaseKey][subjectKey]}。`;
}

function getProgressHint(profile, subjectKey) {
  const valueMap = {
    math: profile.mathProgress,
    english: profile.englishProgress,
    major: profile.majorProgress
  };

  return valueMap[subjectKey] || "如果这科还没正式开始，就从最基础的一章起步。";
}

function getStudyModeHint(studyMode, subjectKey) {
  const hints = {
    foundation: {
      math: "今天以听懂基础概念和例题为主",
      english: "今天以单词和句子理解为主",
      major: "今天以知识点入门和结构理解为主"
    },
    practice: {
      math: "今天以基础题和小专题训练为主",
      english: "今天以阅读训练和精读为主",
      major: "今天以基础题和算法逻辑巩固为主"
    },
    review: {
      math: "今天以错题回做和公式回顾为主",
      english: "今天以旧词复盘和错题阅读复盘为主",
      major: "今天以错题回炉和知识框架复盘为主"
    }
  };

  return hints[studyMode]?.[subjectKey] || hints.foundation[subjectKey];
}

function getShanghaiParts(date) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short"
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: weekdayToNumber(map.weekday)
  };
}

function weekdayToNumber(weekdayText) {
  const map = {
    "周日": 0,
    "周一": 1,
    "周二": 2,
    "周三": 3,
    "周四": 4,
    "周五": 5,
    "周六": 6
  };
  return map[weekdayText] ?? 0;
}
function timeToMinutes(timeText) {
  const [hourText, minuteText] = timeText.split(":");
  return Number(hourText) * 60 + Number(minuteText);
}
function formatTimeToShanghai(date) {
  const parts = getShanghaiParts(date);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

function formatDateToShanghai(date) {
  const parts = getShanghaiParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

async function sendPushPlus(title, content, token) {
  const response = await fetch("http://www.pushplus.plus/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      token,
      title,
      content,
      template: "txt"
    })
  });

  if (!response.ok) {
    throw new Error(`PushPlus 请求失败：${response.status}`);
  }
}
