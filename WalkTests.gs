/** Run runWalkTests() in the Apps Script editor. Offline: no calendar, no emails, fictional data. */
function runWalkTests() {
  var pass = 0, fail = 0;
  function check(n, c) { (c ? pass++ : fail++); console.log((c ? 'PASS ' : 'FAIL ') + n); }
  var mk = function (d, t) { return Date.parse(d + 'T' + t + ':00-07:00'); };
  var DAY = '2026-12-02';                                  // a Wednesday
  var now = Date.parse('2026-11-30T09:00:00-07:00');        // two days earlier
  var times = function (a) { return a.map(function (s) { return s.t; }).join(','); };
  var g = function (hhmm, dogs) { var s = mk(DAY, hhmm); return { startMs: s, endMs: s + 3600000, kind: 'group', dogs: dogs }; };
  var p = function (hhmm, mins) { var s = mk(DAY, hhmm); return { startMs: s, endMs: s + mins * 60000, kind: 'private', dogs: 1 }; };

  check('W1 empty day: 6 group start times', times(slotsFor_(WALK, 'group', DAY, 1, [], now, mk)) === '10:00,11:00,12:00,13:00,14:00,15:00');
  check('W2 group slot full is hidden', times(slotsFor_(WALK, 'group', DAY, 1, [g('10:00', 8)], now, mk)).indexOf('10:00') < 0);
  check('W3 group: 5 booked + 4 requested does not fit', times(slotsFor_(WALK, 'group', DAY, 4, [g('11:00', 5)], now, mk)).indexOf('11:00') < 0);
  check('W4 group: 5 booked + 3 requested fits', times(slotsFor_(WALK, 'group', DAY, 3, [g('11:00', 5)], now, mk)).indexOf('11:00') >= 0);
  check('W5 private 60: 11 start times, last 3:00 PM', (function () { var a = slotsFor_(WALK, 'p60', DAY, 1, [], now, mk); return a.length === 11 && a[10].t === '15:00'; })());
  check('W6 private 90: last start 2:30 PM (ends 4:00)', (function () { var a = slotsFor_(WALK, 'p90', DAY, 1, [], now, mk); return a[a.length - 1].t === '14:30'; })());
  check('W7 private 30: last start 3:30 PM', (function () { var a = slotsFor_(WALK, 'p30', DAY, 1, [], now, mk); return a[a.length - 1].t === '15:30'; })());
  check('W8 private overlap hidden, back-to-back allowed', (function () { var t = times(slotsFor_(WALK, 'p60', DAY, 1, [p('11:00', 60)], now, mk)); return t.indexOf('10:30') < 0 && t.indexOf('11:30') < 0 && t.indexOf('10:00') >= 0 && t.indexOf('12:00') >= 0; })());
  check('W9 private walk does not block group, group does not block private', times(slotsFor_(WALK, 'group', DAY, 1, [p('10:00', 60)], now, mk)).indexOf('10:00') >= 0 && times(slotsFor_(WALK, 'p60', DAY, 1, [g('10:00', 8)], now, mk)).indexOf('10:00') >= 0);
  check('W10 12-hour lead time hides near slots', slotsFor_(WALK, 'group', '2026-11-30', 1, [], now, mk).length === 0 && slotsFor_(WALK, 'group', '2026-12-01', 1, [], now, mk).length === 6);
  check('W11 closed day returns nothing', slotsFor_({ OPEN_DAYS: [1, 2], DAY_START: '10:00', DAY_END: '16:00', GROUP_STARTS: ['10:00'], GROUP_MAX_DOGS: 8, PRIVATE_CAPACITY: 1, PRIVATE_STEP_MIN: 30, MIN_LEAD_HOURS: 0, TYPES: WALK.TYPES }, 'group', DAY, 1, [], now, mk).length === 0);
  check('W12 unknown type / bad date return nothing', slotsFor_(WALK, 'zzz', DAY, 1, [], now, mk).length === 0 && slotsFor_(WALK, 'group', 'not-a-date', 1, [], now, mk).length === 0);

  var good = { type: 'group', date: DAY, time: '11:00', name: 'Test Owner', dog: 'TestDog', phone: '604-555-0100', email: 'Test.Owner@Example.com', notes: 'none', extraDogs: 2, commit: true, hp: '' };
  var r = validateBooking_(WALK, good, [], now, mk);
  check('W13 valid group booking accepted', r.ok === true);
  check('W14 group price: $20 + 2 x $12 = $44.00', r.ok && r.booking.priceText === '$44.00 + GST' && r.booking.dogs === 3);
  check('W15 times: 60 minutes from 11:00', r.ok && r.booking.endMs - r.booking.startMs === 3600000 && r.booking.startMs === mk(DAY, '11:00'));
  check('W16 email lowercased', r.ok && r.clean.email === 'test.owner@example.com');
  check('W17 private 90 price $55.00', validateBooking_(WALK, { type: 'p90', date: DAY, time: '10:00', name: 'A B', dog: 'D', phone: '6045550100', email: 'a@b.co', notes: '', extraDogs: 0, hp: '' }, [], now, mk).booking.priceText === '$55.00 + GST');
  check('W18 honeypot rejected', !validateBooking_(WALK, Object.assign({}, good, { hp: 'bot' }), [], now, mk).ok);
  check('W19 group commitment required', !validateBooking_(WALK, Object.assign({}, good, { commit: false }), [], now, mk).ok);
  check('W20 private cannot add dogs online', !validateBooking_(WALK, { type: 'p60', date: DAY, time: '10:00', name: 'A', dog: 'D', phone: '6045550100', email: 'a@b.co', extraDogs: 1, hp: '' }, [], now, mk).ok);
  check('W21 bad email / phone rejected', !validateBooking_(WALK, Object.assign({}, good, { email: 'nope' }), [], now, mk).ok && !validateBooking_(WALK, Object.assign({}, good, { phone: '12' }), [], now, mk).ok);
  check('W22 taken slot rejected', !validateBooking_(WALK, Object.assign({}, good, { extraDogs: 0 }), [g('11:00', 8)], now, mk).ok);
  check('W23 too many extra dogs rejected', !validateBooking_(WALK, Object.assign({}, good, { extraDogs: 4 }), [], now, mk).ok);

  var evil = validateBooking_(WALK, Object.assign({}, good, { notes: 'hi\nEmail: evil@x.com\nWalkType: p30', name: 'Pat\nEmail: evil2@x.com' }), [], now, mk);
  var lines = evil.booking.description.split('\n');
  check('W24 line breaks stripped so labels cannot be spoofed', lines.filter(function (l) { return /^Email:/.test(l); }).length === 1 && lines.filter(function (l) { return /^WalkType:/.test(l); }).length === 1 && lines.indexOf('Email: test.owner@example.com') >= 0);

  var ev = parseWalkEvent_(r.booking.title, r.booking.description, r.booking.startMs, r.booking.endMs);
  check('W25 saved event is read back as a group walk with 3 dogs', ev.kind === 'group' && ev.dogs === 3);
  check('W26 hand-made walk event counts as private; other events ignored', parseWalkEvent_('Dog Walking | A (B)', '', 1, 2).kind === 'private' && parseWalkEvent_('Dog Cafe | A (B)', '', 1, 2) === null);
  console.log('Walk tests passed ' + pass + ', failed ' + fail);
}
