const API = '/api/auth';

function $(id) { return document.getElementById(id); }

function setFieldError(name, message) {
  const field = document.querySelector(`[data-field="${name}"]`);
  if (!field) return;
  field.classList.add('invalid');
  field.querySelector('.error').textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
  const box = $('alert');
  box.className = 'alert';
  box.textContent = '';
}

function showAlert(message, type) {
  const box = $('alert');
  box.textContent = message;
  box.className = `alert show ${type === 'success' ? 'success-box' : 'error-box'}`;
}

function setLoading(button, loading, label) {
  button.disabled = loading;
  button.innerHTML = loading ? `<span class="spinner"></span>Please wait...` : label;
}

async function postJson(path, body) {
  const res = await fetch(`${API}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}

function applyServerErrors(data) {
  const fields = data.fieldErrors || {};
  Object.entries(fields).forEach(([name, msg]) => setFieldError(name, msg));
  if (!Object.keys(fields).length) showAlert(data.message || 'Something went wrong', 'error');
}

// ---------- Show / hide password ----------
document.querySelectorAll('.toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁️' : '🙈';
  });
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Registration ----------
const registerForm = $('registerForm');
if (registerForm) {
  const pwd = $('password');
  pwd.addEventListener('input', () => {
    const v = pwd.value;
    let score = 0;
    if (v.length >= 6) score++;
    if (v.length >= 10) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
    const levels = [
      ['0%', '#e2e8f0', ''], ['25%', '#ef4444', 'Weak'], ['50%', '#f59e0b', 'Fair'],
      ['75%', '#22c55e', 'Good'], ['100%', '#16a34a', 'Strong']
    ];
    const [w, c, t] = v ? levels[score] : levels[0];
    $('strengthBar').style.width = w;
    $('strengthBar').style.background = c;
    $('strengthText').textContent = t ? `Password strength: ${t}` : '';
  });

  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const body = {
      name: $('name').value.trim(),
      email: $('email').value.trim(),
      password: $('password').value,
      confirmPassword: $('confirmPassword').value
    };

    // quick client-side checks (the server validates again)
    let bad = false;
    if (body.name.length < 2) { setFieldError('name', 'Name must be at least 2 characters'); bad = true; }
    if (!EMAIL_RE.test(body.email)) { setFieldError('email', 'Enter a valid email address'); bad = true; }
    if (body.password.length < 6) { setFieldError('password', 'Password must be at least 6 characters'); bad = true; }
    if (body.password !== body.confirmPassword) { setFieldError('confirmPassword', 'Passwords do not match'); bad = true; }
    if (bad) return;

    const btn = $('submitBtn');
    setLoading(btn, true);
    try {
      const { ok, data } = await postJson('register', body);
      if (ok) {
        showAlert('Account created! Redirecting to login...', 'success');
        setTimeout(() => (window.location.href = 'login.html'), 1400);
      } else {
        applyServerErrors(data);
        setLoading(btn, false, 'Create Account');
      }
    } catch (err) {
      showAlert('Cannot reach the server. Is the application running?', 'error');
      setLoading(btn, false, 'Create Account');
    }
  });
}

// ---------- Login ----------
const loginForm = $('loginForm');
if (loginForm) {
  if (sessionStorage.getItem('user')) window.location.replace('home.html');

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const body = { email: $('email').value.trim(), password: $('password').value };

    let bad = false;
    if (!EMAIL_RE.test(body.email)) { setFieldError('email', 'Enter a valid email address'); bad = true; }
    if (!body.password) { setFieldError('password', 'Password is required'); bad = true; }
    if (bad) return;

    const btn = $('submitBtn');
    setLoading(btn, true);
    try {
      const { ok, data } = await postJson('login', body);
      if (ok) {
        sessionStorage.setItem('user', JSON.stringify(data));
        window.location.href = 'home.html';
      } else {
        applyServerErrors(data);
        setLoading(btn, false, 'Sign In');
      }
    } catch (err) {
      showAlert('Cannot reach the server. Is the application running?', 'error');
      setLoading(btn, false, 'Sign In');
    }
  });
}
