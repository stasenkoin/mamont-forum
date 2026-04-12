document.getElementById('register-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var nickname = document.getElementById('nickname').value.trim();
  var password = document.getElementById('password').value;
  var avatarUrl = document.getElementById('avatarUrl').value.trim();

  var body = { nickname: nickname, password: password };
  if (avatarUrl) body.avatarUrl = avatarUrl;

  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (d) { throw d; });
      return r.json();
    })
    .then(function () {
      window.location.href = '/discussions';
    })
    .catch(function (err) {
      var msg = document.getElementById('error-msg');
      msg.textContent = err.message || 'Ошибка регистрации';
      msg.style.display = 'block';
    });
});
