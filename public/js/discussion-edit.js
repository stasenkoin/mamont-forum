/*
  Скрипт страницы редактирования обсуждения.
  Логика работы:
  1. При загрузке страницы скрипт берет id обсуждения из атрибута data-id формы
  2. Загружает текущие данные обсуждения через GET /api/discussions/:id
  3. Заполняет поля формы текущими значениями (заголовок и содержание)
  4. При нажатии "Сохранить" отправляет PATCH запрос на /api/discussions/:id
  5. При успехе - перенаправление обратно на страницу обсуждения
  6. При ошибке - показываем сообщение (например 403 если не автор)
*/

// находим форму и получаем id обсуждения из data-атрибута
var form = document.getElementById('edit-discussion-form');
var id = form.dataset.id; // берем значение из атрибута data-id="{{discussionId}}"

// загружаем текущие данные обсуждения из API
fetch('/api/discussions/' + id)
  .then(function (response) {
    return response.json(); // парсим ответ как JSON
  })
  .then(function (discussion) {
    // заполняем поля формы текущими значениями обсуждения
    document.getElementById('title').value = discussion.title;
    document.getElementById('content').value = discussion.content;
  });

// вешаем обработчик на отправку формы
form.addEventListener('submit', function (e) {
  // отменяем стандартную отправку
  e.preventDefault();
  // получаем новые значения из полей
  var title = document.getElementById('title').value.trim();
  var content = document.getElementById('content').value.trim();

  // отправляем PATCH запрос для обновления обсуждения
  fetch('/api/discussions/' + id, {
    method: 'PATCH', // PATCH - частичное обновление (не PUT)
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, content: content }),
  })
    .then(function (r) {
      // если ошибка (403 не автор, 404 не найдено) - кидаем исключение
      if (!r.ok) {
        return r.json().then(function (data) { throw data; });
      }
      return r.json();
    })
    .then(function () {
      // обновление успешно - возвращаемся на страницу обсуждения
      window.location.href = '/discussions/' + id;
    })
    .catch(function (err) {
      // показываем ошибку
      var msg = document.getElementById('error-msg');
      msg.textContent = err.message || 'Ошибка сохранения';
      msg.style.display = 'block';
    });
});
