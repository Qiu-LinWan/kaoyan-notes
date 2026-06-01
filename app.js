const STORAGE_KEY = "kaoyan-study-profile";
const DAILY_KEY = "kaoyan-daily-plan";

const subjectLibrary = {
  math: {
    title: "数学",
    foundation: [
      "高数基础概念：极限、导数、微分",
      "高数基础计算：导数、积分入门",
      "线性代数入门：矩阵与行列式",
      "概率基础：随机事件与概率公式"
    ],
    tasks: [
      "听或看一节基础课，边学边做例题",
      "完成 10 到 15 道基础题，优先做定义题和计算题",
      "把今天不会的题写进错题区，并标清楚错因"
    ]
  },
  english: {
    title: "英语",
    foundation: [
      "考研核心词汇基础记忆",
      "长难句拆分训练",
      "阅读句子主干识别",
      "短篇阅读精读"
    ],
    tasks: [
      "背 80 到 120 个新词，并复习旧词",
      "精读 1 到 2 个长难句，弄懂主谓宾和从句",
      "做 1 篇短阅读或一篇真题阅读中的一段"
    ]
  },
  major: {
    title: "408专业课",
    foundation: [
      "数据结构入门：线性表",
      "栈、队列与递归",
      "树与二叉树基础",
      "排序与查找基础"
    ],
    tasks: [
      "学习 1 个知识点并画出结构图",
      "完成 3 到 5 道基础题，先求理解再求速度",
      "尝试手写 1 段核心代码或算法流程"
    ]
  }
};

const roadmapPhases = [
  {
    key: "foundation",
    name: "基础重建期",
    range: "现在 - 2026年8月",
    description: "把学习习惯重新建立起来，主攻数学、英语和数据结构，不追难题，先把基础讲透。"
  },
  {
    key: "growth",
    name: "系统推进期",
    range: "2026年9月 - 2027年2月",
    description: "让学校课程和考研复习同步，数学完成一轮，408 从数据结构推进到计组和操作系统。"
  },
  {
    key: "strengthen",
    name: "强化提分期",
    range: "2027年3月 - 2027年6月",
    description: "开始做更多题和总结错题，408 四门全部过一轮，英语阅读进入稳定训练。"
  },
  {
    key: "sprint",
    name: "冲刺整合期",
    range: "2027年7月 - 初试前",
    description: "加入政治，围绕真题、套卷和背诵回炉，把每门课都收紧到考试节奏。"
  }
];

const methodNotes = [
  {
    title: "先开始，再细化择校",
    body: "近期公开规划内容里很常见的一条是：不要等学校完全确定才开始，数学、英语和 408 基础越早起步越有优势。"
  },
  {
    title: "408不要乱跳章节",
    body: "很多经验类内容都会强调按顺序学：数据结构、计组、操作系统、计网。基础弱时，乱跳最容易把知识学散。"
  },
  {
    title: "网课后必须输出",
    body: "只看课不做题，知识留不住。更有效的做法是看完立刻做基础题、整理错题，再用 A4 纸写知识框架。"
  },
  {
    title: "靠记录稳住节奏",
    body: "主流规划里很强调日记录和阶段检测。每天有完成反馈，每月有阶段复盘，比临时爆发更能长期坚持。"
  }
];

