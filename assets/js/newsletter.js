const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxIri8Saa_zWlTiHJHxW5jDpBKQZWNDgB2zJt7N3VGXirGMDCNeFnRee7Kyra1-uAXi/exec';

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('nl-email').value.trim();
    const sign = document.getElementById('nl-sign').value;
    const agreed = document.getElementById('nl-agree').checked;
    const btn = document.getElementById('nl-btn');
    const msg = document.getElementById('nl-msg');
    if (!email || !sign || !agreed) return;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sign, agreed }),
      });
      msg.textContent = '✦ Welcome to the cosmos. Check your inbox soon.';
      msg.style.color = 'var(--gold)';
      form.reset();
    } catch (err) {
      msg.textContent = 'Something went wrong. Please try again.';
      msg.style.color = '#E24B4A';
    }
    btn.textContent = 'Subscribe';
    btn.disabled = false;
  });
}
document.addEventListener('DOMContentLoaded', initNewsletter);
