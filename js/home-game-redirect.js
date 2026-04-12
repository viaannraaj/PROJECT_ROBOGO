(function () {
  const select = document.getElementById("search-game");
  if (!select) return;

  select.addEventListener("change", function () {
    if (!this.value) return;
    const params = new URLSearchParams();
    params.set("game", this.value);
    window.location.href = "waitlist.html?" + params.toString();
  });
})();
