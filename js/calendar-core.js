/**
 * mallow-cal calendar facts (CSV, holidays, 空, Hong Kong dates).
 * Usable in browser (global) and Node (module.exports).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MallowCalCore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TZ_LABEL = 'Asia/Hong_Kong';
  var WINDOW_START = '2026-12-01';
  var WINDOW_END = '2027-01-31';
  var MONTHS = [
    { key: '2026-12', label: '2026年12月', year: 2026, month: 12 },
    { key: '2027-01', label: '2027年1月', year: 2027, month: 1 },
  ];

  var FREE_BADGE_DAYS = [
    '2026-12-06',
    '2026-12-13',
    '2027-01-10',
    '2027-01-17',
    '2027-01-24',
    '2027-01-31',
  ];

  var HOLIDAY_YMD = {
    '2026-12-25': true,
    '2026-12-26': true,
    '2027-01-01': true,
  };

  var ANIMALS = [
    'fox',
    'bunny',
    'penguin',
    'chick',
    'tiger',
    'bear',
    'cat',
    'frog',
    'owl',
    'elephant',
    'hedgehog',
    'koala',
  ];

  var ANIMAL_ZH = {
    fox: '狐狸',
    bunny: '兔子',
    penguin: '企鵝',
    chick: '雞仔',
    tiger: '老虎',
    bear: '熊',
    cat: '貓',
    frog: '青蛙',
    owl: '貓頭鷹',
    elephant: '大象',
    hedgehog: '刺蝟',
    koala: '樹熊',
  };

  var LOCKED_ANIMAL = {
    Gordon: 'fox',
    'Winnie Wong': 'bunny',
    'Winnie Wu': 'penguin',
    Kami: 'chick',
    Nicol: 'tiger',
  };

  var BAR_CLASS = {
    Gordon: 'gordon',
    'Winnie Wu': 'wu',
    Nicol: 'nicol',
  };

  var BAR_LANE = {
    Gordon: 1,
    'Winnie Wu': 1,
    Nicol: 2,
  };

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function ymd(y, m, d) {
    return y + '-' + pad2(m) + '-' + pad2(d);
  }

  function parseYmd(s) {
    var p = s.split('-').map(Number);
    return { y: p[0], m: p[1], d: p[2], js: new Date(p[0], p[1] - 1, p[2]) };
  }

  function compareYmd(a, b) {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  function addDaysYmd(s, days) {
    var p = parseYmd(s);
    var t = new Date(p.y, p.m - 1, p.d + days);
    return ymd(t.getFullYear(), t.getMonth() + 1, t.getDate());
  }

  function dayOfWeek(s) {
    return parseYmd(s).js.getDay();
  }

  function isSunday(s) {
    return dayOfWeek(s) === 0;
  }

  function isSaturday(s) {
    return dayOfWeek(s) === 6;
  }

  function isHongKongHoliday(s) {
    return isSunday(s) || !!HOLIDAY_YMD[s];
  }

  function inWindow(s) {
    return compareYmd(s, WINDOW_START) >= 0 && compareYmd(s, WINDOW_END) <= 0;
  }

  function eachDay(start, end, fn) {
    var cur = start;
    while (compareYmd(cur, end) <= 0) {
      fn(cur);
      cur = addDaysYmd(cur, 1);
    }
  }

  function hashAnimal(name) {
    if (LOCKED_ANIMAL[name]) return LOCKED_ANIMAL[name];
    var h = 0;
    for (var i = 0; i < name.length; i++) {
      h = ((h << 5) - h + name.charCodeAt(i)) | 0;
    }
    return ANIMALS[Math.abs(h) % ANIMALS.length];
  }

  function parseCSV(text) {
    var lines = text.trim().split(/\r?\n/);
    if (!lines.length) return [];
    var header = lines[0].split(',').map(function (c) {
      return c.trim();
    });
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      var cols = lines[i].split(',');
      var row = {};
      for (var j = 0; j < header.length; j++) {
        row[header[j]] = (cols[j] || '').trim();
      }
      rows.push(row);
    }
    return rows;
  }

  function expandRow(row) {
    var name = row.name;
    var repeat = row.repeat || '';
    var ranges = [];
    if (repeat === 'Sat') {
      eachDay(WINDOW_START, WINDOW_END, function (d) {
        if (isSaturday(d)) ranges.push({ name: name, start: d, end: d, kind: 'mark' });
      });
      return ranges;
    }
    if (row.start && row.end) {
      ranges.push({ name: name, start: row.start, end: row.end, kind: 'range' });
      return ranges;
    }
    return ranges;
  }

  function buildSchedule(rows) {
    var byDate = {};
    var people = {};
    var rangeMeta = [];

    function ensure(date) {
      if (!byDate[date]) byDate[date] = { marks: [], bars: [] };
    }

    rows.forEach(function (row) {
      var name = row.name;
      people[name] = { animal: hashAnimal(name), bar: BAR_CLASS[name] || null };
      expandRow(row).forEach(function (seg) {
        if (seg.kind === 'mark') {
          ensure(seg.start);
          byDate[seg.start].marks.push(name);
        } else if (seg.start === seg.end) {
          if (inWindow(seg.start)) {
            ensure(seg.start);
            byDate[seg.start].marks.push(name);
          }
        } else {
          rangeMeta.push({
            name: name,
            start: seg.start,
            end: seg.end,
            barClass: BAR_CLASS[name],
            lane: BAR_LANE[name] || 1,
          });
          eachDay(seg.start, seg.end, function (d) {
            if (!inWindow(d)) return;
            ensure(d);
            byDate[d].bars.push(name);
          });
        }
      });
    });

    Object.keys(byDate).forEach(function (d) {
      byDate[d].marks = unique(byDate[d].marks);
      byDate[d].bars = unique(byDate[d].bars);
    });

    return { byDate: byDate, people: people, ranges: rangeMeta };
  }

  function unique(arr) {
    var out = [];
    arr.forEach(function (x) {
      if (out.indexOf(x) === -1) out.push(x);
    });
    return out;
  }

  function hasPersonalEvent(schedule, date) {
    var cell = schedule.byDate[date];
    if (!cell) return false;
    return cell.marks.length > 0 || cell.bars.length > 0;
  }

  function isFreeBadgeDay(date, schedule) {
    return FREE_BADGE_DAYS.indexOf(date) !== -1 && !hasPersonalEvent(schedule, date);
  }

  function cellType(date, schedule) {
    if (isFreeBadgeDay(date, schedule)) return 'free';
    if (isHongKongHoliday(date) || isSaturday(date)) return 'busy';
    return 'dim';
  }

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function monthWeeks(year, month) {
    var n = daysInMonth(year, month);
    var weeks = [];
    var week = [];
    var started = false;
    for (var d = 1; d <= n; d++) {
      var ds = ymd(year, month, d);
      var dow = dayOfWeek(ds);
      if (!started) {
        for (var e = 0; e < dow; e++) week.push(null);
        started = true;
      }
      week.push(ds);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return weeks;
  }

  function weekLaneCount(weekDays, schedule, ranges) {
    var maxLane = 0;
    weekDays.forEach(function (d) {
      if (!d) return;
      ranges.forEach(function (r) {
        if (compareYmd(d, r.start) >= 0 && compareYmd(d, r.end) <= 0) {
          maxLane = Math.max(maxLane, r.lane);
        }
      });
    });
    return maxLane;
  }

  function weekBarSegments(weekDays, range) {
    var cols = [];
    weekDays.forEach(function (d, i) {
      if (!d) return;
      if (compareYmd(d, range.start) >= 0 && compareYmd(d, range.end) <= 0) {
        cols.push(i + 1);
      }
    });
    if (!cols.length) return null;
    return {
      range: range,
      colStart: cols[0],
      colEnd: cols[cols.length - 1],
      firstDate: weekDays[cols[0] - 1],
      lastDate: weekDays[cols[cols.length - 1] - 1],
    };
  }

  function barModifiers(seg, monthYear, monthNum) {
    var r = seg.range;
    var mods = [];
    var atRangeStart = seg.firstDate === r.start;
    var atRangeEnd = seg.lastDate === r.end;
    var atWeekStart = seg.colStart === 1;
    var atWeekEnd = seg.colEnd === 7;

    var lastDayOfMonth = ymd(monthYear, monthNum, daysInMonth(monthYear, monthNum));
    var firstDayOfMonth = ymd(monthYear, monthNum, 1);

    var continuesPrevMonth =
      compareYmd(r.start, firstDayOfMonth) < 0 && compareYmd(seg.firstDate, firstDayOfMonth) >= 0;
    var continuesNextMonth =
      compareYmd(r.end, lastDayOfMonth) > 0 && compareYmd(seg.lastDate, lastDayOfMonth) <= 0;

    if (atRangeStart && !continuesPrevMonth) mods.push('start');
  else if (continuesPrevMonth && seg.firstDate === firstDayOfMonth) mods.push('cont-start');
    else if (atWeekStart && !atRangeStart) mods.push('wrap-start');

    if (atRangeEnd && !continuesNextMonth) mods.push('end');
  else if (continuesNextMonth && seg.lastDate === lastDayOfMonth) mods.push('cont-end');
    else if (atWeekEnd && !atRangeEnd) mods.push('wrap-end');

    return mods;
  }

  return {
    TZ_LABEL: TZ_LABEL,
    WINDOW_START: WINDOW_START,
    WINDOW_END: WINDOW_END,
    MONTHS: MONTHS,
    FREE_BADGE_DAYS: FREE_BADGE_DAYS,
    ANIMAL_ZH: ANIMAL_ZH,
    parseCSV: parseCSV,
    buildSchedule: buildSchedule,
    hasPersonalEvent: hasPersonalEvent,
    isFreeBadgeDay: isFreeBadgeDay,
    isHongKongHoliday: isHongKongHoliday,
    cellType: cellType,
    monthWeeks: monthWeeks,
    weekLaneCount: weekLaneCount,
    weekBarSegments: weekBarSegments,
    barModifiers: barModifiers,
    hashAnimal: hashAnimal,
    compareYmd: compareYmd,
  };
});