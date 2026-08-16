var SOURCES = window.TEXT_VARIABLES.sources;
var PAHTS = window.TEXT_VARIABLES.paths;
window.Lazyload.js([SOURCES.jquery, PAHTS.search_js], function() {
  var search = (window.search || (window.search = {}));
  var searchData = window.TEXT_SEARCH_DATA || {};

  function memorize(f) {
    var cache = {};
    return function () {
      var key = Array.prototype.join.call(arguments, ',');
      if (key in cache) return cache[key];
      else return cache[key] = f.apply(this, arguments);
    };
  }

  /// search
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function makeSnippet(content, query, radius) {
    var lower = content.toLowerCase(), q = query.toLowerCase();
    var idx = lower.indexOf(q);
    if (idx < 0) { return ''; }
    var start = Math.max(0, idx - radius);
    var end = Math.min(content.length, idx + q.length + radius);
    var snippet = content.substring(start, end).trim();
    if (start > 0) { snippet = '…' + snippet; }
    if (end < content.length) { snippet = snippet + '…'; }
    return snippet;
  }

  function searchByQuery(query) {
    var i, j, key, keys, cur, _title, _content, _titleMatch, _contentMatch, matches, result = {};
    var _query = query.toLowerCase();
    keys = Object.keys(searchData);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      matches = [];
      for (j = 0; j < searchData[key].length; j++) {
        cur = searchData[key][j];
        _title = cur.title || '';
        _content = cur.content || '';
        _titleMatch = _title.toLowerCase().indexOf(_query) >= 0;
        _contentMatch = !_titleMatch && _content.toLowerCase().indexOf(_query) >= 0;
        if (_titleMatch || _contentMatch) {
          matches.push({
            title: _title,
            url: cur.url,
            titleMatch: _titleMatch,
            snippet: _contentMatch ? makeSnippet(_content, query, 40) : ''
          });
        }
      }
      // title matches ranked above content-only matches; sort is stable so
      // original relative order is preserved within each group.
      matches.sort(function(a, b) { return (b.titleMatch ? 1 : 0) - (a.titleMatch ? 1 : 0); });
      if (matches.length > 0) {
        result[key] = matches.slice(0, 12);
      }
    }
    return result;
  }

  var renderHeader = memorize(function(header) {
    return $('<p class="search-result__header">' + header + '</p>');
  });

  var renderItem = function(index, item) {
    var _snippet = item.snippet
      ? '<span class="search-result__snippet">' + escapeHtml(item.snippet) + '</span>'
      : '';
    return $('<li class="search-result__item" data-index="' + index + '">'
      + '<a class="button" href="' + item.url + '">'
      + '<span class="search-result__title">' + escapeHtml(item.title) + '</span>'
      + _snippet
      + '</a></li>');
  };

  function render(data) {
    if (!data) { return null; }
    var $root = $('<ul></ul>'), i, j, key, keys, cur, itemIndex = 0;
    keys = Object.keys(data);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      $root.append(renderHeader(key));
      for (j = 0; j < data[key].length; j++) {
        cur = data[key][j];
        $root.append(renderItem(itemIndex++, cur));
      }
    }
    return $root;
  }

  // search box
  var $result = $('.js-search-result'), $resultItems;
  var lastActiveIndex, activeIndex;

  function clear() {
    $result.html(null);
    $resultItems = $('.search-result__item'); activeIndex = 0;
  }
  function onInputNotEmpty(val) {
    $result.html(render(searchByQuery(val)));
    $resultItems = $('.search-result__item'); activeIndex = 0;
    $resultItems.eq(0).addClass('active');
  }

  search.clear = clear;
  search.onInputNotEmpty = onInputNotEmpty;

  function updateResultItems() {
    lastActiveIndex >= 0 && $resultItems.eq(lastActiveIndex).removeClass('active');
    activeIndex >= 0 && $resultItems.eq(activeIndex).addClass('active');
  }

  function moveActiveIndex(direction) {
    var itemsCount = $resultItems ? $resultItems.length : 0;
    if (itemsCount > 1) {
      lastActiveIndex = activeIndex;
      if (direction === 'up') {
        activeIndex = (activeIndex - 1 + itemsCount) % itemsCount;
      } else if (direction === 'down') {
        activeIndex = (activeIndex + 1 + itemsCount) % itemsCount;
      }
      updateResultItems();
    }
  }

  // Char Code: 13  Enter, 37  ⬅, 38  ⬆, 39  ➡, 40  ⬇
  $(window).on('keyup', function(e) {
    var modalVisible = search.getModalVisible && search.getModalVisible();
    if (modalVisible) {
      if (e.which === 38) {
        modalVisible && moveActiveIndex('up');
      } else if (e.which === 40) {
        modalVisible && moveActiveIndex('down');
      } else if (e.which === 13) {
        modalVisible && $resultItems && activeIndex >= 0 && $resultItems.eq(activeIndex).children('a')[0].click();
      }
    }
  });

  $result.on('mouseover', '.search-result__item > a', function() {
    var itemIndex = $(this).parent().data('index');
    itemIndex >= 0 && (lastActiveIndex = activeIndex, activeIndex = itemIndex, updateResultItems());
  });
});
