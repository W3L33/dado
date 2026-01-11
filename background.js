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

  for (let i = 0; i < 6; i++) {
    ctxBg.beginPath();
    ctxBg.lineWidth = 2;
    ctxBg.strokeStyle = `hsla(${180 + i * 25},100%,60%,0.6)`;
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
