// ======================================================
// ESTUDIO HACKER - SCRIPT PRINCIPAL
// ======================================================

const sidebar = document.querySelector(".sidebar");
const addTabBtn = document.querySelector(".add-tab");
const content = document.querySelector(".content");


// ======================================================
// UTILIDADES
// ======================================================

function obtenerDatosPestana(tabId) {
  return {
    titulo: localStorage.getItem(tabId + "_titulo") || "",
    fecha: localStorage.getItem(tabId + "_fecha") || "",
    prioridad: localStorage.getItem(tabId + "_prioridad") || "",
    contenido: localStorage.getItem(tabId + "_contenido") || ""
  };
}

function guardarDatosPestana(tabId, datos) {
  localStorage.setItem(tabId + "_titulo", datos.titulo);
  localStorage.setItem(tabId + "_fecha", datos.fecha);
  localStorage.setItem(tabId + "_prioridad", datos.prioridad);
  localStorage.setItem(tabId + "_contenido", datos.contenido);
}


// ======================================================
// PESTAÑAS
// ======================================================

function activateTab(tab) {
  if (!tab) return;

  document.querySelectorAll(".tab").forEach(t => {
    t.classList.remove("active");
  });

  document.querySelectorAll(".tab-content").forEach(c => {
    c.classList.remove("active");
  });

  tab.classList.add("active");

  const target = document.getElementById(tab.dataset.tab);

  if (target) {
    target.classList.add("active");
  }
}


// ======================================================
// ORDENAR PESTAÑAS POR PRIORIDAD
// ======================================================

function ordenarPestañas() {
  const tabs = Array.from(sidebar.querySelectorAll(".tab"))
    .filter(tab =>
      !["inicio", "terminal", "config", "ayuda", "notas", "calendario"]
        .includes(tab.dataset.tab)
    );

  tabs.sort((a, b) => {
    const prioridadA =
      parseInt(localStorage.getItem(a.dataset.tab + "_prioridad")) || 0;

    const prioridadB =
      parseInt(localStorage.getItem(b.dataset.tab + "_prioridad")) || 0;

    return prioridadB - prioridadA;
  });

  tabs.forEach(tab => {
    sidebar.insertBefore(tab, addTabBtn);
  });
}


// ======================================================
// RESUMEN DE PESTAÑA
// ======================================================

function actualizarResumen(tabId, nombre) {
  const tabElement =
    document.querySelector(`.tab[data-tab="${tabId}"]`);

  if (!tabElement) return;

  const prioridad =
    parseInt(localStorage.getItem(tabId + "_prioridad")) || 0;

  const fecha =
    localStorage.getItem(tabId + "_fecha") || "sin fecha";

  let simbolo = "#";
  let color = "#00ff00";

  if (prioridad >= 4) {
    simbolo = "!";
    color = "red";
  } else if (prioridad === 3) {
    simbolo = "~";
    color = "orange";
  } else if (prioridad > 0) {
    simbolo = "-";
    color = "green";
  }

  tabElement.textContent =
    `${simbolo} ${nombre} – ${fecha} – prioridad ${prioridad || "-"}`;

  tabElement.style.color = color;

  ordenarPestañas();
}


// ======================================================
// CREAR FORMULARIO DE UNA PESTAÑA
// ======================================================

