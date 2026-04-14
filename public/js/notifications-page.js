var list = document.getElementById('notifications-list');
var readAllBtn = document.getElementById('read-all-btn');

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

function loadNotifications() {
  fetch('/api/notifications?limit=100')
    .then(function (response) {
      return response.json();
    })
    .then(function (notifications) {
      if (notifications.length === 0) {
        list.innerHTML = '<p class="empty">У вас нет уведомлений.</p>';
        readAllBtn.style.display = 'none';
        return;
      }

      readAllBtn.style.display = 'inline-block';

      var html = '';
      for (var i = 0; i < notifications.length; i++) {
        var n = notifications[i];
        var unreadClass = '';
        if (!n.isRead) {
          unreadClass = ' notification-unread';
        }

        html = html + '<div class="notification' + unreadClass + '" id="notification-' + n.id + '">';
        html = html + '<div class="notification-content">';
        html = html + '<p>' + n.message + '</p>';
        html = html + '<span class="meta">' + formatDate(n.createdAt) + '</span>';

        if (n.discussionId) {
          html = html + ' <a href="/discussions/' + n.discussionId + '" class="btn btn-sm">Перейти</a>';
        }

        html = html + '</div>';
        html = html + '<div class="notification-actions">';

        if (!n.isRead) {
          html = html + '<button class="btn btn-sm mark-read-btn" data-id="' + n.id + '">Прочитано</button>';
        }
        html = html + '<button class="btn btn-sm btn-danger delete-notif-btn" data-id="' + n.id + '">Удалить</button>';

        html = html + '</div>';
        html = html + '</div>';
      }

      list.innerHTML = html;
    });
}

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

document.addEventListener('click', function (e) {
  if (!e.target.classList.contains('mark-read-btn')) return;
  var id = e.target.dataset.id;

  fetch('/api/notifications/' + id + '/read', { method: 'POST' })
    .then(function () {
      var notif = document.getElementById('notification-' + id);
      if (notif) {
        notif.classList.remove('notification-unread');
      }
      e.target.remove();
    });
});

document.addEventListener('click', function (e) {
  if (!e.target.classList.contains('delete-notif-btn')) return;
  var id = e.target.dataset.id;

  fetch('/api/notifications/' + id, { method: 'DELETE' })
    .then(function () {
      var notif = document.getElementById('notification-' + id);
      if (notif) notif.remove();

      if (list.children.length === 0) {
        list.innerHTML = '<p class="empty">У вас нет уведомлений.</p>';
        readAllBtn.style.display = 'none';
      }
    });
});

loadNotifications();
