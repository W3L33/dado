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
                html += `<td><input placeholder="Cara ${idx + 1}"></td>`;
            }
            html += "</tr>";
        }
        html += `</table><button id="toggleInputs">Ocultar</button>`;
        configuracion.innerHTML = html;

        configuracion.querySelectorAll("input").forEach((input, i) => {
            input.addEventListener("input", () => {
                actualizarCarasInternas();
                dibujarDadoEditable();
            });
        });

        document.getElementById("toggleInputs").onclick = () => {
            const table = configuracion.querySelector("table");
            table.style.display = table.style.display === "none" ? "table" : "none";
        };

        const btn = document.createElement("button");
        btn.id = "lanzarBtn";
        btn.textContent = "Lanzar ambos";
        btn.onclick = lanzarTodosDados;
        configuracion.appendChild(btn);
    }
}

/* ================= CARAS ================= */

function actualizarCarasInternas() {
    configuracion.querySelectorAll("input").forEach((input, i) => {
        const n = Number(input.value);
        if (!isNaN(n) && n >= 1 && n <= 6) {
            const op = 7 - n;
            if (i % 2 === 0) {
                carasInternas[i] = n;
                carasInternas[i + 1] = op;
            } else {
                carasInternas[i] = n;
                carasInternas[i - 1] = op;
            }
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

        i === 0 && cantidad > 1
            ? dibujarDadoEditable()
            : dibujarDadoNormal(dado);

        dado.onclick = () => lanzarDado(dado);
    }
}

/* ================= DIBUJO ================= */

function dibujarDadoEditable() {
    const dado = document.querySelector('.dado[data-index="0"]');
    if (!dado) return;

    dado.querySelectorAll(".cara").forEach((cara, i) => {
        cara.innerHTML = "";
        colocarPuntos(cara, carasInternas[i]);
        cara.classList.remove("ganadora");
    });
}

function dibujarDadoNormal(dado) {
    [1,6,3,4,2,5].forEach((v,i)=>{
        colocarPuntos(dado.querySelectorAll(".cara")[i], v);
    });
}

function colocarPuntos(cara, valor) {
    cara.innerHTML = "";
    const layout = {
        1:[[1,1]], 2:[[0,0],[2,2]], 3:[[0,0],[1,1],[2,2]],
        4:[[0,0],[0,2],[2,0],[2,2]],
        5:[[0,0],[0,2],[1,1],[2,0],[2,2]],
        6:[[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]]
    };
    layout[valor]?.forEach(([r,c])=>{
        const p=document.createElement("div");
        p.className="punto";
        p.style.gridRowStart=r+1;
        p.style.gridColumnStart=c+1;
        cara.appendChild(p);
    });
}

/* ================= GIRO DEFINITIVO ================= */

const rotacionesCaras = [
    {x:0,y:0},{x:0,y:180},{x:0,y:-90},
    {x:0,y:90},{x:-90,y:0},{x:90,y:0}
];

function lanzarDado(dado) {
    const caraFinal = Math.floor(Math.random() * 6);

    // Giro visual
    dado.style.transition = "transform 0.9s cubic-bezier(.17,.89,.32,1.49)";
    dado.style.transform =
        `rotateX(${720 + rotacionesCaras[caraFinal].x}deg)
         rotateY(${720 + rotacionesCaras[caraFinal].y}deg)`;

    dado.addEventListener("transitionend", function snap() {
        // 🔒 ENCAJE FINAL LIMPIO (CLAVE)
        dado.style.transition = "none";
        dado.style.transform =
            `rotateX(${rotacionesCaras[caraFinal].x}deg)
             rotateY(${rotacionesCaras[caraFinal].y}deg)`;

        const mapa = ["frente","atras","derecha","izquierda","arriba","abajo"];
        dado.querySelector(`.${mapa[caraFinal]}`)?.classList.add("ganadora");

        dado.removeEventListener("transitionend", snap);
    });
}

/* ================= LANZAR ================= */

function lanzarTodosDados() {
    document.querySelectorAll(".dado").forEach(lanzarDado);
}

crearDados();
