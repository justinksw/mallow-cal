'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Core = require('../js/calendar-core.js');

var sample = fs.readFileSync(path.join(__dirname, '../data/sample.csv'), 'utf8');
var rows = Core.parseCSV(sample);
var schedule = Core.buildSchedule(rows);

assert.strictEqual(rows.length, 5);

Core.FREE_BADGE_DAYS.forEach(function (d) {
  assert.strictEqual(Core.isFreeBadgeDay(d, schedule), true, d + ' should show 空');
});

assert.strictEqual(Core.isHongKongHoliday('2026-12-25'), true);
assert.strictEqual(Core.isHongKongHoliday('2027-01-01'), true);
assert.strictEqual(Core.cellType('2026-12-25', schedule), 'busy');
assert.strictEqual(Core.cellType('2026-12-14', schedule), 'dim');

assert.strictEqual(schedule.people.Gordon.animal, 'fox');
assert.strictEqual(schedule.people['Winnie Wu'].animal, 'penguin');
assert.strictEqual(schedule.people.Kami.animal, 'chick');

assert.strictEqual(Core.hasPersonalEvent(schedule, '2027-01-02'), true);
assert.strictEqual(Core.isFreeBadgeDay('2027-01-10', schedule), true);

var cell0102 = schedule.byDate['2027-01-02'];
assert.ok(cell0102.marks.indexOf('Winnie Wong') !== -1);
assert.ok(cell0102.marks.indexOf('Kami') !== -1);
assert.ok(cell0102.bars.indexOf('Gordon') !== -1);
assert.ok(cell0102.marks.indexOf('Kami') !== -1);

console.log('calendar-facts.test.js: ok');