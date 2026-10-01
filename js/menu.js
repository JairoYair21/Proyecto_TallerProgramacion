// Menú de navegación para pantallas pequeñas.
// Alterna la visibilidad del listado de enlaces al pulsar el botón "Menú".
document.addEventListener("DOMContentLoaded", function () {
  var boton = document.getElementById("botonMenu");
  var menu = document.getElementById("menu-principal");

  if (!boton || !menu) return;

  boton.addEventListener("click", function () {
    var abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
  });

  function cerrarMenu() {
    menu.classList.remove("abierto");
    boton.setAttribute("aria-expanded", "false");
  }

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && menu.classList.contains("abierto")) {
      cerrarMenu();
      boton.focus();
    }
  });

  document.addEventListener("click", function (evento) {
    if (!menu.contains(evento.target) && !boton.contains(evento.target)) {
      cerrarMenu();
    }
  });

  menu.addEventListener("click", function (evento) {
    if (evento.target.closest("a")) cerrarMenu();
  });

  window.matchMedia("(min-width: 721px)").addEventListener("change", cerrarMenu);
});
