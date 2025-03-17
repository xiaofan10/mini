import { peek, pop, push } from "./index";
// js 单线程任务调度器，根据最高优先级与最早执行时间来调度任务

// 任务的优先级

export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;
export const NoPriority = 0; // 没有优先级
export const ImmediatePriority = 1; // 立即执行
export const UserBlockingPriority = 2; // 用户阻塞
export const NormalPriority = 3; // 正常
export const LowPriority = 4; // 低
export const IdlePriority = 5; // 空闲

// 任务队列
type Task = {
  id: number;
  priorityLevel: PriorityLevel;
  startTime: number;
  expirationTime: number;
  sortIndex: number;
  callback: Callback | null;
};
// callback任务初始， task 是调度的任务，
// work为一个时间切片的工作单元
let startTime = -1; // 时间切片的起始时间
let frameInterval = 5; // 时间切片
let isPerformingWork = false; // 锁定当前是否正在执行任务

let isHostCallbackScheduled = false; // 是否已经调度了主线程
let isMessageLoopRunning = false; // 是否正在运行消息循环

const taskQueue: Task[] = [];
let taskIdCounter: number = 0;

let currentTask: Task | null = null;
let currentPriorityLevel: PriorityLevel = NormalPriority;

type Callback = (arg: boolean) => Callback | null | undefined;

function getCurrentTime() {
  return performance.now();
}

// 是否应该将控制器移交给主线程
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  if (timeElapsed < frameInterval) {
    return false;
  }
  return true;
}

// 调度任务开始执行, work为时间切片循环。
function workLoop(initialTime: number): boolean {
  let currentTime = initialTime; // 初始时间
  currentTask = peek(taskQueue);
  while (currentTask !== null) {
    // 如果当前任务的时间早于当前时间，或者已经到了时间切片，则跳出任务
    if (currentTask.expirationTime > currentTime || shouldYieldToHost()) {
      break;
    }
    const callback = currentTask.callback;
    if (typeof callback === "function") {
      // 有效任务
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didUserCallbackTimeout);
      if (typeof continuationCallback === "function") {
        currentTask.callback = continuationCallback;
        return true; // 如果任务有返回值，则继续执行
      } else {
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
    } else {
      // 无效任务
      pop(taskQueue);
    }

    currentTask = peek(taskQueue);
  }
  if (currentTask !== null) {
    return true;
  } else {
    return false;
  }
}

function flushWork(initialTime: number) {
  isHostCallbackScheduled = false;
  isPerformingWork = true;
  const previousPriorityLevel = currentPriorityLevel;
  try {
    // 如果当前任务的时间早于当前时间，或者已经到了时间切片，则停止任务调度
    return workLoop(initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}

function performWorkUntilDeadline() {
  if (isMessageLoopRunning) {
    const currentTime = getCurrentTime();
    startTime = currentTime; // work 的起始时间
    let hasMoreWork = true;
    try {
      hasMoreWork = flushWork(currentTime);
    } finally {
      if (hasMoreWork) {
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
      }
    }
  }
}

const channel = new MessageChannel();
channel.port2.onmessage = performWorkUntilDeadline;
function schedulePerformWorkUntilDeadline() {
  channel.port1.postMessage(null);
}

// 主线程调度函数
function requestHostCallback() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

// 任务调度器的入口函数
function schedulerCallback(priorityLevel: PriorityLevel, callback: Callback) {
  const startTime = getCurrentTime();
  let timeout: number;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = -1;
      break;
    case UserBlockingPriority:
      timeout = 250;
      break;
    case LowPriority:
      timeout = 10000;
      break;
    case IdlePriority:
      timeout = 1073741823;
      break;
    default:
      timeout = 5000;
      break;
  }
  const expirationTime = startTime + timeout;
  const newTask: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: expirationTime,
  };
  push(taskQueue, newTask);
  // 主线程空闲，且时间切片没有在执行
  if (!isHostCallbackScheduled && !isPerformingWork) {
    isHostCallbackScheduled = true;
    requestHostCallback();
  }
}

// 取消某个任务,将其callback置为null，在堆中不好删
// 时间切片

function cancelCallback() {
  currentTask!.callback = null;
}
// 获得当前任务的优先级
function getCurrentPriorityLevel() {
  return currentPriorityLevel;
}

export {
  workLoop,
  schedulerCallback,
  cancelCallback,
  getCurrentPriorityLevel,
  shouldYieldToHost,
};
