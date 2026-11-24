/**
 * PAWS N' PLAY - Dog Walking booking (its own small web app; does not touch the existing booking script).
 *
 * What it does
 *   GET  ?action=slots&type=group|p30|p60|p90&date=YYYY-MM-DD&dogs=1   -> the times still open that day
 *   POST {type,date,time,name,dog,phone,email,notes,extraDogs,commit,hp} -> books it on the Google Calendar
 *        and emails the customer a confirmation.
 * Setup: Project Settings > Script properties > CALENDAR_ID (the same appointment calendar), time zone Vancouver.
 * Deploy: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
 */

// ====================== SETTINGS (change here, then redeploy) ======================
var WALK = {
  TZ: 'America/Vancouver',
  OPEN_DAYS: [0, 1, 2, 3, 4, 5, 6],            // 0 = Sunday ... 6 = Saturday (walks run seven days a week)
  DAY_START: '10:00',                           // walks run between 10:00am and 4:00pm
  DAY_END: '16:00',
  GROUP_STARTS: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
  GROUP_MAX_DOGS: 8,                            // ASSUMED: most dogs allowed on one group walk
  PRIVATE_CAPACITY: 1,                          // ASSUMED: private walks that can run at the same time
  PRIVATE_STEP_MIN: 30,                         // private walks can start every 30 minutes
  MIN_LEAD_HOURS: 12,                           // ASSUMED: how far ahead a walk must be booked
  MAX_DAYS_AHEAD: 60,
  MAX_EXTRA_DOGS: 3,
  MAX_UPCOMING_PER_EMAIL: 8,                    // stops one person filling the calendar
  EXTRA_DOG_PRICE: 12,
  BUSINESS_EMAIL: 'pawsnplayvancouver@gmail.com',
  BUSINESS_PHONE: '778-737-7529',
  TYPES: {
    group: { label: 'Group Walk', minutes: 60, price: 20, kind: 'group' },
    p30: { label: 'Private Walk', minutes: 30, price: 20, kind: 'private' },
    p60: { label: 'Private Walk', minutes: 60, price: 40, kind: 'private' },
    p90: { label: 'Private Walk', minutes: 90, price: 55, kind: 'private' }
  }
};

/** Run this ONCE from the editor so Google asks you to approve calendar and email access. */
function authorizeOnce() {
  var name = CalendarApp.getCalendarById(calendarId_()).getName();
  var quota = MailApp.getRemainingDailyQuota();
  console.log('Authorized. Calendar found: "' + name + '". Emails you can still send today: ' + quota);
}

// ====================== WEB APP ENTRY POINTS ======================
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action !== 'slots') return json_({ ok: false, error: 'Unknown request.' });
    var dogs = Math.max(1, Math.min(1 + WALK.MAX_EXTRA_DOGS, parseInt(p.dogs, 10) || 1));
    var existing = loadExisting_(p.date);
    var slots = slotsFor_(WALK, String(p.type), String(p.date), dogs, existing, Date.now(), mkDate_);
    return json_({ ok: true, slots: slots });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Could not check times.' });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    lock.waitLock(15000);
    var existing = loadExisting_(body.date);
    var check = validateBooking_(WALK, body, existing, Date.now(), mkDate_);
    if (!check.ok) return json_({ ok: false, error: check.error });
    if (countUpcomingForEmail_(check.clean.email) >= WALK.MAX_UPCOMING_PER_EMAIL) {
      return json_({ ok: false, error: 'You already have several walks booked. Please call us on ' + WALK.BUSINESS_PHONE + ' to add more.' });
    }
    var b = check.booking;
    var cal = CalendarApp.getCalendarById(calendarId_());
    cal.createEvent(b.title, new Date(b.startMs), new Date(b.endMs), { description: b.description });
    lock.releaseLock();
    sendConfirmation_(b, check.clean);
    return json_({ ok: true, label: b.label + ' (' + b.minutes + ' min)', minutes: b.minutes, start: iso_(b.startMs), end: iso_(b.endMs), price: b.priceText });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'We could not complete that booking. Please call ' + WALK.BUSINESS_PHONE + '.' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// ====================== PURE LOGIC (tested offline) ======================
