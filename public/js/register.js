/*
  Скрипт страницы регистрации нового пользователя.
  Логика работы:
  1. Пользователь заполняет форму (никнейм, пароль, опционально URL аватара)
  2. При нажатии "Зарегистрироваться" данные отправляются POST запросом на /api/auth/register
  3. Сервер создает нового пользователя в базе и автоматически логинит его (создает сессию)
  4. При успехе - перенаправление на страницу обсуждений
  5. При ошибке (например никнейм занят - 409) - показываем сообщение
*/

// находим форму регистрации и вешаем обработчик на отправку
document.getElementById('register-form').addEventListener('submit', function (e) {
  // отменяем стандартную отправку формы
  e.preventDefault();
  // получаем значения из полей формы
  var nickname = document.getElementById('nickname').value.trim();
  var password = document.getElementById('password').value;
  var avatarUrl = document.getElementById('avatarUrl').value.trim(); // URL аватара - необязательное поле

  // формируем объект с данными для отправки
  var body = { nickname: nickname, password: password };
  // добавляем URL аватара только если пользователь его ввел
  if (avatarUrl) body.avatarUrl = avatarUrl;

  // отправляем POST запрос на API для регистрации
  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // отправляем данные в формате JSON
    body: JSON.stringify(body), // превращаем объект в JSON строку
  })
    .then(function (r) {
      // если сервер вернул ошибку - читаем тело и кидаем как исключение
      if (!r.ok) return r.json().then(function (d) { throw d; });
      // если все ок - парсим ответ
      return r.json();
    })
    .then(function () {
      // регистрация успешна - перенаправляем на главную
      window.location.href = '/discussions';
    })
    .catch(function (err) {
      // показываем ошибку пользователю (например "Этот никнейм уже занят")
      var msg = document.getElementById('error-msg');
      msg.textContent = err.message || 'Ошибка регистрации';
      msg.style.display = 'block';
    });
});
