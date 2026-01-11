const escena = document.getElementById("escena");
const configuracion = document.getElementById("configuracion");
const checkboxes = document.querySelectorAll('input[name="dados"]');

let carasInternas = [1, 6, 3, 4, 2, 5];

const rotacionesCaras = [
    { x: 0,  y: 0   },  // frente
    { x: 0,  y: 180 },  // atrás
    { x: 0,  y: -90 },  // derecha
    { x: 0,  y: 90  },  // izquierda
    { x: -90,y: 0   },  // arriba
    { x: 90, y: 0   }   // abajo
];

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

function crearDados() {
    escena.innerHTML = "";
    configuracion.innerHTML = "";
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
        dibujarDadoNormal(dado);

        dado.addEventListener("click", () => lanzarDado(dado));
    }

    if (cantidad > 1) {
        const btn = document.createElement("button");
        btn.textContent = "Lanzar ambos";
        btn.className = "btn";
        btn.addEventListener("click", lanzarTodosDados);
        configuracion.appendChild(btn);
    }
}

function dibujarDadoNormal(dado) {
    const valores = [1, 6, 3, 4, 2, 5];
    dado.querySelectorAll(".cara").forEach((cara, i) => {
        colocarPuntos(cara, valores[i]);
        cara.classList.remove("ganadora");
    });
}

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
    layout[valor].forEach(([r,c]) => {
        const punto = document.createElement("div");
        punto.className = "punto";
        punto.style.gridRowStart = r + 1;
        punto.style.gridColumnStart = c + 1;
        cara.appendChild(punto);
    });
}

function lanzarDado(dado) {
    const caraFinal = Math.floor(Math.random() * 6);
    const { x, y } = rotacionesCaras[caraFinal];

    /* Fase 1: giro rápido */
    dado.style.transition = "none";
    dado.style.transform = "rotateX(720deg) rotateY(720deg)";
    dado.offsetHeight;

    /* Fase 2: asentamiento limpio */
    dado.style.transition = "transform 0.5s cubic-bezier(.25,.8,.25,1)";
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
        setTimeout(() => lanzarDado(dado), i * 60);
    });
}

crearDados();
