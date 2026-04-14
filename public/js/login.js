/*
  Скрипт страницы входа в аккаунт.
  Логика работы:
  1. Пользователь заполняет форму (никнейм и пароль)
  2. При нажатии "Войти" данные отправляются POST запросом на /api/auth/login
  3. Сервер проверяет данные и создает сессию (cookie connect.sid)
  4. При успехе - перенаправление на страницу обсуждений
  5. При ошибке - показываем сообщение об ошибке на странице
*/

// находим форму входа на странице и вешаем обработчик на отправку
document.getElementById('login-form').addEventListener('submit', function (e) {
  // отменяем стандартную отправку формы (чтобы страница не перезагрузилась)
  e.preventDefault();
  // получаем значения полей из формы
  var nickname = document.getElementById('nickname').value.trim(); // trim убирает пробелы по краям
  var password = document.getElementById('password').value;

  // отправляем POST запрос на API для входа
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // говорим серверу что отправляем JSON
    body: JSON.stringify({ nickname: nickname, password: password }), // превращаем объект в JSON строку
  })
    .then(function (r) {
      // если сервер вернул ошибку (например 401) - читаем тело ответа и кидаем как ошибку
      if (!r.ok) return r.json().then(function (d) { throw d; });
      // если все ок - читаем ответ как JSON
      return r.json();
    })
    .then(function () {
      // вход успешен - перенаправляем на главную страницу с обсуждениями
      window.location.href = '/discussions';
    })
    .catch(function (err) {
      // если произошла ошибка - показываем сообщение пользователю
      var msg = document.getElementById('error-msg'); // находим блок для ошибки
      msg.textContent = err.message || 'Ошибка входа'; // записываем текст ошибки
      msg.style.display = 'block'; // делаем блок видимым (по умолчанию он скрыт)
    });
});
