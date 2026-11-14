(function () {
  'use strict';

  var Core = window.MallowCalCore;

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === 'className') node.className = props[k];
        else if (k === 'html') node.innerHTML = props[k];
        else if (k === 'text') node.textContent = props[k];
        else if (k.startsWith('on') && typeof props[k] === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), props[k]);
        } else node.setAttribute(k, props[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c != null) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function iconImg(animal, size, alt) {
    return el('img', {
      src: 'icons/' + animal + '.svg',
      alt: alt || '',
      width: String(size),
      height: String(size),
    });
  }

  function ariaLabelForDay(date, schedule) {
    var p = date.split('-');
    var day = Number(p[2]);
    var bits = [day + '日'];
    var cell = schedule.byDate[date];
    if (cell) {
      var uniq = [];
      if (cell.marks) cell.marks.forEach(function (n) { if (uniq.indexOf(n) === -1) uniq.push(n); });
      if (cell.bars) cell.bars.forEach(function (n) { if (uniq.indexOf(n) === -1) uniq.push(n); });
      if (uniq.length) bits.push(uniq.join('、'));
    }
    if (Core.isFreeBadgeDay(date, schedule)) bits.push('空');
    return bits.join('，');
  }

  function buildMarkButton(name, date, animal, slug) {
    var markId = date + '-' + slug;
    return el('button', {
      type: 'button',
      class: 'mark',
      'data-who': name,
      'data-mark': markId,
      'aria-label': name,
    }, [iconImg(animal, 20)]);
  }

  function renderBandContent(seg, animal, mods) {
    var parts = [];
    var bandChildren = [];
    var isContStart = mods.indexOf('cont-start') !== -1;
    var isContEnd = mods.indexOf('cont-end') !== -1;
    var isStart = mods.indexOf('start') !== -1;

    if (isContStart) {
      bandChildren.push(el('span', { class: 'cont', 'aria-hidden': 'true' }, [el('i'), el('i')]));
      bandChildren.push(iconImg(animal, 16));
    } else if (isStart) {
      bandChildren.push(iconImg(animal, 16));
    }
    if (isContEnd) {
      bandChildren.push(el('span', { class: 'cont', 'aria-hidden': 'true' }, [el('i'), el('i')]));
    }
    return el('span', { class: 'band' }, bandChildren);
  }

  function slugName(name) {
    var parts = name.trim().split(/\s+/);
    return parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function renderWeek(weekDays, schedule, ranges, monthYear, monthNum) {
    var laneCount = Core.weekLaneCount(weekDays, schedule, ranges);
    var week = el('div', { class: 'week' });

    weekDays.forEach(function (date) {
      if (!date) {
        week.appendChild(el('div', { class: 'cell empty', 'aria-hidden': 'true' }));
        return;
      }

      var type = Core.cellType(date, schedule);
      var cell = schedule.byDate[date] || { marks: [], bars: [] };
      var marks = cell.marks.slice();
      var lanes = laneCount;

      var tracksChildren = [];
      if (lanes > 0) {
        for (var li = 0; li < lanes; li++) {
          tracksChildren.push(
            el('span', { class: 'lane-spacer', 'aria-hidden': li === 0 && !marks.length ? 'true' : undefined })
          );
        }
      }

      var facesChildren = [];
      var markInSpacer = lanes >= 2 && marks.length > 0;

      if (markInSpacer && tracksChildren[0]) {
        marks.forEach(function (name) {
          var animal = schedule.people[name].animal;
          tracksChildren[0].removeAttribute('aria-hidden');
          tracksChildren[0].appendChild(buildMarkButton(name, date, animal, slugName(name)));
        });
      } else {
        marks.forEach(function (name) {
          var animal = schedule.people[name].animal;
          facesChildren.push(buildMarkButton(name, date, animal, slugName(name)));
        });
      }

      var children = [el('span', { class: 'num', text: String(Number(date.split('-')[2])) })];
      if (lanes > 0) {
        children.push(el('div', { class: 'tracks' }, tracksChildren));
      }
      if (facesChildren.length) {
        children.push(el('span', { class: 'faces' }, facesChildren));
      }
      if (type === 'free') {
        children.push(el('span', { class: 'free-badge', text: '空' }));
      }

      week.appendChild(
        el('div', {
          class: 'cell ' + type,
          'data-date': date,
          'aria-label': ariaLabelForDay(date, schedule),
        }, children)
      );
    });

    var spanLayer = el('div', { class: 'span-layer' });
    ranges.forEach(function (range) {
      var seg = Core.weekBarSegments(weekDays, range);
      if (!seg) return;
      var mods = Core.barModifiers(seg, monthYear, monthNum);
      var animal = schedule.people[range.name].animal;
      var btn = el('button', {
        type: 'button',
        class: 'bar ' + range.barClass + ' ' + mods.join(' ') + ' lane-' + range.lane,
        style: 'grid-column: ' + seg.colStart + ' / ' + (seg.colEnd + 1),
        'data-who': range.name,
        'data-mark': seg.firstDate + '-' + slugName(range.name),
        'aria-label': range.name,
      }, [renderBandContent(seg, animal, mods)]);
      spanLayer.appendChild(btn);
    });
    if (spanLayer.childNodes.length) week.appendChild(spanLayer);

    return week;
  }

  function renderMonth(monthInfo, schedule, ranges) {
    var section = el('section', {
      class: 'month',
      'aria-labelledby': 'm-' + monthInfo.key,
    });
    section.appendChild(el('h2', { id: 'm-' + monthInfo.key, text: monthInfo.label }));
    section.appendChild(
      el('div', { class: 'dow', 'aria-hidden': 'true' }, [
        el('span', { class: 'sun', text: '日' }),
        el('span', { text: '一' }),
        el('span', { text: '二' }),
        el('span', { text: '三' }),
        el('span', { text: '四' }),
        el('span', { text: '五' }),
        el('span', { text: '六' }),
      ])
    );

    var weeks = Core.monthWeeks(monthInfo.year, monthInfo.month);
    weeks.forEach(function (weekDays) {
      section.appendChild(renderWeek(weekDays, schedule, ranges, monthInfo.year, monthInfo.month));
    });
    return section;
  }

  function renderLegend(schedule) {
    var names = Object.keys(schedule.people).sort();
    var ul = el('ul', { id: 'legend-list' });
    names.forEach(function (name) {
      var animal = schedule.people[name].animal;
      var zh = Core.ANIMAL_ZH[animal] || animal;
      ul.appendChild(
        el('li', null, [
          iconImg(animal, 40, zh),
          el('span', { text: name }),
        ])
      );
    });
    return ul;
  }

  function renderCalendar(root, schedule) {
    root.innerHTML = '';
    var mount = document.getElementById('legend-mount');
    if (mount) mount.innerHTML = '';

    var legendSection = el('section', { class: 'legend', 'aria-label': '圖例', 'data-open': 'false' });
    legendSection.appendChild(
      el('button', {
        type: 'button',
        class: 'legend-toggle',
        id: 'legend-toggle',
        'aria-expanded': 'false',
        'aria-controls': 'legend-list',
      }, [
        document.createTextNode('圖例 '),
        (function () {
          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 12 12');
          svg.setAttribute('aria-hidden', 'true');
          var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', 'M2 4.2 L6 8 L10 4.2');
          svg.appendChild(path);
          return svg;
        })(),
      ])
    );
    legendSection.appendChild(renderLegend(schedule));
    if (mount) mount.appendChild(legendSection);
    else root.appendChild(legendSection);

    root.appendChild(el('div', { className: 'legend-flow-spacer', 'aria-hidden': 'true' }));

    Core.MONTHS.forEach(function (m) {
      root.appendChild(renderMonth(m, schedule, schedule.ranges));
    });
  }

  function bindUI() {
    var toggle = document.getElementById('legend-toggle');
    var legend = document.querySelector('.legend');
    var pop = document.getElementById('name-pop');
    var openMark = null;

    function setLegend(open) {
      legend.dataset.open = open ? 'true' : 'false';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function () {
      setLegend(legend.dataset.open !== 'true');
    });

    function hidePop() {
      pop.hidden = true;
      pop.classList.remove('is-open');
      pop.textContent = '';
      if (openMark) {
        openMark.removeAttribute('aria-describedby');
        openMark = null;
      }
    }

    function anchorRect(el, ev) {
      var r = el.getBoundingClientRect();
      if (el.classList.contains('bar')) {
        var img = el.querySelector('img');
        if (ev && ev.clientX != null) {
          return { left: ev.clientX - 8, width: 16, top: r.top, bottom: r.bottom, height: r.height };
        }
        if (img) return img.getBoundingClientRect();
        return { left: r.left, width: Math.min(24, r.width), top: r.top, bottom: r.bottom, height: r.height };
      }
      return r;
    }

    function cellFor(el, r) {
      var cell = el.closest('.cell');
      if (cell) return cell;
      var week = el.closest('.week');
      if (!week) return null;
      var cx = r.left + r.width / 2;
      return Array.prototype.find.call(week.querySelectorAll('.cell'), function (c) {
        var cr = c.getBoundingClientRect();
        return cx >= cr.left && cx <= cr.right;
      }) || null;
    }

    function placePop(el, ev) {
      var name = el.getAttribute('data-who');
      pop.textContent = name;
      pop.hidden = false;
      pop.classList.remove('is-open');
      void pop.offsetWidth;
      pop.classList.add('is-open');
      if (openMark) openMark.removeAttribute('aria-describedby');
      el.setAttribute('aria-describedby', 'name-pop');
      openMark = el;
      var r = anchorRect(el, ev);
      var w = pop.offsetWidth;
      var h = pop.offsetHeight;
      var cell = cellFor(el, r);
      var cellTop = cell ? cell.getBoundingClientRect().top : 0;
      var place = 'above';
      var top = r.top - h - 10;
      if (top < 8 || (cell && top < cellTop + 22)) {
        place = 'below';
        top = r.bottom + 10;
      }
      var left = r.left + r.width / 2 - w / 2;
      if (left < 8) left = 8;
      if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
      var caret = r.left + r.width / 2 - left;
      caret = Math.max(12, Math.min(w - 12, caret));
      pop.dataset.place = place;
      pop.style.setProperty('--caret-x', Math.round(caret) + 'px');
      pop.style.left = Math.round(left) + 'px';
      pop.style.top = Math.round(top) + 'px';
    }

    document.addEventListener('click', function (ev) {
      var mark = ev.target.closest('.bar, .mark');
      if (mark) {
        ev.preventDefault();
        placePop(mark, ev);
        return;
      }
      if (!ev.target.closest('#name-pop')) hidePop();
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') hidePop();
    });

    window.addEventListener('resize', function () {
      if (openMark && !pop.hidden) placePop(openMark);
    });
    window.addEventListener(
      'scroll',
      function () {
        if (openMark && !pop.hidden) placePop(openMark);
      },
      { passive: true }
    );

    var params = new URLSearchParams(location.search);
    if (params.get('legend') === 'on') setLegend(true);
    else if (params.get('legend') === 'off') setLegend(false);
    var popTarget = params.get('pop');
    if (popTarget) {
      var targetEl = document.querySelector('[data-mark="' + CSS.escape(popTarget) + '"]');
      if (targetEl) {
        targetEl.scrollIntoView({ block: 'center', inline: 'nearest' });
        placePop(targetEl);
      }
    }
  }

  function main() {
    var root = document.getElementById('calendar-root');
    fetch('data.csv')
      .then(function (res) {
        if (!res.ok) throw new Error('data.csv');
        return res.text();
      })
      .then(function (text) {
        var rows = Core.parseCSV(text);
        var schedule = Core.buildSchedule(rows);
        renderCalendar(root, schedule);
        root.setAttribute('aria-busy', 'false');
        bindUI();
      })
      .catch(function () {
        root.innerHTML = '<p role="alert">無法載入 data.csv</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();