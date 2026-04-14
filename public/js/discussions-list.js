/*
  Скрипт главной страницы - список обсуждений с пагинацией.
  Логика работы:
  1. При загрузке запрашивает первую страницу обсуждений через GET /api/discussions?page=1&limit=10
  2. Из заголовка ответа X-Total-Count берет общее количество обсуждений для расчета страниц
  3. Для каждого обсуждения рисует карточку с заголовком, автором, датой, превью текста, кол-вом комментариев и лайков
  4. Кнопки "Назад" и "Вперёд" переключают страницы (загружают новую порцию данных)
  5. Если обсуждений нет - показывает сообщение "Пока нет обсуждений"
*/

// находим все нужные элементы на странице
var list = document.getElementById('discussions-list'); // контейнер для карточек обсуждений
var pagination = document.getElementById('discussions-pagination'); // блок пагинации
var prevBtn = document.getElementById('prev-page-btn'); // кнопка "Назад"
var nextBtn = document.getElementById('next-page-btn'); // кнопка "Вперёд"
var pageInfo = document.getElementById('page-info'); // текст "Страница X из Y"
var currentPage = 1; // текущая страница (начинаем с первой)
var totalPages = 1; // общее количество страниц (пересчитывается при каждой загрузке)
var limit = 10; // сколько обсуждений показывать на одной странице

// вспомогательная функция для форматирования даты в русский формат
function formatDate(dateStr) {
  var date = new Date(dateStr); // создаем объект даты из строки
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',    // день числом
    month: 'long',     // месяц словом (январь, февраль...)
    year: 'numeric',   // год числом
    hour: '2-digit',   // часы двумя цифрами
    minute: '2-digit', // минуты двумя цифрами
  });
}

// вспомогательная функция для обрезки длинного текста
function truncate(str, len) {
  if (!str) return ''; // если строка пустая - возвращаем пустую строку
  if (str.length > len) {
    return str.substring(0, len) + '...'; // обрезаем и добавляем троеточие
  }
  return str; // если строка короче лимита - возвращаем как есть
}

// основная функция загрузки страницы обсуждений
function loadPage(page) {
  // делаем GET запрос к API с параметрами пагинации
  fetch('/api/discussions?page=' + page + '&limit=' + limit)
    .then(function (response) {
      // читаем заголовок X-Total-Count - общее количество обсуждений в базе
      var totalCount = response.headers.get('X-Total-Count');
      if (totalCount) {
        // вычисляем общее количество страниц (округляем вверх)
        totalPages = Math.ceil(parseInt(totalCount) / limit);
      }
      return response.json(); // парсим тело ответа как JSON (массив обсуждений)
    })
    .then(function (discussions) {
      // если обсуждений нет и мы на первой странице - показываем пустое сообщение
      if (discussions.length === 0 && page === 1) {
        list.innerHTML = '<p class="empty">Пока нет обсуждений. Будьте первым!</p>';
        pagination.style.display = 'none'; // скрываем пагинацию
        return;
      }

      // собираем HTML для всех карточек обсуждений
      var html = '';
      for (var i = 0; i < discussions.length; i++) {
        var d = discussions[i]; // текущее обсуждение
        // определяем имя автора (может быть null если аккаунт удален)
        var authorName = 'Неизвестный';
        if (d.author) {
          authorName = d.author.nickname;
        }

        // собираем HTML одной карточки обсуждения
        html = html + '<div class="card">'; // карточка
        html = html + '<div class="card-header">'; // шапка карточки
        html = html + '<h3><a href="/discussions/' + d.id + '">' + d.title + '</a></h3>'; // заголовок-ссылка
        html = html + '<span class="meta">' + authorName + ' &middot; ' + formatDate(d.createdAt) + '</span>'; // автор и дата
        html = html + '</div>';
        html = html + '<p class="card-text">' + truncate(d.content, 200) + '</p>'; // превью текста (макс 200 символов)
        html = html + '<div class="card-footer">'; // подвал карточки
        html = html + '<span>&#128172; ' + d._count.comments + '</span>'; // количество комментариев
        html = html + '<span>&#10084; ' + d._count.likes + '</span>'; // количество лайков
        html = html + '<a href="/discussions/' + d.id + '" class="btn btn-sm">Открыть обсуждение</a>'; // ссылка
        html = html + '</div>';
        html = html + '</div>';
      }
      // вставляем собранный HTML в контейнер (заменяем "Загрузка...")
      list.innerHTML = html;

      // обновляем состояние пагинации
      currentPage = page; // запоминаем текущую страницу
      pagination.style.display = 'flex'; // показываем блок пагинации
      prevBtn.disabled = currentPage <= 1; // блокируем "Назад" на первой странице
      nextBtn.disabled = currentPage >= totalPages; // блокируем "Вперёд" на последней
      pageInfo.textContent = 'Страница ' + currentPage + ' из ' + (totalPages || 1); // обновляем текст
    });
}

// обработчик кнопки "Назад" - загружаем предыдущую страницу
prevBtn.addEventListener('click', function () {
  if (currentPage > 1) {
    loadPage(currentPage - 1);
  }
});

// обработчик кнопки "Вперёд" - загружаем следующую страницу
nextBtn.addEventListener('click', function () {
  if (currentPage < totalPages) {
    loadPage(currentPage + 1);
  }
});

// загружаем первую страницу при открытии
loadPage(1);
