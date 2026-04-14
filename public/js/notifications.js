/*
  Скрипт уведомлений в шапке сайта (подключается на каждой странице для авторизованных).
  Логика работы:
  1. При загрузке страницы открывает SSE соединение (Server-Sent Events) на /notifications/stream
  2. SSE - это постоянное соединение, по которому сервер в реальном времени отправляет новые уведомления
  3. Когда приходит новое уведомление - увеличиваем счетчик в шапке и показываем всплывающее сообщение (toast)
  4. Также при загрузке делаем GET /notifications/unread-count чтобы показать текущее количество непрочитанных
  5. Если соединение обрывается - закрываем его (чтобы не было бесконечных переподключений)
*/

// ждем полной загрузки DOM перед выполнением
document.addEventListener('DOMContentLoaded', function () {
  // находим элемент счетчика уведомлений в шапке (рядом с иконкой колокольчика)
  var countEl = document.getElementById('notification-count');
  // открываем SSE соединение с сервером для получения уведомлений в реальном времени
  var source = new EventSource('/notifications/stream');

  // обработчик нового сообщения от сервера (приходит когда кто-то лайкнул или прокомментировал)
  source.onmessage = function (event) {
    // парсим JSON данные уведомления из события
    var notification = JSON.parse(event.data)
    // увеличиваем счетчик непрочитанных в шапке
    if (countEl) {
      var current = parseInt(countEl.textContent) || 0; // текущее значение (или 0 если пусто)
      countEl.textContent = current + 1; // прибавляем 1
    }
    // создаем всплывающее уведомление (toast) внизу экрана
    var toast = document.createElement('div');
    toast.className = 'toast'; // CSS класс для стилизации
    toast.textContent = notification.message; // текст уведомления (например "Иван лайкнул ваше обсуждение")
    document.body.appendChild(toast); // добавляем на страницу
    // через 4 секунды удаляем toast со страницы
    setTimeout(function () {
      toast.remove();
    }, 4000);
  };

  // если SSE соединение оборвалось - закрываем его
  source.onerror = function () {
    source.close();
  };

  // при загрузке страницы запрашиваем текущее количество непрочитанных уведомлений
  fetch('/notifications/unread-count')
    .then(function (r) { return r.json(); }) // парсим ответ
    .then(function (data) {
      // если есть непрочитанные - показываем число в шапке
      if (countEl && data.count > 0) {
        countEl.textContent = data.count;
      }
    })
    .catch(function () {}); // игнорируем ошибки (например если не авторизован)
});
