const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PUERTO = Number(process.env.PORT) || 3000;
const URL_CALENDARIO =
    "https://api.jolpi.ca/ergast/f1/current/races/?limit=100";

let calendarioGuardado = null;
let pilotosGuardados = null;
let ultimaConsultaPilotos = 0;
let constructoresGuardados = null;
let ultimaConsultaConstructores = 0;
let ultimaConsulta = 0;
const DURACION_CACHE = 15 * 60 * 1000;

const tipos = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg"
};

const servidor = http.createServer(async (peticion, respuesta) => {
    const ruta = new URL(peticion.url, "http://localhost").pathname;

    if (ruta === "/api/calendario") {
        try {
            const cacheVigente =
                calendarioGuardado !== null &&
                Date.now() - ultimaConsulta < DURACION_CACHE;

            if (!cacheVigente) {
                const resultado = await fetch(URL_CALENDARIO, {
                    headers: {
                        "User-Agent": "PaddockF1-Academico/1.0",
                        "Accept": "application/json"
                    },
                    signal: AbortSignal.timeout(10000)
                });

                if (!resultado.ok) {
                    throw new Error(`La API respondió ${resultado.status}`);
                }

                const datos = await resultado.json();

                calendarioGuardado = {
                    temporada: datos.MRData.RaceTable.season,
                    consultadoEn: new Date().toISOString(),
                    carreras: datos.MRData.RaceTable.Races
                };
                ultimaConsulta = Date.now();
            }

            respuesta.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8"
            });
            respuesta.end(JSON.stringify(calendarioGuardado));
        } catch (error) {
            console.error(error);
            respuesta.writeHead(502, {
                "Content-Type": "application/json; charset=utf-8"
            });
            respuesta.end(JSON.stringify({ error: "No se pudo consultar el calendario" }));
        }
        return;
    }
    if (ruta === "/api/pilotos") {
        try {
            const cacheVigente =
                pilotosGuardados !== null &&
                Date.now() - ultimaConsultaPilotos < DURACION_CACHE;

            if (!cacheVigente) {
                const resultado = await fetch(
                    "https://api.jolpi.ca/ergast/f1/current/driverstandings/?limit=100",
                    {
                        headers: {
                            "User-Agent": "PaddockF1-Academico/1.0",
                            "Accept": "application/json"
                        },
                        signal: AbortSignal.timeout(10000)
                    }
                );

                if (!resultado.ok) {
                    throw new Error(`La API respondió ${resultado.status}`);
                }

                const datos = await resultado.json();
                const tabla = datos.MRData?.StandingsTable;
                const pilotos = tabla?.StandingsLists?.[0]?.DriverStandings;

                if (!Array.isArray(pilotos)) {
                    throw new Error("No hay clasificación de pilotos disponible");
                }

                pilotosGuardados = {
                    temporada: tabla.season,
                    ronda: tabla.round,
                    pilotos: pilotos
                };
                ultimaConsultaPilotos = Date.now();
            }

            respuesta.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8"
            });
            respuesta.end(JSON.stringify(pilotosGuardados));
        } catch (error) {
            console.error("Error al consultar pilotos:", error);
            respuesta.writeHead(502, {
                "Content-Type": "application/json; charset=utf-8"
            });
            respuesta.end(JSON.stringify({
                error: "No se pudo obtener la clasificación de pilotos"
            }));
        }
        return;
    }
    if (ruta === "/api/constructores") {
        try {
            const cacheVigente =
                constructoresGuardados !== null &&
                Date.now() - ultimaConsultaConstructores < DURACION_CACHE;

            if (!cacheVigente) {
                const resultado = await fetch(
                    "https://api.jolpi.ca/ergast/f1/current/constructorstandings/?limit=100",
                    {
                        headers: {
                            "User-Agent": "PaddockF1-Academico/1.0",
                            "Accept": "application/json"
                        },
                        signal: AbortSignal.timeout(10000)
                    }
                );

                if (!resultado.ok) {
                    throw new Error(`La API respondió ${resultado.status}`);
                }

                const datos = await resultado.json();
                const tabla = datos.MRData?.StandingsTable;
                const constructores =
                    tabla?.StandingsLists?.[0]?.ConstructorStandings;

                if (!Array.isArray(constructores)) {
                    throw new Error("No hay clasificación de constructores disponible");
                }

                constructoresGuardados = {
                    temporada: tabla.season,
                    ronda: tabla.round,
                    constructores: constructores
                };
                ultimaConsultaConstructores = Date.now();
            }

            respuesta.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8"
            });
            respuesta.end(JSON.stringify(constructoresGuardados));
        } catch (error) {
            console.error("Error al consultar constructores:", error);
            respuesta.writeHead(502, {
                "Content-Type": "application/json; charset=utf-8"
            });
            respuesta.end(JSON.stringify({
                error: "No se pudo obtener la clasificación de constructores"
            }));
        }
        return;
    }
    const archivo = path.resolve(
        __dirname,
        "." + (ruta === "/" ? "/html/index.html" : ruta)
    );

    if (!archivo.startsWith(__dirname + path.sep)) {
        respuesta.writeHead(403);
        respuesta.end();
        return;
    }

    fs.stat(archivo, (error, datos) => {
        if (error || !datos.isFile()) {
            respuesta.writeHead(404);
            respuesta.end("Archivo no encontrado");
            return;
        }

        respuesta.writeHead(200, {
            "Content-Type": tipos[path.extname(archivo)] || "application/octet-stream"
        });
        fs.createReadStream(archivo).pipe(respuesta);
    });
});
servidor.listen(PUERTO, "0.0.0.0", () => {
    console.log(`Servidor iniciado en el puerto ${PUERTO}`);
});