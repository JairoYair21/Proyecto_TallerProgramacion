async function actualizarInicio() {
    const etiqueta = document.querySelector(".hero-etiqueta");

    try {
        const respuestas = await Promise.all([
            fetch("/api/calendario"),
            fetch("/api/pilotos"),
            fetch("/api/constructores")
        ]);

        if (respuestas.some(respuesta => !respuesta.ok)) {
            throw new Error("No se pudieron consultar todos los datos");
        }

        const [calendario, clasificacion, equipos] =
            await Promise.all(respuestas.map(respuesta => respuesta.json()));

        const lider = clasificacion.pilotos?.[0];
        const segundo = clasificacion.pilotos?.[1];
        const equipoLider = equipos.constructores?.[0];

        if (!lider || !segundo || !equipoLider ||
            !Array.isArray(calendario.carreras)) {
            throw new Error("Faltan datos para mostrar el resumen");
        }

        const hoy = new Date().toLocaleDateString("sv-SE", {
            timeZone: "America/Lima"
        });

        const proxima = calendario.carreras.find(
            carrera => carrera.date >= hoy
        );

        const nombreLider =
            `${lider.Driver.givenName} ${lider.Driver.familyName}`;
        const ventaja =
            Number(lider.points) - Number(segundo.points);

        // Panel del líder.
        document.querySelector(".dato-num").textContent = lider.points;
        document.querySelector(".dato-label").textContent =
            `Puntos del líder tras la ronda ${clasificacion.ronda}`;

        const datosPanel = document.querySelectorAll(
            ".panel-dato li span:last-child"
        );

        datosPanel[0].textContent = nombreLider;
        datosPanel[1].textContent = `+${ventaja} pts`;
        datosPanel[2].textContent = equipoLider.Constructor.name;
        datosPanel[3].textContent =
            calendario.carreras.filter(carrera => carrera.date >= hoy).length;

        document.querySelectorAll(".panel-dato li span:first-child")[3]
            .textContent = "Carreras desde hoy";

        etiqueta.textContent =
            `Temporada ${calendario.temporada} · ` +
            `Ronda ${clasificacion.ronda} de ${calendario.carreras.length}`;

        // Tarjeta de la próxima carrera.
        const seccion = document.querySelector("#proxima-carrera");
        const tarjeta = seccion.querySelector(".carrera-destacada");

        if (proxima) {
            const fecha = tarjeta.querySelector(".carrera-fecha");
            const partes = proxima.date.split("-");
            const mes = new Intl.DateTimeFormat("es-PE", {
                month: "short",
                timeZone: "UTC"
            }).format(new Date(proxima.date + "T12:00:00Z"));

            fecha.setAttribute("datetime", proxima.date);
            fecha.querySelector("strong").textContent = partes[2];
            fecha.querySelector("span").textContent =
                `${mes.toUpperCase()} · ${partes[0]}`;

            tarjeta.querySelector(".chip").textContent =
                `Ronda ${proxima.round} · Próxima`;
            tarjeta.querySelector("h3").textContent = proxima.raceName;
            tarjeta.querySelector("p").textContent =
                `${proxima.Circuit.circuitName} · ` +
                proxima.Circuit.Location.country;

            seccion.querySelector(".seccion-cabecera p").textContent =
                "La siguiente carrera según el calendario disponible.";
        } else {
            seccion.querySelector(".seccion-cabecera h2").textContent =
                "Temporada finalizada";
            seccion.querySelector(".seccion-cabecera p").textContent =
                "No quedan carreras futuras en el calendario.";
            tarjeta.querySelector(".carrera-fecha strong").textContent = "—";
            tarjeta.querySelector(".carrera-fecha span").textContent = "";
            tarjeta.querySelector(".chip").textContent =
                `Temporada ${calendario.temporada}`;
            tarjeta.querySelector("h3").textContent =
                "Consulta el calendario";
            tarjeta.querySelector("p").textContent =
                "Revisa las carreras de la temporada.";
        }
    } catch (error) {
        console.error("Error al actualizar Inicio:", error);
        etiqueta.textContent =
            "Datos de referencia · No se pudo actualizar el resumen";
    }
}

actualizarInicio();
setInterval(actualizarInicio, 15 * 60 * 1000);