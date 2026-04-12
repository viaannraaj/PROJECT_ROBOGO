(function () {
  const gameSelect = document.getElementById("search-game");
  const queryInput = document.getElementById("search-query");
  const resultsEl = document.getElementById("search-results");
  const resultsStatus = document.getElementById("search-status");

  if (!gameSelect || !queryInput || !resultsEl) return;

  const guides = window.RoblogNextGuides || [];

  function normalise(s) {
    return (s || "").toLowerCase().trim();
  }

  function render(list) {
    resultsEl.innerHTML = "";
    if (!list.length) {
      resultsEl.innerHTML =
        '<p class="empty-state" role="status">No guides match that search. Try another keyword or pick a different game.</p>';
      if (resultsStatus) {
        resultsStatus.textContent = "0 results";
      }
      return;
    }

    const ul = document.createElement("ul");
    ul.className = "results-list";

    list.forEach((g) => {
      const li = document.createElement("li");
      li.className = "result-item";
      li.innerHTML =
        "<h4>" +
        escapeHtml(g.title) +
        "</h4>" +
        "<p>" +
        escapeHtml(g.summary) +
        "</p>" +
        '<p class="result-meta">' +
        escapeHtml(g.game) +
        "</p>";
      ul.appendChild(li);
    });

    resultsEl.appendChild(ul);
    if (resultsStatus) {
      resultsStatus.textContent =
        list.length === 1 ? "1 result" : list.length + " results";
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function filter() {
    const game = gameSelect.value;
    const q = normalise(queryInput.value);
    const tokens = q.split(/\s+/).filter(Boolean);

    const filtered = guides.filter((g) => {
      if (game && g.game !== game) return false;
      if (!tokens.length) return true;
      const hay = normalise(
        [g.title, g.summary, (g.tags || []).join(" ")].join(" ")
      );
      return tokens.every((t) => hay.includes(t));
    });

    render(filtered);
  }

  gameSelect.addEventListener("change", filter);
  queryInput.addEventListener("input", debounce(filter, 180));

  filter();

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }
})();
