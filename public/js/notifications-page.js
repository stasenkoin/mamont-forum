// Уведомления уже отрендерены сервером, JS только для интерактивных действий
var list = document.getElementById('notifications-list');
var readAllBtn = document.getElementById('read-all-btn');

// Прочитать все
if (readAllBtn) {
  readAllBtn.addEventListener('click', function () {
    fetch('/api/notifications/read-all', { method: 'POST' })
      .then(function () {
        var unread = document.querySelectorAll('.notification-unread');
        for (var i = 0; i < unread.length; i++) {
          unread[i].classList.remove('notification-unread');
          var btn = unread[i].querySelector('.mark-read-btn');
          if (btn) btn.remove();
        }
      });
  });
}

// Прочитать одно
document.addEventListener('click', function (e) {
  if (!e.target.classList.contains('mark-read-btn')) return;
  var id = e.target.dataset.id;
  fetch('/api/notifications/' + id + '/read', { method: 'POST' })
    .then(function () {
      var notif = document.getElementById('notification-' + id);
      if (notif) notif.classList.remove('notification-unread');
      e.target.remove();
    });
});

// Удалить
document.addEventListener('click', function (e) {
  if (!e.target.classList.contains('delete-notif-btn')) return;
  var id = e.target.dataset.id;
  fetch('/api/notifications/' + id, { method: 'DELETE' })
    .then(function () {
      var notif = document.getElementById('notification-' + id);
      if (notif) notif.remove();
      if (list.children.length === 0) {
        list.innerHTML = '<p class="empty">У вас нет уведомлений.</p>';
        if (readAllBtn) readAllBtn.style.display = 'none';
      }
    });
});
