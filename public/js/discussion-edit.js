// Данные уже заполнены сервером, JS только отправляет форму через API
var form = document.getElementById('edit-discussion-form');
var id = form.dataset.id;

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var title = document.getElementById('title').value.trim();
  var content = document.getElementById('content').value.trim();

  fetch('/api/discussions/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, content: content }),
  })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (d) { throw d; });
      return r.json();
    })
    .then(function () {
      window.location.href = '/discussions/' + id;
    })
    .catch(function (err) {
      var msg = document.getElementById('error-msg');
      msg.textContent = err.message || 'Ошибка сохранения';
      msg.style.display = 'block';
    });
});