function crearFormulario(tabId, nombre) {
  const newContent = document.createElement("div");

  newContent.id = tabId;
  newContent.classList.add("tab-content");

  const datos = obtenerDatosPestana(tabId);


  // ------------------------------
  // TÍTULO
  // ------------------------------

  const tituloLabel = document.createElement("label");
  tituloLabel.textContent = "Título del tema:";

  const tituloInput = document.createElement("input");

  tituloInput.type = "text";
  tituloInput.placeholder = "Título del tema";
  tituloInput.style.width = "100%";
  tituloInput.value = datos.titulo;


  // ------------------------------
  // FECHA
  // ------------------------------

  const fechaLabel = document.createElement("label");
  fechaLabel.textContent = "Fecha:";

  const fechaInput = document.createElement("input");

  fechaInput.type = "date";
  fechaInput.value = datos.fecha;


  // ------------------------------
  // PRIORIDAD
  // ------------------------------

  const prioridadLabel = document.createElement("label");
  prioridadLabel.textContent = "Prioridad (1-5):";

  const prioridadInput = document.createElement("input");

  prioridadInput.type = "number";
  prioridadInput.min = "1";
  prioridadInput.max = "5";
  prioridadInput.placeholder = "Prioridad (1-5)";
  prioridadInput.value = datos.prioridad;


  // ------------------------------
  // APUNTES
  // ------------------------------

  const contenidoLabel = document.createElement("label");
  contenidoLabel.textContent = "Apuntes:";

  const textarea = document.createElement("textarea");

  textarea.style.width = "100%";
  textarea.style.height = "300px";
  textarea.value = datos.contenido;


  // ------------------------------
  // GUARDAR
  // ------------------------------

  function guardar() {
    guardarDatosPestana(tabId, {
      titulo: tituloInput.value,
      fecha: fechaInput.value,
      prioridad: prioridadInput.value,
      contenido: textarea.value
    });

    actualizarResumen(tabId, nombre);
  }

  [tituloInput, fechaInput, prioridadInput, textarea]
    .forEach(input => {
      input.addEventListener("input", guardar);
    });


  // ------------------------------
  // BOTÓN RENOMBRAR
  // ------------------------------

  const renameBtn = document.createElement("button");

  renameBtn.textContent = "Renombrar pestaña";

  renameBtn.addEventListener("click", () => {

    const nuevoNombre =
      prompt("Nuevo nombre para la pestaña:", nombre);

    if (!nuevoNombre) return;

    const tabElement =
      document.querySelector(`.tab[data-tab="${tabId}"]`);

    if (tabElement) {
      tabElement.dataset.nombre = nuevoNombre;
    }

    newContent.querySelector("h1").textContent =
      nuevoNombre;

    actualizarResumen(tabId, nuevoNombre);

    localStorage.setItem(
      tabId + "_nombre",
      nuevoNombre
    );
  });


  // ------------------------------
  // EXPORTAR TXT
  // ------------------------------

  const exportBtn = document.createElement("button");

  exportBtn.textContent = "Exportar TXT";

  exportBtn.addEventListener("click", () => {

    const contenido =
      `Título: ${tituloInput.value}\n` +
      `Fecha: ${fechaInput.value}\n` +
      `Prioridad: ${prioridadInput.value}\n\n` +
      `${textarea.value}`;

    descargarArchivo(
      `${nombre}.txt`,
      contenido,
      "text/plain"
    );
  });


  // ------------------------------
  // EXPORTAR MARKDOWN
  // ------------------------------

  const exportMdBtn = document.createElement("button");

  exportMdBtn.textContent = "Exportar Markdown";

  exportMdBtn.addEventListener("click", () => {

    const markdown =
      `# ${nombre}\n\n` +
      `**Título:** ${tituloInput.value || "Sin título"}\n\n` +
      `**Fecha:** ${fechaInput.value || "Sin fecha"}\n\n` +
      `**Prioridad:** ${prioridadInput.value || "-"}\n\n` +
      `## Apuntes\n\n` +
      `${textarea.value}`;

    descargarArchivo(
      `${nombre}.md`,
      markdown,
      "text/markdown"
    );
  });


  // ------------------------------
  // BOTÓN ELIMINAR
  // ------------------------------

  const deleteBtn = document.createElement("button");

  deleteBtn.textContent = "Eliminar pestaña";

  deleteBtn.addEventListener("click", () => {

    const confirmar =
      confirm(`¿Eliminar la pestaña "${nombre}"?`);

    if (!confirmar) return;

    newContent.remove();

    const tabElement =
      document.querySelector(`.tab[data-tab="${tabId}"]`);

    if (tabElement) {
      tabElement.remove();
    }

    localStorage.removeItem(tabId + "_titulo");
    localStorage.removeItem(tabId + "_fecha");
    localStorage.removeItem(tabId + "_prioridad");
    localStorage.removeItem(tabId + "_contenido");
    localStorage.removeItem(tabId + "_nombre");

    const inicio =
      document.querySelector('.tab[data-tab="inicio"]');

    if (inicio) {
      activateTab(inicio);
    }
  });


  // ------------------------------
  // CONSTRUIR CONTENIDO
  // ------------------------------

  newContent.innerHTML =
    `<h1>${nombre}</h1>`;

  newContent.appendChild(tituloLabel);
  newContent.appendChild(tituloInput);

  newContent.appendChild(document.createElement("br"));

  newContent.appendChild(fechaLabel);
  newContent.appendChild(fechaInput);

  newContent.appendChild(document.createElement("br"));

  newContent.appendChild(prioridadLabel);
  newContent.appendChild(prioridadInput);

  newContent.appendChild(document.createElement("br"));

  newContent.appendChild(contenidoLabel);
  newContent.appendChild(textarea);

  newContent.appendChild(document.createElement("br"));

  newContent.appendChild(renameBtn);
  newContent.appendChild(exportBtn);
  newContent.appendChild(exportMdBtn);
  newContent.appendChild(deleteBtn);

  content.appendChild(newContent);

  actualizarResumen(tabId, nombre);

  return newContent;
}


