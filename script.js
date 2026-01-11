const escena = document.getElementById("escena");
const configuracion = document.getElementById("configuracion");
const checkboxes = document.querySelectorAll('input[name="dados"]');

let carasInternas = [1, 6, 3, 4, 2, 5];
let inputsVisibles = true;

/* =======================
   RADIO BUTTONS
======================= */
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

/* =======================
   CONFIGURACIÓN
======================= */
function crearConfiguracion() {
    const cantidad = getCantidadDados();
    configuracion.innerHTML = "";
    inputsVisibles = true;

    if (cantidad > 1) {
        let html = `<h3 style="color:#eed09d">Personaliza un dado</h3><table>`;
        for (let r = 0; r < 2; r++) {
            html += "<tr>";
            for (let c = 0; c < 3; c++) {
                const idx = r * 3 + c;
                html += `<td><input placeholder="Cara ${idx + 1}" data-index="${idx}"></td>`;
            }
            html += "</tr>";
        }
        html += `</table>
                 <button id="toggleInputs" class="btn">Ocultar</button>
                 <button id="lanzarBtn" class="btn">Lanzar ambos</button>`;

        configuracion.innerHTML = html;

        configuracion.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", () => {
                actualizarCarasInternas();
                redibujarDadoEditable();
            });
        });

        document.getElementById("toggleInputs").addEventListener("click", toggleInputs);
        document.getElementById("lanzarBtn").addEventListener("click", lanzarTodosDados);
    }
}

function toggleInputs() {
    const table = configuracion.querySelector("table");
    const btn = document.getElementById("toggleInputs");

    inputsVisibles = !inputsVisibles;

    table.style.display = inputsVisibles ? "table" : "none";
    btn.textContent = inputsVisibles ? "Ocultar" : "Mostrar";
}

/* =======================
   DADOS
======================= */
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
            redibujarDadoEditable();
        } else {
            dibujarDadoNormal(dado);
        }

        dado.addEventListener("click", () => lanzarDado(dado));
    }
}

/* =======================
   DIBUJADO
======================= */
function actualizarCarasInternas() {
    const inputs = configuracion.querySelectorAll("input");

    inputs.forEach((input, i) => {
        const val = input.value.trim();
        const num = Number(val);

        if (!isNaN(num) && num >= 1 && num <= 6) {
            const pares = [[0,1],[2,3],[4,5]];
            for (const [a,b] of pares) {
                if (i === a) { carasInternas[a] = num; carasInternas[b] = 7 - num; }
                if (i === b) { carasInternas[b] = num; carasInternas[a] = 7 - num; }
            }
        } else if (val) {
            carasInternas[i] = val;
        }
    });
}

function redibujarDadoEditable() {
    const dado = document.querySelector('.dado[data-index="0"]');
    if (!dado) return;

    dado.classList.remove("resultado");

    const caras = dado.querySelectorAll(".cara");
    caras.forEach((cara, i) => {
        cara.innerHTML = "";
        cara.classList.remove("ganadora");

        const valor = carasInternas[i];
        if (typeof valor === "number") {
            colocarPuntos(cara, valor);
        } else {
            const span = document.createElement("span");
            span.textContent = valor;
            cara.appendChild(span);
        }
    });
}

function dibujarDadoNormal(dado) {
    const valores = [1,6,3,4,2,5];
    dado.querySelectorAll(".cara").forEach((cara, i) => {
        colocarPuntos(cara, valores[i]);
        cara.classList.remove("ganadora");
    });
}

/* =======================
   GIRO
======================= */
const rotacionesCaras = [
    {x:0,y:0},{x:0,y:180},{x:0,y:-90},
    {x:0,y:90},{x:-90,y:0},{x:90,y:0}
];

function lanzarDado(dado) {
    const index = Number(dado.dataset.index);
    const caraFinal = Math.floor(Math.random() * 6);

    dado.classList.remove("resultado");
    dado.style.transition = "none";
    dado.style.transform = "rotateX(0deg) rotateY(0deg)";
    dado.offsetHeight;

    const vueltas = 4;
    const fx = vueltas * 360 + rotacionesCaras[caraFinal].x;
    const fy = vueltas * 360 + rotacionesCaras[caraFinal].y;

    dado.style.transition = "transform 1.1s cubic-bezier(.25,.8,.25,1)";
    dado.style.transform = `rotateX(${fx}deg) rotateY(${fy}deg)`;

    dado.addEventListener("transitionend", function fin() {
        dado.classList.add("resultado");

        const mapa = ["frente","atras","derecha","izquierda","arriba","abajo"];
        dado.querySelector(`.${mapa[caraFinal]}`)?.classList.add("ganadora");

        dado.removeEventListener("transitionend", fin);
    });
}

function lanzarTodosDados() {
    document.querySelectorAll(".dado").forEach(lanzarDado);
}

/* =======================
   INIT
======================= */
crearDados();
