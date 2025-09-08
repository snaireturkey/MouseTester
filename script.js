// ------- State -------
let dblThresholdMs = 70;
let reverseWindowMs = 80;
let isDarkTheme = true;
let currentLang = 'ru'; // ru или en
let testMode = 'mouse'; // mouse или keyboard

const logs = []; // newest first (limit 1000)
const doubleCounts = {}; // будет инициализироваться динамически
const wheelStats = { reversals: 0, total: 0 };

const lastDown = { 0: 0, 1: 0, 2: 0 }; // per-button last mousedown time
const lastWheel = { t: 0, sign: 0 };
let wheelIdleTimer = null;
let reversalNotificationActive = false; // флаг для предотвращения множественных уведомлений
let doubleClickNotificationActive = false; // флаг для предотвращения множественных уведомлений двойного клика

// Переводы
const translations = {
  ru: {
    title: 'Mouse & Keyboard Tester',
    clear: '🗑️ Очистить',
    export: '📥 Экспорт',
    lightTheme: '☀️ Светлая',
    darkTheme: '🌙 Темная',
    lang: '🇷🇺 Русский',
    modeMouseTest: '🖱️ Мышь',
    modeKeyboardTest: '⌨️ Клавиатура',
    doubleClickSpeed: 'Скорость двойного клика:',
    ms: 'мс',
    wheelSettings: 'Настройки колесика:',
    reversalWindow: 'Окно обращения:',
    mouseButtons: 'Кнопки мыши',
    wheelScroll: 'Прокрутка колеса',
    reversals: 'Обращения',
    keyboard: 'Клавиатура',
    logs: 'Логи (последние 1000)',
    time: 'Время',
    event: 'Событие', 
    details: 'Детали',
    noEvents: 'Нет событий — начните тест.',
    leftClick: 'ЛКМ',
    middleClick: 'СКМ',
    rightClick: 'ПКМ',
    mouseDown: 'Нажатие',
    mouseUp: 'Отпускание',
    doubleClick: 'Двойной клик',
    wheelUp: 'Колесо вверх',
    wheelDown: 'Колесо вниз',
    wheelReversal: 'Реверс колеса',
    keyDown: 'Нажатие клавиши',
    keyUp: 'Отпускание клавиши',
    adBlock: 'Рекламный блок (300x250 / адаптивный)',
    topBanner: 'Рекламный баннер (728x90 / адаптивный)',
    exportTitle: 'Отчет тестирования мыши',
    exportDate: 'Дата:',
    exportStats: 'СТАТИСТИКА:',
    exportDoubleClicks: 'Двойные клики',
    exportWheelSteps: 'Шагов колеса:',
    exportWheelReversals: 'Реверсы колеса:',
    exportReversalRate: 'Доля реверсов:',
    exportLogs: 'ЛОГИ СОБЫТИЙ:',
    parameters: 'Параметры',
    statistics: 'Статистика', 
    testZone: 'Зона теста мыши',
    testZoneDescription: 'Кликайте ЛКМ/СКМ/ПКМ и прокручивайте колесо. Контекстное меню и автоскролл отключены внутри этой зоны.',
    footer: 'Все права защищены.<br>2025',
    doubleClickThreshold: 'Порог двойного клика (мс)',
    doubleClickHelp: 'Максимальный интервал между кликами для регистрации двойного клика. Стандартно: 150-250мс.',
    reverseWindowLabel: 'Окно реверса колеса (мс)',
    reverseWindowHelp: 'Если направление меняется быстрее этого окна — фиксируем реверс.',
    doubleClicksLMB: 'Даббл-клики ЛКМ:',
    doubleClicksMMB: 'Даббл-клики СКМ:',
    doubleClicksRMB: 'Даббл-клики ПКМ:',
    wheelStepsCount: 'Кол-во шагов колеса:',
    wheelReversalsCount: 'Реверсы колеса:',
    hintLeftButton: 'Левая кнопка:',
    hintLeftText: 'быстро кликайте для теста двойного клика',
    hintMiddleButton: 'Средняя кнопка:',
    hintMiddleText: 'проверьте работу колесика как кнопки',
    hintRightButton: 'Правая кнопка:',
    hintRightText: 'контекстное меню отключено',
    hintWheel: 'Колесо:',
    hintWheelText: 'меняйте направление для теста реверсов',
    wheel: 'Колесо'
  },
  en: {
    title: 'Mouse & Keyboard Tester',
    clear: '🗑️ Clear',
    export: '📥 Export',
    lightTheme: '☀️ Light',
    darkTheme: '🌙 Dark',
    lang: '🇺🇸 English',
    modeMouseTest: '🖱️ Mouse',
    modeKeyboardTest: '⌨️ Keyboard',
    doubleClickSpeed: 'Double Click Speed:',
    ms: 'ms',
    wheelSettings: 'Wheel Settings:',
    reversalWindow: 'Reversal Window:',
    mouseButtons: 'Mouse Buttons',
    wheelScroll: 'Wheel Scroll',
    reversals: 'Reversals',
    keyboard: 'Keyboard',
    logs: 'Logs (last 1000)',
    time: 'Time',
    event: 'Event',
    details: 'Details',
    noEvents: 'No events — start testing.',
    leftClick: 'LMB',
    middleClick: 'MMB',
    rightClick: 'RMB',
    mouseDown: 'Press',
    mouseUp: 'Release',
    doubleClick: 'Double Click',
    wheelUp: 'Wheel Up',
    wheelDown: 'Wheel Down',
    wheelReversal: 'Wheel Reversal',
    keyDown: 'Key Down',
    keyUp: 'Key Up',
    adBlock: 'Advertisement Block (300x250 / Responsive)',
    topBanner: 'Advertisement Banner (728x90 / Responsive)',
    exportTitle: 'Mouse Testing Report',
    exportDate: 'Date:',
    exportStats: 'STATISTICS:',
    exportDoubleClicks: 'Double clicks',
    exportWheelSteps: 'Wheel steps:',
    exportWheelReversals: 'Wheel reversals:',
    exportReversalRate: 'Reversal rate:',
    exportLogs: 'EVENT LOGS:',
    parameters: 'Parameters',
    statistics: 'Statistics',
    testZone: 'Mouse Test Zone',
    testZoneDescription: 'Click LMB/MMB/RMB and scroll the wheel. Context menu and auto-scroll are disabled within this zone.',
    footer: 'All rights reserved.<br>2025',
    doubleClickThreshold: 'Double click threshold (ms)',
    doubleClickHelp: 'Maximum interval between clicks to register a double click. Standard: 150-250ms.',
    reverseWindowLabel: 'Wheel reversal window (ms)',
    reverseWindowHelp: 'If direction changes faster than this window — register reversal.',
    doubleClicksLMB: 'Double-clicks LMB:',
    doubleClicksMMB: 'Double-clicks MMB:',
    doubleClicksRMB: 'Double-clicks RMB:',
    wheelStepsCount: 'Wheel steps count:',
    wheelReversalsCount: 'Wheel reversals:',
    hintLeftButton: 'Left Button:',
    hintLeftText: 'click quickly to test double-click',
    hintMiddleButton: 'Middle Button:',
    hintMiddleText: 'test wheel as button functionality',
    hintRightButton: 'Right Button:',
    hintRightText: 'context menu is disabled',
    hintWheel: 'Wheel:',
    hintWheelText: 'change direction to test reversals',
    wheel: 'Wheel'
  }
};

