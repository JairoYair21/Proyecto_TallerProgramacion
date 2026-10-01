async function actualizarPilotos() {
    const tarjetas = document.querySelector(".podio-grid");
    const cuerpo = document.querySelector(".tabla-pilotos tbody");
    const nota = document.querySelector("main > section:first-child .nota-datos");

    if (!tarjetas || !cuerpo) return;

    try {
        const respuesta = await fetch("/api/pilotos");
        if (!respuesta.ok) throw new Error("No se pudo consultar la clasificación");

        const datos = await respuesta.json();
        if (!Array.isArray(datos.pilotos)) {
            throw new Error("La lista de pilotos no es válida");
        }

        const nuevasTarjetas = document.createDocumentFragment();
        const nuevasFilas = document.createDocumentFragment();

        const colores = {
            mercedes: "#67dbc6",
            ferrari: "#ff6576",
            mclaren: "#ffad51",
            red_bull: "#6688ff"
        };

        datos.pilotos.forEach((piloto, indice) => {
            const nombre =
                `${piloto.Driver.givenName} ${piloto.Driver.familyName}`;
            const equipo = piloto.Constructors?.[0]?.name || "Sin equipo";

            // Actualiza la tabla completa.
            const fila = document.createElement("tr");
            const valores = [
                piloto.position,
                nombre,
                equipo,
                piloto.wins,
                piloto.points
            ];

            valores.forEach((valor, columna) => {
                const celda = document.createElement("td");
                celda.textContent = valor;

                if (columna === 0) {
                    celda.className = indice === 0 ? "pos pos-1" : "pos";
                }
                if (columna === 3 || columna === 4) {
                    celda.classList.add("num");
                }

                fila.append(celda);
            });

            nuevasFilas.append(fila);

            // Actualiza las tarjetas de los tres primeros.
            if (indice < 3) {
                const tarjeta = document.createElement("article");
                tarjeta.className = "tarjeta piloto-destacado";
                tarjeta.style.setProperty(
                    "--equipo",
                    colores[piloto.Constructors?.[0]?.constructorId] || "#e8002d"
                );

                const posicion = document.createElement("span");
                posicion.className = "piloto-posicion";
                posicion.textContent =
                    String(indice + 1).padStart(2, "0") +
                    (indice === 0 ? " · Líder" : "");

                const titulo = document.createElement("h2");
                titulo.textContent = nombre;

                const nombreEquipo = document.createElement("p");
                nombreEquipo.className = "piloto-equipo";
                nombreEquipo.textContent = equipo;

                const puntos = document.createElement("p");
                puntos.className = "piloto-puntos";

                const cantidad = document.createElement("strong");
                cantidad.textContent = piloto.points;

                puntos.append(
                    cantidad,
                    ` puntos · ${piloto.wins} victorias`
                );

                tarjeta.append(posicion, titulo, nombreEquipo, puntos);
                nuevasTarjetas.append(tarjeta);
            }
        });

        cuerpo.replaceChildren(nuevasFilas);
        tarjetas.replaceChildren(nuevasTarjetas);

        document.querySelector(".tabla-pilotos caption").textContent =
            `Campeonato de pilotos ${datos.temporada} — ronda ${datos.ronda}`;

        document.querySelector(
            "main > section:first-child .seccion-cabecera p"
        ).textContent =
            `Clasificación de la temporada ${datos.temporada}, ` +
            `actualizada tras la ronda ${datos.ronda}.`;

        if (nota) {
            nota.textContent =
                "Clasificación obtenida de Jolpica F1. " +
                "La página comprueba los datos cada 15 minutos.";
        }
    } catch (error) {
        console.error("Error al actualizar pilotos:", error);
        if (nota) {
            nota.textContent =
                "No se pudo actualizar la clasificación; " +
                "se muestran los datos de referencia de la página.";
        }
    }
}

actualizarPilotos();
setInterval(actualizarPilotos, 15 * 60 * 1000);
async function actualizarConstructores() {
    // La segunda tabla de pilotos.html es la de constructores.
    const tabla = document.querySelectorAll(
        "main .tabla-envoltorio table"
    )[1];

    if (!tabla) return;

    const seccion = tabla.closest("section");
    const descripcion = seccion.querySelector(".seccion-cabecera p");

    try {
        const respuesta = await fetch("/api/constructores");
        if (!respuesta.ok) {
            throw new Error("No se pudo consultar la clasificación");
        }

        const datos = await respuesta.json();
        if (!Array.isArray(datos.constructores)) {
            throw new Error("La lista de constructores no es válida");
        }

        const filas = document.createDocumentFragment();

        datos.constructores.forEach((equipo, indice) => {
            const fila = document.createElement("tr");

            const valores = [
                equipo.position,
                equipo.Constructor.name,
                equipo.wins,
                equipo.points
            ];

            valores.forEach((valor, columna) => {
                const celda = document.createElement("td");
                celda.textContent = valor;

                if (columna === 0) {
                    celda.className = indice === 0 ? "pos pos-1" : "pos";
                }
                if (columna === 2 || columna === 3) {
                    celda.classList.add("num");
                }

                fila.append(celda);
            });

            filas.append(fila);
        });

        tabla.querySelector("tbody").replaceChildren(filas);

        // La API proporciona victorias, pero no el motor del equipo.
        tabla.querySelector("thead th:nth-child(3)").textContent =
            "Victorias";

        tabla.querySelector("caption").textContent =
            `Constructores ${datos.temporada} — ronda ${datos.ronda}`;

        descripcion.textContent =
            `Clasificación de constructores de la temporada ` +
            `${datos.temporada}, tras la ronda ${datos.ronda}.`;
    } catch (error) {
        console.error("Error al actualizar constructores:", error);
        descripcion.textContent =
            "No se pudo actualizar la clasificación de constructores; " +
            "se muestran los datos de referencia.";
    }
}

actualizarConstructores();
setInterval(actualizarConstructores, 15 * 60 * 1000);