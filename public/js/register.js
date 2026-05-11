document.getElementById('register-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var email = document.getElementById('email').value.trim();
  var nickname = document.getElementById('nickname').value.trim();
  var password = document.getElementById('password').value;
  var errorMsg = document.getElementById('error-msg');

  fetch('/auth/signup', {
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
        var msg = (data.formFields && data.formFields[0] && data.formFields[0].error) || data.message || 'Ошибка регистрации';
        throw new Error(msg);
      }
      var supertokensId = data.user.id;
      return fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ supertokensId: supertokensId, nickname: nickname }),
      });
    })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (d) { throw new Error(d.message || 'Ошибка создания профиля'); });
      window.location.href = '/discussions';
    })
    .catch(function (err) {
      errorMsg.textContent = err.message || 'Ошибка регистрации';
      errorMsg.style.display = 'block';
    });
});