function hhmmToMin_(t) { var m = /^(\d{1,2}):(\d{2})$/.exec(String(t)); return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : NaN; }
function minToHhmm_(n) { return ('0' + Math.floor(n / 60)).slice(-2) + ':' + ('0' + (n % 60)).slice(-2); }
function label12_(hhmm) { var n = hhmmToMin_(hhmm), h = Math.floor(n / 60), m = n % 60; return ((h % 12) || 12) + ':' + ('0' + m).slice(-2) + ' ' + (h < 12 ? 'AM' : 'PM'); }
function dow_(dateStr) { return new Date(dateStr + 'T12:00:00Z').getUTCDay(); }
function validDate_(d) { return /^\d{4}-\d{2}-\d{2}$/.test(String(d)) && !isNaN(new Date(d + 'T12:00:00Z').getTime()); }
function ymdAdd_(ymd, days) { var d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }

/** existing = [{startMs,endMs,kind:'group'|'private',dogs:n}] for that day. mk(dateStr,'HH:MM') -> ms */
function slotsFor_(cfg, typeKey, dateStr, dogs, existing, nowMs, mk) {
  var t = cfg.TYPES[typeKey];
  if (!t || !validDate_(dateStr)) return [];
  if (cfg.OPEN_DAYS.indexOf(dow_(dateStr)) < 0) return [];
  var out = [], earliest = nowMs + cfg.MIN_LEAD_HOURS * 3600000;
  var starts = [];
  if (t.kind === 'group') {
    starts = cfg.GROUP_STARTS.slice();
  } else {
    var s0 = hhmmToMin_(cfg.DAY_START), s1 = hhmmToMin_(cfg.DAY_END) - t.minutes;
    for (var m = s0; m <= s1; m += cfg.PRIVATE_STEP_MIN) starts.push(minToHhmm_(m));
  }
  starts.forEach(function (hhmm) {
    var startMs = mk(dateStr, hhmm), endMs = startMs + t.minutes * 60000;
    if (hhmmToMin_(hhmm) + t.minutes > hhmmToMin_(cfg.DAY_END)) return;
    if (startMs < earliest) return;
    if (t.kind === 'group') {
      var inGroup = 0;
      existing.forEach(function (x) { if (x.kind === 'group' && x.startMs === startMs) inGroup += x.dogs; });
      if (inGroup + dogs > cfg.GROUP_MAX_DOGS) return;
    } else {
      var busy = 0;
      existing.forEach(function (x) { if (x.kind === 'private' && x.startMs < endMs && x.endMs > startMs) busy += 1; });
      if (busy >= cfg.PRIVATE_CAPACITY) return;
    }
    out.push({ t: hhmm, label: label12_(hhmm) });
  });
  return out;
}

function clean_(v, max) { return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }

