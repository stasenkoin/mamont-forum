// Глобальные переменные для пагинации
var currentPage = 1;
var totalPages = 1;
var discussionId = null;
var currentUserId = null;

// Форматировать дату
function formatDate(dateStr) {
  var date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Создать HTML одного комментария
function buildCommentHtml(comment) {
  var nickname = comment.author ? comment.author.nickname : 'Удалённый пользователь';
  var date = formatDate(comment.createdAt);
  var isOwner = currentUserId && comment.authorId === parseInt(currentUserId);

  var html =
    '<div class="comment-header">' +
      '<strong>' + nickname + '</strong>' +
      '<span class="meta">' + date + '</span>' +
    '</div>' +
    '<p>' + comment.content + '</p>';

  if (isOwner) {
    html +=
      '<div class="comment-actions">' +
        '<a href="/discussions/' + discussionId + '/comments/' + comment.id + '/edit" class="btn btn-sm">Редактировать</a>' +
        '<button class="btn btn-sm btn-danger delete-comment-btn" onclick="deleteComment(' + discussionId + ', ' + comment.id + ')">Удалить</button>' +
      '</div>';
  }

  return html;
}

// Обновить видимость кнопок пагинации
function updatePaginationButtons() {
  var pagination = document.getElementById('comments-pagination');
  var prevBtn = document.getElementById('prev-page-btn');
  var nextBtn = document.getElementById('next-page-btn');
  var pageInfo = document.getElementById('page-info');

  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  pagination.style.display = 'flex';
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  pageInfo.textContent = 'Страница ' + currentPage + ' из ' + totalPages;
}

// Загрузить страницу комментариев через API (без перезагрузки)
function loadCommentsPage(page) {
  var commentsList = document.getElementById('comments-list');

  fetch('/api/discussions/' + discussionId + '/comments?page=' + page + '&limit=5')
    .then(function (r) {
      var totalCount = r.headers.get('X-Total-Count');
      if (totalCount) {
        totalPages = Math.ceil(parseInt(totalCount) / 5);
      }
      return r.json();
    })
    .then(function (comments) {
      commentsList.innerHTML = '';

      for (var i = 0; i < comments.length; i++) {
        var div = document.createElement('div');
        div.className = 'comment';
        div.id = 'comment-' + comments[i].id;
        div.dataset.commentId = comments[i].id;
        div.innerHTML = buildCommentHtml(comments[i]);
        commentsList.appendChild(div);
      }

      currentPage = page;
      updatePaginationButtons();
    });
}

// Удалить комментарий (без перезагрузки)
function deleteComment(discId, commentId) {
  if (!confirm('Удалить комментарий?')) return;

  fetch('/api/discussions/' + discId + '/comments/' + commentId, {
    method: 'DELETE',
  }).then(function () {
    var el = document.getElementById('comment-' + commentId);
    if (el) el.remove();

    var heading = document.getElementById('comments-heading');
    var totalNum = parseInt(heading.textContent.replace(/\D/g, '')) || 0;
    totalNum--;
    heading.textContent = 'Комментарии (' + totalNum + ')';

    totalPages = Math.ceil(totalNum / 5) || 1;

    // Если на странице не осталось комментариев — загрузить предыдущую
    var list = document.getElementById('comments-list');
    if (list.children.length === 0 && currentPage > 1) {
      loadCommentsPage(currentPage - 1);
    } else {
      updatePaginationButtons();
    }
  });
}

// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', function () {
  var article = document.querySelector('[data-discussion-id]');
  if (!article) return;
  discussionId = article.dataset.discussionId;

  var commentsList = document.getElementById('comments-list');
  currentPage = parseInt(commentsList.dataset.page) || 1;
  totalPages = parseInt(commentsList.dataset.totalPages) || 1;
  currentUserId = commentsList.dataset.userId || null;

  // --- Лайки ---
  var likeBtn = document.getElementById('like-btn');
  var likeCount = document.getElementById('like-count');

  if (likeBtn) {
    likeBtn.addEventListener('click', function () {
      var liked = likeBtn.dataset.liked === 'true';
      var method = liked ? 'DELETE' : 'POST';
      fetch('/api/discussions/' + discussionId + '/like', { method: method })
        .then(function (r) { return r.json(); })
        .then(function () {
          liked = !liked;
          likeBtn.dataset.liked = liked.toString();
          if (liked) {
            likeBtn.className = 'btn btn-sm btn-liked';
            likeBtn.innerHTML = '&#10084; Убрать лайк';
          } else {
            likeBtn.className = 'btn btn-sm';
            likeBtn.innerHTML = '&#9825; Лайк';
          }
          var current = parseInt(likeCount.textContent.replace(/\D/g, '')) || 0;
          likeCount.innerHTML = '&#10084; ' + (liked ? current + 1 : current - 1);
        });
    });
  }

  // --- Кнопки пагинации ---
  var prevBtn = document.getElementById('prev-page-btn');
  var nextBtn = document.getElementById('next-page-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) loadCommentsPage(currentPage - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages) loadCommentsPage(currentPage + 1);
    });
  }

  updatePaginationButtons();

  // --- Отправка нового комментария ---
  var form = document.getElementById('comment-form');
  var textarea = document.getElementById('comment-content');
  var heading = document.getElementById('comments-heading');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var content = textarea.value.trim();
      if (!content) return;

      fetch('/api/discussions/' + discussionId + '/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content }),
      })
        .then(function (r) { return r.json(); })
        .then(function () {
          textarea.value = '';

          var totalNum = parseInt(heading.textContent.replace(/\D/g, '')) || 0;
          totalNum++;
          heading.textContent = 'Комментарии (' + totalNum + ')';

          totalPages = Math.ceil(totalNum / 5);

          // Перейти на последнюю страницу — там новый комментарий
          loadCommentsPage(totalPages);
        });
    });
  }
});
