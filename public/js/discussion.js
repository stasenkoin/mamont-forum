document.addEventListener('DOMContentLoaded', function () {
  var article = document.querySelector('[data-discussion-id]');
  if (!article) return;
  var discussionId = article.dataset.discussionId;

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

  var form = document.getElementById('comment-form');
  var textarea = document.getElementById('comment-content');
  var commentsList = document.getElementById('comments-list');
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
        .then(function (comment) {
          var div = document.createElement('div');
          div.className = 'comment';
          div.id = 'comment-' + comment.id;
          div.dataset.commentId = comment.id;
          div.innerHTML =
            '<div class="comment-header"><strong>' + (comment.author ? comment.author.nickname : 'Вы') + '</strong></div>' +
            '<p>' + comment.content + '</p>';
          commentsList.appendChild(div);
          textarea.value = '';

          var count = commentsList.children.length;
          heading.textContent = 'Комментарии (' + count + ')';
        });
    });
  }
});

function deleteComment(discussionId, commentId) {
  if (!confirm('Удалить комментарий?')) return;
  fetch('/api/discussions/' + discussionId + '/comments/' + commentId, {
    method: 'DELETE',
  }).then(function () {
    var el = document.getElementById('comment-' + commentId);
    if (el) el.remove();
    var heading = document.getElementById('comments-heading');
    var list = document.getElementById('comments-list');
    if (heading && list) {
      heading.textContent = 'Комментарии (' + list.children.length + ')';
    }
  });
}
