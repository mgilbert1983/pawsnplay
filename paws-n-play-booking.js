/*
 * Paws n' Play booking widget + session stopwatch.
 * In index.html: <div id="paws-n-play-booking"></div>
 *                <script src="paws-n-play-booking.js" defer></script>
 * API is the public Apps Script /exec URL (not a secret). See BOOKING-SETUP.md.
 */
(() => {
  "use strict";
  const API = "https://script.google.com/macros/s/AKfycbwQgTzkRe_H9yZrpe_JNNMoVilLrBgNQ0kalSFGYGjxU_M1GBppjwFJFFSFWuZQmsPT/exec";
  // Dog walking is booked through its own small Apps Script (see walks/WALK-SETUP.md).
  // Until the address below is filled in, choosing Dog Walking tells visitors to call instead.
  const WALK_API = "https://script.google.com/macros/s/AKfycbxiA1QCnQxvCxcX52oUKwqWyR7QCeuqzTxVgOubOClVQloZcRQr9dTSVxuNjQjkQ-r1/exec";
  const WALK_TYPES = {
    group: { label: "Group Walk", min: 60, price: 20, kind: "group" },
    p30: { label: "Private Walk", min: 30, price: 20, kind: "private" },
    p60: { label: "Private Walk", min: 60, price: 40, kind: "private" },
    p90: { label: "Private Walk", min: 90, price: 55, kind: "private" }
  };
  const EXTRA_DOG_PRICE = 12;
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
  #${ROOT_ID} [hidden]{display:none!important}
  #${ROOT_ID} .chk{display:flex;gap:.6rem;align-items:flex-start;font-weight:600;margin-top:.8rem;cursor:pointer}
  #${ROOT_ID} .chk input{width:auto;min-height:0;margin-top:.25rem;flex:0 0 auto}
  #${ROOT_ID} .walkbox{margin-top:1rem;padding:1rem;border:2px dashed #c9c1ff;border-radius:12px;background:#fff}
  #${ROOT_ID} .price{font-weight:700;color:var(--d)}
  @media(max-width:620px){#${ROOT_ID} .grid{grid-template-columns:1fr}}`;
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: css }));

  root.innerHTML = `
  <div class="pnb">
    <form id="pnb-form" novalidate>
      <div class="trap" aria-hidden="true"><input id="pnb-hp" tabindex="-1" autocomplete="off"></div>
      <div class="grid">
        <div class="f"><label for="pnb-svc">What are you booking? *</label>
          <select id="pnb-svc"><option value="">Select a service</option><option value="cafe">Dog Cafe</option><option value="play">Dog Play Center</option><option value="groom">Dog Grooming</option><option value="walk">Dog Walking</option></select></div>
        <div class="f"><label for="pnb-date">Date *</label><input id="pnb-date" type="date"></div>
      </div>
      <div id="pnb-walkbox" class="walkbox" hidden>
        <div class="grid" style="margin-top:0">
          <div class="f"><label for="pnb-wtype">Type of walk *</label>
            <select id="pnb-wtype"><option value="group">Group Walk &ndash; 60 minutes &ndash; $20</option><option value="p30">Private Walk &ndash; 30 minutes &ndash; $20</option><option value="p60">Private Walk &ndash; 60 minutes &ndash; $40</option><option value="p90">Private Walk &ndash; 90 minutes &ndash; $55</option></select></div>
          <div class="f" id="pnb-wextra-wrap"><label for="pnb-wextra">Additional dogs from the same household ($12 each)</label>
            <select id="pnb-wextra"><option value="0">None</option><option value="1">1 additional dog</option><option value="2">2 additional dogs</option><option value="3">3 additional dogs</option></select></div>
        </div>
        <p class="small price" id="pnb-wprice"></p>
        <p class="small" id="pnb-wprivnote" hidden>Need an additional dog or a second walk on the same day? Please contact us for private-walk rates.</p>
        <label class="chk" id="pnb-wcommit-wrap" for="pnb-wcommit"><input id="pnb-wcommit" type="checkbox"><span>I understand that Group Walks require a commitment of at least one walk per week. *</span></label>
      </div>
      <div id="pnb-groombox" class="walkbox" hidden>
        <div class="grid" style="margin-top:0">
          <div class="f"><label for="pnb-gpkg">Grooming package *</label>
            <select id="pnb-gpkg"><option value="bb">Bath &amp; Brush &ndash; $45+ to $100+</option><option value="bbt">Bath, Brush &amp; Tidy &ndash; $65+ to $130+</option><option value="full">Full Groom &ndash; $75+ to $150+</option><option value="deshed">Bath &amp; De-Shedding &ndash; bath charge + $15 per 15 min.</option></select></div>
          <div class="f"><label for="pnb-gbreed">Your dog&rsquo;s breed and size *</label><input id="pnb-gbreed" maxlength="80" placeholder="e.g. Goldendoodle, large"></div>
        </div>
        <div class="f" style="margin-top:1rem"><label>&Agrave; la carte add-ons ($20 each)</label>
          <label class="chk" for="pnb-gadd-face"><input class="gadd" id="pnb-gadd-face" type="checkbox" value="face"><span>Face Trim</span></label>
          <label class="chk" for="pnb-gadd-nails"><input class="gadd" id="pnb-gadd-nails" type="checkbox" value="nails"><span>Nail Trim &amp; Filing</span></label>
          <label class="chk" for="pnb-gadd-pads"><input class="gadd" id="pnb-gadd-pads" type="checkbox" value="pads"><span>Pad Trim &amp; Paw Shaping</span></label></div>
        <p class="small price" id="pnb-gprice"></p>
        <label class="chk" for="pnb-ghealth"><input id="pnb-ghealth" type="checkbox"><span>My dog has up-to-date rabies vaccinations and has no fleas or ticks. *</span></label>
        <label class="chk" for="pnb-gterms"><input id="pnb-gterms" type="checkbox"><span>I understand that a non-refundable deposit is required (the team will contact me to arrange it), that cancellations under 24 hours or no-shows are charged the full fee, and that arriving more than 15 minutes late may result in rescheduling and a no-show fee. *</span></label>
      </div>
      <div class="f" style="margin-top:1rem"><label id="pnb-tl">Time *</label><div id="pnb-slots" class="slots" role="radiogroup" aria-labelledby="pnb-tl"></div></div>
      <div class="grid">
        <div class="f"><label for="pnb-name">Your name *</label><input id="pnb-name" autocomplete="name"></div>
        <div class="f"><label for="pnb-dog">Dog's name *</label><input id="pnb-dog"></div>
        <div class="f"><label for="pnb-phone">Phone *</label><input id="pnb-phone" type="tel" autocomplete="tel"></div>
        <div class="f"><label for="pnb-email">Email *</label><input id="pnb-email" type="email" autocomplete="email"></div>
      </div>
      <div class="f" style="margin-top:1rem"><label for="pnb-notes">Notes (allergies, coat, anything we should know)</label><textarea id="pnb-notes" maxlength="500"></textarea></div>
      <p class="small" id="pnb-note">Open weekdays 9AM to 5PM. Please complete the <a href="#waiver">Dog Owner Waiver</a> before your visit. Grooming needs a non-refundable deposit, and we will contact you to arrange it.</p>
      <button id="pnb-go" class="btn" type="submit">Book this time</button>
      <p id="pnb-msg" class="msg" role="status" aria-live="polite"></p>
    </form>
  </div>`;

  const $ = id => root.querySelector("#pnb-" + id);
  const svc = $("svc"), dateEl = $("date"), slotsEl = $("slots"), msg = $("msg"), go = $("go"), loaded = Date.now();
  const walkBox = $("walkbox"), wtype = $("wtype"), wextra = $("wextra"), wextraWrap = $("wextra-wrap"),
    wcommitWrap = $("wcommit-wrap"), wprice = $("wprice"), wprivnote = $("wprivnote"), noteEl = $("note");
  const NOTE_DEFAULT = noteEl.innerHTML;
  const NOTE_WALK = 'Walks run between 10:00 AM and 4:00 PM. Appointments canceled less than 24 hours before the start time are billed the full fee. All prices are subject to GST. Please complete the <a href="#waiver">Dog Owner Waiver</a> before your first walk.';
  const walkConfigured = !WALK_API.startsWith("PASTE_");
  const isWalk = () => svc.value === "walk";
  // Grooming uses the new package/add-on booking only once the booking web app says it can take it.
  // Until then (or if it is unreachable) grooming keeps using the original booking, unchanged.
  let groomNew = false, groomMinutes = 0;
  const isGroom = () => svc.value === "groom" && groomNew;
  const useNew = () => isWalk() || isGroom();
  const groomBox = $("groombox"), gpkg = $("gpkg"), gprice = $("gprice");
  const NOTE_GROOM = 'Grooming appointments run Monday to Friday. New clients must register, so please complete the <a href="#waiver">Dog Owner Waiver</a>. A non-refundable deposit is required and we will contact you to arrange it. All prices are starting prices and are subject to GST.';
  const GROOM_START = { bb: "$45+", bbt: "$65+", full: "$75+", deshed: "" };
  const addonKeys = () => [...root.querySelectorAll(".gadd")].filter(c => c.checked).map(c => c.value);
  function groomPriceText() {
    const n = addonKeys().length, base = gpkg.value;
    let t = base === "deshed" ? "Bath & De-Shedding: bath charge + $15 per 15 min." : `Starting at ${GROOM_START[base]}`;
    if (n) t += `, plus $${n * 20} in add-ons`;
    t += ", plus GST. The final price depends on your dog's size, coat and behaviour.";
    if (groomMinutes) t += ` Allow about ${groomMinutes} minutes.`;
    return t;
  }
  const walkType = () => WALK_TYPES[wtype.value] || WALK_TYPES.group;
  const WALK_OFF = "Online dog walk booking is not switched on yet. Please call 778-737-7529.";
  function syncWalkUI() {
    const w = isWalk(), t = walkType(), group = t.kind === "group";
    walkBox.hidden = !w;
    groomBox.hidden = !isGroom();
    if (isGroom()) gprice.textContent = groomPriceText();
    wextraWrap.hidden = !group; wcommitWrap.hidden = !group; wprivnote.hidden = group;
    if (!group) wextra.value = "0";
    const extra = Number(wextra.value || 0), total = t.price + (group ? extra * EXTRA_DOG_PRICE : 0);
    wprice.textContent = `${t.label}, ${t.min} minutes: $${t.price}` + (group && extra ? ` + ${extra} additional dog${extra > 1 ? "s" : ""} at $${EXTRA_DOG_PRICE} = $${total}` : "") + " plus GST.";
    noteEl.innerHTML = w ? NOTE_WALK : (isGroom() ? NOTE_GROOM : NOTE_DEFAULT);
  }
  function slotsUrl() {
    if (isWalk()) return `${WALK_API}?action=slots&type=${wtype.value}&date=${dateEl.value}&dogs=${1 + Number(wextra.value || 0)}`;
    if (isGroom()) return `${WALK_API}?service=groom&pkg=${gpkg.value}&addons=${addonKeys().join(",")}&date=${dateEl.value}`;
    return `${API}?action=slots&service=${svc.value}&date=${dateEl.value}`;
  }
  let chosen = "", reqId = 0;
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  dateEl.min = iso(new Date()); dateEl.max = iso(new Date(Date.now() + 60 * 864e5));
  const configured = !API.startsWith("PASTE_");
  if (!configured) msg.textContent = "Online booking is not switched on yet. Please call 778-737-7529.";

  async function loadSlots() {
    chosen = ""; slotsEl.innerHTML = ""; msg.textContent = "";
    if (!svc.value || !dateEl.value) return;
    if (useNew() ? !walkConfigured : !configured) { if (isWalk()) msg.textContent = WALK_OFF; return; }
    const id = ++reqId; slotsEl.textContent = "Checking times...";
    try {
      const r = await (await fetch(slotsUrl())).json();
      if (id !== reqId) return;
      if (!r.ok) throw new Error();
      if (isGroom() && r.minutes) { groomMinutes = r.minutes; gprice.textContent = groomPriceText(); }
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
  svc.onchange = () => { syncWalkUI(); loadSlots(); };
  dateEl.onchange = loadSlots;
  wtype.onchange = wextra.onchange = () => { syncWalkUI(); loadSlots(); };
  const onGroomChange = () => { groomMinutes = 0; syncWalkUI(); loadSlots(); };
  gpkg.onchange = onGroomChange;
  root.querySelectorAll(".gadd").forEach(c => { c.onchange = onGroomChange; });
  syncWalkUI();
  if (walkConfigured) {
    fetch(`${WALK_API}?action=info`).then(r => r.json()).then(j => {
      if (j && j.ok && Array.isArray(j.services) && j.services.includes("groom")) { groomNew = true; syncWalkUI(); if (svc.value === "groom") loadSlots(); }
    }).catch(() => {});
  }

  $("go").form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const v = k => $(k).value.trim();
    if (useNew() ? !walkConfigured : !configured) { if (isWalk()) msg.textContent = WALK_OFF; return; }
    if (!svc.value || !dateEl.value || !chosen || !v("name") || !v("dog") || !v("phone") || !/^\S+@\S+\.\S+$/.test(v("email"))) {
      msg.textContent = "Please choose a service, date and time, and fill in your name, dog, phone and a valid email."; return;
    }
    if (isWalk() && walkType().kind === "group" && !$("wcommit").checked) { msg.textContent = "Please confirm the weekly commitment for Group Walks."; return; }
    if (isGroom()) {
      if (!$("gbreed").value.trim()) { msg.textContent = "Please tell us your dog's breed and size."; return; }
      if (!$("ghealth").checked) { msg.textContent = "Please confirm your dog has up-to-date rabies vaccinations and no fleas or ticks."; return; }
      if (!$("gterms").checked) { msg.textContent = "Please confirm the deposit, cancellation and arrival terms."; return; }
    }
    if ((Date.now() - loaded) / 1000 < MIN_FILL_S) { msg.textContent = "Please review the form and try again."; return; }
    go.disabled = true; go.textContent = "Booking..."; msg.textContent = "";
    try {
      const body = isWalk()
        ? { type: wtype.value, date: dateEl.value, time: chosen, name: v("name"), dog: v("dog"), phone: v("phone"), email: v("email"), notes: v("notes"),
            extraDogs: walkType().kind === "group" ? Number(wextra.value || 0) : 0, commit: $("wcommit").checked, hp: v("hp") }
        : isGroom()
          ? { service: "groom", pkg: gpkg.value, addons: addonKeys(), date: dateEl.value, time: chosen, name: v("name"), dog: v("dog"), breed: v("gbreed"), phone: v("phone"), email: v("email"), notes: v("notes"),
              health: $("ghealth").checked, terms: $("gterms").checked, hp: v("hp") }
          : { service: svc.value, date: dateEl.value, time: chosen, name: v("name"), dog: v("dog"), phone: v("phone"), email: v("email"), notes: v("notes"), hp: v("hp") };
      const res = await fetch(useNew() ? WALK_API : API, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(body) });
      const r = await res.json();
      if (!r.ok) { msg.textContent = r.error || "Booking failed. Please call 778-737-7529."; loadSlots(); return; }
      msg.textContent = "Booked. A confirmation is on its way to your email. To see your booking and its countdown timer, sign in to ";
      const acct = document.createElement("a"); acct.href = "account.html"; acct.textContent = "My Account"; msg.appendChild(acct); msg.appendChild(document.createTextNode("."));
      ["name", "dog", "phone", "email", "notes"].forEach(k => $(k).value = ""); svc.value = ""; dateEl.value = ""; chosen = ""; slotsEl.innerHTML = ""; wextra.value = "0"; $("wcommit").checked = false;
      gpkg.value = "bb"; root.querySelectorAll(".gadd").forEach(c => { c.checked = false; }); $("ghealth").checked = false; $("gterms").checked = false; $("gbreed").value = ""; groomMinutes = 0;
      syncWalkUI();
    } catch (e) { msg.textContent = "We could not confirm your booking. Please try again or call 778-737-7529."; }
    finally { go.disabled = false; go.textContent = "Book this time"; }
  });

  /* The booking countdown/stopwatch no longer shows on this public page (it could reveal someone's booking to the next person
     using the same device). Customers see it after signing in to My Account. Clear anything an earlier version saved here. */
  try { localStorage.removeItem(KEY); } catch (e) { /* storage blocked: nothing to clear */ }
})();