function validateBooking_(cfg, body, existing, nowMs, mk) {
  var bad = function (m) { return { ok: false, error: m }; };
  body = body || {};
  if (String(body.hp || '') !== '') return bad('Please review the form and try again.');
  var t = cfg.TYPES[String(body.type)];
  if (!t) return bad('Please choose a type of walk.');
  var c = { name: clean_(body.name, 80), dog: clean_(body.dog, 80), phone: clean_(body.phone, 40), email: clean_(body.email, 120).toLowerCase(), notes: clean_(body.notes, 500) };
  if (!c.name || !c.dog || !c.phone) return bad('Please fill in your name, your dog and a phone number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return bad('Please enter a valid email address.');
  if ((c.phone.match(/\d/g) || []).length < 7) return bad('Please enter a valid phone number.');
  var extra = 0;
  if (t.kind === 'group') {
    extra = parseInt(body.extraDogs, 10) || 0;
    if (extra < 0 || extra > cfg.MAX_EXTRA_DOGS) return bad('Please choose 0 to ' + cfg.MAX_EXTRA_DOGS + ' additional dogs.');
    if (body.commit !== true) return bad('Please confirm the weekly commitment for Group Walks.');
  } else if (parseInt(body.extraDogs, 10)) {
    return bad('For additional dogs on a private walk, please contact us.');
  }
  var dateStr = String(body.date || ''), time = String(body.time || '');
  if (!validDate_(dateStr) || !/^\d{2}:\d{2}$/.test(time)) return bad('Please choose a date and time.');
  var dogs = 1 + extra;
  var open = slotsFor_(cfg, String(body.type), dateStr, dogs, existing, nowMs, mk);
  if (!open.some(function (s) { return s.t === time; })) return bad('That time is no longer available. Please pick another.');
  var startMs = mk(dateStr, time), endMs = startMs + t.minutes * 60000;
  var price = t.price + (t.kind === 'group' ? extra * cfg.EXTRA_DOG_PRICE : 0);
  var lab = t.label;
  var desc = [
    'Service: Dog Walking - ' + lab,
    'Name: ' + c.name,
    'Dog: ' + c.dog,
    'Phone: ' + c.phone,
    'Email: ' + c.email,
    'Notes: ' + c.notes,
    'WalkType: ' + String(body.type),
    'Dogs: ' + dogs,
    'Price: $' + price.toFixed(2) + ' + GST'
  ].join('\n');
  return {
    ok: true, clean: c,
    booking: { title: 'Dog Walking - ' + lab + ' | ' + c.name + ' (' + c.dog + ')', description: desc, startMs: startMs, endMs: endMs,
               minutes: t.minutes, label: lab, kind: t.kind, dogs: dogs, extra: extra, price: price, priceText: '$' + price.toFixed(2) + ' + GST', dateStr: dateStr, time: time }
  };
}

/** Turns a calendar event (title/description/times) into the small record the slot logic needs, or null. */
function parseWalkEvent_(title, description, startMs, endMs) {
  if (!/^\s*dog walking/i.test(String(title || ''))) return null;
  var d = String(description || '');
  var type = (/^\s*WalkType\s*:\s*(\w+)/im.exec(d) || [])[1];
  var dogs = parseInt((/^\s*Dogs\s*:\s*(\d+)/im.exec(d) || [])[1], 10) || 1;
  var kind = type === 'group' ? 'group' : 'private';   // events added by hand count as private (safest)
  return { startMs: startMs, endMs: endMs, kind: kind, dogs: dogs };
}

// ====================== GOOGLE SERVICES ======================
function calendarId_() {
  var id = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
  if (!id) throw new Error('CALENDAR_ID script property is not set.');
  return id;
}
function mkDate_(dateStr, hhmm) { return Utilities.parseDate(dateStr + ' ' + hhmm, WALK.TZ, 'yyyy-MM-dd HH:mm').getTime(); }
function iso_(ms) { return Utilities.formatDate(new Date(ms), WALK.TZ, "yyyy-MM-dd'T'HH:mm:ssXXX"); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function loadExisting_(dateStr) {
  if (!validDate_(dateStr)) return [];
  var from = new Date(mkDate_(dateStr, '00:00')), to = new Date(mkDate_(dateStr, '00:00') + 26 * 3600000);
  var events = CalendarApp.getCalendarById(calendarId_()).getEvents(from, to);
  var out = [];
  events.forEach(function (ev) {
    var r = parseWalkEvent_(ev.getTitle(), ev.getDescription(), ev.getStartTime().getTime(), ev.getEndTime().getTime());
    if (r) out.push(r);
  });
  return out;
}

function countUpcomingForEmail_(email) {
  var now = new Date(), end = new Date(now.getTime() + WALK.MAX_DAYS_AHEAD * 86400000);
  var events = CalendarApp.getCalendarById(calendarId_()).getEvents(now, end, { search: email });
  return events.filter(function (ev) { return /^\s*dog walking/i.test(ev.getTitle()); }).length;
}

function sendConfirmation_(b, c) {
  try {
    var when = Utilities.formatDate(new Date(b.startMs), WALK.TZ, "EEEE, MMMM d 'at' h:mm a");
    var lines = [
      'Hi ' + c.name + ',', '',
      'Your dog walk with Paws n\' Play is booked:', '',
      '  ' + b.label + ' (' + b.minutes + ' minutes) for ' + c.dog + (b.extra ? ' + ' + b.extra + ' additional dog' + (b.extra > 1 ? 's' : '') : ''),
      '  ' + when,
      '  Price: ' + b.priceText, ''
    ];
    if (b.kind === 'group') {
      lines.push('Group Walks include a complimentary consultation to make sure your dog is a good fit for the pack. A commitment of at least one walk per week is required for Group Walks.', '');
    }
    lines.push(
      'Cancellations: appointments canceled less than 24 hours before the start time are billed the full fee.',
      'Please complete the Dog Owner Waiver on our website before the first walk.', '',
      'Questions? Reply to this email or call ' + WALK.BUSINESS_PHONE + '.', '', 'Paws n\' Play');
    MailApp.sendEmail({ to: c.email, subject: 'Your Paws n\' Play walk is booked: ' + b.label + ', ' + when, body: lines.join('\n'), name: 'Paws n\' Play', replyTo: WALK.BUSINESS_EMAIL });
  } catch (err) {
    console.error('Confirmation email failed', err);   // the booking itself is already saved
  }
}
