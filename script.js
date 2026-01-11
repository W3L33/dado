const escena = document.getElementById("escena");
const configuracion = document.getElementById("configuracion");
const checkboxes = document.querySelectorAll('input[name="dados"]');

checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
        checkboxes.forEach(c => { if(c !== cb) c.checked = false; });
        crearDados();
    });
});

function getCantidadDados() {
    const seleccionado = document.querySelector('input[name="dados"]:checked');
    return seleccionado ? Number(seleccionado.value) : 1;
}

function crearDados() {
    escena.innerHTML = "";
    configuracion.innerHTML = "";
    const cantidad = getCantidadDados();

    if(cantidad > 1){
        let html = `<h3>Personalizar un dado</h3><table>`;
        for(let r=0; r<2; r++){
            html += "<tr>";
            for(let c=0; c<3; c++){
                const idx = r*3 + c +1;
                html += `<td><input placeholder="Cara ${idx}" id="cara${idx}"></td>`;
            }
            html += "</tr>";
        }
        html += `</table><button id="toggleInputs" class="btn">Ocultar</button>`;
        configuracion.innerHTML = html;
        configuracion.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", actualizarCarasDado1);
        });
        const toggleBtn = document.getElementById("toggleInputs");
        toggleBtn.addEventListener("click", () => {
            const table = configuracion.querySelector("table");
            if(table.style.display === "none"){
                table.style.display = "table";
                toggleBtn.textContent = "Ocultar";
            } else {
                table.style.display = "none";
                toggleBtn.textContent = "Mostrar";
            }
        });
    }

    for(let i=0; i<cantidad; i++){
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

        dado.querySelectorAll(".cara").forEach((cara,j) => {
            let valor;
            if(i===0 && cantidad>1){
                valor = document.getElementById(`cara${j+1}`)?.value || (j+1);
            } else {
                valor = j+1;
            }
            colocarPuntos(cara, valor);
        });

        dado.addEventListener("click", () => lanzarDado(dado));
        escena.appendChild(dado);
    }

    const lanzarBtn = document.createElement("button");
    lanzarBtn.textContent = "Lanzar";
    lanzarBtn.id = "lanzarBtn";
    lanzarBtn.className = "btn";
    lanzarBtn.addEventListener("click", lanzarTodosDados);
    configuracion.appendChild(lanzarBtn);
    actualizarCarasDado1();
}

function actualizarCarasDado1(){
    const dado = document.querySelector('.dado[data-index="0"]');
    if(!dado) return;
    dado.querySelectorAll(".cara").forEach((cara,i)=>{
        let val = document.getElementById(`cara${i+1}`)?.value || (i+1);
        colocarPuntos(cara,val);
    });
}

function colocarPuntos(cara,valor){
    cara.innerHTML = "";
    const num = Number(valor);
    if(num>=1 && num<=6){
        const layout = {
            1:[[1,1]],
            2:[[0,0],[2,2]],
            3:[[0,0],[1,1],[2,2]],
            4:[[0,0],[0,2],[2,0],[2,2]],
            5:[[0,0],[0,2],[1,1],[2,0],[2,2]],
            6:[[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]]
        };
        layout[num].forEach(([r,c])=>{
            const div = document.createElement("div");
            div.className = "punto";
            div.style.gridRowStart = r+1;
            div.style.gridColumnStart = c+1;
            cara.appendChild(div);
        });
    } else {
        cara.textContent = valor;
    }
}

const rotacionesCaras = [
    {x:0, y:0},
    {x:-90, y:0},
    {x:0, y:-90},
    {x:0, y:90},
    {x:90, y:0},
    {x:0, y:180} 
];

function lanzarDado(dado){
    const index = Number(dado.dataset.index);
    const carasDOM = dado.querySelectorAll(".cara");
    let carasValores = [1,6,3,4,2,5];
    if(index===0 && getCantidadDados()>1){
        for(let j=0;j<6;j++){
            const inputVal = document.getElementById(`cara${j+1}`)?.value;
            if(inputVal){
                const v = Number(inputVal);
                carasValores[j] = v;
                switch(j){
                    case 0: carasValores[1] = 7-v; break;
                    case 2: carasValores[3] = 7-v; break;
                    case 4: carasValores[5] = 7-v; break;
                }
            }
        }
    }
    const numeroAleatorio = Math.floor(Math.random()*6) + 1;
    const caraFinal = carasValores.indexOf(numeroAleatorio);
    carasDOM.forEach(c=>c.classList.remove("ganadora"));
    dado.style.transition="none";
    dado.style.transform="rotateX(0deg) rotateY(0deg)";
    dado.offsetHeight;
    const vueltas = 3;
    const finalX = vueltas*360 + rotacionesCaras[caraFinal].x;
    const finalY = vueltas*360 + rotacionesCaras[caraFinal].y;

    dado.style.transition="transform 0.8s ease-out";
    dado.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;
    carasDOM.forEach((cara,j)=>colocarPuntos(cara,carasValores[j]));
    dado.addEventListener("transitionend", function glow(){
        const mapaCaras = ["frente","arriba","derecha","izquierda","abajo","atras"];
        const caraVisible = dado.querySelector(`.${mapaCaras[caraFinal]}`);
        if(caraVisible) caraVisible.classList.add("ganadora");
        dado.removeEventListener("transitionend", glow);
    });
}

function lanzarTodosDados(){
    document.querySelectorAll(".dado").forEach(dado=>lanzarDado(dado));
}
crearDados();
