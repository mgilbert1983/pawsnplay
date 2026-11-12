# Waiver and contact form email delivery: setup and testing

## How it works
The waiver form (`paws-n-play-waiver.js`) posts to FormSubmit's AJAX endpoint,
`https://formsubmit.co/ajax/pawsnplayvancouver@gmail.com`. FormSubmit emails each
submission to that address and copies `tonysdestiny@shaw.ca`. It is free, needs
no account, no API key, no environment variables and no server, so it works on
GitHub Pages as is. Nothing secret is stored in the repository.

## Contact form
The "Get in Touch" form in `index.html` now uses the same FormSubmit setup and reaches both
addresses. It previously used Web3Forms, whose free plan delivers to one address only, so the
Web3Forms access key was removed. Its recipients are set in the form's hidden `_cc` field and the
`ENDPOINT` line in the small script just above the waiver script tag in `index.html`. Email and
message are now required fields so empty messages are not sent.

## One-time activation (required, must be done by the inbox owner)
FormSubmit will not forward anything until the primary inbox confirms it owns the address.

1. Upload the files to GitHub and wait for the site to publish.
2. Open the live site (not a local file), fill in the waiver and submit it.
3. Open the pawsnplayvancouver@gmail.com inbox. Look for an email from FormSubmit
   (check Spam and Promotions). Click **Activate Form**.
4. Submit the waiver once more. Both pawsnplayvancouver@gmail.com and
   tonysdestiny@shaw.ca should receive it. Check Spam on shaw.ca for the first one.

The same activation covers both forms. The submission made before activation is held by FormSubmit and is released to the inbox once you activate.

## Optional: hide the address from page source
After activation, FormSubmit emails a private random ID. In `paws-n-play-waiver.js`
change `const FORMSUBMIT_TARGET = RECIPIENT;` to `const FORMSUBMIT_TARGET = "your-random-id";`.
The CC address stays in the script because FormSubmit takes it from the form.

## Changing recipients
Edit `RECIPIENT` and `CC_RECIPIENTS` at the top of `paws-n-play-waiver.js`, and the matching values for the contact form in `index.html`.
If you change `RECIPIENT`, the new address must be activated again.

## What the visitor sees
- Success: confirmation message and the form clears.
- Failure (service down, not yet activated, no connection): the form is NOT cleared,
  and the visitor is asked to retry or phone the business.
- A hidden honeypot field and a minimum-fill-time check block most spam bots. Captcha is off
  because FormSubmit's captcha cannot run through an in-page submission.

## Limits and privacy
- The waiver contains personal information that passes through FormSubmit's servers.
  Review their privacy terms.
- FormSubmit is a free third-party service with no uptime guarantee. Check that waivers arrive
  periodically, and keep a backup copy of anything legally important.
- Gmail and Shaw may sort the first messages into Spam. Mark them "Not spam".

## Mobile stylesheet
`mobile_css.css` was not linked before. It is now linked from `index.html`, but the old rules
(padding forced on every div and section, restyled headings, buttons and SVGs) would have overridden the
site's own mobile layout, so the file now holds only safe rules: images stay on screen and form
fields use 16px text so iPhones do not zoom in.
