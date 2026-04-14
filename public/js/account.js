fetch('/api/auth/me')
  .then(function (response) {
    return response.json();
  })
  .then(function (user) {
    var html = '';
    html = html + '<p><strong>Никнейм:</strong> ' + user.nickname + '</p>';

    if (user.avatarUrl) {
      html = html + '<p><strong>Аватар:</strong></p>';
      html = html + '<img src="' + user.avatarUrl + '" alt="avatar" class="avatar-lg">';
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
