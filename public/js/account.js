// Данные аккаунта уже отрендерены сервером, JS только для интерактивных действий

// Выход
document.getElementById('logout-btn').addEventListener('click', function () {
  fetch('/api/auth/logout', { method: 'POST' })
    .then(function () {
      window.location.href = '/';
    });
});

// Удаление аккаунта
document.getElementById('delete-account-btn').addEventListener('click', function () {
  if (!confirm('Вы уверены? Это действие нельзя отменить.')) return;
  fetch('/api/auth/me', { method: 'DELETE' })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (d) { throw d; });
      window.location.href = '/';
    })
    .catch(function (err) {
      alert(err.message || 'Ошибка удаления');
    });
});
