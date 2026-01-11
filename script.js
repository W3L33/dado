const escena = document.getElementById("escena");
const configuracion = document.getElementById("configuracion");
const checkboxes = document.querySelectorAll('input[name="dados"]');

/* caras opuestas siempre suman 7 */
let carasInternas = [1, 6, 3, 4, 2, 5];

/* rotaciones finales por cara */
const rotacionesCaras = [
    { x: 0,   y: 0   },   // frente
    { x: 0,   y: 180 },   // atrás
    { x: 0,   y: -90 },   // derecha
    { x: 0,   y: 90  },   // izquierda
    { x: -90, y: 0   },   // arriba
    { x: 90,  y: 0   }    // abajo
];

/* ================== RADIO ================== */
checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
        checkboxes.forEach(c => c !== cb && (c.checked = false));
        crearDados();
    });
});

function getCantidadDados() {
    const sel = document.querySelector('input[name="dados"]:checked');
    return sel ? Number(sel.value) : 1;
}

/* ================== CONFIGURACIÓN ================== */
function crearConfiguracion() {
    const cantidad = getCantidadDados();
    configuracion.innerHTML = "";

    if (cantidad > 1) {
        let html = `
            <h3 style="color:#eed09d">Personaliza un dado</h3>
            <table>
        `;

        for (let r = 0; r < 2; r++) {
            html += "<tr>";
            for (let c = 0; c < 3; c++) {
                const idx = r * 3 + c;
                html += `<td><input placeholder="Cara ${idx + 1}" id="cara${idx}"></td>`;
            }
            html += "</tr>";
        }

        html += `
            </table>
            <button id="toggleInputs" class="btn">Ocultar</button>
        `;

        configuracion.innerHTML = html;

        /* inputs */
        configuracion.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", () => {
                actualizarCarasInternas();
                dibujarDadoEditable();
            });
        });

        /* mostrar / ocultar */
        const toggleBtn = document.getElementById("toggleInputs");
        toggleBtn.addEventListener("click", () => {
            const table = configuracion.querySelector("table");
            if (table.style.display === "none") {
                table.style.display = "table";
                toggleBtn.textContent = "Ocultar";
            } else {
                table.style.display = "none";
                toggleBtn.textContent = "Mostrar";
            }
        });

        /* lanzar ambos */
        const lanzarBtn = document.createElement("button");
        lanzarBtn.textContent = "Lanzar ambos";
        lanzarBtn.className = "btn";
        lanzarBtn.addEventListener("click", lanzarTodosDados);
        configuracion.appendChild(lanzarBtn);
    }
}

/* ================== CARAS INTERNAS ================== */
function actualizarCarasInternas() {
    const inputs = configuracion.querySelectorAll("input");
    inputs.forEach((input, i) => {
        const val = Number(input.value.trim());
        if (!isNaN(val) && val >= 1 && val <= 6) {
            carasInternas[i] = val;
            carasInternas[5 - i] = 7 - val;
        }
    });
}

/* ================== DIBUJADO ================== */
function dibujarDadoEditable() {
    const dado = document.querySelector('.dado[data-index="0"]');
    if (!dado) return;

    const caras = dado.querySelectorAll(".cara");
    caras.forEach((cara, i) => {
        colocarPuntos(cara, carasInternas[i]);
        cara.classList.remove("ganadora");
    });
}

function dibujarDadoNormal(dado) {
    const valores = [1, 6, 3, 4, 2, 5];
    dado.querySelectorAll(".cara").forEach((cara, i) => {
        colocarPuntos(cara, valores[i]);
        cara.classList.remove("ganadora");
    });
}

/* ================== PUNTOS ================== */
function colocarPuntos(cara, valor) {
    cara.innerHTML = "";
    const layout = {
        1: [[1,1]],
        2: [[0,0],[2,2]],
        3: [[0,0],[1,1],[2,2]],
        4: [[0,0],[0,2],[2,0],[2,2]],
        5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
        6: [[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]]
    };

    layout[valor].forEach(([r, c]) => {
        const p = document.createElement("div");
        p.className = "punto";
        p.style.gridRowStart = r + 1;
        p.style.gridColumnStart = c + 1;
        cara.appendChild(p);
    });
}

/* ================== CREAR DADOS ================== */
function crearDados() {
    escena.innerHTML = "";
    crearConfiguracion();

    const cantidad = getCantidadDados();

    for (let i = 0; i < cantidad; i++) {
        const dado = document.createElement("div");
        dado.className = "dado";
        dado.dataset.index = i;

        dado.innerHTML = `
            <div class="cara frente"></div>
            <div class="cara atras"></div>
            <div class="cara derecha"></div>
            <div class="cara izquierda"></div>
            <div class="cara arriba"></div>
            <div class="cara abajo"></div>
        `;

        escena.appendChild(dado);

        if (i === 0 && cantidad > 1) {
            dibujarDadoEditable();
        } else {
            dibujarDadoNormal(dado);
        }

        dado.addEventListener("click", () => lanzarDado(dado));
    }
}

/* ================== LANZAR ================== */
function lanzarDado(dado) {
    const caraFinal = Math.floor(Math.random() * 6);
    const { x, y } = rotacionesCaras[caraFinal];

    /* giro rápido */
    dado.style.transition = "none";
    dado.style.transform = "rotateX(720deg) rotateY(720deg)";
    dado.offsetHeight;

    /* asentamiento realista */
    dado.style.transition = "transform 0.9s cubic-bezier(.17,.89,.32,1.49)";
    dado.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;

    dado.addEventListener("transitionend", function fin() {
        const mapa = ["frente","atras","derecha","izquierda","arriba","abajo"];
        dado.querySelectorAll(".cara").forEach(c => c.classList.remove("ganadora"));
        dado.querySelector(`.${mapa[caraFinal]}`)?.classList.add("ganadora");
        dado.removeEventListener("transitionend", fin);
    });
}

function lanzarTodosDados() {
    document.querySelectorAll(".dado").forEach((dado, i) => {
        setTimeout(() => lanzarDado(dado), i * 120);
    });
}

/* ================== INIT ================== */
crearDados();
