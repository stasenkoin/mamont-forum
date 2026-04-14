var list = document.getElementById('discussions-list');
var pagination = document.getElementById('discussions-pagination');
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(str, len) {
  if (!str) return '';
  if (str.length > len) {
    return str.substring(0, len) + '...';
  }
  return str;
}

function loadPage(page) {
  fetch('/api/discussions?page=' + page + '&limit=' + limit)
    .then(function (response) {
      var totalCount = response.headers.get('X-Total-Count');
      if (totalCount) {
        totalPages = Math.ceil(parseInt(totalCount) / limit);
      }
      return response.json();
    })
    .then(function (discussions) {
      if (discussions.length === 0 && page === 1) {
        list.innerHTML = '<p class="empty">Пока нет обсуждений. Будьте первым!</p>';
        pagination.style.display = 'none';
        return;
      }

      var html = '';
      for (var i = 0; i < discussions.length; i++) {
        var d = discussions[i];
        var authorName = 'Неизвестный';
        if (d.author) {
          authorName = d.author.nickname;
        }

        html = html + '<div class="card">';
        html = html + '<div class="card-header">';
        html = html + '<h3><a href="/discussions/' + d.id + '">' + d.title + '</a></h3>';
        html = html + '<span class="meta">' + authorName + ' &middot; ' + formatDate(d.createdAt) + '</span>';
        html = html + '</div>';
        html = html + '<p class="card-text">' + truncate(d.content, 200) + '</p>';
        html = html + '<div class="card-footer">';
        html = html + '<span>&#128172; ' + d._count.comments + '</span>';
        html = html + '<span>&#10084; ' + d._count.likes + '</span>';
        html = html + '<a href="/discussions/' + d.id + '" class="btn btn-sm">Открыть обсуждение</a>';
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
