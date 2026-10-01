// Demostración local: usa la validación del navegador y no envía datos.
document.addEventListener("DOMContentLoaded", function () {
  var formulario = document.getElementById("form-contacto");
  var estado = document.getElementById("form-estado");
  if (!formulario || !estado) return;

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    estado.textContent = "Formulario válido. Esta es una demostración: tus datos no se han enviado ni guardado.";
  });

  formulario.addEventListener("input", function () {
    estado.textContent = "";
  });

  formulario.querySelector('button[type="submit"]').disabled = false;
});
