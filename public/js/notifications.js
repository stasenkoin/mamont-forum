document.addEventListener('DOMContentLoaded', function () {
  var countEl = document.getElementById('notification-count');
  var source = new EventSource('/notifications/stream');

  source.onmessage = function (event) {
    var notification = JSON.parse(event.data);

    // Update counter
    if (countEl) {
      var current = parseInt(countEl.textContent) || 0;
      countEl.textContent = current + 1;
    }

    // Show toast
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = notification.message;
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.remove();
    }, 4000);
  };

  source.onerror = function () {
    source.close();
  };

  // Load initial unread count
  fetch('/notifications/unread-count')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (countEl && data.count > 0) {
        countEl.textContent = data.count;
      }
    })
    .catch(function () {});
});
