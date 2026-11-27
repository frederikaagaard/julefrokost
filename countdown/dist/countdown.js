// Fixed event time in Copenhagen (CET). Independent of the visitor's timezone.
const deadline = Date.parse('2026-11-27T17:00:00+01:00');
const output = document.querySelector('#time');
let timer;
function update() {
  const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor(remaining / 60) % 60;
  const seconds = remaining % 60;
  output.textContent = [hours, minutes, seconds].map(n => String(n).padStart(2, '0')).join(':');
  clearTimeout(timer);
  if (remaining > 0) timer = setTimeout(update, 1000 - Date.now() % 1000);
}
document.addEventListener('visibilitychange', update);
window.addEventListener('pageshow', update);
update();
