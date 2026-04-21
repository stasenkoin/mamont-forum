fetch('/api/auth/me')
  .then(function (response) {
    return response.json();
  })
  .then(function (user) {
    var html = '';
    html = html + '<p><strong>Никнейм:</strong> ' + user.nickname + '</p>';

    if (user.avatarUrl) {
      html = html + '<p><strong>Аватар:</strong></p>';
      html = html + '<img src="' + user.avatarUrl + '" alt="avatar" class="avatar-lg" id="avatar-img">';
    }

    var date = new Date(user.createdAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    html = html + '<p><strong>Зарегистрирован:</strong> ' + date + '</p>';

    document.getElementById('account-info').innerHTML = html;
  });

document.getElementById('avatar-form').addEventListener('submit', function (e) {
  e.preventDefault();

  var file = document.getElementById('avatar-file').files[0];
  if (!file) {
    document.getElementById('avatar-status').textContent = 'Выберите файл';
    return;
  }

  var formData = new FormData();
  formData.append('file', file);

  document.getElementById('avatar-status').textContent = 'Загрузка...';

  fetch('/api/auth/me/avatar', { method: 'PATCH', body: formData })
    .then(function (r) {
      if (!r.ok) {
        return r.json().then(function (data) { throw data; });
      }
      return r.json();
    })
    .then(function (data) {
      document.getElementById('avatar-status').textContent = 'Аватар успешно обновлён!';

      var img = document.getElementById('avatar-img');
      if (img) {
        img.src = data.avatarUrl;
      } else {
        location.reload();
      }
    })
    .catch(function (err) {
      document.getElementById('avatar-status').textContent = err.message || 'Ошибка при загрузке файла';
    });
});

document.getElementById('logout-btn').addEventListener('click', function () {
  fetch('/api/auth/logout', { method: 'POST' })
    .then(function () {
      window.location.href = '/';
    });
});

document.getElementById('delete-account-btn').addEventListener('click', function () {
  if (!confirm('Вы уверены? Это действие нельзя отменить.')) return;

  fetch('/api/auth/me', { method: 'DELETE' })
    .then(function (r) {
      if (!r.ok) {
        return r.json().then(function (data) { throw data; });
      }
      window.location.href = '/';
    })
    .catch(function (err) {
      alert(err.message || 'Ошибка удаления');
    });
});