// ------- Elements -------
let elDblThreshold, elRevWindow, elDblL, elDblM, elDblR, elWheelTotal, elWheelRev;
let testArea, notificationArea, indL, indM, indR, wheelLabel, arrowUp, arrowDown;
let logBody, btnReset, btnExport, btnTheme, btnLang;

// ------- Utils -------
const now = () => Date.now();
const fmtTime = (ms) => {
  const date = new Date(ms);
  return date.toLocaleTimeString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { hour12: false });
};

const fmtTimeForExport = (ms) => {
  const date = new Date(ms);
  return date.toLocaleTimeString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { hour12: false });
};

function showDoubleClickNotification(buttonLabel) {
  if (doubleClickNotificationActive) return; // не показываем если уже активно
  
  doubleClickNotificationActive = true;
  const t = translations[currentLang];
  
  // Создаем специальное уведомление в центре зоны теста
  const notification = document.createElement('div');
  notification.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-red-600 text-white rounded-xl text-lg font-bold shadow-2xl z-20 opacity-0 scale-50 transition-all duration-300';
  notification.textContent = `${t.doubleClick} ${buttonLabel}!`;
  notification.id = 'doubleclick-notification';
  
  testArea.appendChild(notification);
  
  // Анимация появления
  setTimeout(() => {
    notification.classList.remove('opacity-0', 'scale-50');
    notification.classList.add('opacity-100', 'scale-100');
  }, 10);
  
  // Убираем уведомление через 1.5 секунды
  setTimeout(() => {
    notification.classList.add('opacity-0', 'scale-50');
    setTimeout(() => {
      const existingNotification = document.getElementById('doubleclick-notification');
      if (existingNotification) {
        existingNotification.remove();
      }
      doubleClickNotificationActive = false;
    }, 300);
  }, 1500);
}

