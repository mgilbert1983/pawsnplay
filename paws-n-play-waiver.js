/*
 * Paws N Play Dog Cafe & Playground, Waiver Form Module
 * Include this file from your index.html:
 *   <div id="paws-n-play-waiver"></div>
 *   <script src="paws-n-play-waiver.js" defer></script>
 *
 * EMAIL DELIVERY
 * Submissions are posted to FormSubmit's AJAX endpoint, which emails them to
 * RECIPIENT and copies CC_RECIPIENTS. The inbox must be activated once (see
 * WAIVER-EMAIL-SETUP.md). No API keys or secrets are used or needed.
 */
(() => {
  "use strict";

  // ---- Delivery settings (the only lines you should ever need to edit) ----
  const RECIPIENT = "pawsnplayvancouver@gmail.com";   // primary inbox (must be activated once)
  const CC_RECIPIENTS = "tonysdestiny@shaw.ca,mgilbert1983@gmail.com"; // comma-separate to add more
  // After activation FormSubmit emails you a private random ID. You may paste it
  // here instead of the address to keep the inbox out of the page source.
  const FORMSUBMIT_TARGET = RECIPIENT;
  const ENDPOINT = `https://formsubmit.co/ajax/${FORMSUBMIT_TARGET}`;
  const FALLBACK_PHONE = "778-737-7529";
  const MIN_FILL_SECONDS = 8;                          // bot trap: humans cannot finish faster
  const ROOT_ID = "paws-n-play-waiver";

  const styles = `
    #${ROOT_ID} { --pnp-purple:#3414fd; --pnp-line:#d9d3ff; --pnp-pale:#f7f5ff; color:var(--pnp-purple); font-family:inherit; width:100%; }
    #${ROOT_ID} *, #${ROOT_ID} *::before, #${ROOT_ID} *::after { box-sizing:border-box; }
    #${ROOT_ID} .pnp-card { width:100%; max-width:900px; margin:2rem auto; padding:clamp(1rem,3vw,2rem); background:transparent; border:0; border-radius:0; box-shadow:none; }
    #${ROOT_ID} .pnp-intro { width:100%; margin:0 0 1.5rem; color:var(--pnp-purple) !important; line-height:1.65; text-align:left; }
    #${ROOT_ID} p, #${ROOT_ID} label, #${ROOT_ID} legend, #${ROOT_ID} strong, #${ROOT_ID} span, #${ROOT_ID} .pnp-small, #${ROOT_ID} .pnp-legal, #${ROOT_ID} .pnp-note, #${ROOT_ID} .pnp-check span, #${ROOT_ID} .pnp-status { color:var(--pnp-purple) !important; text-align:left; text-justify:auto; hyphens:auto; -webkit-hyphens:auto; overflow-wrap:anywhere; }
    #${ROOT_ID} p, #${ROOT_ID} .pnp-legal, #${ROOT_ID} .pnp-note, #${ROOT_ID} .pnp-intro { display:block; width:100%; max-width:none; }
    #${ROOT_ID} fieldset { display:block; width:100%; min-width:0; border:0; border-top:3px solid var(--pnp-line); margin:1.5rem 0 0; padding:1.25rem 0 0; }
    #${ROOT_ID} legend { max-width:100%; padding:0 .5rem 0 0; font-weight:750; font-size:1.08rem; }
    #${ROOT_ID} .pnp-grid { display:grid; width:100%; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; }
    #${ROOT_ID} .pnp-field { display:flex; flex-direction:column; gap:.4rem; min-width:0; width:100%; }
    #${ROOT_ID} label { font-weight:650; font-size:.94rem; }
    #${ROOT_ID} input:not([type=checkbox]):not([type=radio]), #${ROOT_ID} select, #${ROOT_ID} textarea { width:100%; min-height:44px; padding:.7rem .8rem; border:1px solid #c9c1ff; border-radius:8px; background:#fff; color:var(--pnp-purple) !important; font:inherit; text-align:left; }
    #${ROOT_ID} textarea { min-height:90px; resize:vertical; }
    #${ROOT_ID} input:focus, #${ROOT_ID} select:focus, #${ROOT_ID} textarea:focus { outline:3px solid rgba(52,20,253,.15); border-color:var(--pnp-purple); }
    #${ROOT_ID} .pnp-checks { display:grid; width:100%; gap:.85rem; margin-top:.8rem; }
    #${ROOT_ID} .pnp-check { display:flex; align-items:flex-start; gap:.7rem; line-height:1.5; font-weight:400; width:100%; }
    #${ROOT_ID} .pnp-check input[type=checkbox], #${ROOT_ID} input[type=checkbox], #${ROOT_ID} input[type=radio] { accent-color:var(--pnp-purple) !important; }
    #${ROOT_ID} .pnp-check input { width:1.15rem; height:1.15rem; margin-top:.18rem; flex:0 0 auto; accent-color:var(--pnp-purple) !important; }
    #${ROOT_ID} .pnp-note { margin:.8rem 0 0; padding:.85rem 1rem; background:var(--pnp-pale); border-radius:8px; line-height:1.5; }
    #${ROOT_ID} .pnp-legal { line-height:1.65; }
    #${ROOT_ID} .pnp-actions { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-top:1.5rem; width:100%; }
    #${ROOT_ID} button { min-height:48px; padding:.8rem 1.3rem; border:0; border-radius:9px; background:var(--pnp-purple); color:white !important; font:inherit; font-weight:750; cursor:pointer; }
    #${ROOT_ID} button:hover { filter:brightness(.93); }
    #${ROOT_ID} button:disabled { opacity:.65; cursor:wait; }
    #${ROOT_ID} .pnp-status { margin:.8rem 0 0; font-weight:650; }
    #${ROOT_ID} .pnp-small { font-size:.88rem; line-height:1.5; }
    #${ROOT_ID} .pnp-required { color:var(--pnp-purple) !important; font-weight:750; }
    #${ROOT_ID} .pnp-trap { position:absolute; left:-10000px; width:1px; height:1px; overflow:hidden; }
    @media (max-width:620px) { #${ROOT_ID} .pnp-grid { grid-template-columns:1fr; } #${ROOT_ID} .pnp-card { border-radius:10px; } }
  `;

  const root = document.getElementById(ROOT_ID);
  if (!root) {
    console.error(`Paws N Play waiver: add <div id="${ROOT_ID}"></div> before loading this script.`);
    return;
  }

  const style = document.createElement("style");
  style.textContent = styles;
  document.head.appendChild(style);

  root.innerHTML = `
    <section class="pnp-card" aria-labelledby="pnp-title">
      <p class="pnp-intro" id="pnp-title"><strong>Dog Owner Waiver, Release &amp; Responsibility Agreement</strong><br>
      Please complete every required field and acknowledgement. Required fields are marked <span class="pnp-required">*</span>.</p>

      <form id="pnp-waiver-form" action="${ENDPOINT}" method="POST">
        <input type="hidden" name="_cc" value="${CC_RECIPIENTS}">
        <input type="hidden" name="_subject" value="New Paws N Play Dog Owner Waiver Submission">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="Submitted At" value="">
        <input type="hidden" name="Submitted From Page" value="">
        <div class="pnp-trap" aria-hidden="true"><label>Leave this field empty<input name="_honey" tabindex="-1" autocomplete="off"></label></div>

        <fieldset>
          <legend>Owner / Handler Information</legend>
          <div class="pnp-grid">
            <div class="pnp-field"><label for="pnp-owner">Owner/Handler full name <span class="pnp-required">*</span></label><input id="pnp-owner" name="Owner / Handler Name" autocomplete="name" required></div>
            <div class="pnp-field"><label for="pnp-phone">Phone <span class="pnp-required">*</span></label><input id="pnp-phone" name="Owner Phone" type="tel" autocomplete="tel" required></div>
            <div class="pnp-field"><label for="pnp-email">Email <span class="pnp-required">*</span></label><input id="pnp-email" name="Owner Email" type="email" autocomplete="email" required></div>
            <div class="pnp-field"><label for="pnp-emergency-name">Emergency contact name <span class="pnp-required">*</span></label><input id="pnp-emergency-name" name="Emergency Contact Name" required></div>
            <div class="pnp-field"><label for="pnp-emergency-phone">Emergency contact phone <span class="pnp-required">*</span></label><input id="pnp-emergency-phone" name="Emergency Contact Phone" type="tel" required></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Dog Information</legend>
          <div class="pnp-grid">
            <div class="pnp-field"><label for="pnp-dog">Dog's name <span class="pnp-required">*</span></label><input id="pnp-dog" name="Dog Name" required></div>
            <div class="pnp-field"><label for="pnp-breed">Breed (or best-known mix) <span class="pnp-required">*</span></label><input id="pnp-breed" name="Dog Breed" required></div>
            <div class="pnp-field"><label for="pnp-tag">Dog licence tag number <span class="pnp-required">*</span></label><input id="pnp-tag" name="Dog Licence Tag Number" required></div>
            <div class="pnp-field"><label for="pnp-service">Primary service / area</label>
              <select id="pnp-service" name="Intended Service">
                <option value="">Select an option</option><option>Dog Cafe</option><option>Playground</option><option>Daycare</option><option>Boarding</option><option>Grooming</option><option>Other / multiple areas</option>
              </select>
            </div>
            <div class="pnp-field"><label for="pnp-vet">Preferred veterinarian</label><input id="pnp-vet" name="Preferred Veterinarian"></div>
            <div class="pnp-field"><label for="pnp-vet-phone">Veterinarian phone</label><input id="pnp-vet-phone" name="Veterinarian Phone" type="tel"></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Vaccination Requirements — Mandatory</legend>
          <p class="pnp-legal">All dogs must have current vaccination records on file before entering or using any part of the premises. Records must identify the dog and show the vaccine type and current expiry/renewal date. Proof can be obtained from your veterinarian. Playground access is refused if records are missing, incomplete or expired.</p>
          <div class="pnp-checks">
            <label class="pnp-check"><input type="checkbox" name="Rabies Record Provided" value="Yes" required><span>I have provided Paws N Play with my dog's current Rabies vaccination record. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Bordetella Record Provided" value="Yes" required><span>I have provided Paws N Play with my dog's current Kennel Cough (Bordetella) vaccination record. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Vaccination Records Required Before Entry" value="Acknowledged" required><span>I understand my dog cannot enter or use any part of the premises, including the cafe lounge and indoor playground, until both required vaccination records have been provided and are on file. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Update Vaccination Records" value="Acknowledged" required><span>I am responsible for providing updated vaccination records when vaccinations are renewed or expire. <span class="pnp-required">*</span></span></label>
          </div>
          <p class="pnp-note"><strong>Important:</strong> Checking these boxes confirms that the records have been provided; it does not upload the records. Please submit the records separately using the process provided by Paws N Play.</p>
        </fieldset>

        <fieldset>
          <legend>Dog Health &amp; Behaviour</legend>
          <div class="pnp-checks">
            <label class="pnp-check"><input type="checkbox" name="Non-Reactive Confirmation" value="Confirmed" required><span><strong>Non-reactive:</strong> To the best of my knowledge, my dog is not reactive toward people or other dogs in a way that would make participation unsafe. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Non-Aggressive Confirmation" value="Confirmed" required><span><strong>Non-aggressive:</strong> To the best of my knowledge, my dog is not aggressive toward people or other dogs. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Good Health Confirmation" value="Confirmed" required><span>My dog is currently in good health and, to the best of my knowledge, does not have a contagious illness, infection, parasites, vomiting, diarrhea, coughing or another condition that could put other dogs or people at risk. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Behaviour Disclosure Agreement" value="Agreed" required><span>I will immediately inform staff of known behavioural concerns, bite history, guarding behaviour, fear, anxiety or other information that could affect safety. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Dogs In Heat Not Permitted" value="Acknowledged" required><span>I understand that dogs in heat are not permitted in the cafe lounge or indoor playground. <span class="pnp-required">*</span></span></label>
            <p class="pnp-small">Paws N Play may refuse or discontinue access if a dog's health or behaviour presents a safety concern.</p>
          </div>
          <div class="pnp-field" style="margin-top:1rem"><label for="pnp-behaviour">Additional health or behaviour information (if applicable)</label><textarea id="pnp-behaviour" name="Additional Health or Behaviour Information" placeholder="Please disclose anything staff should know for safety."></textarea></div>
        </fieldset>

        <fieldset>
          <legend>Owner / Handler Responsibility</legend>
          <div class="pnp-checks">
            <label class="pnp-check"><input type="checkbox" name="Supervision Responsibility" value="Agreed" required><span>I am responsible for my dog and its behaviour while on the premises, including while my dog is in the cafe lounge or the playground. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Supervise and Control Dog" value="Agreed" required><span>I will supervise and maintain reasonable control of my dog in the cafe, playground and other customer areas. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Leash at Table in Cafe Lounge" value="Agreed" required><span>I will keep my dog on a leash at my table in the cafe lounge and under my direct supervision. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Playground Responsibility and Attendants" value="Agreed" required><span>I understand I remain responsible for my dog while it uses the playground, whether I am in the playground or the cafe lounge. Playground attendants provide general supervision, help prevent and address issues, and support a positive playground experience, but their supervision does not replace my responsibility for my dog. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Notify Attendant Before Leaving Dog" value="Agreed" required><span>If I need to use the washroom or leave my dog at any point while in the seating lounge, foyer or playground, I must notify a playground attendant and arrange for the attendant to watch my dog until I return. I must receive confirmation from the attendant before leaving my dog and I remain responsible for my dog. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Dog Licence Tag on Collar" value="Acknowledged" required><span>As per City of Vancouver Animal Control By-law No. 9150, s. 3.5, my dog must wear a licence tag on its collar, and the tag must match the licence tag number entered above. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Cleanup and Rules" value="Agreed" required><span>I will clean up after my dog and follow posted rules and staff instructions. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Responsibility for Dog Damage" value="Agreed" required><span>I accept responsibility for injury or damage caused by my dog to another dog, person, property, furniture, equipment or the premises, to the extent permitted by law. <span class="pnp-required">*</span></span></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Assumption of Risk</legend>
          <p class="pnp-legal">I understand that interactions between dogs involve inherent and unpredictable risks. Even friendly, well-socialized dogs may become frightened, reactive or defensive, be injured or become involved in an altercation. I voluntarily assume the ordinary and inherent risks associated with bringing my dog onto the premises and allowing interaction with other dogs and people, including bites, scratches, falls, collisions, illness, disease transmission, escape, property damage and injury.</p>
          <label class="pnp-check"><input type="checkbox" name="Assumption of Risk Acknowledged" value="Acknowledged" required><span>I have read and acknowledge the assumption-of-risk statement above. <span class="pnp-required">*</span></span></label>
        </fieldset>

        <fieldset>
          <legend>Release &amp; Liability</legend>
          <p class="pnp-legal">To the fullest extent permitted by applicable law, I agree that Paws N Play, its owners, employees, contractors and representatives will not be responsible for injury, illness, loss or damage arising from the ordinary and inherent risks of dog interactions or use of the premises. Nothing in this waiver is intended to exclude or limit liability that cannot legally be excluded or limited under British Columbia law.</p>
          <label class="pnp-check"><input type="checkbox" name="Release and Liability Acknowledged" value="Acknowledged" required><span>I have read and acknowledge the release and liability statement above. <span class="pnp-required">*</span></span></label>
        </fieldset>

        <fieldset>
          <legend>Emergency Care</legend>
          <p class="pnp-legal">If an emergency occurs and I cannot be reached, I authorize Paws N Play staff to take reasonable steps to protect my dog's immediate health and safety, including contacting or transporting my dog to a veterinarian when reasonably necessary. I understand that I am responsible for veterinary expenses incurred on my dog's behalf, except to the extent responsibility is determined otherwise under applicable law.</p>
          <label class="pnp-check"><input type="checkbox" name="Emergency Veterinary Care Authorization" value="Authorized" required><span>I authorize the emergency-care steps described above. <span class="pnp-required">*</span></span></label>
        </fieldset>

        <fieldset>
          <legend>Acknowledgement &amp; Signature</legend>
          <div class="pnp-checks">
            <label class="pnp-check"><input type="checkbox" name="Agreement Accuracy Acknowledged" value="Acknowledged" required><span>I have read and understand this agreement and confirm the information I provided is accurate to the best of my knowledge. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Rules Acknowledged" value="Agreed" required><span>I agree to follow Paws N Play rules and reasonable staff instructions. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Requirements Apply To Cafe and Playground" value="Acknowledged" required><span>I understand the vaccination record and dog licence tag requirements apply to both the cafe and the playground. <span class="pnp-required">*</span></span></label>
          </div>
          <div class="pnp-grid" style="margin-top:1rem">
            <div class="pnp-field"><label for="pnp-signature">Owner/Handler electronic signature (type full legal name) <span class="pnp-required">*</span></label><input id="pnp-signature" name="Typed Electronic Signature" autocomplete="name" required></div>
            <div class="pnp-field"><label for="pnp-printed">Printed name <span class="pnp-required">*</span></label><input id="pnp-printed" name="Printed Name" required></div>
            <div class="pnp-field"><label for="pnp-date">Date <span class="pnp-required">*</span></label><input id="pnp-date" name="Signature Date" type="date" required></div>
            <div class="pnp-field"><label for="pnp-dog-confirm">Dog's name (confirm) <span class="pnp-required">*</span></label><input id="pnp-dog-confirm" name="Dog Name at Signature" required></div>
            <div class="pnp-field"><label for="pnp-witness">Paws N Play staff/witness (if completed onsite)</label><input id="pnp-witness" name="Paws N Play Staff or Witness"></div>
          </div>
          <p class="pnp-small">Typing your name is an electronic-signature method for this web form. Confirm with your legal adviser whether this method meets your operational and legal requirements.</p>
        </fieldset>

        <div class="pnp-actions">
          <p id="pnp-account-note" class="pnp-small"></p>
          <button id="pnp-submit" type="submit">Submit Waiver</button>
          <span class="pnp-small">Your submission will be sent to Paws N Play and copied to the team.</span>
        </div>
        <p id="pnp-status" class="pnp-status" role="status" aria-live="polite"></p>
        <p class="pnp-small">Recommended: Have this waiver reviewed by a lawyer licensed in British Columbia before putting it into use. Do not use this form to submit urgent medical information.</p>
      </form>
    </section>
  `;

  const loadedAt = Date.now();
  const form = root.querySelector("#pnp-waiver-form");
  const submit = root.querySelector("#pnp-submit");
  const status = root.querySelector("#pnp-status");
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  root.querySelector("#pnp-date").value = localToday;

  // Keep the confirmation dog name in sync with the main dog-name field.
  const dogName = root.querySelector("#pnp-dog");
  const dogConfirm = root.querySelector("#pnp-dog-confirm");
  dogName.addEventListener("input", () => {
    if (!dogConfirm.dataset.userEdited) dogConfirm.value = dogName.value;
  });
  dogConfirm.addEventListener("input", () => { dogConfirm.dataset.userEdited = "true"; });


  // ---- Optional extra: if the visitor is signed in to their Paws N Play account, ALSO keep a copy of the
  // waiver in their account. This is best-effort. It runs only AFTER the email has been sent successfully,
  // and any problem here is ignored so it can never stop the normal email waiver from working.
  const WAIVER_VERSION = "2026-11-bylaw9150";
  const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js";
  let sbPromise = null;
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src; el.async = true; el.onload = resolve; el.onerror = reject;
      document.head.appendChild(el);
    });
  }
  function getSupabase() {
    if (!sbPromise) {
      sbPromise = (async () => {
        if (!window.PNP_CONFIG) await loadScript("pnp-config.js");
        if (!window.supabase) await loadScript(SUPABASE_JS);
        const c = window.PNP_CONFIG;
        if (!c || !c.SUPABASE_URL || c.SUPABASE_URL.indexOf("PASTE_") === 0 || !window.supabase) return null;
        return window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
      })().catch(() => null);
    }
    return sbPromise;
  }
  //ACCT-START
  async function saveToAccount(sb, snap) {
    try {
      if (!sb) return false;
      const sess = await sb.auth.getSession();
      const user = sess && sess.data && sess.data.session && sess.data.session.user;
      if (!user) return false;
      const norm = (v) => String(v || "").toLowerCase().replace(/\s+/g, "");
      const tag = String(snap["Dog Licence Tag Number"] || "").trim();
      const dogName = String(snap["Dog Name"] || "").trim();

      // 1. find the customer's dog (by licence tag, else by name) or add it
      const found = await sb.from("dogs").select("id,name,licence_tag");
      let dogId = null;
      ((found && found.data) || []).forEach((d) => {
        if (dogId) return;
        if ((tag && norm(d.licence_tag) === norm(tag)) || (!tag && norm(d.name) === norm(dogName))) dogId = d.id;
      });
      if (!dogId) {
        const ins = await sb.from("dogs").insert({
          owner_id: user.id, name: dogName.slice(0, 80), breed: String(snap["Dog Breed"] || "").slice(0, 120) || null,
          licence_tag: tag.slice(0, 40) || null
        }).select("id").single();
        dogId = ins && ins.data ? ins.data.id : null;
      }

      // 2. fill in blank contact details (never overwrite what the customer already saved)
      const prof = await sb.from("profiles").select("full_name,phone,emergency_name,emergency_phone").eq("id", user.id).maybeSingle();
      const cur = (prof && prof.data) || {};
      const fill = {};
      if (!cur.full_name && snap["Owner / Handler Name"]) fill.full_name = String(snap["Owner / Handler Name"]).slice(0, 120);
      if (!cur.phone && snap["Owner Phone"]) fill.phone = String(snap["Owner Phone"]).slice(0, 40);
      if (!cur.emergency_name && snap["Emergency Contact Name"]) fill.emergency_name = String(snap["Emergency Contact Name"]).slice(0, 120);
      if (!cur.emergency_phone && snap["Emergency Contact Phone"]) fill.emergency_phone = String(snap["Emergency Contact Phone"]).slice(0, 40);
      if (Object.keys(fill).length) await sb.from("profiles").update(fill).eq("id", user.id);

      // 3. keep the signed waiver
      const w = await sb.from("waivers").insert({
        owner_id: user.id, dog_id: dogId, signed_name: String(snap["Typed Electronic Signature"] || "").slice(0, 120),
        waiver_version: WAIVER_VERSION, answers: snap
      });
      return !(w && w.error);
    } catch (e) {
      console.warn("Waiver not saved to account:", e);
      return false;
    }
  }
  //ACCT-END

  // Tell the visitor whether this waiver will also be saved to an account.
  (async () => {
    const note = root.querySelector("#pnp-account-note");
    if (!note) return;
    const sb = await getSupabase();
    let user = null;
    try { const s = sb && await sb.auth.getSession(); user = s && s.data && s.data.session && s.data.session.user; } catch (_) {}
    if (user) { note.textContent = "You are signed in as " + user.email + ". This waiver will also be saved to your account."; return; }
    if (!sb) return;
    note.appendChild(document.createTextNode("Tip: have a Paws N Play account? "));
    const a = document.createElement("a"); a.href = "account.html"; a.textContent = "Sign in first";
    note.appendChild(a);
    note.appendChild(document.createTextNode(" and this waiver will also be saved to your account."));
  })();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    if (!form.reportValidity()) return;

    const signature = root.querySelector("#pnp-signature").value.trim();
    const printed = root.querySelector("#pnp-printed").value.trim();
    if (signature.toLocaleLowerCase() !== printed.toLocaleLowerCase()) {
      status.textContent = "Please make sure your typed signature and printed name match.";
      root.querySelector("#pnp-signature").focus();
      return;
    }

    // Bot trap: a real person needs more than a few seconds to complete this form.
    if ((Date.now() - loadedAt) / 1000 < MIN_FILL_SECONDS) {
      status.textContent = "Please review the form and try again.";
      return;
    }

    submit.disabled = true;
    submit.textContent = "Submitting\u2026";
    status.textContent = "Sending your waiver securely over HTTPS\u2026";

    try {
      form.elements["Submitted At"].value = new Date().toString();
      form.elements["Submitted From Page"].value = window.location.href;
      const snapshot = Object.fromEntries(new FormData(form).entries());

      // Abort after 25 seconds so the button can never sit on "Submitting" forever.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      let response;
      try {
        response = await fetch(ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" },
          signal: controller.signal
        });
      } finally {
        clearTimeout(timer);
      }

      let result = null;
      try { result = await response.json(); } catch (_) { /* non-JSON reply */ }

      // FormSubmit replies {"success":"true", ...}. Anything else is a failure.
      if (!response.ok || !result || String(result.success) !== "true") {
        console.error("Waiver submission rejected:", response.status, result);
        throw new Error((result && result.message) || "Submission service returned an error.");
      }

      // The email has been sent. Now (best effort) also keep a copy in the customer's account.
      let savedToAccount = false;
      try {
        savedToAccount = await Promise.race([
          getSupabase().then((sb) => saveToAccount(sb, snapshot)),
          new Promise((resolve) => setTimeout(() => resolve(false), 8000))
        ]);
      } catch (_) { savedToAccount = false; }
      status.textContent = "Thank you. Your waiver has been submitted." + (savedToAccount ? " A copy has also been saved to your account." : "") + " If you do not receive confirmation from Paws N Play, please contact the business directly.";
      form.reset();
      root.querySelector("#pnp-date").value = localToday;
      dogConfirm.dataset.userEdited = "";
    } catch (error) {
      console.error("Waiver submission failed:", error);
      // The form is NOT reset on failure, so nothing the visitor typed is lost.
      status.textContent = `We could not confirm delivery, so your waiver may not have been sent. Your answers are still on this page. Please try again, or call Paws N Play at ${FALLBACK_PHONE}.`;
    } finally {
      submit.disabled = false;
      submit.textContent = "Submit Waiver";
    }
  });
})();