// ======================================================
// CREAR NUEVA PESTAÑA
// ======================================================

function crearNuevaPestaña(nombre) {

  const newTabId =
    `tab_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const newTab =
    document.createElement("div");

  newTab.classList.add("tab");

  newTab.dataset.tab =
    newTabId;

  newTab.dataset.nombre =
    nombre;

  newTab.textContent =
    nombre;

  sidebar.insertBefore(
    newTab,
    addTabBtn
  );

  crearFormulario(
    newTabId,
    nombre
  );

  newTab.addEventListener(
    "click",
    () => activateTab(newTab)
  );

  localStorage.setItem(
    newTabId + "_nombre",
    nombre
  );

  actualizarResumen(
    newTabId,
    nombre
  );

  activateTab(newTab);
}


// ======================================================
// BOTÓN + NUEVA PESTAÑA
// ======================================================

addTabBtn.addEventListener("click", () => {

  const nombre =
    prompt("Nombre de la nueva pestaña:");

  if (!nombre || !nombre.trim()) return;

  crearNuevaPestaña(
    nombre.trim()
  );
});


// ======================================================
// ACTIVAR PESTAÑAS EXISTENTES
// ======================================================

document.querySelectorAll(".tab").forEach(tab => {

  tab.addEventListener(
    "click",
    () => activateTab(tab)
  );
});


// ======================================================
// RECUPERAR PESTAÑAS GUARDADAS
// ======================================================

function cargarPestañas() {

  const claves = [];

  for (let i = 0; i < localStorage.length; i++) {

    const key =
      localStorage.key(i);

    if (
      key &&
      key.startsWith("tab_") &&
      !key.endsWith("_titulo") &&
      !key.endsWith("_fecha") &&
      !key.endsWith("_prioridad") &&
      !key.endsWith("_contenido") &&
      !key.endsWith("_nombre")
    ) {
      claves.push(key);
    }
  }

  claves.forEach(tabId => {

    const nombre =
      localStorage.getItem(
        tabId + "_nombre"
      ) || "Pestaña";

    const newTab =
      document.createElement("div");

    newTab.classList.add("tab");

    newTab.dataset.tab =
      tabId;

    newTab.dataset.nombre =
      nombre;

    newTab.textContent =
      nombre;

    sidebar.insertBefore(
      newTab,
      addTabBtn
    );

    crearFormulario(
      tabId,
      nombre
    );

    newTab.addEventListener(
      "click",
      () => activateTab(newTab)
    );

    actualizarResumen(
      tabId,
      nombre
    );
  });

  ordenarPestañas();
}


// ======================================================
// DESCARGAR ARCHIVOS
// ======================================================

function descargarArchivo(
  nombre,
  contenido,
  tipo
) {

  const blob =
    new Blob(
      [contenido],
      { type: tipo }
    );

  const enlace =
    document.createElement("a");

  const url =
    URL.createObjectURL(blob);

  enlace.href = url;
  enlace.download = nombre;

  document.body.appendChild(enlace);

  enlace.click();

  enlace.remove();

  URL.revokeObjectURL(url);
}


// ======================================================
// NOTAS RÁPIDAS
// ======================================================

const notasRapidas =
  document.getElementById("notasRapidas");

if (notasRapidas) {

  notasRapidas.value =
    localStorage.getItem("notasRapidas") || "";

  notasRapidas.addEventListener(
    "input",
    () => {
      localStorage.setItem(
        "notasRapidas",
        notasRapidas.value
      );
    }
  );
}


// ======================================================
// TERMINAL
// ======================================================

const terminalOutput =
  document.getElementById("terminalOutput");

const terminalInput =
  document.getElementById("terminalInput");


function escribirTerminal(texto) {

  terminalOutput.textContent +=
    `\n${texto}`;

  terminalOutput.scrollTop =
    terminalOutput.scrollHeight;
}


function ejecutarComando(comando) {

  if (!comando) return;


  // HELP
  if (comando === "help") {

    escribirTerminal(
      `Comandos disponibles:
- help
- ls
- clear
- ping servidor
- new [nombre]
- ordenar
- exportar txt
- exportar md`
    );

    return;
  }


  // LS
  if (comando === "ls") {

    const tabs =
      Array.from(
        document.querySelectorAll(".tab")
      )
      .map(tab => tab.textContent)
      .join(", ");

    escribirTerminal(tabs);

    return;
  }


  // PING
  if (comando === "ping servidor") {

    escribirTerminal(
      "Respuesta: conexión establecida"
    );

    return;
  }


  // CLEAR
  if (comando === "clear") {

    terminalOutput.textContent = "";

    return;
  }


  // NEW
  if (comando.startsWith("new ")) {

    const nombre =
      comando.substring(4).trim();

    if (!nombre) {

      escribirTerminal(
        "Error: debes escribir un nombre."
      );

      return;
    }

    crearNuevaPestaña(nombre);

    escribirTerminal(
      `Pestaña creada: ${nombre}`
    );

    return;
  }


  // ORDENAR
  if (comando === "ordenar") {

    ordenarPestañas();

    escribirTerminal(
      "Pestañas ordenadas por prioridad."
    );

    return;
  }


  // EXPORTAR TXT
  if (comando === "exportar txt") {

    exportarTodasLasPestañas("txt");

    escribirTerminal(
      "Apuntes exportados en TXT."
    );

    return;
  }


  // EXPORTAR MARKDOWN
  if (comando === "exportar md") {

    exportarTodasLasPestañas("md");

    escribirTerminal(
      "Apuntes exportados en Markdown."
    );

    return;
  }


  escribirTerminal(
    `Comando no reconocido: ${comando}`
  );
}


if (terminalInput) {

  terminalInput.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        const comando =
          terminalInput.value.trim();

        terminalInput.value = "";

        ejecutarComando(comando);
      }
    }
  );
}


// ======================================================
// EXPORTAR TODAS LAS PESTAÑAS
// ======================================================

function obtenerPestañasGuardadas() {

  const pestañas = [];

  const ids = [];

  for (let i = 0; i < localStorage.length; i++) {

    const key =
      localStorage.key(i);

    if (
      key &&
      key.startsWith("tab_") &&
      !key.includes("_titulo") &&
      !key.includes("_fecha") &&
      !key.includes("_prioridad") &&
      !key.includes("_contenido") &&
      !key.includes("_nombre")
    ) {
      ids.push(key);
    }
  }

  ids.forEach(tabId => {

    const nombre =
      localStorage.getItem(
        tabId + "_nombre"
      ) || "Pestaña";

    const datos =
      obtenerDatosPestana(tabId);

    pestañas.push({
      nombre,
      ...datos
    });
  });

  return pestañas;
}


function exportarTodasLasPestañas(
  formato = "txt"
) {

  const pestañas =
    obtenerPestañasGuardadas();

  let contenido = "";


  if (formato === "md") {

    contenido =
      "# Mis Apuntes Completos\n\n";

    pestañas.forEach(pestana => {

      contenido +=
        `## ${pestana.nombre}\n\n`;

      contenido +=
        `**Título:** ${
          pestana.titulo || "Sin título"
        }\n\n`;

      contenido +=
        `**Fecha:** ${
          pestana.fecha || "Sin fecha"
        }\n\n`;

      contenido +=
        `**Prioridad:** ${
          pestana.prioridad || "-"
        }\n\n`;

      contenido +=
        `${pestana.contenido}\n\n`;

      contenido +=
        "---\n\n";
    });

    descargarArchivo(
      "Mis_Apuntes_Completos.md",
      contenido,
      "text/markdown"
    );

  } else {

    contenido =
      "=== MIS APUNTES COMPLETOS ===\n\n";

    pestañas.forEach(pestana => {

      contenido +=
        `Materia: ${pestana.nombre}\n`;

      contenido +=
        `Título: ${
          pestana.titulo || "Sin título"
        }\n`;

      contenido +=
        `Fecha: ${
          pestana.fecha || "Sin fecha"
        }\n`;

      contenido +=
        `Prioridad: ${
          pestana.prioridad || "-"
        }\n\n`;

      contenido +=
        `Apuntes:\n${
          pestana.contenido
        }\n\n`;

      contenido +=
        "-----------------------------\n\n";
    });

    descargarArchivo(
      "Mis_Apuntes_Completos.txt",
      contenido,
      "text/plain"
    );
  }
}


