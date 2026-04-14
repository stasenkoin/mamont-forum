document.getElementById('create-discussion-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var title = document.getElementById('title').value.trim();
  var content = document.getElementById('content').value.trim();

  fetch('/api/discussions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, content: content }),
  })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (d) { throw d; });
      return r.json();
    })
    .then(function (discussion) {
      window.location.href = '/discussions/' + discussion.id;
    })
    .catch(function (err) {
      var msg = document.getElementById('error-msg');
      msg.textContent = err.message || 'Ошибка создания';
      msg.style.display = 'block';
    });
});
