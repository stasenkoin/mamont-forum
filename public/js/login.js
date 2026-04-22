document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var email = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;
  var errorMsg = document.getElementById('error-msg');

  fetch('/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'st-auth-mode': 'cookie',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      formFields: [
        { id: 'email', value: email },
        { id: 'password', value: password },
      ],
    }),
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.status !== 'OK') {
        throw new Error(data.message || 'Неверный email или пароль');
      }
      window.location.href = '/discussions';
    })
    .catch(function (err) {
      errorMsg.textContent = err.message || 'Ошибка входа';
      errorMsg.style.display = 'block';
    });
});
