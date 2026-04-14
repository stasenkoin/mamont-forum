/*
  Скрипт страницы создания нового обсуждения.
  Логика работы:
  1. Пользователь заполняет заголовок и содержание
  2. При нажатии "Создать" данные отправляются POST запросом на /api/discussions
  3. Сервер создает обсуждение в базе данных и возвращает его (с id)
  4. При успехе - перенаправление на страницу созданного обсуждения
  5. При ошибке - показываем сообщение (например если пользователь не авторизован)
*/

// находим форму создания и вешаем обработчик
document.getElementById('create-discussion-form').addEventListener('submit', function (e) {
  // отменяем стандартную отправку формы
  e.preventDefault();
  // получаем заголовок и содержание из полей формы
  var title = document.getElementById('title').value.trim();
  var content = document.getElementById('content').value.trim();

  // отправляем POST запрос на API для создания обсуждения
  fetch('/api/discussions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, content: content }), // отправляем заголовок и текст
  })
    .then(function (r) {
      // если сервер вернул ошибку - кидаем как исключение
      if (!r.ok) return r.json().then(function (d) { throw d; });
      return r.json();
    })
    .then(function (discussion) {
      // обсуждение создано - переходим на его страницу по id
      window.location.href = '/discussions/' + discussion.id;
    })
    .catch(function (err) {
      // показываем ошибку пользователю
      var msg = document.getElementById('error-msg');
      msg.textContent = err.message || 'Ошибка создания';
      msg.style.display = 'block';
    });
});
