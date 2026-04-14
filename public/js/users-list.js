var list = document.getElementById('users-list');
var pagination = document.getElementById('users-pagination');
var prevBtn = document.getElementById('prev-page-btn');
var nextBtn = document.getElementById('next-page-btn');
var pageInfo = document.getElementById('page-info');
var currentPage = 1;
var totalPages = 1;
var limit = 10;

function formatDate(dateStr) {
  var date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function loadPage(page) {
  fetch('/api/users?page=' + page + '&limit=' + limit)
    .then(function (response) {
      var totalCount = response.headers.get('X-Total-Count');
      if (totalCount) {
        totalPages = Math.ceil(parseInt(totalCount) / limit);
      }
      return response.json();
    })
    .then(function (users) {
      if (users.length === 0 && page === 1) {
        list.innerHTML = '<p class="empty">Пока нет пользователей.</p>';
        pagination.style.display = 'none';
        return;
      }

      var html = '';
      for (var i = 0; i < users.length; i++) {
        var u = users[i];

        html = html + '<div class="card user-card">';
        html = html + '<div class="user-card-info">';

        if (u.avatarUrl) {
          html = html + '<img src="' + u.avatarUrl + '" alt="avatar" class="avatar-sm">';
        } else {
          html = html + '<span class="avatar-placeholder">&#128100;</span>';
        }

        html = html + '<div>';
        html = html + '<strong>' + u.nickname + '</strong>';
        html = html + '<div class="meta">Зарегистрирован: ' + formatDate(u.createdAt) + '</div>';
        html = html + '</div>';
        html = html + '</div>';

        html = html + '<div class="user-card-stats">';
        html = html + '<span>&#128172; ' + u._count.discussions + ' обсуждений</span>';
        html = html + '<span>&#128488; ' + u._count.comments + ' комментариев</span>';
        html = html + '</div>';
        html = html + '</div>';
      }
      list.innerHTML = html;

      currentPage = page;
      pagination.style.display = 'flex';
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;
      pageInfo.textContent = 'Страница ' + currentPage + ' из ' + (totalPages || 1);
    });
}

prevBtn.addEventListener('click', function () {
  if (currentPage > 1) {
    loadPage(currentPage - 1);
  }
});

nextBtn.addEventListener('click', function () {
  if (currentPage < totalPages) {
    loadPage(currentPage + 1);
  }
});

loadPage(1);
