/*
  Скрипт страницы одного обсуждения - самый сложный скрипт в приложении.
  Логика работы:
  1. При загрузке берет id обсуждения и id текущего пользователя из data-атрибутов HTML
  2. Загружает обсуждение через GET /api/discussions/:id (с автором, лайками, кол-вом комментариев)
  3. Рисует обсуждение: заголовок, автор, дата, текст, кнопка лайка, кнопки автора (редактировать/удалить)
  4. Загружает комментарии постранично через GET /api/discussions/:id/comments?page=X&limit=5
  5. Позволяет ставить/убирать лайк (POST/DELETE /api/discussions/:id/like)
  6. Позволяет автору удалять обсуждение и свои комментарии
  7. Позволяет добавлять новые комментарии через форму
  8. Пагинация комментариев с кнопками "Назад"/"Вперёд"
*/

// глобальные переменные состояния страницы
var currentPage = 1; // текущая страница комментариев
var totalPages = 1; // всего страниц комментариев
var discussionId = null; // id текущего обсуждения (берется из data-атрибута)
var currentUserId = null; // id текущего пользователя (null если не авторизован)
var totalComments = 0; // общее количество комментариев

// вспомогательная функция для форматирования даты
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

// функция отрисовки обсуждения на странице
function renderDiscussion(d) {
  var container = document.getElementById('discussion-container');
  // определяем имя автора (может быть null если аккаунт удален)
  var authorName = 'Неизвестный';
  if (d.author) {
    authorName = d.author.nickname;
  }

  // проверяем является ли текущий пользователь автором обсуждения
  var isAuthor = false;
  if (currentUserId && d.authorId === parseInt(currentUserId)) {
    isAuthor = true;
  }

  // проверяем поставил ли текущий пользователь лайк
  // перебираем массив лайков и ищем совпадение по userId
  var userLiked = false;
  if (currentUserId && d.likes) {
    for (var i = 0; i < d.likes.length; i++) {
      if (d.likes[i].userId === parseInt(currentUserId)) {
        userLiked = true;
        break; // нашли лайк - выходим из цикла
      }
    }
  }

  // собираем HTML обсуждения
  var html = '';
  html = html + '<article class="discussion-detail">';
  html = html + '<h1>' + d.title + '</h1>'; // заголовок обсуждения
  html = html + '<div class="meta">' + authorName + ' &middot; ' + formatDate(d.createdAt) + '</div>'; // автор и дата
  html = html + '<div class="discussion-content"><p>' + d.content + '</p></div>'; // текст обсуждения

  // секция лайков
  html = html + '<div class="like-section">';
  // кнопка лайка показывается только авторизованным пользователям
  if (currentUserId) {
    // если уже лайкнул - кнопка выглядит нажатой (btn-liked) и текст "Убрать лайк"
    var likedClass = userLiked ? 'btn-liked' : '';
    var likedText = userLiked ? '&#10084; Убрать лайк' : '&#9825; Лайк';
    // data-liked хранит текущее состояние лайка для обработчика клика
    html = html + '<button id="like-btn" class="btn btn-sm ' + likedClass + '" data-liked="' + userLiked + '">';
    html = html + likedText;
    html = html + '</button>';
  }
  // счетчик лайков виден всем
  html = html + '<span id="like-count">&#10084; ' + d._count.likes + '</span>';
  html = html + '</div>';

  // кнопки автора (редактировать и удалить) - видны только автору обсуждения
  if (isAuthor) {
    html = html + '<div class="author-actions">';
    html = html + '<a href="/discussions/' + d.id + '/edit" class="btn btn-sm">Редактировать</a>';
    html = html + '<button class="btn btn-sm btn-danger" id="delete-discussion-btn">Удалить</button>';
    html = html + '</div>';
  }

  html = html + '</article>';
  // вставляем HTML в контейнер
  container.innerHTML = html;

  // запоминаем общее количество комментариев для пагинации
  totalComments = d._count.comments;

  // показываем секцию комментариев (она скрыта пока обсуждение не загрузится)
  document.getElementById('comments').style.display = 'block';
  // обновляем заголовок "Комментарии (X)"
  document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';

  // инициализируем обработчик кнопки лайка
  initLikeButton();

  // инициализируем обработчик кнопки удаления обсуждения (если она есть)
  var deleteBtn = document.getElementById('delete-discussion-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function () {
      // спрашиваем подтверждение
      if (!confirm('Удалить обсуждение?')) return;
      // отправляем DELETE запрос
      fetch('/api/discussions/' + discussionId, { method: 'DELETE' })
        .then(function (r) {
          // если ошибка - кидаем исключение
          if (!r.ok) {
            return r.json().then(function (data) { throw data; });
          }
          // обсуждение удалено - перенаправляем на список
          window.location.href = '/discussions';
        })
        .catch(function (err) {
          alert(err.message || 'Ошибка удаления');
        });
    });
  }
}