function showReversalNotification() {
  if (reversalNotificationActive) return; // не показываем если уже активно
  
  reversalNotificationActive = true;
  const t = translations[currentLang];
  
  // Создаем специальное уведомление в центре зоны теста
  const notification = document.createElement('div');
  notification.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-orange-600 text-white rounded-xl text-lg font-bold shadow-2xl z-20 opacity-0 scale-50 transition-all duration-300';
  notification.textContent = t.wheelReversal;
  notification.id = 'reversal-notification';
  
  testArea.appendChild(notification);
  
  // Анимация появления
  setTimeout(() => {
    notification.classList.remove('opacity-0', 'scale-50');
    notification.classList.add('opacity-100', 'scale-100');
  }, 10);
  
  // Убираем уведомление через 1.5 секунды
  setTimeout(() => {
    notification.classList.add('opacity-0', 'scale-50');
    setTimeout(() => {
      const existingNotification = document.getElementById('reversal-notification');
      if (existingNotification) {
        existingNotification.remove();
      }
      reversalNotificationActive = false;
    }, 300);
  }, 1500);
}

function showNotification(message, type = 'default') {
  const notification = document.createElement('div');
  const bgColor = type === 'doubleclick' ? 'bg-red-600' : 
                 type === 'reversal' ? 'bg-orange-600' : 'bg-blue-600';
  
  notification.className = `px-3 py-2 ${bgColor} text-white rounded-lg text-sm font-medium shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
  notification.textContent = message;
  
  notificationArea.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full', 'opacity-0');
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    notification.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 2000);
}

function playNotificationSound(type) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Разные частоты для разных типов событий
    const frequency = type === 'doubleclick' ? 800 : type === 'reversal' ? 600 : 500;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Короткий звук
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Звук не критичен, игнорируем ошибки
  }
}

function updateInterface() {
  const t = translations[currentLang];
  
  // Обновляем заголовок
  document.querySelector('h1').textContent = t.title;
  
  // Обновляем кнопки
  btnReset.textContent = t.clear;
  btnExport.textContent = t.export;
  btnLang.textContent = t.lang;
  
  // Обновляем кнопку темы
  if (isDarkTheme) {
    btnTheme.textContent = t.lightTheme;
  } else {
    btnTheme.textContent = t.darkTheme;
  }
  
  // Обновляем заголовки секций
  const h2Elements = document.querySelectorAll('h2');
  if (h2Elements.length >= 4) {
    h2Elements[0].textContent = t.parameters;  // Параметры
    h2Elements[1].textContent = t.statistics;  // Статистика
    h2Elements[2].textContent = t.testZone;    // Зона теста мыши
    h2Elements[3].textContent = t.logs;        // Логи
  }
  
  // Обновляем описание зоны теста
  const testZoneDesc = document.querySelector('#test-area p');
  if (testZoneDesc) {
    testZoneDesc.textContent = t.testZoneDescription;
  }
  
  // Обновляем подсказки (теперь они в последней сетке)
  const hintsContainer = document.querySelector('#test-area .grid.grid-cols-1.sm\\:grid-cols-2 ');
  if (hintsContainer) {
    const hints = hintsContainer.querySelectorAll('div');
    if (hints.length >= 4) {
      hints[0].innerHTML = `💡 <strong>${t.hintLeftButton}</strong> ${t.hintLeftText}`;
      hints[1].innerHTML = `💡 <strong>${t.hintMiddleButton}</strong> ${t.hintMiddleText}`;
      hints[2].innerHTML = `💡 <strong>${t.hintRightButton}</strong> ${t.hintRightText}`;
      hints[3].innerHTML = `💡 <strong>${t.hintWheel}</strong> ${t.hintWheelText}`;
    }
  }
  
  // Обновляем индикаторы кнопок мыши
  const lmbIndicator = document.querySelector('#ind-lmb span');
  const mmbIndicator = document.querySelector('#ind-mmb span');
  const rmbIndicator = document.querySelector('#ind-rmb span');
  if (lmbIndicator) lmbIndicator.textContent = t.leftClick;
  if (mmbIndicator) mmbIndicator.textContent = t.middleClick;
  if (rmbIndicator) rmbIndicator.textContent = t.rightClick;

  // Обновляем лейбл колеса
  if (wheelLabel) wheelLabel.textContent = t.wheel;

  // Обновляем заголовки таблицы
  const tableHeaders = document.querySelectorAll('th');
  if (tableHeaders.length >= 3) {
    tableHeaders[0].textContent = t.time;
    tableHeaders[1].textContent = t.event;
    tableHeaders[2].textContent = t.details;
  }
  
  // Обновляем верхний баннер
  const topBannerTexts = document.querySelectorAll('.bg-slate-800\\/60');
  if (topBannerTexts.length >= 2) {
    topBannerTexts[0].textContent = t.topBanner; // верхний баннер
    topBannerTexts[1].textContent = t.adBlock;   // нижний блок
  }
  
  // Обновляем footer
  const footerText = document.querySelector('footer p');
  if (footerText) {
    footerText.innerHTML = t.footer;
  }
  
  // Обновляем лейблы параметров
  const dblThresholdInput = document.querySelector('input[id="dbl-threshold"]');
  if (dblThresholdInput && dblThresholdInput.previousElementSibling) {
    dblThresholdInput.previousElementSibling.textContent = t.doubleClickThreshold;
  }
  
  const reverseWindowInput = document.querySelector('input[id="reverse-window"]');
  if (reverseWindowInput && reverseWindowInput.previousElementSibling) {
    reverseWindowInput.previousElementSibling.textContent = t.reverseWindowLabel;
  }
  
  // Обновляем подсказки
  const dblThresholdHelp = document.querySelector('input[id="dbl-threshold"]')?.nextElementSibling;
  if (dblThresholdHelp) {
    dblThresholdHelp.textContent = t.doubleClickHelp;
  }
  
  const reverseWindowHelp = document.querySelector('input[id="reverse-window"]')?.nextElementSibling;
  if (reverseWindowHelp) {
    reverseWindowHelp.textContent = t.reverseWindowHelp;
  }
  
  // Обновляем статистику
  const statLabels = document.querySelectorAll('li span:first-child');
  if (statLabels.length >= 5) {
    statLabels[0].textContent = t.doubleClicksLMB;
    statLabels[1].textContent = t.doubleClicksMMB;
    statLabels[2].textContent = t.doubleClicksRMB;
    statLabels[3].textContent = t.wheelStepsCount;
    statLabels[4].textContent = t.wheelReversalsCount;
  }
  
  // Обновляем счетчики двойных кликов
  updateDoubleCounts();
  
  // Перерендерим логи
  renderLogs();
}

function pushLog(item) {
  logs.unshift(item);
  if (logs.length > 1000) logs.pop();
  renderLogs();
}

function renderLogs() {
  const t = translations[currentLang];
  if (logs.length === 0) {
    logBody.innerHTML = `<tr><td class="py-2 text-slate-500 text-center" colspan="3">${t.noEvents}</td></tr>`;
    return;
  }
  const rows = logs.map((l) => {
    const { event, details, isSpecial } = formatLogEvent(l);
    const rowClass = isSpecial ? 'border-t border-slate-200 dark:border-slate-800/60 bg-red-100 dark:bg-red-900/20' : 'border-t border-slate-200 dark:border-slate-800/60';
    const textClass = isSpecial ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-300';
    return `<tr class="${rowClass}">
      <td class="py-1 font-mono text-xs text-center w-24">${fmtTime(l.t)}</td>
      <td class="py-1 text-center w-24 ${isSpecial ? 'text-red-600 dark:text-red-400 font-semibold' : ''}">${event}</td>
      <td class="py-1 text-center ${textClass} whitespace-nowrap min-w-0">${details}</td>
    </tr>`;
  }).join('');
  logBody.innerHTML = rows;
}

function updateDoubleCounts() {
  const t = translations[currentLang];
  // Инициализируем счетчики с правильными ключами для текущего языка
  if (!doubleCounts[t.leftClick]) {
    doubleCounts[t.leftClick] = 0;
    doubleCounts[t.middleClick] = 0;
    doubleCounts[t.rightClick] = 0;
  }
}

function updateStats() {
  const t = translations[currentLang];
  elDblL.textContent = String(doubleCounts[t.leftClick] || 0);
  elDblM.textContent = String(doubleCounts[t.middleClick] || 0);
  elDblR.textContent = String(doubleCounts[t.rightClick] || 0);
  elWheelTotal.textContent = String(wheelStats.total);
  elWheelRev.textContent = String(wheelStats.reversals);
}

function setIndicator(el, active) {
  const dot = el.querySelector('span.size-3');
  
  if (active) {
    // Активное состояние - зеленый цвет для всего индикатора
    el.classList.remove('border-slate-200', 'dark:border-slate-800', 'bg-slate-50', 'dark:bg-slate-900');
    el.classList.add('border-emerald-500', 'bg-emerald-500/10');
    
    if (dot) {
      dot.classList.remove('bg-slate-300', 'dark:bg-slate-700');
      dot.classList.add('bg-emerald-500');
    }
  } else {
    // Неактивное состояние - возвращаем базовые классы
    el.classList.remove('border-emerald-500', 'bg-emerald-500/10');
    el.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-slate-50', 'dark:bg-slate-900');
    
    if (dot) {
      dot.classList.remove('bg-emerald-500');
      dot.classList.add('bg-slate-300', 'dark:bg-slate-700');
    }
  }
}

function setWheelArrow(dir) {
  // Очищаем все состояния
  arrowUp.classList.remove('border-emerald-500', 'bg-emerald-500/10', 'border-slate-800', 'bg-slate-900');
  arrowDown.classList.remove('border-emerald-500', 'bg-emerald-500/10', 'border-slate-800', 'bg-slate-900');
  
  // Восстанавливаем базовые классы
  arrowUp.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-slate-50', 'dark:bg-slate-900');
  arrowDown.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-slate-50', 'dark:bg-slate-900');
  
  // Применяем активное состояние
  if (dir === 'up') {
    arrowUp.classList.remove('border-slate-200', 'dark:border-slate-800', 'bg-slate-50', 'dark:bg-slate-900');
    arrowUp.classList.add('border-emerald-500', 'bg-emerald-500/10');
  } else if (dir === 'down') {
    arrowDown.classList.remove('border-slate-200', 'dark:border-slate-800', 'bg-slate-50', 'dark:bg-slate-900');
    arrowDown.classList.add('border-emerald-500', 'bg-emerald-500/10');
  }
}

function resetAll() {
  logs.length = 0;
  const t = translations[currentLang];
  doubleCounts[t.leftClick] = doubleCounts[t.middleClick] = doubleCounts[t.rightClick] = 0;
  wheelStats.reversals = 0; wheelStats.total = 0;
  renderLogs(); updateStats();
}

function updateTheme() {
  const html = document.documentElement;
  if (isDarkTheme) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

function buttonLabel(button) {
  const t = translations[currentLang];
  return button === 0 ? t.leftClick : button === 1 ? t.middleClick : t.rightClick;
}

function onMouseDown(e) {
  e.preventDefault(); // предотвращаем поведение по умолчанию
  const t = now();
  const btn = e.button;
  const prev = lastDown[btn];
  const delta = t - prev;
  if (prev && delta <= dblThresholdMs) {
    const label = buttonLabel(btn);
    doubleCounts[label]++;
    // Добавляем двойной клик в логи с временем между нажатиями
    pushLog({ t, type: 'double-click', details: { button: label, deltaMs: delta } });
    showDoubleClickNotification(label);
    updateStats();
  } else {
    pushLog({ t, type: 'click-down', details: { button: buttonLabel(btn) } });
  }
  lastDown[btn] = t;
  
  // Visual feedback
  if (btn === 0) setIndicator(indL, true);
  else if (btn === 1) setIndicator(indM, true);
  else if (btn === 2) setIndicator(indR, true);
}

function onMouseUp(e) {
  e.preventDefault(); // предотвращаем поведение по умолчанию
  const t = now();
  const btn = e.button;
  pushLog({ t, type: 'click-up', details: { button: buttonLabel(btn) } });
  
  // Visual feedback
  if (btn === 0) setIndicator(indL, false);
  else if (btn === 1) setIndicator(indM, false);
  else if (btn === 2) setIndicator(indR, false);
}

function formatLogEvent(log) {
  let event = '';
  let details = '';
  let isSpecial = false; // для выделения красным
  const t = translations[currentLang];
  
  switch (log.type) {
    case 'click-down':
      event = log.details.button;
      details = t.mouseDown;
      break;
    case 'click-up':
      event = log.details.button;
      details = t.mouseUp;
      break;
    case 'double-click':
      event = log.details.button;
      details = `${t.doubleClick}<br><span class="text-xs opacity-60">${log.details.deltaMs}${t.ms}</span>`;
      isSpecial = true; // выделяем двойные клики
      break;
    case 'wheel':
      event = currentLang === 'ru' ? 'Колесо' : 'Wheel';
      details = log.details.dir === 'up' ? t.wheelUp : t.wheelDown;
      break;
    case 'wheel-reversal':
      event = currentLang === 'ru' ? 'Колесо' : 'Wheel';
      details = `${t.wheelReversal}<br><span class="text-xs opacity-60">${log.details.sinceMs}${t.ms}</span>`;
      isSpecial = true; // выделяем реверсы красным
      break;
    case 'info':
      event = currentLang === 'ru' ? 'Система' : 'System';
      details = log.details.message;
      break;
    default:
      event = log.type;
      details = JSON.stringify(log.details || {});
  }
  
  return { event, details, isSpecial };
}

function onWheel(e) {
  // prevent page scroll while inside test area
  e.preventDefault();
  e.stopPropagation();
  const t = now();
  const sign = Math.sign(e.deltaY); // >0 = down, <0 = up
  const dir = sign > 0 ? 'down' : sign < 0 ? 'up' : 'idle';

  if (sign !== 0) {
    wheelStats.total++;
    updateStats();
  }

  const last = lastWheel;
  const since = t - last.t;
  if (last.sign !== 0 && sign !== 0 && sign !== last.sign && since <= reverseWindowMs) {
    wheelStats.reversals++;
    // Добавляем реверс в логи как специальное событие
    pushLog({ t, type: 'wheel-reversal', details: { dir, deltaY: e.deltaY, sinceMs: since } });
    showReversalNotification();
    updateStats();
  } else if (sign !== 0) {
    pushLog({ t, type: 'wheel', details: { dir, deltaY: e.deltaY } });
  }

  lastWheel.t = t; lastWheel.sign = sign;

  // Visual feedback
  setWheelArrow(dir);
  
  // Highlight test area during wheel events
  testArea.classList.add('ring-2', 'ring-emerald-500/50', 'bg-emerald-900/10');
  clearTimeout(wheelIdleTimer);
  wheelIdleTimer = setTimeout(() => {
    setWheelArrow('idle');
    testArea.classList.remove('ring-2', 'ring-emerald-500/50', 'bg-emerald-900/10');
  }, 200);
}

// ------- Event Handlers -------
function setupEventListeners() {
  elDblThreshold.addEventListener('input', () => {
    dblThresholdMs = parseInt(elDblThreshold.value || '0', 10);
  });

  elRevWindow.addEventListener('input', () => {
    reverseWindowMs = parseInt(elRevWindow.value || '0', 10);
  });

  btnReset.addEventListener('click', resetAll);

  btnExport.addEventListener('click', () => {
    // Создаем текстовый отчет
    const reversedLogs = [...logs].reverse();
    const t = translations[currentLang];
    let textContent = `${t.exportTitle}\n`;
    textContent += `${t.exportDate} ${new Date().toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US')}\n`;
    textContent += `=====================================\n\n`;
    
    textContent += `${t.exportStats}\n`;
    textContent += `- ${t.exportDoubleClicks} ${t.leftClick}: ${doubleCounts[t.leftClick] || 0}\n`;
    textContent += `- ${t.exportDoubleClicks} ${t.middleClick}: ${doubleCounts[t.middleClick] || 0}\n`;
    textContent += `- ${t.exportDoubleClicks} ${t.rightClick}: ${doubleCounts[t.rightClick] || 0}\n`;
    textContent += `- ${t.exportWheelSteps} ${wheelStats.total}\n`;
    textContent += `- ${t.exportWheelReversals} ${wheelStats.reversals}\n`;
    const rate = wheelStats.total ? (100 * wheelStats.reversals / wheelStats.total) : 0;
    textContent += `- ${t.exportReversalRate} ${rate.toFixed(1)}%\n\n`;
    
    textContent += `${t.exportLogs}\n`;
    textContent += `${t.time}\t\t${t.event}\t\t${t.details}\n`;
    textContent += `-----------------------------------------------\n`;
    
    reversedLogs.forEach(log => {
      const { event, details } = formatLogEvent(log);
      textContent += `${fmtTimeForExport(log.t)}\t\t${event}\t\t${details}\n`;
    });
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mouse_test_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  btnTheme.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('mouseTestTheme', isDarkTheme ? 'dark' : 'light');
    updateTheme();
    updateInterface();
  });

  btnLang.addEventListener('click', () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    localStorage.setItem('mouseTestLang', currentLang);
    updateInterface();
  });

  // ------- Event Listeners -------
  testArea.addEventListener('mousedown', onMouseDown);
  testArea.addEventListener('mouseup', onMouseUp);
  testArea.addEventListener('wheel', onWheel, { passive: false });
  testArea.addEventListener('contextmenu', (e) => e.preventDefault());

  testArea.addEventListener('mouseleave', () => {
    setIndicator(indL, false);
    setIndicator(indM, false);
    setIndicator(indR, false);
    setWheelArrow('idle');
    testArea.blur();
  });

  // Global wheel handler to prevent scrolling when not in test area
  window.addEventListener('wheel', (e) => {
    // Only prevent default if we're not in a scrollable container
    const target = e.target;
    const testAreaContains = testArea.contains(target);
    const isScrollable = target.closest('.overflow-auto, .overflow-y-auto, .overflow-scroll');
    
    if (testAreaContains && !isScrollable) {
      e.preventDefault();
    }
  }, { passive: false });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  elDblThreshold = document.getElementById('dbl-threshold');
  elRevWindow = document.getElementById('reverse-window');
  elDblL = document.getElementById('dbl-lmb');
  elDblM = document.getElementById('dbl-mmb');
  elDblR = document.getElementById('dbl-rmb');
  elWheelTotal = document.getElementById('wheel-total');
  elWheelRev = document.getElementById('wheel-rev');
  testArea = document.getElementById('test-area');
  notificationArea = document.getElementById('notification-area');
  indL = document.getElementById('ind-lmb');
  indM = document.getElementById('ind-mmb');
  indR = document.getElementById('ind-rmb');
  wheelLabel = document.getElementById('wheel-label');
  arrowUp = document.getElementById('arrow-up');
  arrowDown = document.getElementById('arrow-down');
  logBody = document.getElementById('log-body');
  btnReset = document.getElementById('btn-reset');
  btnExport = document.getElementById('btn-export');
  btnTheme = document.getElementById('btn-theme');
  btnLang = document.getElementById('btn-lang');
  
  // Setup event listeners
  setupEventListeners();
  
  // Focus test area for immediate testing
  testArea.focus();
  
  // Инициализация темы из localStorage
  const savedTheme = localStorage.getItem('mouseTestTheme');
  if (savedTheme === 'light') {
    isDarkTheme = false;
  }
  // Применяем тему
  updateTheme();
  
  // Инициализация языка из localStorage
  const savedLang = localStorage.getItem('mouseTestLang');
  if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
    currentLang = savedLang;
  }
  
  // Инициализируем счетчики двойных кликов
  updateDoubleCounts();
  
  // Обновляем весь интерфейс с правильным языком и темой
  updateInterface();
});
