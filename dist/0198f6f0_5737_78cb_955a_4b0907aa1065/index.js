import { EventEmitter } from "node:events";
import { Writable } from "node:stream";
const hrtime$1 = /* @__PURE__ */ Object.assign(function hrtime(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, { bigint: function bigint() {
  return BigInt(Date.now() * 1e6);
} });
class ReadStream {
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
}
class WriteStream {
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
}
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = () => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  };
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
const NODE_VERSION = "22.14.0";
class Process extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
}
const globalProcess = globalThis["process"];
const getBuiltinModule = globalProcess.getBuiltinModule;
const workerdProcess = getBuiltinModule("node:process");
const isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
const unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime$1,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
const { exit, features, platform } = workerdProcess;
const {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime2,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
const {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert,
  disconnect,
  mainModule
} = unenvProcess;
const {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
const _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime2,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
globalThis.process = _process;
const noop = Object.assign(() => {
}, { __unenv__: true });
const _console = globalThis.console;
const _ignoreErrors = true;
const _stderr = new Writable();
const _stdout = new Writable();
const Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
const _times = /* @__PURE__ */ new Map();
const _stdoutErrorHandler = noop;
const _stderrErrorHandler = noop;
const workerdConsole = globalThis["console"];
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
globalThis.console = workerdConsole;
const _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
const _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
const nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
class PerformanceEntry {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
}
const PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
class PerformanceMeasure extends PerformanceEntry {
  entryType = "measure";
}
class PerformanceResourceTiming extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
}
class PerformanceObserverEntryList {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
}
class Performance {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
}
class PerformanceObserver {
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
}
const performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index2 = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index2) {
        throw new Error("next() called multiple times");
      }
      index2 = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    form[key] = value;
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index2) => {
    if (index2 === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index2) => {
    const mark = `@${index2}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", 8);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw[key]();
  };
  json() {
    return this.#cachedBody("json");
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};
var HtmlEscapedCallbackPhase = {
  Stringify: 1
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  {
    return resStr;
  }
};
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = (headers, map = {}) => {
  for (const key of Object.keys(map)) {
    headers.set(key, map[key]);
  }
  return headers;
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status = 200;
  #executionCtx;
  #headers;
  #preparedHeaders;
  #res;
  #isFresh = true;
  #layout;
  #renderer;
  #notFoundHandler;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    this.#isFresh = false;
    return this.#res ||= new Response("404 Not Found", { status: 404 });
  }
  set res(_res) {
    this.#isFresh = false;
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    if (value === void 0) {
      if (this.#headers) {
        this.#headers.delete(name);
      } else if (this.#preparedHeaders) {
        delete this.#preparedHeaders[name.toLocaleLowerCase()];
      }
      if (this.finalized) {
        this.res.headers.delete(name);
      }
      return;
    }
    if (options?.append) {
      if (!this.#headers) {
        this.#isFresh = false;
        this.#headers = new Headers(this.#preparedHeaders);
        this.#preparedHeaders = {};
      }
      this.#headers.append(name, value);
    } else {
      if (this.#headers) {
        this.#headers.set(name, value);
      } else {
        this.#preparedHeaders ??= {};
        this.#preparedHeaders[name.toLowerCase()] = value;
      }
    }
    if (this.finalized) {
      if (options?.append) {
        this.res.headers.append(name, value);
      } else {
        this.res.headers.set(name, value);
      }
    }
  };
  status = (status) => {
    this.#isFresh = false;
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    if (this.#isFresh && !headers && !arg && this.#status === 200) {
      return new Response(data, {
        headers: this.#preparedHeaders
      });
    }
    if (arg && typeof arg !== "number") {
      const header = new Headers(arg.headers);
      if (this.#headers) {
        this.#headers.forEach((v, k) => {
          if (k === "set-cookie") {
            header.append(k, v);
          } else {
            header.set(k, v);
          }
        });
      }
      const headers2 = setHeaders(header, this.#preparedHeaders);
      return new Response(data, {
        headers: headers2,
        status: arg.status ?? this.#status
      });
    }
    const status = typeof arg === "number" ? arg : this.#status;
    this.#preparedHeaders ??= {};
    this.#headers ??= new Headers();
    setHeaders(this.#headers, this.#preparedHeaders);
    if (this.#res) {
      this.#res.headers.forEach((v, k) => {
        if (k === "set-cookie") {
          this.#headers?.append(k, v);
        } else {
          this.#headers?.set(k, v);
        }
      });
      setHeaders(this.#headers, this.#preparedHeaders);
    }
    headers ??= {};
    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === "string") {
        this.#headers.set(k, v);
      } else {
        this.#headers.delete(k);
        for (const v2 of v) {
          this.#headers.append(k, v2);
        }
      }
    }
    return new Response(data, {
      status,
      headers: this.#headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => {
    return typeof arg === "number" ? this.#newResponse(data, arg, headers) : this.#newResponse(data, arg);
  };
  text = (text, arg, headers) => {
    if (!this.#preparedHeaders) {
      if (this.#isFresh && !headers && !arg) {
        return new Response(text);
      }
      this.#preparedHeaders = {};
    }
    this.#preparedHeaders["content-type"] = TEXT_PLAIN;
    if (typeof arg === "number") {
      return this.#newResponse(text, arg, headers);
    }
    return this.#newResponse(text, arg);
  };
  json = (object, arg, headers) => {
    const body = JSON.stringify(object);
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "application/json";
    return typeof arg === "number" ? this.#newResponse(body, arg, headers) : this.#newResponse(body, arg);
  };
  html = (html, arg, headers) => {
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "text/html; charset=UTF-8";
    if (typeof html === "object") {
      return resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then((html2) => {
        return typeof arg === "number" ? this.#newResponse(html2, arg, headers) : this.#newResponse(html2, arg);
      });
    }
    return typeof arg === "number" ? this.#newResponse(html, arg, headers) : this.#newResponse(html, arg);
  };
  redirect = (location, status) => {
    this.#headers ??= new Headers();
    this.#headers.set("Location", String(location));
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    return err.getResponse();
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono$1 = class Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono$1({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node$1 = class Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index2, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index2;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node$1();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node$1();
      }
    }
    node.insert(restTokens, index2, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node$1();
  insert(path, index2, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index2, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index2 = match.indexOf("", 1);
      return [matcher[1][index2], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (Object.keys(curNode.#children).includes(key)) {
        curNode = curNode.#children[key];
        const pattern2 = getPattern(p, nextP);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    const m = /* @__PURE__ */ Object.create(null);
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
      score: this.#order
    };
    m[method] = handlerSet;
    curNode.#methods.push(m);
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};
var Hono2 = class extends Hono$1 {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.origin !== "*") {
      const existingVary = c.req.header("Vary");
      if (existingVary) {
        set("Vary", existingVary);
      } else {
        set("Vary", "Origin");
      }
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      if (opts.allowMethods?.length) {
        set("Access-Control-Allow-Methods", opts.allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
  };
};
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = (cookie, name) => {
  if (cookie.indexOf(name) === -1) {
    return {};
  }
  const pairs = cookie.trim().split(";");
  const parsedCookie = {};
  for (let pairStr of pairs) {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      continue;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      continue;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
      {
        break;
      }
    }
  }
  return parsedCookie;
};
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (name.startsWith("__Secure-") && !opt.secure) {
    throw new Error("__Secure- Cookie must have Secure attributes");
  }
  if (name.startsWith("__Host-")) {
    if (!opt.secure) {
      throw new Error("__Host- Cookie must have Secure attributes");
    }
    if (opt.path !== "/") {
      throw new Error('__Host- Cookie must have Path attributes with "/"');
    }
    if (opt.domain) {
      throw new Error("__Host- Cookie must not have Domain attributes");
    }
  }
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    if (opt.maxAge > 3456e4) {
      throw new Error(
        "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
      );
    }
    cookie += `; Max-Age=${opt.maxAge | 0}`;
  }
  if (opt.domain && opt.prefix !== "host") {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    if (opt.expires.getTime() - Date.now() > 3456e7) {
      throw new Error(
        "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
      );
    }
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
  }
  if (opt.priority) {
    cookie += `; Priority=${opt.priority}`;
  }
  if (opt.partitioned) {
    if (!opt.secure) {
      throw new Error("Partitioned Cookie must have Secure attributes");
    }
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};
var getCookie = (c, key, prefix) => {
  const cookie = c.req.raw.headers.get("Cookie");
  {
    if (!cookie) {
      return void 0;
    }
    let finalKey = key;
    const obj2 = parse(cookie, finalKey);
    return obj2[finalKey];
  }
};
var setCookie = (c, name, value, opt) => {
  let cookie;
  if (opt?.prefix === "secure") {
    cookie = serialize("__Secure-" + name, value, { path: "/", ...opt, secure: true });
  } else if (opt?.prefix === "host") {
    cookie = serialize("__Host-" + name, value, {
      ...opt,
      path: "/",
      secure: true,
      domain: void 0
    });
  } else {
    cookie = serialize(name, value, { path: "/", ...opt });
  }
  c.header("Set-Cookie", cookie, { append: true });
};
const DEFAULT_MOCHA_USERS_SERVICE_API_URL = "https://getmocha.com/u";
const MOCHA_SESSION_TOKEN_COOKIE_NAME = "mocha_session_token";
const SUPPORTED_OAUTH_PROVIDERS = ["google"];
async function getOAuthRedirectUrl(provider, options) {
  if (!SUPPORTED_OAUTH_PROVIDERS.includes(provider)) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
  const apiUrl = options.apiUrl || DEFAULT_MOCHA_USERS_SERVICE_API_URL;
  const response = await fetch(`${apiUrl}/oauth/${provider}/redirect_url`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": options.apiKey
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to get redirect URL for provider ${provider}: ${response.statusText}`);
  }
  const { redirect_url } = await response.json();
  return redirect_url;
}
async function exchangeCodeForSessionToken(code, options) {
  const apiUrl = options.apiUrl || DEFAULT_MOCHA_USERS_SERVICE_API_URL;
  const response = await fetch(`${apiUrl}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": options.apiKey
    },
    body: JSON.stringify({ code })
  });
  if (!response.ok) {
    throw new Error(`Failed to exchange code for session token: ${response.statusText}`);
  }
  const { session_token } = await response.json();
  return session_token;
}
async function getCurrentUser(sessionToken, options) {
  const apiUrl = options.apiUrl || DEFAULT_MOCHA_USERS_SERVICE_API_URL;
  try {
    const response = await fetch(`${apiUrl}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "x-api-key": options.apiKey
      }
    });
    if (!response.ok) {
      return null;
    }
    const { data: user } = await response.json();
    return user;
  } catch (error) {
    console.error("Error validating session:", error);
    return null;
  }
}
async function deleteSession(sessionToken, options) {
  const apiUrl = options.apiUrl || DEFAULT_MOCHA_USERS_SERVICE_API_URL;
  try {
    await fetch(`${apiUrl}/sessions`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "x-api-key": options.apiKey
      }
    });
  } catch (error) {
    console.error("Error deleting session:", error);
  }
}
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
const ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
const getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};
const ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
class ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
}
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};
const errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
let overrideErrorMap = errorMap;
function getErrorMap() {
  return overrideErrorMap;
}
const makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === errorMap ? void 0 : errorMap
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
class ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
}
const INVALID = Object.freeze({
  status: "aborted"
});
const DIRTY = (value) => ({ status: "dirty", value });
const OK = (value) => ({ status: "valid", value });
const isAborted = (x) => x.status === "aborted";
const isDirty = (x) => x.status === "dirty";
const isValid = (x) => x.status === "valid";
const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));
class ParseInputLazyPath {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
}
const handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
class ZodType {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[0-9a-z]+$/;
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
const nanoidRegex = /^[a-z0-9_-]{21}$/i;
const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
const durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
let emojiRegex;
const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
const base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
class ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
class ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
class ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
class ZodBoolean extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
class ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
}
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
class ZodSymbol extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
class ZodUndefined extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
class ZodNull extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
class ZodAny extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
class ZodUnknown extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
class ZodNever extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
}
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
class ZodVoid extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
class ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
class ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") ;
      else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index2) {
    return new ZodObject({
      ...this._def,
      catchall: index2
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
}
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
class ZodUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
}
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index2 = 0; index2 < a.length; index2++) {
      const itemA = a[index2];
      const itemB = b[index2];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
class ZodIntersection extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
}
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
class ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
}
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
class ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
}
class ZodMap extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index2) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index2, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index2, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
}
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
class ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
class ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
}
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
class ZodLiteral extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
}
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
class ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
}
ZodEnum.create = createZodEnum;
class ZodNativeEnum extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
}
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
class ZodPromise extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
}
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
class ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
}
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
class ZodOptional extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
class ZodNullable extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
class ZodDefault extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
class ZodCatch extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
class ZodNaN extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
}
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
class ZodBranded extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
}
class ZodReadonly extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
const stringType = ZodString.create;
const numberType = ZodNumber.create;
const booleanType = ZodBoolean.create;
const anyType = ZodAny.create;
ZodNever.create;
ZodArray.create;
const objectType = ZodObject.create;
ZodUnion.create;
ZodIntersection.create;
ZodTuple.create;
const recordType = ZodRecord.create;
const enumType = ZodEnum.create;
ZodPromise.create;
ZodOptional.create;
ZodNullable.create;
objectType({
  username: stringType().optional(),
  display_name: stringType().optional(),
  bio: stringType().optional(),
  avatar_url: stringType().optional(),
  banner_url: stringType().optional(),
  website_url: stringType().optional(),
  social_links: stringType().optional()
});
const CreateDropRequestSchema = objectType({
  title: stringType(),
  description: stringType(),
  drop_type: stringType(),
  difficulty: stringType(),
  key_cost: numberType().min(0),
  gem_reward_base: numberType().min(0),
  gem_pool_total: numberType().optional(),
  reward_logic: stringType().optional(),
  follower_threshold: numberType().min(0).default(0),
  time_commitment: stringType().optional(),
  requirements: stringType().optional(),
  deliverables: stringType().optional(),
  deadline_at: stringType().optional(),
  max_participants: numberType().optional(),
  platform: stringType().optional(),
  content_url: stringType().optional(),
  move_cost_points: numberType().min(0).default(0),
  key_reward_amount: numberType().min(0).default(0),
  is_proof_drop: booleanType().default(false),
  is_paid_drop: booleanType().default(false)
});
objectType({
  application_message: stringType()
});
objectType({
  action_type: enumType(["like", "comment", "save", "share", "repost"]),
  reference_id: numberType().optional(),
  reference_type: stringType().optional()
});
objectType({
  from_currency: enumType(["points", "gems"]),
  to_currency: enumType(["keys"]),
  amount: numberType().min(1)
});
objectType({
  date: stringType().optional()
});
objectType({
  amount: numberType().min(200),
  payment_method: stringType(),
  payment_details: recordType(anyType())
});
objectType({
  payment_method: stringType(),
  preference_data: recordType(anyType()),
  is_default: booleanType().optional()
});
objectType({
  package_id: stringType(),
  gems: numberType().min(1),
  price: numberType().min(0.01)
});
objectType({
  content_id: numberType().optional(),
  platform: stringType(),
  content_url: stringType(),
  forecast_type: enumType(["views", "likes", "shares", "comments"]),
  target_value: numberType().min(1),
  odds: numberType().min(1),
  expires_at: stringType(),
  initial_amount: numberType().min(1),
  initial_side: enumType(["over", "under"])
});
objectType({
  prediction_amount: numberType().min(1),
  prediction_side: enumType(["over", "under"])
});
objectType({
  platform: stringType(),
  content_url: stringType(),
  bet_type: enumType(["views", "likes", "shares", "comments"]),
  target_value: numberType().min(1),
  odds: numberType().min(1),
  expires_at: stringType()
});
objectType({
  bet_amount: numberType().min(1),
  bet_side: enumType(["over", "under"])
});
enumType(["instagram", "tiktok", "youtube", "twitter"]);
enumType(["content_clipping", "reviews", "ugc_creation", "affiliate_referral", "surveys", "challenges_events", "engagement"]);
enumType(["easy", "medium", "hard"]);
enumType(["social_media", "content_creation", "marketing", "review", "survey"]);
enumType(["easy", "medium", "hard"]);
const CreateContentRequestSchema = objectType({
  platform: enumType(["instagram", "tiktok", "youtube", "twitter", "linkedin"]),
  title: stringType().min(1),
  description: stringType().optional(),
  platform_url: stringType().url(),
  media_url: stringType().optional(),
  total_shares: numberType().min(1).max(1e3),
  share_price: numberType().min(0)
});
objectType({
  content_id: numberType(),
  shares_count: numberType().min(1)
});
objectType({
  title: stringType(),
  description: stringType(),
  category: stringType(),
  difficulty: enumType(["easy", "medium", "hard"]),
  reward_amount: numberType().min(0),
  currency_type: stringType().default("USD"),
  follower_threshold: numberType().min(0).default(0),
  time_commitment: stringType().optional(),
  requirements: stringType().optional(),
  deliverables: stringType().optional(),
  deadline_at: stringType().optional(),
  max_participants: numberType().optional()
});
objectType({
  application_message: stringType()
});
const payments = new Hono2();
async function getOrCreateUser$2(mochaUser, db) {
  try {
    const existingUser = await db.prepare(
      "SELECT * FROM users WHERE mocha_user_id = ?"
    ).bind(mochaUser.id).first();
    if (existingUser) {
      return existingUser;
    }
    const baseUsername = mochaUser.email ? mochaUser.email.split("@")[0] : "user";
    let username = baseUsername;
    let usernameAttempts = 0;
    while (usernameAttempts < 10) {
      const existingUsername = await db.prepare(
        "SELECT id FROM users WHERE username = ?"
      ).bind(username).first();
      if (!existingUsername) {
        break;
      }
      usernameAttempts++;
      username = `${baseUsername}${usernameAttempts}`;
    }
    const displayName = mochaUser.google_user_data?.name || mochaUser.google_user_data?.given_name || username;
    let referralCode;
    let referralAttempts = 0;
    do {
      const baseCode = username.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4);
      referralCode = `${baseCode || "USER"}${Math.floor(Math.random() * 9e3) + 1e3}`;
      const existingReferral = await db.prepare(
        "SELECT id FROM users WHERE referral_code = ?"
      ).bind(referralCode).first();
      if (!existingReferral) {
        break;
      }
      referralAttempts++;
    } while (referralAttempts < 10);
    const result = await db.prepare(`
      INSERT INTO users (
        mocha_user_id, email, username, display_name, bio, avatar_url,
        xp_points, level, referral_code, points_balance, keys_balance, 
        gems_balance, gold_collected, user_tier, points_streak_days,
        last_activity_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      mochaUser.id,
      mochaUser.email || "",
      username,
      displayName,
      "Welcome to Promorang!",
      mochaUser.google_user_data?.picture || null,
      100,
      // Starting XP
      1,
      // Starting level
      referralCode,
      25,
      // Starting points
      1,
      // Starting keys
      0,
      // Starting gems
      0,
      // Starting gold
      "free",
      0,
      // Streak days
      (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    const newUser = await db.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
    return newUser;
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw error;
  }
}
payments.post("/create-checkout-session", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser$2(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const { package_id, gems, price } = await c.req.json();
    if (!package_id || !gems || !price) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    const Stripe = (await import("./assets/stripe.esm.worker-B4f3yCBp.js")).default;
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil"
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${gems} Gems Package`,
              description: `${package_id.charAt(0).toUpperCase() + package_id.slice(1)} gem package - ${gems} gems at $1.10 per gem`
            },
            unit_amount: Math.round(price * 100)
            // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${new URL(c.req.url).origin}/wallet?payment=success`,
      cancel_url: `${new URL(c.req.url).origin}/wallet?payment=cancelled`,
      metadata: {
        user_id: user.id.toString(),
        package_id,
        gems_amount: gems.toString()
      }
    });
    await c.env.DB.prepare(`
      INSERT INTO pending_gem_purchases (
        user_id, stripe_session_id, package_id, gems_amount, price_amount, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      session.id,
      package_id,
      gems,
      price,
      "pending",
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    return c.json({
      checkout_url: session.url,
      session_id: session.id
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return c.json({ error: "Failed to create payment session" }, 500);
  }
});
payments.post("/stripe-webhook", async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header("stripe-signature");
    if (!signature) {
      return c.json({ error: "No signature provided" }, 400);
    }
    const Stripe = (await import("./assets/stripe.esm.worker-B4f3yCBp.js")).default;
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil"
    });
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, c.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return c.json({ error: "Webhook signature verification failed" }, 400);
    }
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const pendingPurchase = await c.env.DB.prepare(
          "SELECT * FROM pending_gem_purchases WHERE stripe_session_id = ?"
        ).bind(session.id).first();
        if (!pendingPurchase) {
          console.error("No pending purchase found for session:", session.id);
          break;
        }
        await c.env.DB.prepare(
          "UPDATE users SET gems_balance = gems_balance + ?, updated_at = ? WHERE id = ?"
        ).bind(
          pendingPurchase.gems_amount,
          (/* @__PURE__ */ new Date()).toISOString(),
          pendingPurchase.user_id
        ).run();
        await c.env.DB.prepare(
          "UPDATE pending_gem_purchases SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?"
        ).bind(
          "completed",
          (/* @__PURE__ */ new Date()).toISOString(),
          (/* @__PURE__ */ new Date()).toISOString(),
          pendingPurchase.id
        ).run();
        await c.env.DB.prepare(`
          INSERT INTO transactions (
            user_id, transaction_type, amount, currency_type, status, 
            reference_id, reference_type, description, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          pendingPurchase.user_id,
          "gem_purchase",
          pendingPurchase.gems_amount,
          "GEMS",
          "completed",
          pendingPurchase.id,
          "gem_purchase",
          `Purchased ${pendingPurchase.gems_amount} gems (${pendingPurchase.package_id} package)`,
          (/* @__PURE__ */ new Date()).toISOString(),
          (/* @__PURE__ */ new Date()).toISOString()
        ).run();
        console.log("Successfully processed gem purchase:", {
          user_id: pendingPurchase.user_id,
          gems_amount: pendingPurchase.gems_amount,
          package_id: pendingPurchase.package_id
        });
        break;
      case "checkout.session.expired":
        const expiredSession = event.data.object;
        await c.env.DB.prepare(
          "UPDATE pending_gem_purchases SET status = ?, updated_at = ? WHERE stripe_session_id = ?"
        ).bind(
          "expired",
          (/* @__PURE__ */ new Date()).toISOString(),
          expiredSession.id
        ).run();
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return c.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});
const currency = new Hono2();
async function getOrCreateUser$1(mochaUser, db) {
  try {
    const existingUser = await db.prepare(
      "SELECT * FROM users WHERE mocha_user_id = ?"
    ).bind(mochaUser.id).first();
    if (existingUser) {
      return existingUser;
    }
    const baseUsername = mochaUser.email ? mochaUser.email.split("@")[0] : `user${Date.now()}`;
    const username = baseUsername;
    const displayName = mochaUser.google_user_data?.name || mochaUser.google_user_data?.given_name || username;
    const referralCode = `${username.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4) || "USER"}${Math.floor(Math.random() * 9e3) + 1e3}`;
    const result = await db.prepare(`
      INSERT INTO users (
        mocha_user_id, email, username, display_name, bio, avatar_url,
        xp_points, level, referral_code, points_balance, keys_balance, 
        gems_balance, gold_collected, user_tier, points_streak_days,
        last_activity_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      mochaUser.id,
      mochaUser.email || "",
      username,
      displayName,
      "Welcome to Promorang!",
      mochaUser.google_user_data?.picture || null,
      100,
      // Starting XP
      1,
      // Starting level
      referralCode,
      25,
      // Starting points
      1,
      // Starting keys
      0,
      // Starting gems
      0,
      // Starting gold
      "free",
      0,
      // Streak days
      (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    const newUser = await db.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
    return newUser;
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw error;
  }
}
currency.post("/convert", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser$1(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const { from_currency, to_currency, amount } = await c.req.json();
    if (!from_currency || !to_currency || !amount || amount < 1) {
      return c.json({ error: "Invalid conversion data" }, 400);
    }
    const conversionRates = {
      points: { keys: 500 },
      // 500 points = 1 key
      gems: { keys: 2 }
      // 2 gems = 1 key
    };
    if (!conversionRates[from_currency] || !conversionRates[from_currency][to_currency]) {
      return c.json({ error: "Invalid conversion path" }, 400);
    }
    const rate = conversionRates[from_currency][to_currency];
    const requiredAmount = amount * rate;
    const currentBalance = from_currency === "points" ? user.points_balance || 0 : user.gems_balance || 0;
    if (currentBalance < requiredAmount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }
    if (from_currency === "points") {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const todayConversions = await c.env.DB.prepare(
        "SELECT SUM(to_amount) as total FROM currency_conversions WHERE user_id = ? AND from_currency = ? AND DATE(created_at) = ?"
      ).bind(user.id, "points", today).first();
      const todayTotal = (todayConversions?.total || 0) + amount;
      if (todayTotal > 3) {
        return c.json({ error: "Daily limit of 3 keys from points exceeded" }, 400);
      }
    }
    const updateField = from_currency === "points" ? "points_balance" : "gems_balance";
    await c.env.DB.prepare(`
      UPDATE users SET 
        ${updateField} = ${updateField} - ?,
        keys_balance = keys_balance + ?,
        updated_at = ?
      WHERE id = ?
    `).bind(requiredAmount, amount, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    await c.env.DB.prepare(`
      INSERT INTO currency_conversions (
        user_id, from_currency, to_currency, from_amount, to_amount, conversion_rate, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      from_currency,
      to_currency,
      requiredAmount,
      amount,
      rate,
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    await c.env.DB.prepare(`
      INSERT INTO transactions (
        user_id, transaction_type, amount, currency_type, status, 
        description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      "currency_conversion",
      amount,
      "KEYS",
      "completed",
      `Converted ${requiredAmount} ${from_currency} to ${amount} keys`,
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    return c.json({
      success: true,
      converted: {
        from_amount: requiredAmount,
        from_currency,
        to_amount: amount,
        to_currency
      }
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    return c.json({ error: "Failed to convert currency" }, 500);
  }
});
async function handleImageUpload(formData, env2, userId) {
  const image = formData.get("image");
  if (!image) {
    throw new Error("No image provided");
  }
  if (!image.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }
  if (image.size > 15 * 1024 * 1024) {
    throw new Error("Image must be smaller than 15MB");
  }
  const fileExtension = image.name.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const filename = `user-${userId}-${timestamp}-${randomStr}.${fileExtension}`;
  try {
    const arrayBuffer = await image.arrayBuffer();
    await env2.R2_BUCKET.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: image.type
      }
    });
    const publicUrl = `https://${env2.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${filename}`;
    return {
      url: publicUrl,
      filename
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload image");
  }
}
const app = new Hono2();
app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "stripe-signature"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.route("/api/payments", payments);
app.route("/api/users", currency);
app.get("/", (c) => c.text("Hello from Promorang!"));
async function getOrCreateUser(mochaUser, db) {
  console.log("Getting or creating user for Mocha user:", {
    id: mochaUser.id,
    email: mochaUser.email,
    hasGoogleData: !!mochaUser.google_user_data
  });
  try {
    const existingUser = await db.prepare(
      "SELECT * FROM users WHERE mocha_user_id = ?"
    ).bind(mochaUser.id).first();
    if (existingUser) {
      console.log("Found existing user:", {
        id: existingUser.id,
        email: existingUser.email,
        gems_balance: existingUser.gems_balance
      });
      return existingUser;
    }
    console.log("No existing user found, creating new user...");
    const baseUsername = mochaUser.email ? mochaUser.email.split("@")[0] : `user${Date.now()}`;
    let username = baseUsername;
    let usernameAttempts = 0;
    while (usernameAttempts < 10) {
      try {
        const existingUsername = await db.prepare(
          "SELECT id FROM users WHERE username = ?"
        ).bind(username).first();
        if (!existingUsername) {
          break;
        }
        usernameAttempts++;
        username = `${baseUsername}${usernameAttempts}`;
      } catch (usernameError) {
        console.error("Error checking username uniqueness:", usernameError);
        username = `${baseUsername}${Math.floor(Math.random() * 1e4)}`;
        break;
      }
    }
    const displayName = mochaUser.google_user_data?.name || mochaUser.google_user_data?.given_name || username;
    let referralCode = `${username.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4) || "USER"}${Math.floor(Math.random() * 9e3) + 1e3}`;
    console.log("Creating new user with data:", {
      mocha_user_id: mochaUser.id,
      email: mochaUser.email,
      username,
      display_name: displayName,
      referral_code: referralCode
    });
    try {
      const result = await db.prepare(`
        INSERT INTO users (
          mocha_user_id, email, username, display_name, bio, avatar_url,
          xp_points, level, referral_code, points_balance, keys_balance, 
          gems_balance, gold_collected, user_tier, points_streak_days,
          last_activity_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        mochaUser.id,
        mochaUser.email || "",
        username,
        displayName,
        "Welcome to Promorang!",
        mochaUser.google_user_data?.picture || null,
        100,
        // Starting XP
        1,
        // Starting level
        referralCode,
        25,
        // Starting points
        1,
        // Starting keys
        0,
        // Starting gems
        0,
        // Starting gold
        "free",
        0,
        // Streak days
        (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      console.log("User creation result:", {
        success: result.success,
        lastRowId: result.meta.last_row_id,
        changes: result.meta.changes
      });
      if (!result.success || !result.meta.last_row_id) {
        throw new Error("Failed to insert user - no row ID returned");
      }
      const newUser = await db.prepare(
        "SELECT * FROM users WHERE id = ?"
      ).bind(result.meta.last_row_id).first();
      if (!newUser) {
        throw new Error("Failed to retrieve newly created user");
      }
      console.log("New user created successfully:", {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        gems_balance: newUser.gems_balance
      });
      return newUser;
    } catch (insertError) {
      console.error("Error inserting new user:", insertError);
      const existingAfterError = await db.prepare(
        "SELECT * FROM users WHERE mocha_user_id = ?"
      ).bind(mochaUser.id).first();
      if (existingAfterError) {
        console.log("Found user after insert error, returning existing user");
        return existingAfterError;
      }
      throw insertError;
    }
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack"
    });
    throw error;
  }
}
app.get("/api/oauth/google/redirect_url", async (c) => {
  try {
    const redirectUrl = await getOAuthRedirectUrl("google", {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    return c.json({ redirectUrl }, 200);
  } catch (error) {
    return c.json({ error: "Failed to get redirect URL" }, 500);
  }
});
app.post("/api/sessions", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.code) {
      return c.json({ error: "No authorization code provided" }, 400);
    }
    if (!c.env.MOCHA_USERS_SERVICE_API_URL || !c.env.MOCHA_USERS_SERVICE_API_KEY) {
      return c.json({ error: "Service configuration error" }, 500);
    }
    let sessionToken;
    try {
      sessionToken = await exchangeCodeForSessionToken(body.code, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
      });
    } catch (exchangeError) {
      return c.json({
        error: "Authentication failed",
        details: exchangeError instanceof Error ? exchangeError.message : "Token exchange failed"
      }, 500);
    }
    if (!sessionToken) {
      return c.json({ error: "Failed to obtain session token" }, 500);
    }
    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 24 * 60 * 60
      // 60 days
    });
    try {
      const user = await getCurrentUser(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
      });
      if (!user) {
        return c.json({ error: "Session token verification failed" }, 500);
      }
      try {
        const dbUser = await getOrCreateUser(user, c.env.DB);
        console.log("User created/updated in database:", dbUser?.id);
      } catch (dbError) {
        console.error("Database user creation failed:", dbError);
      }
      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.google_user_data?.name || user.google_user_data?.given_name
        }
      }, 200);
    } catch (verificationError) {
      return c.json({
        error: "Session verification failed",
        details: verificationError instanceof Error ? verificationError.message : "Unknown error"
      }, 500);
    }
  } catch (error) {
    return c.json({
      error: "Authentication failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});
app.get("/api/users/me", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json(null);
    }
    if (!c.env.MOCHA_USERS_SERVICE_API_URL || !c.env.MOCHA_USERS_SERVICE_API_KEY) {
      return c.json(null);
    }
    try {
      const mochaUser = await getCurrentUser(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
      });
      if (!mochaUser) {
        return c.json(null);
      }
      return c.json(mochaUser);
    } catch (userError) {
      return c.json(null);
    }
  } catch (error) {
    return c.json(null);
  }
});
app.get("/api/app/users/me", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    console.log("=== /api/app/users/me Debug ===");
    console.log("Session token exists:", !!sessionToken);
    console.log("Session token value:", sessionToken ? `${sessionToken.substring(0, 10)}...` : "null");
    console.log("Environment check:", {
      hasApiUrl: !!c.env.MOCHA_USERS_SERVICE_API_URL,
      hasApiKey: !!c.env.MOCHA_USERS_SERVICE_API_KEY,
      hasDB: !!c.env.DB
    });
    if (!sessionToken) {
      console.log("No session token, returning null");
      return c.json(null);
    }
    if (!c.env.MOCHA_USERS_SERVICE_API_URL || !c.env.MOCHA_USERS_SERVICE_API_KEY) {
      console.error("Missing Mocha service configuration");
      return c.json({ error: "Service configuration missing" }, 500);
    }
    try {
      console.log("Attempting to get current user from Mocha service...");
      const mochaUser = await getCurrentUser(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
      });
      console.log("Mocha user result:", mochaUser ? {
        id: mochaUser.id,
        email: mochaUser.email,
        hasGoogleData: !!mochaUser.google_user_data
      } : "null");
      if (!mochaUser) {
        console.log("No Mocha user found, returning null");
        return c.json(null);
      }
      console.log("Getting or creating user in database...");
      let user = await c.env.DB.prepare(
        "SELECT * FROM users WHERE mocha_user_id = ?"
      ).bind(mochaUser.id).first();
      if (user) {
        console.log("Found existing database user:", { id: user.id, email: user.email });
        return c.json(user);
      }
      console.log("No existing user found, creating new user...");
      user = await getOrCreateUser(mochaUser, c.env.DB);
      console.log("Database user result:", user ? {
        id: user.id,
        email: user.email,
        gems_balance: user.gems_balance,
        points_balance: user.points_balance,
        keys_balance: user.keys_balance
      } : "null");
      if (!user) {
        console.error("Failed to create or retrieve user");
        return c.json({ error: "Failed to create user" }, 500);
      }
      return c.json(user);
    } catch (authError) {
      console.error("Auth error in /api/app/users/me:", authError);
      console.error("Auth error stack:", authError instanceof Error ? authError.stack : "No stack");
      return c.json({ error: "Authentication failed" }, 500);
    }
  } catch (error) {
    console.error("General error in /api/app/users/me:", error);
    console.error("General error stack:", error instanceof Error ? error.stack : "No stack");
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/images/upload", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const formData = await c.req.formData();
    const result = await handleImageUpload(formData, c.env, mochaUser.id);
    return c.json(result);
  } catch (error) {
    console.error("Image upload error:", error);
    return c.json({
      error: error instanceof Error ? error.message : "Upload failed"
    }, 400);
  }
});
app.put("/api/users/brand-profile", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const body = await c.req.json();
    const { brand_name, brand_logo_url, brand_description, brand_website, brand_email, brand_phone } = body;
    if (!brand_name?.trim()) {
      return c.json({ error: "Brand name is required" }, 400);
    }
    await c.env.DB.prepare(`
        UPDATE users 
        SET brand_name = ?, brand_logo_url = ?, brand_description = ?, 
            brand_website = ?, brand_email = ?, brand_phone = ?, updated_at = CURRENT_TIMESTAMP
        WHERE mocha_user_id = ?
      `).bind(
      brand_name.trim(),
      brand_logo_url || null,
      brand_description?.trim() || null,
      brand_website?.trim() || null,
      brand_email?.trim() || null,
      brand_phone?.trim() || null,
      mochaUser.id
    ).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating brand profile:", error);
    return c.json({ error: "Failed to update brand profile" }, 500);
  }
});
app.put("/api/users/profile", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const body = await c.req.json();
    const { username, display_name, bio, avatar_url, banner_url, website_url, social_links } = body;
    if (username !== void 0) {
      if (username && username.length < 3) {
        return c.json({ error: "Username must be at least 3 characters long" }, 400);
      }
      if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
        return c.json({ error: "Username can only contain letters, numbers, and underscores" }, 400);
      }
      if (username && username !== user.username) {
        const existingUser = await c.env.DB.prepare(
          "SELECT id FROM users WHERE username = ? AND id != ?"
        ).bind(username, user.id).first();
        if (existingUser) {
          return c.json({ error: "Username is already taken" }, 400);
        }
      }
    }
    if (bio && bio.length > 500) {
      return c.json({ error: "Bio must be less than 500 characters" }, 400);
    }
    if (website_url && website_url.trim()) {
      try {
        new URL(website_url);
      } catch {
        return c.json({ error: "Please enter a valid website URL" }, 400);
      }
    }
    if (social_links && social_links.trim()) {
      try {
        const parsed = JSON.parse(social_links);
        if (typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Invalid format");
        }
      } catch {
        return c.json({ error: "Social links must be valid JSON format" }, 400);
      }
    }
    await c.env.DB.prepare(`
      UPDATE users 
      SET username = ?, display_name = ?, bio = ?, avatar_url = ?, 
          banner_url = ?, website_url = ?, social_links = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      username !== void 0 ? username || null : user.username,
      display_name !== void 0 ? display_name || null : user.display_name,
      bio !== void 0 ? bio || null : user.bio,
      avatar_url !== void 0 ? avatar_url || null : user.avatar_url,
      banner_url !== void 0 ? banner_url || null : user.banner_url,
      website_url !== void 0 ? website_url || null : user.website_url,
      social_links !== void 0 ? social_links || null : user.social_links,
      (/* @__PURE__ */ new Date()).toISOString(),
      user.id
    ).run();
    const updatedUser = await c.env.DB.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(user.id).first();
    return c.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});
app.get("/api/users/check-username/:username", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const username = c.req.param("username");
    if (!username || username.length < 3) {
      return c.json({ available: false, reason: "Username must be at least 3 characters long" });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return c.json({ available: false, reason: "Username can only contain letters, numbers, and underscores" });
    }
    if (username === user.username) {
      return c.json({ available: true, reason: "This is your current username" });
    }
    const existingUser = await c.env.DB.prepare(
      "SELECT id FROM users WHERE username = ?"
    ).bind(username).first();
    if (existingUser) {
      return c.json({ available: false, reason: "Username is already taken" });
    }
    return c.json({ available: true });
  } catch (error) {
    console.error("Error checking username:", error);
    return c.json({ error: "Failed to check username availability" }, 500);
  }
});
app.post("/api/users/become-advertiser", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    await c.env.DB.prepare(
      "UPDATE users SET user_type = ?, updated_at = ? WHERE id = ?"
    ).bind(
      "advertiser",
      (/* @__PURE__ */ new Date()).toISOString(),
      user.id
    ).run();
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    const existingMonthly = await c.env.DB.prepare(
      "SELECT id FROM advertiser_inventory WHERE advertiser_id = ? AND period_type = ? AND period_start = ?"
    ).bind(user.id, "monthly", monthStart).first();
    if (!existingMonthly) {
      await c.env.DB.prepare(`
        INSERT INTO advertiser_inventory (
          advertiser_id, period_type, period_start, period_end,
          moves_allocated, proof_drops_allocated, paid_drops_allocated,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        "monthly",
        monthStart,
        monthEnd,
        50,
        // Free tier gets 50 moves per month
        5,
        // Free tier gets 5 proof drops per month
        0,
        // Free tier gets no paid drops
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
    }
    return c.json({ success: true });
  } catch (error) {
    console.error("Error becoming advertiser:", error);
    return c.json({ error: "Failed to become advertiser" }, 500);
  }
});
app.get("/api/logout", async (c) => {
  return handleLogout(c);
});
app.post("/api/logout", async (c) => {
  return handleLogout(c);
});
async function handleLogout(c) {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (sessionToken) {
      try {
        await deleteSession(sessionToken, {
          apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
          apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
        });
      } catch (sessionError) {
      }
    }
    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 0
    });
    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: "Logout failed" }, 500);
  }
}
app.post("/api/drops", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    if (user.user_type !== "advertiser") {
      return c.json({ error: "Only advertisers can create drops" }, 403);
    }
    const body = await c.req.json();
    const validationResult = CreateDropRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({
        error: "Invalid drop data",
        details: validationResult.error.errors
      }, 400);
    }
    const dropData = validationResult.data;
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const inventory = await c.env.DB.prepare(`
      SELECT * FROM advertiser_inventory 
      WHERE advertiser_id = ? AND period_type = 'monthly' AND period_start = ?
    `).bind(user.id, monthStart).first();
    if (!inventory) {
      return c.json({ error: "No advertiser inventory found for this month" }, 400);
    }
    if (dropData.is_proof_drop) {
      if (inventory.proof_drops_used >= inventory.proof_drops_allocated) {
        return c.json({ error: "You have used all your proof drops for this month" }, 400);
      }
    } else if (dropData.is_paid_drop) {
      if (inventory.paid_drops_used >= inventory.paid_drops_allocated) {
        return c.json({ error: "You have used all your paid drops for this month" }, 400);
      }
    }
    const gemPoolRemaining = dropData.gem_pool_total || 0;
    const result = await c.env.DB.prepare(`
      INSERT INTO drops (
        creator_id, title, description, drop_type, difficulty, key_cost, 
        gem_reward_base, gem_pool_total, gem_pool_remaining, reward_logic,
        follower_threshold, time_commitment, requirements, deliverables, 
        deadline_at, max_participants, platform, content_url, move_cost_points,
        key_reward_amount, is_proof_drop, is_paid_drop, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      dropData.title,
      dropData.description,
      dropData.drop_type,
      dropData.difficulty,
      dropData.key_cost,
      dropData.gem_reward_base,
      dropData.gem_pool_total || 0,
      gemPoolRemaining,
      dropData.reward_logic || null,
      dropData.follower_threshold,
      dropData.time_commitment || null,
      dropData.requirements || null,
      dropData.deliverables || null,
      dropData.deadline_at || null,
      dropData.max_participants || null,
      dropData.platform || null,
      dropData.content_url || null,
      dropData.move_cost_points,
      dropData.key_reward_amount,
      dropData.is_proof_drop,
      dropData.is_paid_drop,
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    if (dropData.is_proof_drop) {
      await c.env.DB.prepare(
        "UPDATE advertiser_inventory SET proof_drops_used = proof_drops_used + 1, updated_at = ? WHERE id = ?"
      ).bind((/* @__PURE__ */ new Date()).toISOString(), inventory.id).run();
    } else if (dropData.is_paid_drop) {
      await c.env.DB.prepare(
        "UPDATE advertiser_inventory SET paid_drops_used = paid_drops_used + 1, updated_at = ? WHERE id = ?"
      ).bind((/* @__PURE__ */ new Date()).toISOString(), inventory.id).run();
    }
    const newDrop = await c.env.DB.prepare(`
      SELECT d.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.id = ?
    `).bind(result.meta.last_row_id).first();
    return c.json({
      success: true,
      drop: newDrop,
      dropId: result.meta.last_row_id
    }, 201);
  } catch (error) {
    console.error("Error creating drop:", error);
    return c.json({ error: "Failed to create drop" }, 500);
  }
});
app.get("/api/drops", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "20");
    const result = await c.env.DB.prepare(`
      SELECT d.*, 
             u.username as creator_name, 
             u.avatar_url as creator_avatar,
             u.brand_name,
             u.brand_logo_url,
             COALESCE(u.brand_name, u.display_name, u.username) as display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as display_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.status = 'active'
      ORDER BY d.created_at DESC
      LIMIT ?
    `).bind(limit).all();
    const drops = result.results || [];
    return c.json(drops);
  } catch (error) {
    return c.json({ error: "Failed to fetch drops" }, 500);
  }
});
app.get("/api/drops/:id", async (c) => {
  try {
    const dropId = parseInt(c.req.param("id"));
    if (isNaN(dropId)) {
      return c.json({ error: "Invalid drop ID" }, 400);
    }
    const drop = await c.env.DB.prepare(`
      SELECT d.*, 
             u.username as creator_name,
             u.display_name as creator_display_name,
             u.avatar_url as creator_avatar,
             u.brand_name,
             u.brand_logo_url,
             COALESCE(u.brand_name, u.display_name, u.username) as display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as display_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.id = ?
    `).bind(dropId).first();
    if (!drop) {
      return c.json({ error: "Drop not found" }, 404);
    }
    return c.json(drop);
  } catch (error) {
    console.error("Failed to fetch drop:", error);
    return c.json({ error: "Failed to fetch drop" }, 500);
  }
});
app.put("/api/drops/:id", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const dropId = parseInt(c.req.param("id"));
    if (isNaN(dropId)) {
      return c.json({ error: "Invalid drop ID" }, 400);
    }
    const existingDrop = await c.env.DB.prepare(
      "SELECT * FROM drops WHERE id = ? AND creator_id = ?"
    ).bind(dropId, user.id).first();
    if (!existingDrop) {
      return c.json({ error: "Drop not found or you do not have permission to edit it" }, 404);
    }
    const body = await c.req.json();
    const validationResult = CreateDropRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({
        error: "Invalid drop data",
        details: validationResult.error.errors
      }, 400);
    }
    const dropData = validationResult.data;
    await c.env.DB.prepare(`
      UPDATE drops SET
        title = ?, description = ?, drop_type = ?, difficulty = ?, 
        key_cost = ?, gem_reward_base = ?, gem_pool_total = ?, 
        follower_threshold = ?, time_commitment = ?, requirements = ?, 
        deliverables = ?, deadline_at = ?, max_participants = ?, 
        platform = ?, content_url = ?, move_cost_points = ?, 
        key_reward_amount = ?, updated_at = ?
      WHERE id = ? AND creator_id = ?
    `).bind(
      dropData.title,
      dropData.description,
      dropData.drop_type,
      dropData.difficulty,
      dropData.key_cost,
      dropData.gem_reward_base,
      dropData.gem_pool_total || 0,
      dropData.follower_threshold,
      dropData.time_commitment || null,
      dropData.requirements || null,
      dropData.deliverables || null,
      dropData.deadline_at || null,
      dropData.max_participants || null,
      dropData.platform || null,
      dropData.content_url || null,
      dropData.move_cost_points,
      dropData.key_reward_amount,
      (/* @__PURE__ */ new Date()).toISOString(),
      dropId,
      user.id
    ).run();
    const updatedDrop = await c.env.DB.prepare(`
      SELECT d.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.id = ?
    `).bind(dropId).first();
    return c.json({
      success: true,
      drop: updatedDrop
    });
  } catch (error) {
    console.error("Error updating drop:", error);
    return c.json({ error: "Failed to update drop" }, 500);
  }
});
app.delete("/api/drops/:id", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const dropId = parseInt(c.req.param("id"));
    if (isNaN(dropId)) {
      return c.json({ error: "Invalid drop ID" }, 400);
    }
    const existingDrop = await c.env.DB.prepare(
      "SELECT * FROM drops WHERE id = ? AND creator_id = ?"
    ).bind(dropId, user.id).first();
    if (!existingDrop) {
      return c.json({ error: "Drop not found or you do not have permission to delete it" }, 404);
    }
    const hasApplications = await c.env.DB.prepare(
      "SELECT id FROM drop_applications WHERE drop_id = ? AND status IN (?, ?) LIMIT 1"
    ).bind(dropId, "pending", "approved").first();
    if (hasApplications) {
      return c.json({
        error: "Cannot delete drop with active applications. Please complete or reject all applications first."
      }, 400);
    }
    await c.env.DB.prepare("DELETE FROM drop_applications WHERE drop_id = ?").bind(dropId).run();
    await c.env.DB.prepare("DELETE FROM drops WHERE id = ? AND creator_id = ?").bind(dropId, user.id).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting drop:", error);
    return c.json({ error: "Failed to delete drop" }, 500);
  }
});
app.get("/api/content", async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT cp.*, 
             u.username as creator_name, 
             u.avatar_url as creator_avatar,
             u.brand_name,
             u.brand_logo_url,
             COALESCE(u.brand_name, u.display_name, u.username) as display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as display_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      ORDER BY cp.created_at DESC
      LIMIT 50
    `).all();
    const content = result.results || [];
    return c.json(content);
  } catch (error) {
    return c.json({ error: "Failed to fetch content" }, 500);
  }
});
app.get("/api/content/sponsored", async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT cp.*, 
             u.username as creator_name, 
             u.avatar_url as creator_avatar,
             u.brand_name as creator_brand_name,
             u.brand_logo_url as creator_brand_logo,
             COALESCE(u.brand_name, u.display_name, u.username) as creator_display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as creator_display_avatar,
             GROUP_CONCAT(sc.boost_multiplier) as boost_multipliers,
             GROUP_CONCAT(sc.gems_allocated) as gems_allocated_list,
             GROUP_CONCAT(COALESCE(u2.brand_name, u2.display_name, u2.username, 'Advertiser')) as sponsor_names,
             GROUP_CONCAT(COALESCE(u2.brand_logo_url, u2.avatar_url)) as sponsor_logos,
             SUM(sc.boost_multiplier) as total_boost_multiplier,
             SUM(sc.gems_allocated) as total_gems_allocated,
             COUNT(sc.id) as sponsor_count,
             MIN(sc.expires_at) as earliest_expiry
      FROM content_pieces cp
      JOIN sponsored_content sc ON cp.id = sc.content_id
      JOIN users u ON cp.creator_id = u.id
      LEFT JOIN users u2 ON sc.advertiser_id = u2.id
      WHERE sc.status = 'active' AND sc.expires_at > datetime('now')
      GROUP BY cp.id
      ORDER BY total_boost_multiplier DESC, sponsor_count DESC, sc.created_at DESC
      LIMIT 20
    `).bind().all();
    const sponsoredContent = result.results || [];
    return c.json(sponsoredContent);
  } catch (error) {
    console.error("Error fetching sponsored content:", error);
    return c.json([], 500);
  }
});
app.post("/api/content/:id/fund", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const contentId = c.req.param("id");
    const { amount, currency_type } = await c.req.json();
    if (!amount || amount <= 0) {
      return c.json({ error: "Invalid funding amount" }, 400);
    }
    let usdAmount = amount;
    if (currency_type === "Points") {
      usdAmount = amount / 1e3;
    }
    const content = await c.env.DB.prepare(
      "SELECT * FROM content_pieces WHERE id = ?"
    ).bind(contentId).first();
    if (!content) {
      return c.json({ error: "Content not found" }, 404);
    }
    await c.env.DB.prepare(`
      INSERT INTO content_funding (creator_id, content_id, funding_amount, currency_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.id,
      contentId,
      usdAmount,
      "USD",
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    const newRevenue = content.current_revenue + usdAmount;
    const newSharePrice = content.total_shares > 0 ? newRevenue / content.total_shares : 0;
    await c.env.DB.prepare(
      "UPDATE content_pieces SET current_revenue = ?, share_price = ?, updated_at = ? WHERE id = ?"
    ).bind(newRevenue, newSharePrice, (/* @__PURE__ */ new Date()).toISOString(), contentId).run();
    if (currency_type === "Points") {
      await c.env.DB.prepare(
        "UPDATE users SET points_balance = points_balance - ?, updated_at = ? WHERE id = ?"
      ).bind(amount, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    } else if (currency_type === "Gems") {
      await c.env.DB.prepare(
        "UPDATE users SET gems_balance = gems_balance - ?, updated_at = ? WHERE id = ?"
      ).bind(amount, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    }
    return c.json({
      success: true,
      new_revenue: newRevenue,
      new_share_price: newSharePrice
    });
  } catch (error) {
    console.error("Error funding content:", error);
    return c.json({ error: "Failed to fund content" }, 500);
  }
});
app.post("/api/content/:id/tip", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const contentId = c.req.param("id");
    const { amount, currency_type } = await c.req.json();
    if (!amount || amount <= 0) {
      return c.json({ error: "Invalid tip amount" }, 400);
    }
    let usdAmount = amount;
    if (currency_type === "Points") {
      usdAmount = amount / 1e3;
    }
    const content = await c.env.DB.prepare(
      "SELECT * FROM content_pieces WHERE id = ?"
    ).bind(contentId).first();
    if (!content) {
      return c.json({ error: "Content not found" }, 404);
    }
    await c.env.DB.prepare(`
      INSERT INTO content_tips (tipper_id, content_id, tip_amount, currency_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.id,
      contentId,
      usdAmount,
      "USD",
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    const newRevenue = content.current_revenue + usdAmount;
    const newSharePrice = content.total_shares > 0 ? newRevenue / content.total_shares : 0;
    await c.env.DB.prepare(
      "UPDATE content_pieces SET current_revenue = ?, share_price = ?, updated_at = ? WHERE id = ?"
    ).bind(newRevenue, newSharePrice, (/* @__PURE__ */ new Date()).toISOString(), contentId).run();
    if (currency_type === "Points") {
      await c.env.DB.prepare(
        "UPDATE users SET points_balance = points_balance - ?, updated_at = ? WHERE id = ?"
      ).bind(amount, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    } else if (currency_type === "Gems") {
      await c.env.DB.prepare(
        "UPDATE users SET gems_balance = gems_balance - ?, updated_at = ? WHERE id = ?"
      ).bind(amount, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    }
    return c.json({
      success: true,
      new_revenue: newRevenue,
      new_share_price: newSharePrice
    });
  } catch (error) {
    console.error("Error tipping content:", error);
    return c.json({ error: "Failed to tip content" }, 500);
  }
});
app.get("/api/content/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const content = await c.env.DB.prepare(`
      SELECT cp.*, 
             u.username as creator_name, 
             u.avatar_url as creator_avatar,
             u.brand_name,
             u.brand_logo_url,
             COALESCE(u.brand_name, u.display_name, u.username) as display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as display_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE cp.id = ?
    `).bind(id).first();
    if (!content) {
      return c.json({ error: "Content not found" }, 404);
    }
    return c.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    return c.json({ error: "Failed to fetch content" }, 500);
  }
});
app.get("/api/content/:id/sponsorship", async (c) => {
  try {
    const contentId = c.req.param("id");
    const sponsorships = await c.env.DB.prepare(`
      SELECT sc.*, 
             u.display_name as advertiser_name, 
             u.username as advertiser_username,
             u.brand_name as advertiser_brand_name,
             u.brand_logo_url as advertiser_brand_logo,
             COALESCE(u.brand_name, u.display_name, u.username) as advertiser_display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as advertiser_display_logo
      FROM sponsored_content sc
      JOIN users u ON sc.advertiser_id = u.id
      WHERE sc.content_id = ? AND sc.status = 'active' AND sc.expires_at > datetime('now')
      ORDER BY sc.boost_multiplier DESC, sc.created_at ASC
    `).bind(contentId).all();
    if (!sponsorships || sponsorships.results.length === 0) {
      return c.json(null);
    }
    const totalBoostMultiplier = sponsorships.results.reduce((sum, s) => sum + s.boost_multiplier, 0);
    const totalGemsAllocated = sponsorships.results.reduce((sum, s) => sum + s.gems_allocated, 0);
    const sponsorNames = sponsorships.results.map((s) => s.advertiser_display_name || "Advertiser");
    const sponsorLogos = sponsorships.results.map((s) => s.advertiser_display_logo);
    return c.json({
      sponsors: sponsorships.results,
      sponsor_names: sponsorNames,
      sponsor_logos: sponsorLogos,
      total_boost_multiplier: totalBoostMultiplier,
      total_gems_allocated: totalGemsAllocated,
      sponsor_count: sponsorships.results.length,
      primary_sponsor: sponsorNames[0],
      // Highest boost or earliest sponsor
      primary_sponsor_logo: sponsorLogos[0],
      boost_multiplier: totalBoostMultiplier,
      // For backward compatibility
      gems_allocated: totalGemsAllocated,
      // For backward compatibility
      advertiser_name: sponsorNames[0]
      // For backward compatibility
    });
  } catch (error) {
    console.error("Error fetching sponsorship data:", error);
    return c.json({ error: "Failed to fetch sponsorship data" }, 500);
  }
});
app.post("/api/content/:id/sponsor", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    if (user.user_type !== "advertiser") {
      return c.json({ error: "Only advertisers can sponsor content" }, 403);
    }
    const contentId = c.req.param("id");
    const { gems_allocated, boost_multiplier, duration_hours } = await c.req.json();
    if (!gems_allocated || !boost_multiplier || !duration_hours || gems_allocated <= 0 || boost_multiplier < 1 || duration_hours <= 0) {
      return c.json({ error: "Invalid sponsorship parameters" }, 400);
    }
    if (user.gems_balance < gems_allocated) {
      return c.json({ error: "Insufficient gems" }, 400);
    }
    const content = await c.env.DB.prepare(
      "SELECT * FROM content_pieces WHERE id = ?"
    ).bind(contentId).first();
    if (!content) {
      return c.json({ error: "Content not found" }, 404);
    }
    if (content.creator_id === user.id) {
      return c.json({ error: "Cannot sponsor your own content" }, 400);
    }
    const existingSponsorship = await c.env.DB.prepare(
      'SELECT * FROM sponsored_content WHERE advertiser_id = ? AND content_id = ? AND status = "active" AND expires_at > datetime("now")'
    ).bind(user.id, contentId).first();
    if (existingSponsorship) {
      return c.json({ error: "You already have an active sponsorship for this content" }, 400);
    }
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setHours(expiresAt.getHours() + duration_hours);
    await c.env.DB.prepare(
      "UPDATE users SET gems_balance = gems_balance - ?, updated_at = ? WHERE id = ?"
    ).bind(gems_allocated, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    await c.env.DB.prepare(`
      INSERT INTO sponsored_content (
        advertiser_id, content_id, gems_allocated, boost_multiplier, status, 
        expires_at, duration_hours, advertiser_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      contentId,
      gems_allocated,
      boost_multiplier,
      "active",
      expiresAt.toISOString(),
      duration_hours,
      user.brand_name || user.display_name || user.username || "Advertiser",
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error creating content sponsorship:", error);
    return c.json({ error: "Failed to create sponsorship" }, 500);
  }
});
app.get("/api/content/:id/metrics", async (c) => {
  try {
    const contentId = c.req.param("id");
    const [likes, comments, shares, moves, externalMoves] = await Promise.all([
      // Count likes from points_transactions table
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM points_transactions WHERE action_type = ? AND reference_id = ? AND reference_type = ?"
      ).bind("like", contentId, "content").first(),
      // Count comments from points_transactions table
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM points_transactions WHERE action_type = ? AND reference_id = ? AND reference_type = ?"
      ).bind("comment", contentId, "content").first(),
      // Count shares from content_shares table
      c.env.DB.prepare(
        "SELECT COUNT(*) as count, COALESCE(SUM(verified_shares), 0) as total_shares FROM content_shares WHERE content_id = ?"
      ).bind(contentId).first(),
      // Count internal moves
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM move_transactions WHERE content_id = ?"
      ).bind(contentId).first(),
      // Count external moves
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM external_moves WHERE content_id = ?"
      ).bind(contentId).first()
    ]);
    const totalEngagement = (likes?.count || 0) + (comments?.count || 0) + (shares?.count || 0);
    const estimatedViews = Math.max(totalEngagement * 50, totalEngagement + 100);
    return c.json({
      likes: likes?.count || 0,
      comments: comments?.count || 0,
      shares: shares?.total_shares || 0,
      views: estimatedViews,
      internal_moves: moves?.count || 0,
      external_moves: externalMoves?.count || 0,
      total_engagement: totalEngagement
    });
  } catch (error) {
    console.error("Error fetching content metrics:", error);
    return c.json({ error: "Failed to fetch metrics" }, 500);
  }
});
app.post("/api/users/social-action", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const { action_type, reference_id, reference_type } = await c.req.json();
    if (!action_type || !reference_id || !reference_type) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    if (action_type === "like" && reference_type === "content") {
      const existingLike = await c.env.DB.prepare(
        "SELECT id FROM user_content_likes WHERE user_id = ? AND content_id = ?"
      ).bind(user.id, reference_id).first();
      if (existingLike) {
        return c.json({ error: "Content already liked" }, 400);
      }
      await c.env.DB.prepare(`
        INSERT INTO user_content_likes (user_id, content_id, created_at)
        VALUES (?, ?, ?)
      `).bind(user.id, reference_id, (/* @__PURE__ */ new Date()).toISOString()).run();
    }
    if (action_type === "save" && reference_type === "content") {
      const existingSave = await c.env.DB.prepare(
        "SELECT id FROM user_saved_content WHERE user_id = ? AND content_id = ?"
      ).bind(user.id, reference_id).first();
      if (existingSave) {
        return c.json({ error: "Content already saved" }, 400);
      }
      await c.env.DB.prepare(`
        INSERT INTO user_saved_content (user_id, content_id, created_at)
        VALUES (?, ?, ?)
      `).bind(user.id, reference_id, (/* @__PURE__ */ new Date()).toISOString()).run();
    }
    const basePoints = {
      like: 0.1,
      comment: 0.3,
      save: 0.5,
      share: 1
    };
    const tierMultipliers = {
      free: 1,
      premium: 1.5,
      super: 2
    };
    const base = basePoints[action_type] || 0.1;
    const multiplier = tierMultipliers[user.user_tier] || 1;
    const pointsEarned = Math.floor(base * multiplier * 10) / 10;
    await c.env.DB.prepare(`
      INSERT INTO points_transactions (
        user_id, action_type, points_earned, reference_id, reference_type,
        base_points, multiplier, user_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      action_type,
      pointsEarned,
      reference_id,
      reference_type,
      base,
      multiplier,
      user.user_tier,
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    await c.env.DB.prepare(
      "UPDATE users SET points_balance = points_balance + ?, updated_at = ? WHERE id = ?"
    ).bind(pointsEarned, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    if (action_type === "share" && reference_type === "content") {
      await c.env.DB.prepare(`
        INSERT INTO content_shares (user_id, content_id, platform, verified_shares, points_earned, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        reference_id,
        "internal",
        // internal share
        1,
        pointsEarned,
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
    }
    if (reference_type === "content") {
      const content = await c.env.DB.prepare(
        "SELECT engagement_shares_remaining FROM content_pieces WHERE id = ?"
      ).bind(reference_id).first();
      if (content && content.engagement_shares_remaining > 0) {
        if (action_type === "comment" || action_type === "share") {
          const existingShare = await c.env.DB.prepare(
            "SELECT id FROM user_engagement_shares WHERE user_id = ? AND content_id = ?"
          ).bind(user.id, reference_id).first();
          if (!existingShare) {
            await c.env.DB.prepare(`
              INSERT INTO user_engagement_shares (user_id, content_id, shares_count, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?)
            `).bind(
              user.id,
              reference_id,
              1,
              (/* @__PURE__ */ new Date()).toISOString(),
              (/* @__PURE__ */ new Date()).toISOString()
            ).run();
            await c.env.DB.prepare(
              "UPDATE content_pieces SET engagement_shares_remaining = engagement_shares_remaining - 1, updated_at = ? WHERE id = ?"
            ).bind((/* @__PURE__ */ new Date()).toISOString(), reference_id).run();
          }
        }
      }
    }
    return c.json({
      success: true,
      points_earned: pointsEarned,
      multiplier,
      base_points: base
    });
  } catch (error) {
    console.error("Error recording social action:", error);
    return c.json({ error: "Failed to record action" }, 500);
  }
});
app.post("/api/users/external-move", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const { move_type, content_id, content_platform, content_url, proof_url, proof_type } = await c.req.json();
    if (!move_type || !proof_url) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    const basePoints = {
      like: 10,
      comment: 30,
      save: 50,
      share: 100,
      repost: 120
    };
    const tierMultipliers = {
      free: 1,
      premium: 1.5,
      super: 2
    };
    const base = basePoints[move_type] || 10;
    const multiplier = tierMultipliers[user.user_tier] || 1;
    const pointsEarned = Math.floor(base * multiplier);
    const keysEarned = Math.ceil(pointsEarned / 20);
    await c.env.DB.prepare(`
      INSERT INTO external_moves (
        user_id, move_type, content_id, content_platform, content_url,
        proof_url, proof_type, points_earned, keys_earned, verification_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      move_type,
      content_id || null,
      content_platform || null,
      content_url || null,
      proof_url,
      proof_type,
      pointsEarned,
      keysEarned,
      "verified",
      // Auto-verify for now
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    await c.env.DB.prepare(
      "UPDATE users SET points_balance = points_balance + ?, keys_balance = keys_balance + ?, updated_at = ? WHERE id = ?"
    ).bind(pointsEarned, keysEarned, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    return c.json({
      success: true,
      points_earned: pointsEarned,
      keys_earned: keysEarned,
      multiplier
    });
  } catch (error) {
    console.error("Error recording external move:", error);
    return c.json({ error: "Failed to record external move" }, 500);
  }
});
app.post("/api/users/share-content", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const { content_id, platform: platform2, share_url } = await c.req.json();
    if (!content_id || !platform2 || !share_url) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    const basePoints = 10;
    const tierMultipliers = {
      free: 1,
      premium: 1.5,
      super: 2
    };
    const multiplier = tierMultipliers[user.user_tier] || 1;
    const pointsEarned = Math.floor(basePoints * multiplier);
    await c.env.DB.prepare(`
      INSERT INTO content_shares (user_id, content_id, platform, share_url, verified_shares, points_earned, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      content_id,
      platform2,
      share_url,
      1,
      pointsEarned,
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    await c.env.DB.prepare(
      "UPDATE users SET points_balance = points_balance + ?, updated_at = ? WHERE id = ?"
    ).bind(pointsEarned, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    return c.json({
      success: true,
      points_earned: pointsEarned,
      multiplier
    });
  } catch (error) {
    console.error("Error recording content share:", error);
    return c.json({ error: "Failed to record share" }, 500);
  }
});
app.post("/api/content/buy-shares", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const { content_id, shares_count } = await c.req.json();
    if (!content_id || !shares_count || shares_count < 1) {
      return c.json({ error: "Invalid purchase data" }, 400);
    }
    const content = await c.env.DB.prepare(
      "SELECT * FROM content_pieces WHERE id = ?"
    ).bind(content_id).first();
    if (!content) {
      return c.json({ error: "Content not found" }, 404);
    }
    if (content.available_shares < shares_count) {
      return c.json({ error: "Not enough shares available" }, 400);
    }
    const totalCost = shares_count * content.share_price;
    await c.env.DB.prepare(`
      INSERT INTO content_investments (
        content_id, investor_id, shares_owned, purchase_price, 
        purchase_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      content_id,
      user.id,
      shares_count,
      totalCost,
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    await c.env.DB.prepare(
      "UPDATE content_pieces SET available_shares = available_shares - ?, updated_at = ? WHERE id = ?"
    ).bind(shares_count, (/* @__PURE__ */ new Date()).toISOString(), content_id).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error buying shares:", error);
    return c.json({ error: "Failed to purchase shares" }, 500);
  }
});
app.put("/api/content/:id", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const contentId = c.req.param("id");
    const existingContent = await c.env.DB.prepare(
      "SELECT * FROM content_pieces WHERE id = ? AND creator_id = ?"
    ).bind(contentId, user.id).first();
    if (!existingContent) {
      return c.json({ error: "Content not found or you do not have permission to edit it" }, 404);
    }
    const body = await c.req.json();
    const validationResult = CreateContentRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({
        error: "Invalid content data",
        details: validationResult.error.errors
      }, 400);
    }
    const contentData = validationResult.data;
    const engagementShares = Math.floor(contentData.total_shares * 0.5);
    const availableShares = contentData.total_shares - engagementShares;
    await c.env.DB.prepare(`
      UPDATE content_pieces SET
        platform = ?, platform_url = ?, title = ?, description = ?, 
        media_url = ?, total_shares = ?, available_shares = ?, 
        engagement_shares_total = ?, share_price = ?, updated_at = ?
      WHERE id = ? AND creator_id = ?
    `).bind(
      contentData.platform,
      contentData.platform_url,
      contentData.title,
      contentData.description || "",
      contentData.media_url || "",
      contentData.total_shares,
      availableShares,
      engagementShares,
      contentData.share_price,
      (/* @__PURE__ */ new Date()).toISOString(),
      contentId,
      user.id
    ).run();
    const updatedContent = await c.env.DB.prepare(`
      SELECT cp.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE cp.id = ?
    `).bind(contentId).first();
    return c.json({
      success: true,
      content: updatedContent
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return c.json({ error: "Failed to update content" }, 500);
  }
});
app.delete("/api/content/:id", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const contentId = c.req.param("id");
    const existingContent = await c.env.DB.prepare(
      "SELECT * FROM content_pieces WHERE id = ? AND creator_id = ?"
    ).bind(contentId, user.id).first();
    if (!existingContent) {
      return c.json({ error: "Content not found or you do not have permission to delete it" }, 404);
    }
    const hasInvestments = await c.env.DB.prepare(
      "SELECT id FROM content_investments WHERE content_id = ? LIMIT 1"
    ).bind(contentId).first();
    const hasShares = await c.env.DB.prepare(
      "SELECT id FROM content_shares WHERE content_id = ? LIMIT 1"
    ).bind(contentId).first();
    if (hasInvestments || hasShares) {
      return c.json({
        error: "Cannot delete content with active investments or shares. Contact support if needed."
      }, 400);
    }
    await c.env.DB.prepare("DELETE FROM content_tips WHERE content_id = ?").bind(contentId).run();
    await c.env.DB.prepare("DELETE FROM content_funding WHERE content_id = ?").bind(contentId).run();
    await c.env.DB.prepare("DELETE FROM user_engagement_shares WHERE content_id = ?").bind(contentId).run();
    await c.env.DB.prepare("DELETE FROM points_transactions WHERE reference_id = ? AND reference_type = ?").bind(contentId, "content").run();
    await c.env.DB.prepare("DELETE FROM content_pieces WHERE id = ? AND creator_id = ?").bind(contentId, user.id).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting content:", error);
    return c.json({ error: "Failed to delete content" }, 500);
  }
});
app.post("/api/content/upload-image", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const { fileName, fileType, fileData } = await c.req.json();
    if (!fileName || !fileType || !fileData) {
      return c.json({ error: "Missing file data" }, 400);
    }
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "");
    const uniqueFileName = `promorang_${timestamp}_${randomId}_${cleanFileName}`;
    console.log("Processing upload for:", uniqueFileName, "Type:", fileType);
    try {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(fileType.toLowerCase())) {
        return c.json({ error: "Invalid file type. Please upload JPG, PNG, GIF, or WEBP images." }, 400);
      }
      const sizeInBytes = fileData.length * 3 / 4;
      const maxSizeBytes = 15 * 1024 * 1024;
      if (sizeInBytes > maxSizeBytes) {
        return c.json({
          error: `File too large (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB). Maximum supported file size is 15MB. Please compress your image.`
        }, 400);
      }
      const user = await getOrCreateUser(mochaUser, c.env.DB);
      if (!user) {
        return c.json({ error: "Failed to get user data" }, 500);
      }
      try {
        console.log("Uploading to HostGator server...");
        const binaryString = atob(fileData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const formData = new FormData();
        const blob = new Blob([bytes], { type: fileType });
        formData.append("file", blob, uniqueFileName);
        formData.append("source", "promorang");
        formData.append("user_id", user.id.toString());
        const uploadResponse = await fetch("https://www.edgeillusions.com/uploads/upload.php", {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(3e4)
          // 30 second timeout
        });
        console.log("HostGator response status:", uploadResponse.status);
        console.log("HostGator response content-type:", uploadResponse.headers.get("content-type"));
        if (uploadResponse.ok) {
          const responseText = await uploadResponse.text();
          console.log("HostGator response text:", responseText);
          try {
            const uploadResult = JSON.parse(responseText);
            if (uploadResult.success && uploadResult.url) {
              const imageUrl2 = uploadResult.url;
              const result2 = await c.env.DB.prepare(`
                INSERT INTO uploaded_images (user_id, filename, file_type, data_url, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
              `).bind(
                user.id,
                uniqueFileName,
                fileType,
                imageUrl2,
                // Store HostGator URL
                (/* @__PURE__ */ new Date()).toISOString(),
                (/* @__PURE__ */ new Date()).toISOString()
              ).run();
              console.log("Image uploaded to HostGator and metadata stored:", result2.meta.last_row_id);
              return c.json({
                success: true,
                imageUrl: imageUrl2,
                imageId: result2.meta.last_row_id,
                originalFileName: fileName,
                storage: "hostgator"
              });
            } else {
              throw new Error(uploadResult.error || `HostGator upload failed: ${JSON.stringify(uploadResult)}`);
            }
          } catch (jsonError) {
            throw new Error(`HostGator returned invalid JSON: ${responseText.substring(0, 200)}...`);
          }
        } else {
          const errorText = await uploadResponse.text();
          console.log("HostGator error response:", errorText);
          throw new Error(`HostGator server returned ${uploadResponse.status}: ${errorText.substring(0, 200)}`);
        }
      } catch (hostgatorError) {
        console.error("HostGator upload failed, falling back to database storage:", hostgatorError);
        const errorMsg = hostgatorError instanceof Error ? hostgatorError.message : String(hostgatorError);
        if (errorMsg.toLowerCase().includes("too large") || errorMsg.toLowerCase().includes("size")) {
          throw hostgatorError;
        }
      }
      console.log("Using database fallback storage...");
      if (sizeInBytes > 5 * 1024 * 1024) {
        throw new Error("File too large for database storage (max 5MB). External server unavailable.");
      }
      const dataUrl = `data:${fileType};base64,${fileData}`;
      const result = await c.env.DB.prepare(`
        INSERT INTO uploaded_images (user_id, filename, file_type, data_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        uniqueFileName,
        fileType,
        dataUrl,
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      console.log("Image stored in database with ID:", result.meta.last_row_id);
      const imageUrl = `/api/images/${result.meta.last_row_id}`;
      return c.json({
        success: true,
        imageUrl,
        imageId: result.meta.last_row_id,
        originalFileName: fileName,
        storage: "database",
        fallback: true,
        fallbackReason: "HostGator server unavailable - using database storage"
      });
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      const getPlatformImage = (filename) => {
        const name = filename.toLowerCase();
        if (name.includes("instagram") || name.includes("insta")) {
          return "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=800&fit=crop&crop=center&auto=format&q=80";
        } else if (name.includes("tiktok") || name.includes("video")) {
          return "https://images.unsplash.com/photo-1558403194-611308249627?w=600&h=800&fit=crop&crop=center&auto=format&q=80";
        } else if (name.includes("youtube") || name.includes("yt")) {
          return "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=450&fit=crop&crop=center&auto=format&q=80";
        } else if (name.includes("twitter") || name.includes("tweet")) {
          return "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop&crop=center&auto=format&q=80";
        } else if (name.includes("linkedin")) {
          return "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=600&fit=crop&crop=center&auto=format&q=80";
        } else {
          return "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center&auto=format&q=80";
        }
      };
      const fallbackUrl = getPlatformImage(fileName);
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Storage failed";
      console.log("Using final fallback placeholder due to error:", errorMessage);
      return c.json({
        success: true,
        imageUrl: fallbackUrl,
        originalFileName: fileName,
        fallback: true,
        fallbackReason: errorMessage.includes("too large") ? "File too large - please use smaller image" : "HostGator server unavailable - using placeholder"
      });
    }
  } catch (error) {
    console.error("Error in image upload:", error);
    return c.json({ error: "Failed to process upload" }, 500);
  }
});
app.get("/api/images/:id", async (c) => {
  try {
    const imageId = c.req.param("id");
    if (!imageId || isNaN(parseInt(imageId))) {
      return c.json({ error: "Invalid image ID" }, 400);
    }
    const image = await c.env.DB.prepare(
      "SELECT data_url, file_type, filename FROM uploaded_images WHERE id = ?"
    ).bind(imageId).first();
    if (!image) {
      return c.json({ error: "Image not found" }, 404);
    }
    if (image.data_url.startsWith("https://")) {
      return Response.redirect(image.data_url, 302);
    }
    const base64Data = image.data_url.split(",")[1];
    if (!base64Data) {
      return c.json({ error: "Invalid image data" }, 400);
    }
    const binaryData = atob(base64Data);
    const uint8Array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    return new Response(uint8Array, {
      headers: {
        "Content-Type": image.file_type,
        "Content-Disposition": `inline; filename="${image.filename}"`,
        "Cache-Control": "public, max-age=31536000",
        // Cache for 1 year
        "Content-Length": uint8Array.length.toString()
      }
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return c.json({ error: "Failed to serve image" }, 500);
  }
});
app.post("/api/content/generate-placeholder", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const { description, platform: platform2 } = await c.req.json();
    console.log("Generating placeholder for:", { description, platform: platform2 });
    const platformImages = {
      instagram: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=800&fit=crop&crop=center&auto=format&q=80",
      tiktok: "https://images.unsplash.com/photo-1558403194-611308249627?w=600&h=800&fit=crop&crop=center&auto=format&q=80",
      youtube: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=450&fit=crop&crop=center&auto=format&q=80",
      twitter: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
      linkedin: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=600&fit=crop&crop=center&auto=format&q=80"
    };
    const imageUrl = platformImages[platform2] || platformImages.instagram;
    return c.json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error("Error generating placeholder:", error);
    return c.json({ error: "Failed to generate placeholder" }, 500);
  }
});
app.post("/api/content", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const body = await c.req.json();
    console.log("Content creation request received:", {
      platform: body.platform,
      title: body.title,
      hasMediaUrl: !!body.media_url,
      totalShares: body.total_shares,
      sharePrice: body.share_price
    });
    const validationResult = CreateContentRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Content validation failed:", {
        errors: validationResult.error.errors,
        receivedData: body
      });
      return c.json({
        error: "Invalid content data",
        details: validationResult.error.errors,
        field_errors: validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code
        }))
      }, 400);
    }
    const contentData = validationResult.data;
    const engagementShares = Math.floor(contentData.total_shares * 0.5);
    const availableShares = contentData.total_shares - engagementShares;
    console.log("Inserting content into database:", {
      userId: user.id,
      username: user.username || user.display_name || "Anonymous",
      platform: contentData.platform,
      title: contentData.title,
      totalShares: contentData.total_shares,
      engagementShares,
      availableShares
    });
    let result;
    try {
      result = await c.env.DB.prepare(`
        INSERT INTO content_pieces (
          creator_id, creator_username, platform, platform_url, title, description, 
          media_url, total_shares, available_shares, engagement_shares_total, 
          engagement_shares_remaining, share_price, current_revenue, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        user.username || user.display_name || "Anonymous",
        contentData.platform,
        contentData.platform_url,
        contentData.title,
        contentData.description || "",
        contentData.media_url || "",
        contentData.total_shares,
        availableShares,
        engagementShares,
        engagementShares,
        contentData.share_price,
        0,
        // initial revenue
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      console.log("Content insertion result:", {
        success: result.success,
        lastRowId: result.meta?.last_row_id,
        changes: result.meta?.changes
      });
      if (!result.success || !result.meta?.last_row_id) {
        throw new Error(`Database insertion failed: ${JSON.stringify(result)}`);
      }
    } catch (dbError) {
      console.error("Database insertion error:", dbError);
      console.error("Database error details:", {
        message: dbError instanceof Error ? dbError.message : "Unknown error",
        stack: dbError instanceof Error ? dbError.stack : "No stack trace"
      });
      throw new Error(`Database operation failed: ${dbError instanceof Error ? dbError.message : "Unknown database error"}`);
    }
    let newContent;
    try {
      newContent = await c.env.DB.prepare(`
        SELECT cp.*, u.username as creator_name, u.avatar_url as creator_avatar
        FROM content_pieces cp
        LEFT JOIN users u ON cp.creator_id = u.id
        WHERE cp.id = ?
      `).bind(result.meta.last_row_id).first();
      if (!newContent) {
        throw new Error("Failed to retrieve newly created content");
      }
      console.log("Content created successfully:", {
        id: newContent.id,
        title: newContent.title,
        creatorId: newContent.creator_id
      });
    } catch (retrieveError) {
      console.error("Error retrieving created content:", retrieveError);
      newContent = {
        id: result.meta.last_row_id,
        title: contentData.title,
        platform: contentData.platform,
        creator_id: user.id
      };
    }
    return c.json({
      success: true,
      content: newContent,
      contentId: result.meta.last_row_id
    }, 201);
  } catch (error) {
    console.error("Error creating content:", error);
    console.error("Content creation error stack:", error instanceof Error ? error.stack : "No stack trace");
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return c.json({
      error: "Failed to create content",
      details: errorMessage,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, 500);
  }
});
app.get("/api/content/:id/comments", async (c) => {
  try {
    const contentId = c.req.param("id");
    const comments = await c.env.DB.prepare(`
      SELECT 
        cc.*,
        u.display_name as user_display_name,
        u.username as user_username,
        u.avatar_url as user_avatar
      FROM content_comments cc
      LEFT JOIN users u ON cc.user_id = u.id
      WHERE cc.content_id = ?
      ORDER BY cc.is_pinned DESC, cc.created_at DESC
    `).bind(contentId).all();
    const commentMap = /* @__PURE__ */ new Map();
    const topLevelComments = [];
    for (const comment of comments.results || []) {
      comment.replies = [];
      comment.has_liked = false;
      commentMap.set(comment.id, comment);
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    }
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (sessionToken) {
      try {
        const mochaUser = await getCurrentUser(sessionToken, {
          apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
          apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
        });
        if (mochaUser) {
          const user = await getOrCreateUser(mochaUser, c.env.DB);
          if (user) {
            const likedComments = await c.env.DB.prepare(`
              SELECT comment_id FROM comment_likes WHERE user_id = ?
            `).bind(user.id).all();
            const likedSet = new Set((likedComments.results || []).map((like) => like.comment_id));
            const updateLikeStatus = (comment) => {
              comment.has_liked = likedSet.has(comment.id);
              comment.replies?.forEach(updateLikeStatus);
            };
            topLevelComments.forEach(updateLikeStatus);
          }
        }
      } catch (authError) {
      }
    }
    return c.json(topLevelComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});
app.post("/api/content/:id/comments", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const contentId = c.req.param("id");
    const { comment_text, parent_comment_id } = await c.req.json();
    if (!comment_text?.trim()) {
      return c.json({ error: "Comment text is required" }, 400);
    }
    const result = await c.env.DB.prepare(`
      INSERT INTO content_comments (content_id, user_id, comment_text, parent_comment_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      contentId,
      user.id,
      comment_text.trim(),
      parent_comment_id || null,
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    const basePoints = 0.3;
    const tierMultipliers = { free: 1, premium: 1.5, super: 2 };
    const multiplier = tierMultipliers[user.user_tier] || 1;
    const pointsEarned = Math.floor(basePoints * multiplier * 10) / 10;
    await c.env.DB.prepare(`
      INSERT INTO points_transactions (
        user_id, action_type, points_earned, reference_id, reference_type,
        base_points, multiplier, user_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      "comment",
      pointsEarned,
      contentId,
      "content",
      basePoints,
      multiplier,
      user.user_tier,
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    await c.env.DB.prepare(
      "UPDATE users SET points_balance = points_balance + ?, updated_at = ? WHERE id = ?"
    ).bind(pointsEarned, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
    return c.json({ success: true, comment_id: result.meta.last_row_id });
  } catch (error) {
    console.error("Error posting comment:", error);
    return c.json({ error: "Failed to post comment" }, 500);
  }
});
app.post("/api/content/comments/:id/like", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const commentId = c.req.param("id");
    const existingLike = await c.env.DB.prepare(
      "SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?"
    ).bind(user.id, commentId).first();
    if (existingLike) {
      await c.env.DB.prepare(
        "DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?"
      ).bind(user.id, commentId).run();
      await c.env.DB.prepare(
        "UPDATE content_comments SET likes_count = likes_count - 1 WHERE id = ?"
      ).bind(commentId).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO comment_likes (user_id, comment_id, created_at)
        VALUES (?, ?, ?)
      `).bind(user.id, commentId, (/* @__PURE__ */ new Date()).toISOString()).run();
      await c.env.DB.prepare(
        "UPDATE content_comments SET likes_count = likes_count + 1 WHERE id = ?"
      ).bind(commentId).run();
    }
    return c.json({ success: true });
  } catch (error) {
    console.error("Error liking comment:", error);
    return c.json({ error: "Failed to like comment" }, 500);
  }
});
app.delete("/api/content/comments/:id", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const commentId = c.req.param("id");
    const comment = await c.env.DB.prepare(`
      SELECT cc.*, cp.creator_id as content_creator_id
      FROM content_comments cc
      LEFT JOIN content_pieces cp ON cc.content_id = cp.id
      WHERE cc.id = ?
    `).bind(commentId).first();
    if (!comment) {
      return c.json({ error: "Comment not found" }, 404);
    }
    if (comment.user_id !== user.id && comment.content_creator_id !== user.id) {
      return c.json({ error: "Not authorized to delete this comment" }, 403);
    }
    await c.env.DB.prepare("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM content_comments WHERE id = ? OR parent_comment_id = ?)").bind(commentId, commentId).run();
    await c.env.DB.prepare("DELETE FROM content_comments WHERE id = ? OR parent_comment_id = ?").bind(commentId, commentId).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return c.json({ error: "Failed to delete comment" }, 500);
  }
});
app.post("/api/content/comments/:id/pin", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const commentId = c.req.param("id");
    const comment = await c.env.DB.prepare(`
      SELECT cc.*, cp.creator_id as content_creator_id
      FROM content_comments cc
      LEFT JOIN content_pieces cp ON cc.content_id = cp.id
      WHERE cc.id = ?
    `).bind(commentId).first();
    if (!comment || comment.content_creator_id !== user.id) {
      return c.json({ error: "Not authorized to pin this comment" }, 403);
    }
    await c.env.DB.prepare(
      "UPDATE content_comments SET is_pinned = NOT is_pinned WHERE id = ?"
    ).bind(commentId).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error pinning comment:", error);
    return c.json({ error: "Failed to pin comment" }, 500);
  }
});
app.get("/api/users/saved-content", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const savedContent = await c.env.DB.prepare(`
      SELECT 
        usc.*,
        cp.title as content_title,
        cp.platform as content_platform,
        cp.platform_url as content_url,
        u.display_name as creator_name,
        u.avatar_url as creator_avatar
      FROM user_saved_content usc
      LEFT JOIN content_pieces cp ON usc.content_id = cp.id
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE usc.user_id = ?
      ORDER BY usc.created_at DESC
    `).bind(user.id).all();
    return c.json(savedContent.results || []);
  } catch (error) {
    console.error("Error fetching saved content:", error);
    return c.json({ error: "Failed to fetch saved content" }, 500);
  }
});
app.delete("/api/users/saved-content/:id", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    const contentId = c.req.param("id");
    await c.env.DB.prepare(
      "DELETE FROM user_saved_content WHERE user_id = ? AND content_id = ?"
    ).bind(user.id, contentId).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error removing saved content:", error);
    return c.json({ error: "Failed to remove saved content" }, 500);
  }
});
app.get("/api/users/public/:username", async (c) => {
  try {
    const username = c.req.param("username");
    if (!username) {
      return c.json({ error: "Username required" }, 400);
    }
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE username = ?"
    ).bind(username).first();
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    const userContent = await c.env.DB.prepare(`
      SELECT cp.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE cp.creator_id = ?
      ORDER BY cp.created_at DESC
      LIMIT 20
    `).bind(user.id).all();
    const userDrops = await c.env.DB.prepare(`
      SELECT d.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.creator_id = ?
      ORDER BY d.created_at DESC
      LIMIT 20
    `).bind(user.id).all();
    const leaderboardPosition = await c.env.DB.prepare(`
      SELECT 
        rank_position as daily_rank, composite_score
      FROM leaderboard_scores 
      WHERE user_id = ? AND period_type = 'daily'
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(user.id).first();
    return c.json({
      user,
      content: userContent.results || [],
      drops: userDrops.results || [],
      leaderboard_position: leaderboardPosition
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});
app.get("/api/advertisers/suggested-content", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    if (user.user_type !== "advertiser") {
      return c.json({ error: "Only advertisers can view content suggestions" }, 403);
    }
    const suggestions = await c.env.DB.prepare(`
      SELECT 
        cp.*,
        u.username as creator_name,
        u.display_name as creator_display_name,
        u.avatar_url as creator_avatar,
        u.follower_count as creator_followers,
        COALESCE(likes.like_count, 0) as like_count,
        COALESCE(comments.comment_count, 0) as comment_count,
        COALESCE(shares.share_count, 0) as share_count,
        COALESCE(moves.move_count, 0) as move_count,
        (COALESCE(likes.like_count, 0) + COALESCE(comments.comment_count, 0) * 3 + COALESCE(shares.share_count, 0) * 5 + COALESCE(moves.move_count, 0) * 2) as engagement_score,
        julianday('now') - julianday(cp.created_at) as days_old,
        CASE 
          WHEN julianday('now') - julianday(cp.created_at) <= 1 THEN 1.5
          WHEN julianday('now') - julianday(cp.created_at) <= 3 THEN 1.2
          WHEN julianday('now') - julianday(cp.created_at) <= 7 THEN 1.0
          ELSE 0.8
        END as freshness_multiplier,
        COALESCE(active_sponsors.sponsor_count, 0) as current_sponsor_count,
        COALESCE(active_sponsors.total_boost, 0) as current_boost_multiplier
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      LEFT JOIN (
        SELECT reference_id, COUNT(*) as like_count
        FROM points_transactions 
        WHERE action_type = 'like' AND reference_type = 'content'
        GROUP BY reference_id
      ) likes ON cp.id = likes.reference_id
      LEFT JOIN (
        SELECT reference_id, COUNT(*) as comment_count
        FROM points_transactions 
        WHERE action_type = 'comment' AND reference_type = 'content'
        GROUP BY reference_id
      ) comments ON cp.id = comments.reference_id
      LEFT JOIN (
        SELECT content_id, COUNT(*) as share_count
        FROM content_shares
        GROUP BY content_id
      ) shares ON cp.id = shares.content_id
      LEFT JOIN (
        SELECT content_id, COUNT(*) as move_count
        FROM move_transactions
        WHERE content_id IS NOT NULL
        GROUP BY content_id
      ) moves ON cp.id = moves.content_id
      LEFT JOIN (
        SELECT 
          content_id, 
          COUNT(*) as sponsor_count,
          SUM(boost_multiplier) as total_boost
        FROM sponsored_content 
        WHERE status = 'active' AND expires_at > datetime('now')
        GROUP BY content_id
      ) active_sponsors ON cp.id = active_sponsors.content_id
      WHERE cp.creator_id != ? 
        AND cp.id NOT IN (
          SELECT content_id 
          FROM sponsored_content 
          WHERE advertiser_id = ? AND status = 'active' AND expires_at > datetime('now')
        )
        AND cp.created_at >= datetime('now', '-30 days')
      ORDER BY 
        (engagement_score * freshness_multiplier) DESC,
        cp.created_at DESC
      LIMIT 12
    `).bind(user.id, user.id).all();
    const enrichedSuggestions = (suggestions.results || []).map((content) => {
      const totalActions = content.like_count + content.comment_count + content.share_count + content.move_count;
      const estimatedViews = Math.max(totalActions * 20, 100);
      const engagementRate = totalActions > 0 ? totalActions / estimatedViews * 100 : 0;
      const roiPotential = Math.min(engagementRate * 10, 100);
      let suggestedPackage = "quick-boost";
      if (content.engagement_score > 50) suggestedPackage = "viral-campaign";
      else if (content.engagement_score > 30) suggestedPackage = "premium-spotlight";
      else if (content.engagement_score > 15) suggestedPackage = "daily-featured";
      else if (content.engagement_score > 5) suggestedPackage = "popular-boost";
      return {
        ...content,
        engagement_rate: Math.round(engagementRate * 10) / 10,
        roi_potential: Math.round(roiPotential),
        estimated_views: estimatedViews,
        suggested_package: suggestedPackage,
        total_engagement: totalActions,
        competition_level: content.current_sponsor_count > 0 ? "High" : totalActions > 20 ? "Medium" : "Low"
      };
    });
    return c.json(enrichedSuggestions);
  } catch (error) {
    console.error("Error fetching suggested content:", error);
    return c.json({ error: "Failed to fetch content suggestions" }, 500);
  }
});
app.get("/api/advertisers/dashboard", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: "Failed to get user data" }, 500);
    }
    if (user.user_type !== "advertiser") {
      return c.json({ error: "Only advertisers can view dashboard" }, 403);
    }
    const drops = await c.env.DB.prepare(`
      SELECT d.*, 
             COUNT(da.id) as total_applications,
             SUM(CASE WHEN da.status = 'completed' THEN da.gems_earned ELSE 0 END) as gems_paid
      FROM drops d
      LEFT JOIN drop_applications da ON d.id = da.drop_id
      WHERE d.creator_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `).bind(user.id).all();
    const analytics = await c.env.DB.prepare(`
      SELECT * FROM advertiser_analytics
      WHERE advertiser_id = ?
      ORDER BY period_start DESC
      LIMIT 10
    `).bind(user.id).all();
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const monthlyInventory = await c.env.DB.prepare(`
      SELECT * FROM advertiser_inventory 
      WHERE advertiser_id = ? AND period_type = 'monthly' AND period_start = ?
    `).bind(user.id, monthStart).first();
    const weekStart = /* @__PURE__ */ new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weeklyInventory = await c.env.DB.prepare(`
      SELECT * FROM advertiser_inventory 
      WHERE advertiser_id = ? AND period_type = 'weekly' AND period_start = ?
    `).bind(user.id, weekStartStr).first();
    return c.json({
      drops: drops.results || [],
      analytics: analytics.results || [],
      user_tier: user.user_tier,
      monthly_inventory: monthlyInventory,
      weekly_inventory: weeklyInventory
    });
  } catch (error) {
    console.error("Error fetching advertiser dashboard:", error);
    return c.json({ error: "Failed to fetch dashboard data" }, 500);
  }
});
app.get("/api/users/public/id/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    if (!userId || isNaN(parseInt(userId))) {
      return c.json({ error: "Valid user ID required" }, 400);
    }
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(userId).first();
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    const userContent = await c.env.DB.prepare(`
      SELECT cp.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE cp.creator_id = ?
      ORDER BY cp.created_at DESC
      LIMIT 20
    `).bind(user.id).all();
    const userDrops = await c.env.DB.prepare(`
      SELECT d.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.creator_id = ?
      ORDER BY d.created_at DESC
      LIMIT 20
    `).bind(user.id).all();
    const leaderboardPosition = await c.env.DB.prepare(`
      SELECT 
        rank_position as daily_rank, composite_score
      FROM leaderboard_scores 
      WHERE user_id = ? AND period_type = 'daily'
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(user.id).first();
    return c.json({
      user,
      content: userContent.results || [],
      drops: userDrops.results || [],
      leaderboard_position: leaderboardPosition
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});
app.get("/api/content/:id/user-status", async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (!sessionToken) {
      return c.json({ has_liked: false, has_saved: false });
    }
    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
    if (!mochaUser) {
      return c.json({ has_liked: false, has_saved: false });
    }
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ has_liked: false, has_saved: false });
    }
    const contentId = c.req.param("id");
    const [likeStatus, saveStatus] = await Promise.all([
      c.env.DB.prepare("SELECT id FROM user_content_likes WHERE user_id = ? AND content_id = ?").bind(user.id, contentId).first(),
      c.env.DB.prepare("SELECT id FROM user_saved_content WHERE user_id = ? AND content_id = ?").bind(user.id, contentId).first()
    ]);
    return c.json({
      has_liked: !!likeStatus,
      has_saved: !!saveStatus
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    return c.json({ has_liked: false, has_saved: false });
  }
});
const index = {
  fetch: app.fetch.bind(app)
};
const workerEntry = index ?? {};
export {
  workerEntry as default
};