// ======================================================
// CONFIGURACIÓN - EXPORTAR TODAS
// ======================================================

const exportarTodoBtn =
  document.getElementById("exportarTodo");

if (exportarTodoBtn) {

  exportarTodoBtn.addEventListener(
    "click",
    () => exportarTodasLasPestañas("txt")
  );
}


// ======================================================
// IMPORTAR TXT
// ======================================================

const importarArchivoInput =
  document.getElementById("importarArchivo");


if (importarArchivoInput) {

  importarArchivoInput.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if (!file) return;


      const reader =
        new FileReader();


      reader.onload = e => {

        const contenido =
          e.target.result;

        const nombre =
          prompt(
            "Nombre para la pestaña importada:",
            file.name.replace(".txt", "")
          );

        if (!nombre) return;


        const newTabId =
          `tab_${Date.now()}_${Math.floor(Math.random() * 1000)}`;


        localStorage.setItem(
          newTabId + "_nombre",
          nombre
        );

        localStorage.setItem(
          newTabId + "_titulo",
          ""
        );

        localStorage.setItem(
          newTabId + "_fecha",
          ""
        );

        localStorage.setItem(
          newTabId + "_prioridad",
          ""
        );

        localStorage.setItem(
          newTabId + "_contenido",
          contenido
        );


        const newTab =
          document.createElement("div");

        newTab.classList.add("tab");

        newTab.dataset.tab =
          newTabId;

        newTab.dataset.nombre =
          nombre;

        newTab.textContent =
          nombre;

        sidebar.insertBefore(
          newTab,
          addTabBtn
        );


        crearFormulario(
          newTabId,
          nombre
        );


        newTab.addEventListener(
          "click",
          () => activateTab(newTab)
        );


        actualizarResumen(
          newTabId,
          nombre
        );

        activateTab(newTab);
      };


      reader.readAsText(file);

      // Permitir importar el mismo archivo otra vez
      importarArchivoInput.value = "";
    }
  );
}


