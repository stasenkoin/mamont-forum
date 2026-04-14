/*
  Скрипт страницы редактирования комментария.
  Логика работы:
  1. При загрузке берем id обсуждения и id комментария из data-атрибутов формы
  2. Загружаем текущий текст комментария через GET /api/discussions/:id/comments/:commentId
  3. Заполняем textarea текущим текстом комментария
  4. При нажатии "Сохранить" отправляем PATCH запрос для обновления
  5. При успехе - перенаправление на страницу обсуждения
  6. При ошибке - показываем сообщение (403 не автор, 404 не найден)
*/

// находим форму и получаем id обсуждения и комментария из data-атрибутов
var form = document.getElementById('edit-comment-form');
var discussionId = form.dataset.discussionId; // из атрибута data-discussion-id
var commentId = form.dataset.commentId; // из атрибута data-comment-id

// загружаем текущие данные комментария из API
fetch('/api/discussions/' + discussionId + '/comments/' + commentId)
  .then(function (response) {
    return response.json(); // парсим JSON ответ
  })
  .then(function (comment) {
    // заполняем текстовое поле текущим текстом комментария
    document.getElementById('content').value = comment.content;
  });

// вешаем обработчик на отправку формы
form.addEventListener('submit', function (e) {
  // отменяем стандартную отправку
  e.preventDefault();
  // получаем новый текст комментария
  var content = document.getElementById('content').value.trim();

  // отправляем PATCH запрос для обновления комментария
  fetch('/api/discussions/' + discussionId + '/comments/' + commentId, {
    method: 'PATCH', // частичное обновление
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content }), // отправляем новый текст
  })
    .then(function (r) {
      // если ошибка - кидаем исключение
      if (!r.ok) {
        return r.json().then(function (data) { throw data; });
      }
      return r.json();
    })
    .then(function () {
      // сохранение успешно - возвращаемся на страницу обсуждения
      window.location.href = '/discussions/' + discussionId;
    })
    .catch(function (err) {
      // показываем ошибку
      var msg = document.getElementById('error-msg');
      msg.textContent = err.message || 'Ошибка сохранения';
      msg.style.display = 'block';
    });
});
