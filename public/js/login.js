document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var nickname = document.getElementById('nickname').value.trim();
  var password = document.getElementById('password').value;

  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname: nickname, password: password }),
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
      msg.textContent = err.message || 'Ошибка входа';
      msg.style.display = 'block';
    });
});