// функция инициализации кнопки лайка
function initLikeButton() {
  var likeBtn = document.getElementById('like-btn');
  var likeCount = document.getElementById('like-count');
  // если кнопки нет (пользователь не авторизован) - выходим
  if (!likeBtn) return;

  // обработчик клика по кнопке лайка
  likeBtn.addEventListener('click', function () {
    // определяем текущее состояние: лайкнуто или нет
    var liked = likeBtn.dataset.liked === 'true';
    // если лайкнуто - отправляем DELETE для удаления лайка, иначе POST для создания
    var method = liked ? 'DELETE' : 'POST';

    // отправляем запрос на API
    fetch('/api/discussions/' + discussionId + '/like', { method: method })
      .then(function (r) {
        if (!r.ok) throw new Error('Ошибка');
        return r.json();
      })
      .then(function () {
        // переключаем состояние
        liked = !liked;
        likeBtn.dataset.liked = liked.toString(); // обновляем data-атрибут

        // обновляем внешний вид кнопки
        if (liked) {
          likeBtn.className = 'btn btn-sm btn-liked'; // нажатый стиль
          likeBtn.innerHTML = '&#10084; Убрать лайк';
        } else {
          likeBtn.className = 'btn btn-sm'; // обычный стиль
          likeBtn.innerHTML = '&#9825; Лайк';
        }

        // обновляем счетчик лайков (+1 или -1)
        var current = parseInt(likeCount.textContent.replace(/\D/g, '')) || 0; // извлекаем число из текста
        likeCount.innerHTML = '&#10084; ' + (liked ? current + 1 : current - 1);
      });
  });
}

// функция создания HTML одного комментария
function buildCommentHtml(comment) {
  // определяем имя автора комментария
  var nickname = 'Неизвестный';
  if (comment.author) {
    nickname = comment.author.nickname;
  }
  var date = formatDate(comment.createdAt);

  // проверяем является ли текущий пользователь автором этого комментария
  var isOwner = false;
  if (currentUserId && comment.authorId === parseInt(currentUserId)) {
    isOwner = true;
  }

  // собираем HTML комментария
  var html = '';
  html = html + '<div class="comment-header">';
  html = html + '<strong>' + nickname + '</strong>'; // имя автора
  html = html + '<span class="meta">' + date + '</span>'; // дата
  html = html + '</div>';
  html = html + '<p>' + comment.content + '</p>'; // текст комментария

  // кнопки автора комментария (редактировать и удалить)
  if (isOwner) {
    html = html + '<div class="comment-actions">';
    html = html + '<a href="/discussions/' + discussionId + '/comments/' + comment.id + '/edit" class="btn btn-sm">Редактировать</a>';
    // data-id нужен для обработчика делегирования событий
    html = html + '<button class="btn btn-sm btn-danger delete-comment-btn" data-id="' + comment.id + '">Удалить</button>';
    html = html + '</div>';
  }

  return html;
}

// функция обновления кнопок пагинации комментариев
function updatePaginationButtons() {
  var pagination = document.getElementById('comments-pagination');
  var prevBtn = document.getElementById('prev-page-btn');
  var nextBtn = document.getElementById('next-page-btn');
  var pageInfo = document.getElementById('page-info');

  pagination.style.display = 'flex'; // показываем блок пагинации
  prevBtn.disabled = currentPage <= 1; // блокируем "Назад" на первой странице
  nextBtn.disabled = currentPage >= totalPages; // блокируем "Вперёд" на последней
  pageInfo.textContent = 'Страница ' + currentPage + ' из ' + (totalPages || 1);
}

