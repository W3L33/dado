const escena = document.getElementById("escena");
const configuracion = document.getElementById("configuracion");
const radios = document.querySelectorAll('input[name="dados"]');

let carasInternas = [1, 6, 3, 4, 2, 5];
let inputsVisibles = true;

/* ======================
   RADIO BUTTONS
====================== */
radios.forEach(r => {
    r.addEventListener("change", () => {
        radios.forEach(o => o.checked = (o === r));
        crearDados();
    });
});

function getCantidadDados() {
    const r = document.querySelector('input[name="dados"]:checked');
    return r ? Number(r.value) : 1;
}

/* ======================
   CONFIGURACIÓN
====================== */
function crearConfiguracion() {
    configuracion.innerHTML = "";
    inputsVisibles = true;

    if (getCantidadDados() === 2) {
        let html = `<h3 style="color:#eed09d">Personaliza un dado</h3><table>`;
        for (let i = 0; i < 6; i++) {
            if (i % 3 === 0) html += "<tr>";
            html += `<td><input placeholder="Cara ${i + 1}" data-i="${i}"></td>`;
            if (i % 3 === 2) html += "</tr>";
        }
        html += `</table>
                 <button id="toggleInputs" class="btn">Ocultar</button>
                 <button id="lanzarBtn" class="btn">Lanzar ambos</button>`;

        configuracion.innerHTML = html;

        configuracion.querySelectorAll("input").forEach(inp => {
            inp.addEventListener("input", () => {
                actualizarCarasInternas();
                dibujarDadoEditable();
            });
        });

        document.getElementById("toggleInputs").onclick = toggleInputs;
        document.getElementById("lanzarBtn").onclick = lanzarTodosDados;
    }
}

function toggleInputs() {
    const table = configuracion.querySelector("table");
    const btn = document.getElementById("toggleInputs");
    inputsVisibles = !inputsVisibles;
    table.style.display = inputsVisibles ? "table" : "none";
    btn.textContent = inputsVisibles ? "Ocultar" : "Mostrar";
}

/* ======================
   CREAR DADOS
====================== */
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

        if (i === 0 && cantidad === 2) {
            dibujarDadoEditable();
        } else {
            dibujarDadoNormal(dado);
        }

        dado.addEventListener("click", () => lanzarDado(dado));
    }
}

/* ======================
   DIBUJAR CARAS
====================== */
function actualizarCarasInternas() {
    configuracion.querySelectorAll("input").forEach((inp, i) => {
        const v = inp.value.trim();
        const n = Number(v);

        if (!isNaN(n) && n >= 1 && n <= 6) {
            const pares = [[0,1],[2,3],[4,5]];
            pares.forEach(([a,b]) => {
                if (i === a) { carasInternas[a] = n; carasInternas[b] = 7 - n; }
                if (i === b) { carasInternas[b] = n; carasInternas[a] = 7 - n; }
            });
        } else if (v) {
            carasInternas[i] = v;
        }
    });
}

function dibujarDadoEditable() {
    const dado = document.querySelector('.dado[data-index="0"]');
    if (!dado) return;

    dado.querySelectorAll(".cara").forEach((cara, i) => {
        cara.innerHTML = "";
        const val = carasInternas[i];

        if (typeof val === "number") {
            colocarPuntos(cara, val);
        } else if (val) {
            const span = document.createElement("span");
            span.textContent = val;
            cara.appendChild(span);
        }

        cara.classList.remove("ganadora");
    });
}

function dibujarDadoNormal(dado) {
    const vals = [1, 6, 3, 4, 2, 5];
    dado.querySelectorAll(".cara").forEach((cara, i) => {
        colocarPuntos(cara, vals[i]);
        cara.classList.remove("ganadora");
    });
}

function colocarPuntos(cara, valor) {
    cara.innerHTML = "";
    const layout = {
        1:[[1,1]],
        2:[[0,0],[2,2]],
        3:[[0,0],[1,1],[2,2]],
        4:[[0,0],[0,2],[2,0],[2,2]],
        5:[[0,0],[0,2],[1,1],[2,0],[2,2]],
        6:[[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]]
    };
    layout[valor]?.forEach(([r,c]) => {
        const p = document.createElement("div");
        p.className = "punto";
        p.style.gridRowStart = r + 1;
        p.style.gridColumnStart = c + 1;
        cara.appendChild(p);
    });
}

/* ======================
   GIRO (ESTABLE iOS)
====================== */
const rotaciones = [
    {x:0,y:0},      // frente
    {x:0,y:180},    // atrás
    {x:0,y:-90},    // derecha
    {x:0,y:90},     // izquierda
    {x:-90,y:0},    // arriba
    {x:90,y:0}      // abajo
];

function lanzarDado(dado) {
    const caraFinal = Math.floor(Math.random() * 6);
    const epsilon = 0.01; // FIX WebKit (clave)

    dado.style.transition = "none";
    dado.style.transform = "rotateX(0deg) rotateY(0deg)";
    dado.offsetHeight;

    const vueltas = 4;
    const fx = vueltas * 360 + rotaciones[caraFinal].x + epsilon;
    const fy = vueltas * 360 + rotaciones[caraFinal].y + epsilon;

    dado.style.transition = "transform 1.1s cubic-bezier(.25,.8,.25,1)";
    dado.style.transform = `rotateX(${fx}deg) rotateY(${fy}deg)`;

    dado.addEventListener("transitionend", function fin() {
        dado.querySelectorAll(".cara").forEach(c => c.classList.remove("ganadora"));

        const mapa = ["frente","atras","derecha","izquierda","arriba","abajo"];
        dado.querySelector("." + mapa[caraFinal])?.classList.add("ganadora");

        dado.removeEventListener("transitionend", fin);
    });
}

function lanzarTodosDados() {
    document.querySelectorAll(".dado").forEach(lanzarDado);
}

/* ======================
   INIT
====================== */
crearDados();
