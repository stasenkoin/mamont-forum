document.getElementById('rule-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var title = document.getElementById('rule-title').value.trim();
  var content = document.getElementById('rule-content').value.trim();
  var errorMsg = document.getElementById('rule-error');

  fetch('/api/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ title: title, content: content }),
  })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (d) { throw new Error(d.message || 'Ошибка'); });
      window.location.reload();
    })
    .catch(function (err) {
      errorMsg.textContent = err.message;
      errorMsg.style.display = 'block';
    });
});

function deleteRule(id) {
  if (!confirm('Удалить правило?')) return;
  fetch('/api/rules/' + id, {
    method: 'DELETE',
    credentials: 'same-origin',
  }).then(function (r) {
    if (r.ok) {
      var el = document.getElementById('rule-' + id);
      if (el) el.remove();
    } else {
      alert('Не удалось удалить');
    }
  });
}
