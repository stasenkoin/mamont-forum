// Данные уже заполнены сервером, JS только отправляет форму через API
var form = document.getElementById('edit-comment-form');
var discussionId = form.dataset.discussionId;
var commentId = form.dataset.commentId;

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var content = document.getElementById('content').value.trim();

  fetch('/api/discussions/' + discussionId + '/comments/' + commentId, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content }),
  })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (d) { throw d; });
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
