/*
  Скрипт страницы списка пользователей с пагинацией.
  Логика работы:
  1. При загрузке запрашивает первую страницу пользователей через GET /api/users?page=1&limit=10
  2. Из заголовка X-Total-Count получает общее количество для расчета страниц
  3. Для каждого пользователя рисует карточку с аватаром, никнеймом, датой регистрации и статистикой
  4. Статистика показывает количество обсуждений и комментариев пользователя
  5. Кнопки "Назад" / "Вперёд" переключают страницы
*/

// находим элементы на странице
var list = document.getElementById('users-list'); // контейнер для карточек пользователей
var pagination = document.getElementById('users-pagination'); // блок пагинации
var prevBtn = document.getElementById('prev-page-btn'); // кнопка "Назад"
var nextBtn = document.getElementById('next-page-btn'); // кнопка "Вперёд"
var pageInfo = document.getElementById('page-info'); // текст "Страница X из Y"
var currentPage = 1; // текущая страница
var totalPages = 1; // всего страниц
var limit = 10; // пользователей на одной странице

// форматирование даты в русский формат (только дата, без времени)
function formatDate(dateStr) {
  var date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// основная функция загрузки страницы пользователей
function loadPage(page) {
  // запрашиваем список пользователей с пагинацией
  fetch('/api/users?page=' + page + '&limit=' + limit)
    .then(function (response) {
      // читаем общее количество пользователей из заголовка
      var totalCount = response.headers.get('X-Total-Count');
      if (totalCount) {
        totalPages = Math.ceil(parseInt(totalCount) / limit); // считаем количество страниц
      }
      return response.json(); // парсим массив пользователей
    })
    .then(function (users) {
      // если пользователей нет - показываем пустое сообщение
      if (users.length === 0 && page === 1) {
        list.innerHTML = '<p class="empty">Пока нет пользователей.</p>';
        pagination.style.display = 'none';
        return;
      }

      // собираем HTML для карточек пользователей
      var html = '';
      for (var i = 0; i < users.length; i++) {
        var u = users[i]; // текущий пользователь

        html = html + '<div class="card user-card">'; // карточка пользователя
        html = html + '<div class="user-card-info">'; // блок с аватаром и именем

        // показываем аватар или заглушку (иконку человечка)
        if (u.avatarUrl) {
          html = html + '<img src="' + u.avatarUrl + '" alt="avatar" class="avatar-sm">';
        } else {
          html = html + '<span class="avatar-placeholder">&#128100;</span>'; // иконка-заглушка
        }

        // никнейм и дата регистрации
        html = html + '<div>';
        html = html + '<strong>' + u.nickname + '</strong>';
        html = html + '<div class="meta">Зарегистрирован: ' + formatDate(u.createdAt) + '</div>';
        html = html + '</div>';
        html = html + '</div>';

        // статистика пользователя (сколько обсуждений и комментариев создал)
        html = html + '<div class="user-card-stats">';
        html = html + '<span>&#128172; ' + u._count.discussions + ' обсуждений</span>';
        html = html + '<span>&#128488; ' + u._count.comments + ' комментариев</span>';
        html = html + '</div>';
        html = html + '</div>';
      }
      // вставляем HTML в контейнер
      list.innerHTML = html;

      // обновляем пагинацию
      currentPage = page;
      pagination.style.display = 'flex'; // показываем блок пагинации
      prevBtn.disabled = currentPage <= 1; // блокируем "Назад" на первой странице
      nextBtn.disabled = currentPage >= totalPages; // блокируем "Вперёд" на последней
      pageInfo.textContent = 'Страница ' + currentPage + ' из ' + (totalPages || 1);
    });
}

// обработчик кнопки "Назад"
prevBtn.addEventListener('click', function () {
  if (currentPage > 1) {
    loadPage(currentPage - 1);
  }
});

// обработчик кнопки "Вперёд"
nextBtn.addEventListener('click', function () {
  if (currentPage < totalPages) {
    loadPage(currentPage + 1);
  }
});

// загружаем первую страницу при открытии
loadPage(1);
