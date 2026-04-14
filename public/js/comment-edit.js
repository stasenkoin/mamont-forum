var form = document.getElementById('edit-comment-form');
var discussionId = form.dataset.discussionId;
var commentId = form.dataset.commentId;

fetch('/api/discussions/' + discussionId + '/comments/' + commentId)
  .then(function (response) {
    return response.json();
  })
  .then(function (comment) {
    document.getElementById('content').value = comment.content;
  });

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var content = document.getElementById('content').value.trim();

  fetch('/api/discussions/' + discussionId + '/comments/' + commentId, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content }),
  })
    .then(function (r) {
      if (!r.ok) {
        return r.json().then(function (data) { throw data; });
      }
      return r.json();
    })
    .then(function () {
      window.location.href = '/discussions/' + discussionId;
    })
    .catch(function (err) {
      var msg = document.getElementById('error-msg');
      msg.textContent = err.message || 'Ошибка сохранения';
      msg.style.display = 'block';
    });
});
