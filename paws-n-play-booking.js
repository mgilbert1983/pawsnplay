/*
 * Paws n' Play booking widget + session stopwatch.
 * In index.html: <div id="paws-n-play-booking"></div>
 *                <script src="paws-n-play-booking.js" defer></script>
 * API is the public Apps Script /exec URL (not a secret). See BOOKING-SETUP.md.
 */
(() => {
  "use strict";
  const API = "https://script.google.com/macros/s/AKfycbwQgTzkRe_H9yZrpe_JNNMoVilLrBgNQ0kalSFGYGjxU_M1GBppjwFJFFSFWuZQmsPT/exec";
  const ROOT_ID = "paws-n-play-booking", KEY = "pnpBooking", MIN_FILL_S = 6;
  const root = document.getElementById(ROOT_ID);
  if (!root) return;

  const css = `
  #${ROOT_ID}{--p:#7b68ee;--d:#3414fd;--pink:#fad4fc;width:100%;color:var(--p);text-align:left}
  #${ROOT_ID} *{box-sizing:border-box;text-align:left;text-justify:auto;hyphens:none}
  #${ROOT_ID} .pnb{max-width:900px;margin:1.5rem auto;padding:0 1rem}
  #${ROOT_ID} .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-top:1rem}
  #${ROOT_ID} .f{display:flex;flex-direction:column;gap:.4rem;min-width:0}
  #${ROOT_ID} label{font-weight:650;font-size:.94rem}
  #${ROOT_ID} input,#${ROOT_ID} select,#${ROOT_ID} textarea{width:100%;min-height:44px;padding:.7rem .8rem;border:1px solid #c9c1ff;border-radius:8px;background:#fff;color:var(--p);font:inherit}
  #${ROOT_ID} textarea{min-height:80px}
  #${ROOT_ID} :focus-visible{outline:3px solid rgba(52,20,253,.25);outline-offset:1px}
  #${ROOT_ID} .slots{display:flex;flex-wrap:wrap;gap:.5rem;min-height:44px}
  #${ROOT_ID} .slot{width:auto;min-height:44px;padding:.5rem 1rem;border:2px solid var(--p);border-radius:8px;background:#fff;color:var(--p);font:inherit;font-weight:700;cursor:pointer}
  #${ROOT_ID} .slot[aria-checked=true]{background:var(--p);color:#fff}
  #${ROOT_ID} .btn{min-height:48px;padding:.8rem 1.4rem;border:0;border-radius:9px;background:var(--p);color:#fff;font:inherit;font-weight:750;cursor:pointer;margin-top:1.2rem}
  #${ROOT_ID} .btn:disabled{opacity:.55;cursor:not-allowed}
  #${ROOT_ID} .small{font-size:.88rem;line-height:1.5;margin:.6rem 0 0;max-width:none}
  #${ROOT_ID} .msg{font-weight:650;margin:.8rem 0 0;max-width:none}
  #${ROOT_ID} .trap{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}
  #${ROOT_ID} .watch{background:var(--pink);border-radius:14px;padding:1.2rem 1.4rem;margin-bottom:1.5rem}
  #${ROOT_ID} .watch h3{margin:0 0 .3rem;font-family:'League Spartan',sans-serif;font-size:1.4rem;text-align:left!important}
  #${ROOT_ID} .clock{font-family:'League Spartan',sans-serif;font-weight:900;font-size:clamp(2.6rem,9vw,4.2rem);line-height:1;font-variant-numeric:tabular-nums;color:var(--d);margin:.4rem 0}
  #${ROOT_ID} .clock.warn{color:#b45309}#${ROOT_ID} .clock.over{color:#b91c1c}
  #${ROOT_ID} .row{display:flex;gap:.6rem;flex-wrap:wrap}#${ROOT_ID} .row .btn{margin-top:.6rem}
  #${ROOT_ID} .btn.alt{background:#fff;color:var(--p);border:2px solid var(--p)}
  @media(max-width:620px){#${ROOT_ID} .grid{grid-template-columns:1fr}}`;
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: css }));

  root.innerHTML = `
  <div class="pnb">
    <div id="pnb-watch"></div>
    <form id="pnb-form" novalidate>
      <div class="trap" aria-hidden="true"><input id="pnb-hp" tabindex="-1" autocomplete="off"></div>
      <div class="grid">
        <div class="f"><label for="pnb-svc">What are you booking? *</label>
          <select id="pnb-svc"><option value="">Select a service</option><option value="cafe">Dog Cafe</option><option value="play">Dog Play Center</option><option value="groom">Dog Grooming</option></select></div>
        <div class="f"><label for="pnb-date">Date *</label><input id="pnb-date" type="date"></div>
      </div>
      <div class="f" style="margin-top:1rem"><label id="pnb-tl">Time *</label><div id="pnb-slots" class="slots" role="radiogroup" aria-labelledby="pnb-tl"></div></div>
      <div class="grid">
        <div class="f"><label for="pnb-name">Your name *</label><input id="pnb-name" autocomplete="name"></div>
        <div class="f"><label for="pnb-dog">Dog's name *</label><input id="pnb-dog"></div>
        <div class="f"><label for="pnb-phone">Phone *</label><input id="pnb-phone" type="tel" autocomplete="tel"></div>
        <div class="f"><label for="pnb-email">Email *</label><input id="pnb-email" type="email" autocomplete="email"></div>
      </div>
      <div class="f" style="margin-top:1rem"><label for="pnb-notes">Notes (allergies, coat, anything we should know)</label><textarea id="pnb-notes" maxlength="500"></textarea></div>
      <p class="small">Open weekdays 9AM to 5PM. Please complete the <a href="#waiver">Dog Owner Waiver</a> before your visit. Grooming needs a non-refundable deposit, and we will contact you to arrange it.</p>
      <button id="pnb-go" class="btn" type="submit">Book this time</button>
      <p id="pnb-msg" class="msg" role="status" aria-live="polite"></p>
    </form>
  </div>`;

  const $ = id => root.querySelector("#pnb-" + id);
  const svc = $("svc"), dateEl = $("date"), slotsEl = $("slots"), msg = $("msg"), go = $("go"), loaded = Date.now();
  let chosen = "", reqId = 0;
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  dateEl.min = iso(new Date()); dateEl.max = iso(new Date(Date.now() + 60 * 864e5));
  const configured = !API.startsWith("PASTE_");
  if (!configured) msg.textContent = "Online booking is not switched on yet. Please call 778-737-7529.";

  async function loadSlots() {
    chosen = ""; slotsEl.innerHTML = ""; msg.textContent = "";
    if (!configured || !svc.value || !dateEl.value) return;
    const id = ++reqId; slotsEl.textContent = "Checking times...";
    try {
      const r = await (await fetch(`${API}?action=slots&service=${svc.value}&date=${dateEl.value}`)).json();
      if (id !== reqId) return;
      if (!r.ok) throw new Error();
      slotsEl.innerHTML = "";
      if (!r.slots.length) { slotsEl.textContent = "No times left that day. Try another weekday."; return; }
      r.slots.forEach(s => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "slot"; b.textContent = s.label; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false");
        b.onclick = () => { chosen = s.t; slotsEl.querySelectorAll(".slot").forEach(x => x.setAttribute("aria-checked", String(x === b))); };
        slotsEl.appendChild(b);
      });
    } catch (e) { if (id === reqId) slotsEl.textContent = "Could not load times. Please try again or call 778-737-7529."; }
  }
  svc.onchange = dateEl.onchange = loadSlots;

  $("go").form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const v = k => $(k).value.trim();
    if (!configured) return;
    if (!svc.value || !dateEl.value || !chosen || !v("name") || !v("dog") || !v("phone") || !/^\S+@\S+\.\S+$/.test(v("email"))) {
      msg.textContent = "Please choose a service, date and time, and fill in your name, dog, phone and a valid email."; return;
    }
    if ((Date.now() - loaded) / 1000 < MIN_FILL_S) { msg.textContent = "Please review the form and try again."; return; }
    go.disabled = true; go.textContent = "Booking..."; msg.textContent = "";
    try {
      const res = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({
        service: svc.value, date: dateEl.value, time: chosen, name: v("name"), dog: v("dog"), phone: v("phone"), email: v("email"), notes: v("notes"), hp: v("hp") }) });
      const r = await res.json();
      if (!r.ok) { msg.textContent = r.error || "Booking failed. Please call 778-737-7529."; loadSlots(); return; }
      localStorage.setItem(KEY, JSON.stringify({ label: r.label, minutes: r.minutes, start: r.start, end: r.end, dog: v("dog") }));
      msg.textContent = "Booked. A confirmation is on its way to your email.";
      ["name", "dog", "phone", "email", "notes"].forEach(k => $(k).value = ""); svc.value = ""; dateEl.value = ""; chosen = ""; slotsEl.innerHTML = "";
      drawWatch();
    } catch (e) { msg.textContent = "We could not confirm your booking. Please try again or call 778-737-7529."; }
    finally { go.disabled = false; go.textContent = "Book this time"; }
  });

  /* ---------- Session stopwatch ---------- */
  const watch = $("watch"); let timer = null;
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  const put = b => localStorage.setItem(KEY, JSON.stringify(b));
  const fmt = ms => { const s = Math.floor(Math.abs(ms) / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s % 60).padStart(2, "0"); };

  function drawWatch() {
    clearInterval(timer);
    const b = get();
    if (!b || Date.now() > Date.parse(b.end) + 12 * 36e5) { localStorage.removeItem(KEY); watch.innerHTML = ""; return; }
    const when = new Date(b.start).toLocaleString([], { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
    watch.innerHTML = `<div class="watch"><h3>${b.label} for ${b.dog.replace(/[<>&"]/g, "")}</h3><p class="small" style="margin:0">${when}</p>
      <div id="pnb-clock" class="clock" aria-live="off">0:00</div><p id="pnb-sub" class="small" style="margin:0"></p>
      <div class="row"><button id="pnb-start" class="btn" type="button"></button><button id="pnb-clear" class="btn alt" type="button">Remove</button></div></div>`;
    const clock = $("clock"), sub = $("sub"), start = $("start");
    $("clear").onclick = () => { localStorage.removeItem(KEY); drawWatch(); };
    start.onclick = () => { const x = get(); if (x.startedAt && !x.stoppedAt) x.stoppedAt = Date.now(); else if (!x.startedAt) x.startedAt = Date.now(); put(x); tick(); };
    const tick = () => {
      const x = get(); if (!x) return; const now = Date.now(), s0 = Date.parse(x.start), len = x.minutes * 6e4;
      clock.className = "clock";
      if (!x.startedAt) {
        const wait = s0 - 15 * 6e4 - now;
        clock.textContent = fmt(Math.max(s0 - now, 0)); sub.textContent = now < s0 ? "until your booked time" : "Your time has arrived.";
        start.textContent = "Start stopwatch"; start.disabled = wait > 0;
      } else {
        const el = (x.stoppedAt || now) - x.startedAt, left = len - el;
        clock.textContent = fmt(el);
        if (x.stoppedAt) { sub.textContent = "Stopped. Total visit time."; start.style.display = "none"; clearInterval(timer); return; }
        start.textContent = "Stop"; start.disabled = false;
        if (left < 0) { clock.classList.add("over"); sub.textContent = "Over your booked time by " + fmt(left) + "."; }
        else { if (left <= 5 * 6e4) clock.classList.add("warn"); sub.textContent = fmt(left) + " left of your " + x.minutes + " minute booking."; }
      }
    };
    tick(); timer = setInterval(tick, 1000);
  }
  drawWatch();
})();