// ======================================================
// CALENDARIO
// ======================================================

const fechaEvento =
  document.getElementById("fechaEvento");

const nombreEvento =
  document.getElementById("nombreEvento");

const agregarEvento =
  document.getElementById("agregarEvento");

const listaEventos =
  document.getElementById("listaEventos");


function mostrarEventos() {

  if (!listaEventos) return;

  const eventos =
    JSON.parse(
      localStorage.getItem("eventos")
    ) || [];

  listaEventos.innerHTML = "";

  eventos.sort(
    (a, b) =>
      new Date(a.fecha) -
      new Date(b.fecha)
  );


  eventos.forEach(
    (evento, index) => {

      const item =
        document.createElement("li");

      item.style.marginBottom =
        "10px";


      const texto =
        document.createElement("span");

      texto.textContent =
        `${evento.fecha} – ${evento.nombre}`;


      const eliminar =
        document.createElement("button");

      eliminar.textContent =
        "Eliminar";

      eliminar.style.marginLeft =
        "10px";


      eliminar.addEventListener(
        "click",
        () => {

          const eventosActuales =
            JSON.parse(
              localStorage.getItem("eventos")
            ) || [];

          eventosActuales.splice(
            index,
            1
          );

          localStorage.setItem(
            "eventos",
            JSON.stringify(
              eventosActuales
            )
          );

          mostrarEventos();
        }
      );


      const hoy =
        new Date();

      const fecha =
        new Date(
          evento.fecha + "T00:00:00"
        );

      const diferencia =
        (
          fecha - hoy
        ) /
        (1000 * 60 * 60 * 24);


      if (
        diferencia >= 0 &&
        diferencia <= 3
      ) {

        texto.style.color =
          "red";

      } else {

        texto.style.color =
          "#00ff00";
      }


      item.appendChild(texto);
      item.appendChild(eliminar);

      listaEventos.appendChild(item);
    }
  );
}


