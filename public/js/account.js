/*
  Скрипт страницы настроек аккаунта.
  Логика работы:
  1. При загрузке получаем данные текущего пользователя через GET /api/auth/me
  2. Отображаем никнейм, аватар (если есть) и дату регистрации
  3. Кнопка "Выйти" - отправляет POST /api/auth/logout и перенаправляет на главную
  4. Кнопка "Удалить аккаунт" - спрашивает подтверждение, потом DELETE /api/auth/me
*/

// загружаем данные текущего пользователя из API
fetch('/api/auth/me')
  .then(function (response) {
    return response.json(); // парсим JSON ответ
  })
  .then(function (user) {
    // собираем HTML с информацией о пользователе
    var html = '';
    html = html + '<p><strong>Никнейм:</strong> ' + user.nickname + '</p>';

    // если у пользователя есть аватар - показываем картинку
    if (user.avatarUrl) {
      html = html + '<p><strong>Аватар:</strong></p>';
      html = html + '<img src="' + user.avatarUrl + '" alt="avatar" class="avatar-lg">';
    }

    // форматируем дату регистрации в русском формате
    var date = new Date(user.createdAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    html = html + '<p><strong>Зарегистрирован:</strong> ' + date + '</p>';

    // вставляем собранный HTML в блок с информацией об аккаунте
    document.getElementById('account-info').innerHTML = html;
  });

// обработчик кнопки "Выйти из аккаунта"
document.getElementById('logout-btn').addEventListener('click', function () {
  // отправляем POST запрос на выход - сервер уничтожит сессию
  fetch('/api/auth/logout', { method: 'POST' })
    .then(function () {
      // после выхода перенаправляем на главную страницу
      window.location.href = '/';
    });
});

// обработчик кнопки "Удалить аккаунт"
document.getElementById('delete-account-btn').addEventListener('click', function () {
  // спрашиваем подтверждение через стандартный диалог браузера
  if (!confirm('Вы уверены? Это действие нельзя отменить.')) return;

  // отправляем DELETE запрос на удаление аккаунта
  fetch('/api/auth/me', { method: 'DELETE' })
    .then(function (r) {
      // если ошибка - кидаем исключение
      if (!r.ok) {
        return r.json().then(function (data) { throw data; });
      }
      // аккаунт удален - перенаправляем на главную
      window.location.href = '/';
    })
    .catch(function (err) {
      // показываем ошибку через alert
      alert(err.message || 'Ошибка удаления');
    });
});
