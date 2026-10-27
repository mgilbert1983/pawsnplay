/*
 * Paws N Play Dog Cafe & Playground — Waiver Form Module
 * Include this file from your index.html:
 *   <div id="paws-n-play-waiver"></div>
 *   <script src="paws-n-play-waiver.js" defer></script>
 *
 * IMPORTANT EMAIL DELIVERY NOTE:
 * This self-contained module uses FormSubmit.co to email submissions to
 * pawsnplayvancouver@gmail.com. On the first submission, FormSubmit may send
 * a confirmation email to that inbox; click its activation link before live use.
 * Form submissions include personal information. Review the provider's privacy
 * terms and have the waiver reviewed by a BC lawyer before publishing.
 */
(() => {
  "use strict";

  const EMAIL = "pawsnplayvancouver@gmail.com";
  const ROOT_ID = "paws-n-play-waiver";

  const styles = `
    #${ROOT_ID} { --pnp-ink:#26352c; --pnp-green:#426b4f; --pnp-pale:#f4f7f1; --pnp-line:#d9e1d8; color:var(--pnp-ink); font-family:inherit; }
    #${ROOT_ID} * { box-sizing:border-box; }
    #${ROOT_ID} .pnp-card { max-width:900px; margin:2rem auto; padding:clamp(1rem,3vw,2rem); background:#fff; border:1px solid var(--pnp-line); border-radius:16px; box-shadow:0 8px 28px rgba(28,48,33,.08); }
    #${ROOT_ID} h2 { margin:0 0 .35rem; font-size:clamp(1.5rem,3vw,2rem); line-height:1.2; }
    #${ROOT_ID} .pnp-intro { margin:0 0 1.5rem; color:#536257; line-height:1.55; }
    #${ROOT_ID} fieldset { min-width:0; border:0; border-top:1px solid var(--pnp-line); margin:1.5rem 0 0; padding:1.25rem 0 0; }
    #${ROOT_ID} legend { padding:0 .5rem 0 0; font-weight:750; font-size:1.08rem; }
    #${ROOT_ID} .pnp-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; }
    #${ROOT_ID} .pnp-field { display:flex; flex-direction:column; gap:.4rem; min-width:0; }
    #${ROOT_ID} label { font-weight:650; font-size:.94rem; }
    #${ROOT_ID} input:not([type=checkbox]):not([type=radio]), #${ROOT_ID} select, #${ROOT_ID} textarea { width:100%; min-height:44px; padding:.7rem .8rem; border:1px solid #bfcbbf; border-radius:8px; background:#fff; color:inherit; font:inherit; }
    #${ROOT_ID} textarea { min-height:90px; resize:vertical; }
    #${ROOT_ID} input:focus, #${ROOT_ID} select:focus, #${ROOT_ID} textarea:focus { outline:3px solid rgba(66,107,79,.2); border-color:var(--pnp-green); }
    #${ROOT_ID} .pnp-checks { display:grid; gap:.85rem; margin-top:.8rem; }
    #${ROOT_ID} .pnp-check { display:flex; align-items:flex-start; gap:.7rem; line-height:1.5; font-weight:400; }
    #${ROOT_ID} .pnp-check input { width:1.15rem; height:1.15rem; margin-top:.18rem; flex:0 0 auto; accent-color:var(--pnp-green); }
    #${ROOT_ID} .pnp-note { margin:.8rem 0 0; padding:.85rem 1rem; background:var(--pnp-pale); border-radius:8px; line-height:1.5; }
    #${ROOT_ID} .pnp-legal { line-height:1.65; color:#3e4c42; }
    #${ROOT_ID} .pnp-actions { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-top:1.5rem; }
    #${ROOT_ID} button { min-height:48px; padding:.8rem 1.3rem; border:0; border-radius:9px; background:var(--pnp-green); color:white; font:inherit; font-weight:750; cursor:pointer; }
    #${ROOT_ID} button:hover { filter:brightness(.93); }
    #${ROOT_ID} button:disabled { opacity:.65; cursor:wait; }
    #${ROOT_ID} .pnp-status { margin:.8rem 0 0; font-weight:650; }
    #${ROOT_ID} .pnp-small { font-size:.88rem; color:#58665b; line-height:1.5; }
    #${ROOT_ID} .pnp-required { color:#9a3025; }
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
      <h2 id="pnp-title">Paws N Play Dog Cafe &amp; Playground</h2>
      <p class="pnp-intro"><strong>Dog Owner Waiver, Release &amp; Responsibility Agreement</strong><br>
      Please complete every required field and acknowledgement. Required fields are marked <span class="pnp-required">*</span>.</p>

      <form id="pnp-waiver-form" action="https://formsubmit.co/${EMAIL}" method="POST">
        <input type="hidden" name="_subject" value="New Paws N Play Dog Owner Waiver Submission">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_captcha" value="true">
        <input type="hidden" name="_next" value="">
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
          <p class="pnp-legal">All dogs must have current vaccination records on file before entering or using any part of the premises. Records must identify the dog and show the vaccination type and current status or expiry date. Paws N Play may refuse entry or services if records are missing, incomplete or expired.</p>
          <div class="pnp-checks">
            <label class="pnp-check"><input type="checkbox" name="Rabies Record Provided" value="Yes" required><span>I have provided Paws N Play with my dog's current Rabies vaccination record. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Bordetella Record Provided" value="Yes" required><span>I have provided Paws N Play with my dog's current Kennel Cough (Bordetella) vaccination record. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Vaccination Records Required Before Entry" value="Acknowledged" required><span>I understand my dog cannot enter or use any part of the premises until both required vaccination records have been provided and are on file. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Update Vaccination Records" value="Acknowledged" required><span>I am responsible for providing updated vaccination records when vaccinations are renewed or expire. <span class="pnp-required">*</span></span></label>
          </div>
          <p class="pnp-note"><strong>Important:</strong> Checking these boxes confirms that the records have been provided; it does not upload the records. Please submit the records separately using the process provided by Paws N Play.</p>
        </fieldset>

        <fieldset>
          <legend>Dog Health &amp; Behaviour</legend>
          <div class="pnp-checks">
            <label class="pnp-check"><input type="checkbox" name="Non-Reactive Confirmation" value="Confirmed" required><span><strong>Non-reactive:</strong> To the best of my knowledge, my dog is not reactive toward people or other dogs in a way that would make participation unsafe. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Non-Aggressive Confirmation" value="Confirmed" required><span><strong>Non-aggressive:</strong> To the best of my knowledge, my dog has no history of dangerous or aggressive behaviour toward people or other dogs. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Good Health Confirmation" value="Confirmed" required><span>My dog is currently in good health and, to the best of my knowledge, does not have a contagious illness, infection, parasites, vomiting, diarrhea, coughing or another condition that could put other dogs at risk. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Behaviour Disclosure Agreement" value="Agreed" required><span>I will immediately inform staff of known behavioural concerns, bite history, guarding behaviour, fear, anxiety or other information that could affect safety. <span class="pnp-required">*</span></span></label>
          </div>
          <div class="pnp-field" style="margin-top:1rem"><label for="pnp-behaviour">Additional health or behaviour information (if applicable)</label><textarea id="pnp-behaviour" name="Additional Health or Behaviour Information" placeholder="Please disclose anything staff should know for safety."></textarea></div>
        </fieldset>

        <fieldset>
          <legend>Owner / Handler Responsibility</legend>
          <div class="pnp-checks">
            <label class="pnp-check"><input type="checkbox" name="Supervision Responsibility" value="Agreed" required><span>I am responsible for my dog at all times on the premises unless my dog has been formally checked into a paid daycare or boarding service and accepted into Paws N Play's care. <span class="pnp-required">*</span></span></label>
            <label class="pnp-check"><input type="checkbox" name="Supervise and Control Dog" value="Agreed" required><span>I will supervise and maintain reasonable control of my dog in the cafe, playground and other customer areas. <span class="pnp-required">*</span></span></label>
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
          <p class="pnp-legal">To the fullest extent permitted by applicable law, I agree that Paws N Play, its owners, employees, contractors and representatives will not be responsible for injury, illness, loss or damage arising from the ordinary and inherent risks of participating in dog play or using the premises. Nothing in this waiver is intended to exclude or limit liability that cannot legally be excluded or limited under British Columbia law.</p>
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
          <button id="pnp-submit" type="submit">Submit Waiver</button>
          <span class="pnp-small">Your submission will be sent to Paws N Play for review.</span>
        </div>
        <p id="pnp-status" class="pnp-status" role="status" aria-live="polite"></p>
        <p class="pnp-small">Recommended: Have this waiver reviewed by a lawyer licensed in British Columbia before putting it into use. Do not use this form to submit urgent medical information.</p>
      </form>
    </section>
  `;

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

    submit.disabled = true;
    submit.textContent = "Submitting…";
    status.textContent = "Sending your waiver securely over HTTPS…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) throw new Error("Submission service returned an error.");
      status.textContent = "Thank you. Your waiver has been submitted. If you do not receive confirmation from Paws N Play, please contact the business directly.";
      form.reset();
      root.querySelector("#pnp-date").value = localToday;
      dogConfirm.dataset.userEdited = "";
    } catch (error) {
      status.textContent = "We couldn't confirm delivery. Your form may not have been sent. Please try again, or contact Paws N Play directly. If this is the first submission, check the inbox for a FormSubmit activation email.";
    } finally {
      submit.disabled = false;
      submit.textContent = "Submit Waiver";
    }
  });
})();