if (agregarEvento) {

  agregarEvento.addEventListener(
    "click",
    () => {

      if (
        !fechaEvento.value ||
        !nombreEvento.value.trim()
      ) {
        alert(
          "Introduce una fecha y un nombre para el evento."
        );

        return;
      }


      const eventos =
        JSON.parse(
          localStorage.getItem("eventos")
        ) || [];


      eventos.push({
        fecha:
          fechaEvento.value,

        nombre:
          nombreEvento.value.trim()
      });


      localStorage.setItem(
        "eventos",
        JSON.stringify(eventos)
      );


      nombreEvento.value = "";
      fechaEvento.value = "";

      mostrarEventos();
    }
  );
}


// ======================================================
// EXPORTAR CALENDARIO
// ======================================================

function exportarEventos(formato = "txt") {

  const eventos =
    JSON.parse(
      localStorage.getItem("eventos")
    ) || [];

  let contenido = "";


  if (formato === "md") {

    contenido =
      "# Calendario de eventos\n\n";

    eventos.forEach(evento => {

      contenido +=
        `- **${evento.fecha}**: ${evento.nombre}\n`;
    });

  } else {

    contenido =
      "Calendario de eventos\n\n";

    eventos.forEach(evento => {

      contenido +=
        `${evento.fecha} – ${evento.nombre}\n`;
    });
  }


  descargarArchivo(
    formato === "md"
      ? "Calendario.md"
      : "Calendario.txt",

    contenido,

    formato === "md"
      ? "text/markdown"
      : "text/plain"
  );
}


// ======================================================
// BUSCADOR DE AYUDA
// ======================================================

const buscadorAyuda =
  document.getElementById(
    "buscadorAyuda"
  );

const listaAyuda =
  document.getElementById(
    "listaAyuda"
  );


if (
  buscadorAyuda &&
  listaAyuda
) {

  const elementos =
    listaAyuda.querySelectorAll("li");


  buscadorAyuda.addEventListener(
    "input",
    () => {

      const query =
        buscadorAyuda.value
          .toLowerCase()
          .trim();


      elementos.forEach(item => {

        const keywords =
          (
            item.dataset.keywords ||
            ""
          ).toLowerCase();

        const texto =
          item.textContent.toLowerCase();


        if (
          keywords.includes(query) ||
          texto.includes(query)
        ) {

          item.style.display =
            "list-item";

        } else {

          item.style.display =
            "none";
        }
      });
    }
  );
}


// ======================================================
// INICIALIZACIÓN
// ======================================================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    cargarPestañas();

    mostrarEventos();

    const inicio =
      document.querySelector(
        '.tab[data-tab="inicio"]'
      );

    if (inicio) {
      activateTab(inicio);
    }
  }
);
