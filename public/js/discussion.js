var currentPage = 1;
var totalPages = 1;
var discussionId = null;
var currentUserId = null;
var totalComments = 0;

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

function renderDiscussion(d) {
  var container = document.getElementById('discussion-container');
  var authorName = 'Неизвестный';
  if (d.author) {
    authorName = d.author.nickname;
  }

  var isAuthor = false;
  if (currentUserId && d.authorId === parseInt(currentUserId)) {
    isAuthor = true;
  }

  var userLiked = false;
  if (currentUserId && d.likes) {
    for (var i = 0; i < d.likes.length; i++) {
      if (d.likes[i].userId === parseInt(currentUserId)) {
        userLiked = true;
        break;
      }
    }
  }

  var html = '';
  html = html + '<article class="discussion-detail">';
  html = html + '<h1>' + d.title + '</h1>';
  html = html + '<div class="meta">' + authorName + ' &middot; ' + formatDate(d.createdAt) + '</div>';
  html = html + '<div class="discussion-content"><p>' + d.content + '</p></div>';

  html = html + '<div class="like-section">';
  if (currentUserId) {
    var likedClass = userLiked ? 'btn-liked' : '';
    var likedText = userLiked ? '&#10084; Убрать лайк' : '&#9825; Лайк';
    html = html + '<button id="like-btn" class="btn btn-sm ' + likedClass + '" data-liked="' + userLiked + '">';
    html = html + likedText;
    html = html + '</button>';
  }
  html = html + '<span id="like-count">&#10084; ' + d._count.likes + '</span>';
  html = html + '</div>';

  if (isAuthor) {
    html = html + '<div class="author-actions">';
    html = html + '<a href="/discussions/' + d.id + '/edit" class="btn btn-sm">Редактировать</a>';
    html = html + '<button class="btn btn-sm btn-danger" id="delete-discussion-btn">Удалить</button>';
    html = html + '</div>';
  }

  html = html + '</article>';
  container.innerHTML = html;

  totalComments = d._count.comments;

  document.getElementById('comments').style.display = 'block';
  document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';

  initLikeButton();

  var deleteBtn = document.getElementById('delete-discussion-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function () {
      if (!confirm('Удалить обсуждение?')) return;
      fetch('/api/discussions/' + discussionId, { method: 'DELETE' })
        .then(function (r) {
          if (!r.ok) {
            return r.json().then(function (data) { throw data; });
          }
          window.location.href = '/discussions';
        })
        .catch(function (err) {
          alert(err.message || 'Ошибка удаления');
        });
    });
  }
}

function initLikeButton() {
  var likeBtn = document.getElementById('like-btn');
  var likeCount = document.getElementById('like-count');
  if (!likeBtn) return;

  likeBtn.addEventListener('click', function () {
    var liked = likeBtn.dataset.liked === 'true';
    var method = liked ? 'DELETE' : 'POST';

    fetch('/api/discussions/' + discussionId + '/like', { method: method })
      .then(function (r) {
        if (!r.ok) throw new Error('Ошибка');
        return r.json();
      })
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

function buildCommentHtml(comment) {
  var nickname = 'Неизвестный';
  if (comment.author) {
    nickname = comment.author.nickname;
  }
  var date = formatDate(comment.createdAt);

  var isOwner = false;
  if (currentUserId && comment.authorId === parseInt(currentUserId)) {
    isOwner = true;
  }

  var html = '';
  html = html + '<div class="comment-header">';
  html = html + '<strong>' + nickname + '</strong>';
  html = html + '<span class="meta">' + date + '</span>';
  html = html + '</div>';
  html = html + '<p>' + comment.content + '</p>';

  if (isOwner) {
    html = html + '<div class="comment-actions">';
    html = html + '<a href="/discussions/' + discussionId + '/comments/' + comment.id + '/edit" class="btn btn-sm">Редактировать</a>';
    html = html + '<button class="btn btn-sm btn-danger delete-comment-btn" data-id="' + comment.id + '">Удалить</button>';
    html = html + '</div>';
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
    .then(function (response) {
      var tc = response.headers.get('X-Total-Count');
      if (tc) {
        totalComments = parseInt(tc);
        totalPages = Math.ceil(totalComments / 5);
      }
      return response.json();
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

document.addEventListener('click', function (e) {
  if (!e.target.classList.contains('delete-comment-btn')) return;

  var commentId = e.target.dataset.id;
  if (!confirm('Удалить комментарий?')) return;

  fetch('/api/discussions/' + discussionId + '/comments/' + commentId, {
    method: 'DELETE',
  })
    .then(function () {
      var el = document.getElementById('comment-' + commentId);
      if (el) el.remove();

      totalComments--;
      document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';
      totalPages = Math.ceil(totalComments / 5) || 1;

      var commentsList = document.getElementById('comments-list');
      if (commentsList.children.length === 0 && currentPage > 1) {
        loadCommentsPage(currentPage - 1);
      } else {
        updatePaginationButtons();
      }
    });
});

document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('discussion-container');
  if (!container) return;

  discussionId = container.dataset.discussionId;
  currentUserId = container.dataset.userId || null;

  fetch('/api/discussions/' + discussionId)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Обсуждение не найдено');
      }
      return response.json();
    })
    .then(function (discussion) {
      renderDiscussion(discussion);
      totalPages = Math.ceil(totalComments / 5) || 1;
      loadCommentsPage(1);
    })
    .catch(function (err) {
      container.innerHTML = '<p class="empty">' + err.message + '</p>';
    });

  var prevBtn = document.getElementById('prev-page-btn');
  var nextBtn = document.getElementById('next-page-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) {
        loadCommentsPage(currentPage - 1);
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages) {
        loadCommentsPage(currentPage + 1);
      }
    });
  }

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
        .then(function (r) {
          return r.json();
        })
        .then(function () {
          textarea.value = '';
          totalComments++;
          totalPages = Math.ceil(totalComments / 5);
          document.getElementById('comments-heading').textContent = 'Комментарии (' + totalComments + ')';
          loadCommentsPage(totalPages);
        });
    });
  }
});