const profileForm = document.getElementById("profileForm");
const generatePlanBtn = document.getElementById("generatePlanBtn");
const notifyBtn = document.getElementById("notifyBtn");
const todayDateEl = document.getElementById("todayDate");
const dailyHeadlineEl = document.getElementById("dailyHeadline");
const planListEl = document.getElementById("planList");
const totalHoursEl = document.getElementById("totalHours");
const completedCountEl = document.getElementById("completedCount");
const streakCountEl = document.getElementById("streakCount");
const weeklyAdviceEl = document.getElementById("weeklyAdvice");
const roadmapCardsEl = document.getElementById("roadmapCards");
const methodCardsEl = document.getElementById("methodCards");
const phaseTagEl = document.getElementById("phaseTag");
const downloadConfigBtn = document.getElementById("downloadConfigBtn");
const downloadCloudConfigBtn = document.getElementById("downloadCloudConfigBtn");
const copyInstallCmdBtn = document.getElementById("copyInstallCmdBtn");
const copyTestCmdBtn = document.getElementById("copyTestCmdBtn");
const copySecretNameBtn = document.getElementById("copySecretNameBtn");
const copyVariableNameBtn = document.getElementById("copyVariableNameBtn");
const copyCloudJsonBtn = document.getElementById("copyCloudJsonBtn");
const installCommandEl = document.getElementById("installCommand");
const testCommandEl = document.getElementById("testCommand");
const completionRateEl = document.getElementById("completionRate");
const studyCalendarEl = document.getElementById("studyCalendar");
const notesSummaryEl = document.getElementById("notesSummary");

const fieldIds = [
  "studentName",
  "studentYear",
  "examYear",
  "weekdayHours",
  "weekendHours",
  "studyStartTime",
  "weakestSubject",
  "mathLevel",
  "englishLevel",
  "majorLevel",
  "notifyTime",
  "pushProvider",
  "pushToken",
  "mathProgress",
  "englishProgress",
  "majorProgress",
  "studyMode"
];

const today = new Date();
const todayKey = getDateKey(today);
const HISTORY_KEY = "kaoyan-daily-history";

function init() {
  todayDateEl.textContent = formatDate(today);
  renderRoadmap();
  renderMethodCards();
  loadProfileIntoForm();
  renderWeeklyAdvice(loadProfile());
  renderPushCommands(loadProfile() || defaultProfile());
  renderArchivePanels();
  restoreOrGenerateToday();
  profileForm.addEventListener("submit", handleSaveProfile);
  generatePlanBtn.addEventListener("click", handleGenerateToday);
  notifyBtn.addEventListener("click", enableNotifications);
  downloadConfigBtn.addEventListener("click", downloadPushConfig);
  downloadCloudConfigBtn.addEventListener("click", downloadCloudPushConfig);
  copyInstallCmdBtn.addEventListener("click", copyInstallCommand);
  copyTestCmdBtn.addEventListener("click", copyTestCommand);
  copySecretNameBtn.addEventListener("click", copySecretName);
  copyVariableNameBtn.addEventListener("click", copyVariableName);
  copyCloudJsonBtn.addEventListener("click", copyCloudJson);
  setInterval(checkReminder, 60 * 1000);
}

function handleSaveProfile(event) {
  event.preventDefault();
  const profile = readProfileFromForm();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  renderWeeklyAdvice(profile);
  renderRoadmap();
  renderPushCommands(profile);
  generatePlan(profile);
  showHeadline(`${profile.studentName || "同学"}，你的信息已经保存，今天先稳稳把基础学起来。`);
}

function handleGenerateToday() {
  const profile = readProfileFromForm();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  renderWeeklyAdvice(profile);
  renderRoadmap();
  renderPushCommands(profile);
  generatePlan(profile);
}

function restoreOrGenerateToday() {
  const profile = loadProfile();
  const savedPlan = loadDailyPlan();
  if (savedPlan && savedPlan.dateKey === todayKey) {
    renderPlan(savedPlan, profile);
    return;
  }
  if (profile) {
    generatePlan(profile);
  }
}

function generatePlan(profile) {
  const isWeekend = [0, 6].includes(today.getDay());
  const totalHours = isWeekend ? Number(profile.weekendHours) : Number(profile.weekdayHours);
  const phase = getCurrentPhase(Number(profile.examYear));
  const weights = getSubjectWeights(profile, phase.key);
  const tasks = buildTasks(profile, totalHours, weights, phase.key);
  const plan = {
    dateKey: todayKey,
    phase: phase.key,
    totalHours,
    tasks,
    completedTaskIds: [],
    lastReminderDate: "",
    streak: computeStreak()
  };
  localStorage.setItem(DAILY_KEY, JSON.stringify(plan));
  persistPlanSnapshot(plan);
  renderPlan(plan, profile);
}

