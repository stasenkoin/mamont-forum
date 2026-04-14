/*
  Скрипт страницы списка уведомлений (/notifications).
  Логика работы:
  1. При загрузке запрашивает все уведомления пользователя через GET /api/notifications
  2. Рисует каждое уведомление с кнопками "Прочитано" и "Удалить"
  3. Непрочитанные уведомления выделяются CSS классом notification-unread
  4. Кнопка "Прочитать все" - POST /api/notifications/read-all - убирает выделение со всех
  5. Кнопка "Прочитано" - POST /api/notifications/:id/read - помечает одно уведомление прочитанным
  6. Кнопка "Удалить" - DELETE /api/notifications/:id - удаляет уведомление
  7. Используется делегирование событий (один обработчик на document вместо обработчика на каждую кнопку)
*/

// находим элементы на странице
var list = document.getElementById('notifications-list'); // контейнер для списка уведомлений
var readAllBtn = document.getElementById('read-all-btn'); // кнопка "Прочитать все"

// вспомогательная функция для форматирования даты в русский формат
function formatDate(dateStr) {
  var date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// функция загрузки списка уведомлений с сервера
function loadNotifications() {
  // запрашиваем уведомления с лимитом 100 (чтобы показать все на одной странице)
  fetch('/api/notifications?limit=100')
    .then(function (response) {
      return response.json(); // парсим JSON ответ (массив уведомлений)
    })
    .then(function (notifications) {
      // если уведомлений нет - показываем пустое сообщение
      if (notifications.length === 0) {
        list.innerHTML = '<p class="empty">У вас нет уведомлений.</p>';
        readAllBtn.style.display = 'none'; // скрываем кнопку "Прочитать все"
        return;
      }

      // есть уведомления - показываем кнопку "Прочитать все"
      readAllBtn.style.display = 'inline-block';

      // собираем HTML для каждого уведомления
      var html = '';
      for (var i = 0; i < notifications.length; i++) {
        var n = notifications[i];
        // если уведомление не прочитано - добавляем CSS класс для выделения
        var unreadClass = '';
        if (!n.isRead) {
          unreadClass = ' notification-unread';
        }

        // карточка уведомления с уникальным id для поиска в DOM
        html = html + '<div class="notification' + unreadClass + '" id="notification-' + n.id + '">';
        html = html + '<div class="notification-content">';
        html = html + '<p>' + n.message + '</p>'; // текст уведомления
        html = html + '<span class="meta">' + formatDate(n.createdAt) + '</span>'; // дата

        // если уведомление связано с обсуждением - показываем ссылку "Перейти"
        if (n.discussionId) {
          html = html + ' <a href="/discussions/' + n.discussionId + '" class="btn btn-sm">Перейти</a>';
        }

        html = html + '</div>';
        html = html + '<div class="notification-actions">'; // блок с кнопками действий

        // кнопка "Прочитано" показывается только для непрочитанных уведомлений
        if (!n.isRead) {
          html = html + '<button class="btn btn-sm mark-read-btn" data-id="' + n.id + '">Прочитано</button>';
        }
        // кнопка "Удалить" есть у всех уведомлений
        html = html + '<button class="btn btn-sm btn-danger delete-notif-btn" data-id="' + n.id + '">Удалить</button>';

        html = html + '</div>';
        html = html + '</div>';
      }

      // вставляем собранный HTML в контейнер
      list.innerHTML = html;
    });
}

// обработчик кнопки "Прочитать все" - помечает все уведомления как прочитанные
readAllBtn.addEventListener('click', function () {
  // отправляем POST запрос для пометки всех уведомлений прочитанными
  fetch('/api/notifications/read-all', { method: 'POST' })
    .then(function () {
      // после успеха убираем выделение со всех непрочитанных
      var unread = document.querySelectorAll('.notification-unread');
      for (var i = 0; i < unread.length; i++) {
        unread[i].classList.remove('notification-unread'); // убираем CSS класс выделения
        var btn = unread[i].querySelector('.mark-read-btn');
        if (btn) btn.remove(); // удаляем кнопку "Прочитано" (она больше не нужна)
      }
    });
});

// делегирование событий: обработчик клика по кнопке "Прочитано"
// вешаем один обработчик на весь document вместо обработчика на каждую кнопку
document.addEventListener('click', function (e) {
  // проверяем что кликнули именно по кнопке "Прочитано"
  if (!e.target.classList.contains('mark-read-btn')) return;
  var id = e.target.dataset.id; // получаем id уведомления из атрибута data-id

  // отправляем POST запрос для пометки одного уведомления прочитанным
  fetch('/api/notifications/' + id + '/read', { method: 'POST' })
    .then(function () {
      // убираем выделение с этого уведомления
      var notif = document.getElementById('notification-' + id);
      if (notif) {
        notif.classList.remove('notification-unread');
      }
      e.target.remove(); // удаляем саму кнопку "Прочитано"
    });
});

// делегирование событий: обработчик клика по кнопке "Удалить"
document.addEventListener('click', function (e) {
  // проверяем что кликнули по кнопке "Удалить"
  if (!e.target.classList.contains('delete-notif-btn')) return;
  var id = e.target.dataset.id; // получаем id уведомления

  // отправляем DELETE запрос для удаления уведомления
  fetch('/api/notifications/' + id, { method: 'DELETE' })
    .then(function () {
      // удаляем карточку уведомления из DOM
      var notif = document.getElementById('notification-' + id);
      if (notif) notif.remove();

      // если больше нет уведомлений - показываем пустое сообщение
      if (list.children.length === 0) {
        list.innerHTML = '<p class="empty">У вас нет уведомлений.</p>';
        readAllBtn.style.display = 'none'; // скрываем кнопку "Прочитать все"
      }
    });
});

// запускаем загрузку уведомлений при открытии страницы
loadNotifications();
