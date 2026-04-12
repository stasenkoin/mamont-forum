var currentPage = 1;
var totalPages = 1;
var discussionId = null;
var currentUserId = null;
var totalComments = 0;

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// --- Лайки ---

function initLikeButton() {
  var likeBtn = document.getElementById('like-btn');
  var likeCount = document.getElementById('like-count');
  if (!likeBtn) return;

  likeBtn.addEventListener('click', function () {
    var liked = document.getElementById('like-section').dataset.liked === 'true';
    var method = liked ? 'DELETE' : 'POST';
    fetch('/api/discussions/' + discussionId + '/like', { method: method })
      .then(function (r) { return r.json(); })
      .then(function () {
        liked = !liked;
        document.getElementById('like-section').dataset.liked = liked.toString();
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

// --- Комментарии ---

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
        '<button class="btn btn-sm btn-danger delete-comment-btn" data-id="' + comment.id + '">Удалить</button>' +
      '</div>';
  }

  return html;
}

function updatePaginationButtons() {
  var pagination = document.getElementById('comments-pagination');
  var prevBtn = document.getElementById('prev-page-btn');
  var nextBtn = document.getElementById('next-page-btn');
  var pageInfo = document.getElementById('page-info');

  pagination.style.display = 'flex';
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  pageInfo.textContent = 'Страница ' + currentPage + ' из ' + (totalPages || 1);
}

function loadCommentsPage(page) {
  var commentsList = document.getElementById('comments-list');

  fetch('/api/discussions/' + discussionId + '/comments?page=' + page + '&limit=5')
    .then(function (r) {
      var tc = r.headers.get('X-Total-Count');
      if (tc) {
        totalComments = parseInt(tc);
        totalPages = Math.ceil(totalComments / 5);
      }
      return r.json();
    })
    .then(function (comments) {
      commentsList.innerHTML = '';
      for (var i = 0; i < comments.length; i++) {
        var div = document.createElement('div');
        div.className = 'comment';
        div.id = 'comment-' + comments[i].id;
        div.innerHTML = buildCommentHtml(comments[i]);
        commentsList.appendChild(div);
      }
      currentPage = page;
      document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';
      updatePaginationButtons();
    });
}

// --- Удаление ---

function deleteDiscussion() {
  if (!confirm('Удалить обсуждение?')) return;
  fetch('/api/discussions/' + discussionId, { method: 'DELETE' })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (d) { throw d; });
      window.location.href = '/discussions';
    })
    .catch(function (err) {
      alert(err.message || 'Ошибка удаления');
    });
}

// --- Инициализация ---

document.addEventListener('DOMContentLoaded', function () {
  var commentsSection = document.getElementById('comments');
  if (!commentsSection) return;

  discussionId = commentsSection.dataset.discussionId;
  currentUserId = commentsSection.dataset.userId || null;
  totalComments = parseInt(commentsSection.dataset.totalComments) || 0;
  totalPages = Math.ceil(totalComments / 5) || 1;

  // Лайк-кнопка
  initLikeButton();

  // Удаление обсуждения
  var deleteBtn = document.getElementById('delete-discussion-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteDiscussion);
  }

  // Пагинация начальная
  updatePaginationButtons();

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

  // Удаление комментария (делегирование)
  document.addEventListener('click', function (e) {
    if (!e.target.classList.contains('delete-comment-btn')) return;
    var commentId = e.target.dataset.id;
    if (!confirm('Удалить комментарий?')) return;
    fetch('/api/discussions/' + discussionId + '/comments/' + commentId, {
      method: 'DELETE',
    }).then(function () {
      var el = document.getElementById('comment-' + commentId);
      if (el) el.remove();

      totalComments--;
      document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';
      totalPages = Math.ceil(totalComments / 5) || 1;

      var list = document.getElementById('comments-list');
      if (list.children.length === 0 && currentPage > 1) {
        loadCommentsPage(currentPage - 1);
      } else {
        updatePaginationButtons();
      }
    });
  });

  // Отправка комментария
  var form = document.getElementById('comment-form');
  var textarea = document.getElementById('comment-content');

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
        .then(function (comment) {
          textarea.value = '';
          totalComments++;
          totalPages = Math.ceil(totalComments / 5);
          document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';
          loadCommentsPage(totalPages);
        });
    });
  }
});