// функция загрузки страницы комментариев
function loadCommentsPage(page) {
  var commentsList = document.getElementById('comments-list');

  // запрашиваем комментарии с пагинацией (по 5 на страницу)
  fetch('/api/discussions/' + discussionId + '/comments?page=' + page + '&limit=5')
    .then(function (response) {
      // читаем общее количество комментариев из заголовка
      var tc = response.headers.get('X-Total-Count');
      if (tc) {
        totalComments = parseInt(tc);
        totalPages = Math.ceil(totalComments / 5); // пересчитываем количество страниц
      }
      return response.json(); // парсим массив комментариев
    })
    .then(function (comments) {
      // очищаем контейнер комментариев
      commentsList.innerHTML = '';

      // создаем DOM элемент для каждого комментария
      for (var i = 0; i < comments.length; i++) {
        var div = document.createElement('div');
        div.className = 'comment';
        div.id = 'comment-' + comments[i].id; // уникальный id для удаления из DOM
        div.innerHTML = buildCommentHtml(comments[i]);
        commentsList.appendChild(div); // добавляем в контейнер
      }

      // обновляем состояние пагинации
      currentPage = page;
      document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';
      updatePaginationButtons();
    });
}

// делегирование событий: обработчик удаления комментария
// один обработчик на document вместо обработчика на каждую кнопку "Удалить"
document.addEventListener('click', function (e) {
  // проверяем что кликнули по кнопке удаления комментария
  if (!e.target.classList.contains('delete-comment-btn')) return;

  var commentId = e.target.dataset.id; // id комментария из data-id
  // спрашиваем подтверждение
  if (!confirm('Удалить комментарий?')) return;

  // отправляем DELETE запрос
  fetch('/api/discussions/' + discussionId + '/comments/' + commentId, {
    method: 'DELETE',
  })
    .then(function () {
      // удаляем элемент комментария из DOM
      var el = document.getElementById('comment-' + commentId);
      if (el) el.remove();

      // обновляем счетчик и пагинацию
      totalComments--;
      document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';
      totalPages = Math.ceil(totalComments / 5) || 1;

      // если на текущей странице больше нет комментариев - переходим на предыдущую
      var commentsList = document.getElementById('comments-list');
      if (commentsList.children.length === 0 && currentPage > 1) {
        loadCommentsPage(currentPage - 1);
      } else {
        updatePaginationButtons();
      }
    });
});

// основная инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('discussion-container');
  if (!container) return; // если контейнера нет - выходим

  // получаем id обсуждения и id пользователя из data-атрибутов HTML элемента
  discussionId = container.dataset.discussionId;
  currentUserId = container.dataset.userId || null; // null если не авторизован

  // загружаем данные обсуждения из API
  fetch('/api/discussions/' + discussionId)
    .then(function (response) {
      // если обсуждение не найдено (404) - кидаем ошибку
      if (!response.ok) {
        throw new Error('Обсуждение не найдено');
      }
      return response.json();
    })
    .then(function (discussion) {
      // рисуем обсуждение на странице
      renderDiscussion(discussion);
      // рассчитываем количество страниц комментариев
      totalPages = Math.ceil(totalComments / 5) || 1;
      // загружаем первую страницу комментариев
      loadCommentsPage(1);
    })
    .catch(function (err) {
      // показываем ошибку если обсуждение не загрузилось
      container.innerHTML = '<p class="empty">' + err.message + '</p>';
    });

  // обработчики кнопок пагинации комментариев
  var prevBtn = document.getElementById('prev-page-btn');
  var nextBtn = document.getElementById('next-page-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) {
        loadCommentsPage(currentPage - 1); // загружаем предыдущую страницу
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages) {
        loadCommentsPage(currentPage + 1); // загружаем следующую страницу
      }
    });
  }

  // обработчик формы добавления нового комментария
  var form = document.getElementById('comment-form');
  var textarea = document.getElementById('comment-content');

  if (form) {
    form.addEventListener('submit', function (e) {
      // отменяем стандартную отправку формы
      e.preventDefault();
      var content = textarea.value.trim();
      if (!content) return; // не отправляем пустой комментарий

      // отправляем POST запрос для создания комментария
      fetch('/api/discussions/' + discussionId + '/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function () {
          textarea.value = ''; // очищаем текстовое поле
          totalComments++; // увеличиваем счетчик комментариев
          totalPages = Math.ceil(totalComments / 5); // пересчитываем страницы
          document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';
          loadCommentsPage(totalPages); // переходим на последнюю страницу чтобы увидеть новый комментарий
        });
    });
  }
});