function buildTasks(profile, totalHours, weights, phaseKey) {
  const blocks = [];
  const totalMinutes = Math.round(totalHours * 60);
  const subjects = ["math", "english", "major"];
  let currentOffset = 0;

  let blockIndex = 0;
  subjects.forEach((subjectKey) => {
    const minutes = roundToTen(totalMinutes * weights[subjectKey]);
    const item = createTaskBlock(subjectKey, minutes, profile, phaseKey, blockIndex, currentOffset);
    blocks.push(item);
    currentOffset += minutes;
    blockIndex += 1;
  });

  blocks.push({
    id: `review-${todayKey}`,
    subject: "复盘",
    duration: "30 分钟",
    title: "晚间复盘与错题整理",
    detail: "回看今天不会的题，写出错因，明天优先重做。基础差时，复盘比盲目加时长更重要。",
    points: buildReviewPoints(profile),
    start: getBlockTime(profile.studyStartTime, currentOffset),
    completed: false
  });

  return blocks;
}

function createTaskBlock(subjectKey, minutes, profile, phaseKey, blockIndex, offsetMinutes) {
  const subject = subjectLibrary[subjectKey];
  const focusIndex = getLevelScore(profile[`${subjectKey}Level`] || "weak");
  const focusTopic = subject.foundation[Math.min(focusIndex, subject.foundation.length - 1)];
  const taskLine = subject.tasks[blockIndex % subject.tasks.length];
  const phaseCopy = getPhaseTaskCopy(subjectKey, phaseKey);
  const progressHint = getProgressHint(profile, subjectKey);
  const modeHint = getStudyModeHint(profile.studyMode, subjectKey);

  return {
    id: `${subjectKey}-${todayKey}`,
    subject: subject.title,
    duration: `${minutes} 分钟`,
    title: `${subject.title}基础任务`,
    detail: `${focusTopic}。${progressHint}。${taskLine}。${modeHint}。${phaseCopy}`,
    points: buildTaskPoints(subjectKey, profile, focusTopic, taskLine),
    start: getBlockTime(profile.studyStartTime, offsetMinutes),
    completed: false
  };
}

function buildTaskPoints(subjectKey, profile, focusTopic, taskLine) {
  const progressHint = getProgressHint(profile, subjectKey);
  const modeHint = getStudyModeHint(profile.studyMode, subjectKey);

  return [
    `先学习这个任务点：${focusTopic}`,
    progressHint,
    `完成执行要求：${taskLine}`,
    `今天的训练侧重点：${modeHint}`
  ];
}

function buildReviewPoints(profile) {
  return [
    "回看今天所有不会或做错的题",
    "把错因写清楚：概念不懂、计算失误、还是题型不会",
    `优先复盘你最薄弱的科目：${subjectLibrary[profile.weakestSubject].title}`,
    "为明天写下 1 个最优先回炉的知识点"
  ];
}

function getPhaseTaskCopy(subjectKey, phaseKey) {
  const phaseMessages = {
    foundation: {
      math: "今天不追求难题，先把概念和最基本计算吃透，再用 A4 纸写一页框架。",
      english: "今天只要求你看懂、读顺，不要求做题速度，先把词汇和句子吃透。",
      major: "今天先用最慢的速度弄懂知识结构，不要跳章节，学完立刻做错题任务。"
    },
    growth: {
      math: "开始把知识点串起来，学完后做一组对应基础题，并开始二刷薄弱点。",
      english: "开始加入真题阅读的句子分析，逐步适应考研文风，坚持词汇复盘。",
      major: "把学校课程与考研内容对应起来，学完就整理框架图，避免只刷课不输出。"
    },
    strengthen: {
      math: "开始强化错题回做，注意题型总结和计算稳定性。",
      english: "阅读要同时关注词汇、句法和选项干扰方式，逐步补作文和小三门。",
      major: "一边复习知识点，一边补真题和典型题，并做阶段检测。"
    },
    sprint: {
      math: "严格按考试要求训练速度和稳定性。",
      english: "重视真题手感，保持每天都接触阅读。",
      major: "以真题和错题为主，做到查漏补缺。"
    }
  };

  return phaseMessages[phaseKey][subjectKey];
}

