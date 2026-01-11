const bg = document.getElementById('bg');
const ctxBg = bg.getContext('2d');

function resizeBg() {
  bg.width = window.innerWidth;
  bg.height = window.innerHeight;
}
window.addEventListener('resize', resizeBg);
resizeBg();

let offset = 0;

function drawBackground() {
  ctxBg.fillStyle = '#000'; 
  ctxBg.fillRect(0, 0, bg.width, bg.height);

  // Nueva paleta de colores que incluyen verde, caramel, madera, y tonos cálidos
  const colorPalette = [
    "hsla(120, 100%, 50%, 0.6)",  
    "hsla(150, 100%, 40%, 0.6)",  
    "hsla(30, 60%, 50%, 0.6)",  
    "hsla(30, 60%, 30%, 0.6)",    
    "hsla(35, 100%, 40%, 0.6)",   
    "hsla(45, 80%, 55%, 0.6)",    
    "rgba(0, 102, 0, 0.8)"    
  ];

  for (let i = 0; i < 7; i++) {  // Usamos 7 para incluir la línea blanca
    ctxBg.beginPath();
    ctxBg.lineWidth = 2;
    ctxBg.strokeStyle = colorPalette[i % colorPalette.length];  // Usamos la paleta de colores variados
    ctxBg.shadowColor = ctxBg.strokeStyle;
    ctxBg.shadowBlur = 20;

    for (let x = 0; x <= bg.width; x += 10) {
      const y =
        bg.height / 2 +
        Math.sin((x + offset + i * 80) * 0.01) * (40 + i * 8);
      ctxBg.lineTo(x, y);
    }
    ctxBg.stroke();
  }

  ctxBg.shadowBlur = 0;
  offset += 2;

  requestAnimationFrame(drawBackground);
}

drawBackground();
