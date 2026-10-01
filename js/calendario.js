async function actualizarCalendario() {
    const cuerpo = document.querySelector(".tabla-calendario tbody");
    const destacado = document.querySelector(".calendario-destacado");
    if (!cuerpo || !destacado) return;

    try {
        const respuesta = await fetch("/api/calendario");
        if (!respuesta.ok) throw new Error("No se pudo consultar el servidor");

        const datos = await respuesta.json();
        const carreras = datos.carreras;

        if (!Array.isArray(carreras)) {
            throw new Error("El calendario recibido no es válido");
        }

        // Fecha actual en Perú, con formato AAAA-MM-DD.
        const hoy = new Date().toLocaleDateString("sv-SE", {
            timeZone: "America/Lima"
        });

        const proxima = carreras.find(carrera => carrera.date >= hoy);
        const filas = document.createDocumentFragment();

        for (const carrera of carreras) {
            const fila = document.createElement("tr");
            const esProxima = carrera === proxima;
            if (esProxima) fila.className = "carrera-proxima";

            let estado = "Pasada";
            if (carrera.date === hoy) estado = "Hoy";
            else if (esProxima) estado = "Próxima";
            else if (carrera.date > hoy) estado = "Pendiente";

            const columnas = [
                ["Ronda", carrera.round],
                ["Gran Premio", carrera.raceName],
                ["Circuito", carrera.Circuit.circuitName],
                ["País", carrera.Circuit.Location.country],
                ["Fecha", new Intl.DateTimeFormat("es-PE", {
                    dateStyle: "long",
                    timeZone: "UTC"
                }).format(new Date(carrera.date + "T12:00:00Z"))],
                ["Estado", estado]
            ];

            columnas.forEach(([etiqueta, valor], indice) => {
                const celda = document.createElement("td");
                celda.dataset.label = etiqueta;

                if (indice === 0) {
                    celda.className = esProxima ? "pos pos-1" : "pos";
                }

                if (indice === 5) {
                    const distintivo = document.createElement("span");
                    distintivo.className = esProxima
                        ? "chip chip-proxima"
                        : "chip";
                    distintivo.textContent = valor;
                    celda.append(distintivo);
                } else {
                    celda.textContent = valor;
                }

                fila.append(celda);
            });

            filas.append(fila);
        }

        cuerpo.replaceChildren(filas);
        document.querySelector(".tabla-calendario caption").textContent =
            `Calendario de la temporada ${datos.temporada}`;

        if (proxima) {
            const fecha = destacado.querySelector(".carrera-fecha");
            const partes = proxima.date.split("-");

            fecha.setAttribute("datetime", proxima.date);
            fecha.querySelector("strong").textContent = partes[2];
            fecha.querySelector("span").textContent =
                `${new Intl.DateTimeFormat("es-PE", {
                    month: "short",
                    timeZone: "UTC"
                }).format(new Date(proxima.date + "T12:00:00Z")).toUpperCase()} · ${partes[0]}`;

            destacado.querySelector(".chip").textContent =
                `Ronda ${proxima.round} · Próxima`;
            destacado.querySelector("h2").textContent = proxima.raceName;
            destacado.querySelector("p").textContent =
                `${proxima.Circuit.circuitName} · ${proxima.Circuit.Location.country}`;
        }
    } catch (error) {
        console.error("Error al actualizar el calendario:", error);
    }
}

actualizarCalendario();
setInterval(actualizarCalendario, 15 * 60 * 1000);