function renderPlan(plan, profile) {
  phaseTagEl.textContent = getPhaseLabel(plan.phase);
  totalHoursEl.textContent = `${plan.totalHours} 小时`;
  streakCountEl.textContent = `${plan.streak} 天`;
  showHeadline(createHeadline(profile, plan.phase, plan.totalHours));
  planListEl.innerHTML = "";
  planListEl.classList.remove("empty-state");

  plan.tasks.forEach((task) => {
    const template = document.getElementById("taskItemTemplate");
    const node = template.content.firstElementChild.cloneNode(true);
    const checkbox = node.querySelector(".task-checkbox");
    const pointsWrap = node.querySelector(".task-points");
    node.querySelector(".task-title").textContent = task.title;
    node.querySelector(".task-meta").textContent = `${task.subject} | 建议开始：${task.start} | 预计 ${task.duration}`;
    node.querySelector(".task-detail").textContent = task.detail;
    const pointStates = getTaskPointStates(plan, task);
    const allDone = pointStates.every(Boolean);
    checkbox.checked = allDone;
    node.classList.toggle("completed", allDone);
    checkbox.addEventListener("change", () => toggleWholeTask(task.id, checkbox.checked));

    task.points.forEach((point, pointIndex) => {
      const pointTemplate = document.getElementById("taskPointTemplate");
      const pointNode = pointTemplate.content.firstElementChild.cloneNode(true);
      const pointCheckbox = pointNode.querySelector(".task-point-checkbox");
      const noteInput = pointNode.querySelector(".task-point-note-input");
      const noteButton = pointNode.querySelector(".task-point-note-btn");
      pointNode.querySelector(".task-point-text").textContent = point;
      pointCheckbox.checked = Boolean(pointStates[pointIndex]);
      pointCheckbox.addEventListener("change", () => toggleTaskPoint(task.id, pointIndex, pointCheckbox.checked));
      noteInput.value = getTaskPointNote(plan, task.id, pointIndex);
      noteButton.addEventListener("click", () => saveTaskPointNote(task.id, pointIndex, noteInput.value));
      noteInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          saveTaskPointNote(task.id, pointIndex, noteInput.value);
        }
      });
      pointsWrap.appendChild(pointNode);
    });

    planListEl.appendChild(node);
  });

  updateCompletedCount(plan);
  renderArchivePanels();
}

function toggleWholeTask(taskId, checked) {
  const plan = loadDailyPlan();
  if (!plan || plan.dateKey !== todayKey) {
    return;
  }

  const task = plan.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  const pointCount = task.points?.length || 0;
  const states = new Array(pointCount).fill(Boolean(checked));
  if (!plan.pointCompletion) {
    plan.pointCompletion = {};
  }
  plan.pointCompletion[taskId] = states;
  syncTaskCompletion(plan, taskId);
  localStorage.setItem(DAILY_KEY, JSON.stringify(plan));
  persistPlanSnapshot(plan);
  renderPlan(plan, loadProfile());
}

function toggleTaskPoint(taskId, pointIndex, checked) {
  const plan = loadDailyPlan();
  if (!plan || plan.dateKey !== todayKey) {
    return;
  }

  const task = plan.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  if (!plan.pointCompletion) {
    plan.pointCompletion = {};
  }

  const current = getTaskPointStates(plan, task).slice();
  current[pointIndex] = checked;
  plan.pointCompletion[taskId] = current;
  syncTaskCompletion(plan, taskId);
  localStorage.setItem(DAILY_KEY, JSON.stringify(plan));
  persistPlanSnapshot(plan);
  renderPlan(plan, loadProfile());
}

