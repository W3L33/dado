const escena = document.getElementById("escena");
const configuracion = document.getElementById("configuracion");
const checkboxes = document.querySelectorAll('input[name="dados"]');

let carasInternas = [1, 6, 3, 4, 2, 5];

checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
        checkboxes.forEach(c => { if (c !== cb) c.checked = false; });
        crearDados();
    });
});

function getCantidadDados() {
    const sel = document.querySelector('input[name="dados"]:checked');
    return sel ? Number(sel.value) : 1;
}

/* ================= CONFIGURACIÓN ================= */

function crearConfiguracion() {
    const cantidad = getCantidadDados();
    configuracion.innerHTML = "";

    if (cantidad > 1) {
        let html = `<h3 style="color:#eed09d">Personaliza un dado</h3><table>`;
        for (let r = 0; r < 2; r++) {
            html += "<tr>";
            for (let c = 0; c < 3; c++) {
                const idx = r * 3 + c;
                html += `<td><input placeholder="Cara ${idx + 1}" id="cara${idx}"></td>`;
            }
            html += "</tr>";
        }
        html += `</table><button id="toggleInputs" class="btn">Ocultar</button>`;
        configuracion.innerHTML = html;

        configuracion.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", () => {
                actualizarCarasInternas();
                dibujarDadoEditable();
            });
        });

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

        const lanzarBtn = document.createElement("button");
        lanzarBtn.textContent = "Lanzar ambos";
        lanzarBtn.id = "lanzarBtn";
        lanzarBtn.addEventListener("click", lanzarTodosDados);
        configuracion.appendChild(lanzarBtn);
    }
}

/* ================= CARAS INTERNAS ================= */

function actualizarCarasInternas() {
    const inputs = configuracion.querySelectorAll("input");
    if (!inputs.length) return;

    inputs.forEach((input, i) => {
        const val = input.value.trim();
        const num = Number(val);

        if (!isNaN(num) && num >= 1 && num <= 6) {
            switch (i) {
                case 0: carasInternas[0] = num; carasInternas[1] = 7 - num; break;
                case 1: carasInternas[1] = num; carasInternas[0] = 7 - num; break;
                case 2: carasInternas[2] = num; carasInternas[3] = 7 - num; break;
                case 3: carasInternas[3] = num; carasInternas[2] = 7 - num; break;
                case 4: carasInternas[4] = num; carasInternas[5] = 7 - num; break;
                case 5: carasInternas[5] = num; carasInternas[4] = 7 - num; break;
            }
        } else if (val) {
            carasInternas[i] = val;
        }
    });
}

/* ================= CREAR DADOS ================= */

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

/* ================= DIBUJO ================= */

function dibujarDadoEditable() {
    const dado = document.querySelector('.dado[data-index="0"]');
    if (!dado) return;

    const caras = dado.querySelectorAll(".cara");

    caras.forEach((cara, i) => {
        cara.innerHTML = "";
        const valor = carasInternas[i];

        if (typeof valor === "number") {
            colocarPuntos(cara, valor);
        } else if (valor) {
            const span = document.createElement("span");
            span.textContent = valor;
            cara.appendChild(span);
        }

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

/* ================= PUNTOS ================= */

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

    if (layout[valor]) {
        layout[valor].forEach(([r, c]) => {
            const p = document.createElement("div");
            p.className = "punto";
            p.style.gridRowStart = r + 1;
            p.style.gridColumnStart = c + 1;
            cara.appendChild(p);
        });
    }
}

/* ================= GIRO ================= */

const rotacionesCaras = [
    {x:0, y:0},     
    {x:0, y:180},   
    {x:0, y:-90},   
    {x:0, y:90},    
    {x:-90, y:0},   
    {x:90, y:0}    
];

function lanzarDado(dado) {
    const caraFinal = Math.floor(Math.random() * 6);

    dado.style.transition = "none";
    dado.style.transform = "rotateX(0deg) rotateY(0deg)";
    dado.offsetHeight;

    const vueltas = 3;

    // 🔒 NORMALIZACIÓN CLAVE (bug corregido)
    const finalX = (vueltas * 360 + rotacionesCaras[caraFinal].x) % 360;
    const finalY = (vueltas * 360 + rotacionesCaras[caraFinal].y) % 360;

    dado.style.transition = "transform 0.9s cubic-bezier(.17,.89,.32,1.49)";
    dado.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

    dado.addEventListener("transitionend", function glow() {
        const mapa = ["frente","atras","derecha","izquierda","arriba","abajo"];
        const cara = dado.querySelector(`.${mapa[caraFinal]}`);
        if (cara) cara.classList.add("ganadora");
        dado.removeEventListener("transitionend", glow);
    });
}

/* ================= LANZAR ================= */

function lanzarTodosDados() {
    document.querySelectorAll(".dado").forEach(dado => lanzarDado(dado));
}

crearDados();