function getTaskPointStates(plan, task) {
  if (!plan.pointCompletion) {
    plan.pointCompletion = {};
  }

  const existing = plan.pointCompletion[task.id];
  if (existing && existing.length === task.points.length) {
    return existing;
  }

  const defaults = new Array(task.points.length).fill(false);
  plan.pointCompletion[task.id] = defaults;
  return defaults;
}

function getTaskPointNote(plan, taskId, pointIndex) {
  if (!plan.pointNotes) {
    plan.pointNotes = {};
  }

  const notes = plan.pointNotes[taskId];
  if (!notes) {
    return "";
  }

  return notes[pointIndex] || "";
}

function saveTaskPointNote(taskId, pointIndex, noteValue) {
  const plan = loadDailyPlan();
  if (!plan || plan.dateKey !== todayKey) {
    return;
  }

  if (!plan.pointNotes) {
    plan.pointNotes = {};
  }

  const task = plan.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  const currentNotes = plan.pointNotes[taskId]
    ? plan.pointNotes[taskId].slice()
    : new Array(task.points.length).fill("");

  currentNotes[pointIndex] = noteValue.trim();
  plan.pointNotes[taskId] = currentNotes;
  localStorage.setItem(DAILY_KEY, JSON.stringify(plan));
  persistPlanSnapshot(plan);
  renderArchivePanels();
}

function syncTaskCompletion(plan, taskId) {
  const task = plan.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  const states = getTaskPointStates(plan, task);
  const isCompleted = states.length > 0 && states.every(Boolean);

  if (isCompleted) {
    if (!plan.completedTaskIds.includes(taskId)) {
      plan.completedTaskIds.push(taskId);
    }
  } else {
    plan.completedTaskIds = plan.completedTaskIds.filter((id) => id !== taskId);
  }
}

function updateCompletedCount(plan) {
  completedCountEl.textContent = `${plan.completedTaskIds.length} / ${plan.tasks.length}`;
  const rate = plan.tasks.length ? Math.round((plan.completedTaskIds.length / plan.tasks.length) * 100) : 0;
  completionRateEl.textContent = `${rate}%`;
}

function persistPlanSnapshot(plan) {
  const history = loadHistory();
  history[todayKey] = {
    dateKey: plan.dateKey,
    completedTaskIds: plan.completedTaskIds || [],
    taskCount: plan.tasks?.length || 0,
    pointNotes: plan.pointNotes || {},
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function renderArchivePanels() {
  renderStudyCalendar();
  renderNotesSummary();
  const plan = loadDailyPlan();
  if (!plan) {
    completionRateEl.textContent = "0%";
    return;
  }
  const rate = plan.tasks?.length ? Math.round((plan.completedTaskIds.length / plan.tasks.length) * 100) : 0;
  completionRateEl.textContent = `${rate}%`;
}

function renderStudyCalendar() {
  studyCalendarEl.innerHTML = "";
  const history = loadHistory();
  const dates = getRecentDateKeys(7);

  dates.forEach((dateKey) => {
    const snapshot = history[dateKey];
    const doneRate = snapshot && snapshot.taskCount
      ? Math.round((snapshot.completedTaskIds.length / snapshot.taskCount) * 100)
      : 0;
    const date = new Date(`${dateKey}T00:00:00`);
    const item = document.createElement("div");
    item.className = `calendar-day${doneRate > 0 ? " done" : ""}${dateKey === todayKey ? " today" : ""}`;
    item.innerHTML = `<p class="calendar-day-num">${date.getDate()}</p><p class="calendar-day-rate">${doneRate}%</p>`;
    studyCalendarEl.appendChild(item);
  });
}

function renderNotesSummary() {
  const history = loadHistory();
  const dates = getRecentDateKeys(7).reverse();
  const collected = [];

  dates.forEach((dateKey) => {
    const snapshot = history[dateKey];
    if (!snapshot?.pointNotes) {
      return;
    }

    Object.entries(snapshot.pointNotes).forEach(([taskId, notes]) => {
      notes.forEach((note) => {
        if (note) {
          collected.push({ dateKey, taskId, note });
        }
      });
    });
  });

  notesSummaryEl.innerHTML = "";
  if (collected.length === 0) {
    notesSummaryEl.textContent = "今天还没有备注记录。";
    return;
  }

  collected.slice(-6).reverse().forEach((item) => {
    const node = document.createElement("div");
    node.className = "note-summary-item";
    node.innerHTML = `<p><strong>${item.dateKey}</strong></p><p>${item.note}</p>`;
    notesSummaryEl.appendChild(node);
  });
}

function getRecentDateKeys(days) {
  const result = [];
  const cursor = new Date(today);

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() - i);
    result.push(getDateKey(date));
  }

  return result;
}

function renderWeeklyAdvice(profile) {
  weeklyAdviceEl.innerHTML = "";
  const subjectWeights = getSubjectWeights(profile || defaultProfile(), getCurrentPhase(Number((profile || defaultProfile()).examYear)).key);
  const cards = [
    {
      title: "周一到周五",
      body: `每天先学数学，再学英语，最后学 408。工作日建议总时长 ${profile?.weekdayHours || 5} 小时，保持稳定比偶尔爆发更重要。`
    },
    {
      title: "周末安排",
      body: `周末建议总时长 ${profile?.weekendHours || 8} 小时，适合做本周错题回炉和阶段复盘。`
    },
    {
      title: "科目占比",
      body: `当前建议占比：数学 ${Math.round(subjectWeights.math * 100)}%，英语 ${Math.round(subjectWeights.english * 100)}%，408 ${Math.round(subjectWeights.major * 100)}%。`
    },
    {
      title: "当前重点",
      body: `你当前最薄弱的是${subjectLibrary[(profile || defaultProfile()).weakestSubject].title}，所以系统会优先为这门课分配更多时间。`
    }
  ];

  cards.forEach((card) => {
    const el = document.createElement("article");
    el.className = "weekly-card";
    el.innerHTML = `<h3>${card.title}</h3><p>${card.body}</p>`;
    weeklyAdviceEl.appendChild(el);
  });
}

function renderRoadmap() {
  const currentPhase = getCurrentPhase(Number(loadProfile()?.examYear || 2027)).key;
  roadmapCardsEl.innerHTML = "";
  roadmapPhases.forEach((phase) => {
    const el = document.createElement("article");
    el.className = `roadmap-card${phase.key === currentPhase ? " active" : ""}`;
    el.innerHTML = `<h3>${phase.name}</h3><p>${phase.range}</p><p>${phase.description}</p>`;
    roadmapCardsEl.appendChild(el);
  });
}

function renderMethodCards() {
  methodCardsEl.innerHTML = "";
  methodNotes.forEach((item) => {
    const el = document.createElement("article");
    el.className = "weekly-card";
    el.innerHTML = `<h3>${item.title}</h3><p>${item.body}</p>`;
    methodCardsEl.appendChild(el);
  });
}

function getSubjectWeights(profile, phaseKey) {
  const base = {
    math: 0.42,
    english: 0.24,
    major: 0.34
  };

  base[profile.weakestSubject] += 0.08;
  const others = Object.keys(base).filter((key) => key !== profile.weakestSubject);
  others.forEach((key) => {
    base[key] -= 0.04;
  });

  if (phaseKey === "foundation") {
    base.math += 0.03;
    base.english += 0.01;
    base.major -= 0.04;
  }

  return normalizeWeights(base);
}

function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const normalized = {};
  Object.entries(weights).forEach(([key, value]) => {
    normalized[key] = value / total;
  });
  return normalized;
}

function getCurrentPhase(examYear) {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (year <= examYear - 1 && month <= 8) {
    return roadmapPhases[0];
  }
  if ((year === examYear - 1 && month >= 9) || (year === examYear && month <= 2)) {
    return roadmapPhases[1];
  }
  if (year === examYear && month >= 3 && month <= 6) {
    return roadmapPhases[2];
  }
  return roadmapPhases[3];
}

function getPhaseLabel(phaseKey) {
  return roadmapPhases.find((item) => item.key === phaseKey)?.name || "今日计划";
}

function createHeadline(profile, phaseKey, totalHours) {
  const name = profile.studentName || "同学";
  const subject = subjectLibrary[profile.weakestSubject].title;
  const modeLabel = getStudyModeLabel(profile.studyMode);
  const phaseMap = {
    foundation: `今天先稳住基础，重点补 ${subject}。`,
    growth: `今天继续系统推进，课程和考研一起抓。`,
    strengthen: `今天开始偏强化，注意做题和总结。`,
    sprint: `今天按冲刺节奏来，真题和回炉优先。`
  };
  return `${name}，你今天建议学习 ${totalHours} 小时，当前重点是${modeLabel}。${phaseMap[phaseKey]}`;
}

function loadProfileIntoForm() {
  const profile = loadProfile() || defaultProfile();
  fieldIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = profile[id];
    }
  });
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadDailyPlan() {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readProfileFromForm() {
  const values = {};
  fieldIds.forEach((id) => {
    values[id] = document.getElementById(id).value;
  });
  return values;
}

function defaultProfile() {
  return {
    studentName: "",
    studentYear: "sophomore",
    examYear: "2027",
    weekdayHours: "5",
    weekendHours: "8",
    studyStartTime: "07:30",
    weakestSubject: "math",
    mathLevel: "weak",
    englishLevel: "weak",
    majorLevel: "weak",
    notifyTime: "07:20",
    pushProvider: "pushplus",
    pushToken: "",
    mathProgress: "",
    englishProgress: "",
    majorProgress: "",
    studyMode: "foundation"
  };
}

function computeStreak() {
  const historyKey = "kaoyan-plan-history";
  const raw = localStorage.getItem(historyKey);
  let history = raw ? JSON.parse(raw) : [];

  history = history.filter((item) => item !== todayKey);
  history.push(todayKey);
  history.sort();
  localStorage.setItem(historyKey, JSON.stringify(history));

  let streak = 0;
  let cursor = new Date(today);

  while (history.includes(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    alert("当前浏览器不支持通知提醒。");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    notifyBtn.textContent = "提醒已开启";
    showReminderNotification("提醒已开启", "以后你每天打开这个页面时，我都会按设定时间提醒你开始学习。");
  } else {
    alert("你没有允许通知，暂时无法提醒。");
  }
}

function checkReminder() {
  const profile = loadProfile();
  const plan = loadDailyPlan();
  if (!profile || !plan || plan.dateKey !== todayKey || Notification.permission !== "granted") {
    return;
  }

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  if (currentTime === profile.notifyTime && plan.lastReminderDate !== todayKey) {
    showReminderNotification("今天的考研计划来了", dailyHeadlineEl.textContent || "打开页面查看你的今日学习任务。");
    plan.lastReminderDate = todayKey;
    localStorage.setItem(DAILY_KEY, JSON.stringify(plan));
  }
}

function showReminderNotification(title, body) {
  new Notification(title, {
    body,
    icon: ""
  });
}

function renderPushCommands(profile) {
  installCommandEl.textContent = buildInstallCommand();
  testCommandEl.textContent = buildTestCommand();

  if (profile?.pushToken?.trim()) {
    downloadConfigBtn.textContent = "下载 push-config.json";
  } else {
    downloadConfigBtn.textContent = "先填 Token 再下载配置";
  }
}

function buildInstallCommand() {
  return 'powershell -ExecutionPolicy Bypass -File ".\\\\Install-DailyPushTask.ps1" -ConfigPath ".\\\\push-config.json"';
}

function buildTestCommand() {
  return 'powershell -ExecutionPolicy Bypass -File ".\\\\Send-DailyPlan.ps1" -ConfigPath ".\\\\push-config.json" -PreviewOnly';
}

function downloadPushConfig() {
  const profile = readProfileFromForm();
  if (!profile.pushToken.trim()) {
    alert("请先填写 PushPlus token，再下载配置。");
    return;
  }

  const config = buildPushConfig(profile);
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "push-config.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadCloudPushConfig() {
  const profile = readProfileFromForm();
  const config = buildCloudPushConfig(profile);
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cloud-push-config.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function buildPushConfig(profile) {
  return {
    studentName: profile.studentName || "同学",
    studentYear: profile.studentYear,
    examYear: Number(profile.examYear),
    weekdayHours: Number(profile.weekdayHours),
    weekendHours: Number(profile.weekendHours),
    studyStartTime: profile.studyStartTime,
    weakestSubject: profile.weakestSubject,
    mathLevel: profile.mathLevel,
    englishLevel: profile.englishLevel,
    majorLevel: profile.majorLevel,
    mathProgress: profile.mathProgress,
    englishProgress: profile.englishProgress,
    majorProgress: profile.majorProgress,
    studyMode: profile.studyMode,
    notifyTime: profile.notifyTime,
    push: {
      provider: profile.pushProvider,
      token: profile.pushToken,
      channel: "wechat"
    }
  };
}

function buildCloudPushConfig(profile) {
  return {
    studentName: profile.studentName || "同学",
    studentYear: profile.studentYear,
    examYear: Number(profile.examYear),
    weekdayHours: Number(profile.weekdayHours),
    weekendHours: Number(profile.weekendHours),
    studyStartTime: profile.studyStartTime,
    weakestSubject: profile.weakestSubject,
    mathLevel: profile.mathLevel,
    englishLevel: profile.englishLevel,
    majorLevel: profile.majorLevel,
    mathProgress: profile.mathProgress,
    englishProgress: profile.englishProgress,
    majorProgress: profile.majorProgress,
    studyMode: profile.studyMode,
    notifyTime: profile.notifyTime,
    timezone: "Asia/Shanghai",
    push: {
      provider: profile.pushProvider
    }
  };
}

async function copyInstallCommand() {
  await copyText(buildInstallCommand(), "安装命令已复制。");
}

async function copyTestCommand() {
  await copyText(buildTestCommand(), "测试命令已复制。");
}

async function copySecretName() {
  await copyText("PUSHPLUS_TOKEN", "GitHub Secret 名称已复制。");
}

async function copyVariableName() {
  await copyText("KAOYAN_PROFILE_JSON", "GitHub Variable 名称已复制。");
}

async function copyCloudJson() {
  const profile = readProfileFromForm();
  const config = buildCloudPushConfig(profile);
  await copyText(JSON.stringify(config), "云端 JSON 已复制。");
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    alert(successMessage);
  } catch {
    alert("复制失败，请手动复制页面里的命令。");
  }
}

function getProgressHint(profile, subjectKey) {
  const progressMap = {
    math: profile.mathProgress,
    english: profile.englishProgress,
    major: profile.majorProgress
  };
  const value = progressMap[subjectKey];
  return value ? `建议围绕你现在的进度继续推进：${value}` : "如果这一科还没开始，就从最基础的一章起步";
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

function getStudyModeLabel(studyMode) {
  return {
    foundation: "补基础",
    practice: "做题巩固",
    review: "错题复盘"
  }[studyMode] || "补基础";
}

function showHeadline(text) {
  dailyHeadlineEl.textContent = text;
}

function getLevelScore(level) {
  if (level === "weak") {
    return 0;
  }
  if (level === "basic") {
    return 1;
  }
  return 2;
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}

function getBlockTime(startTime, minutesToAdd) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes + minutesToAdd, 0, 0);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function roundToTen(minutes) {
  return Math.max(40, Math.round(minutes / 10) * 10);
}

init();
