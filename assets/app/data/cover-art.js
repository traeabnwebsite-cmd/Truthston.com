export function createCoverArt({ random: rand }) {
  const colors = ["#c3321d", "#d9902b", "#2c5a46", "#272b22", "#8c432e"];
  function cover(title, i) {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const x = c.getContext("2d");
    x.fillStyle = colors[i % 5];
    x.fillRect(0, 0, 512, 512);
    x.fillStyle = "#e7dec5";
    if (i % 3 === 0) {
      for (let j = 0; j < 9; j++) {
        x.globalAlpha = 0.16;
        x.fillRect(j * 70 - 120, 0, 28, 512);
      }
      x.globalAlpha = 1;
      x.beginPath();
      x.arc(380, 160, 130, 0, 7);
      x.fill();
      x.fillStyle = colors[i % 5];
      x.beginPath();
      x.arc(380, 160, 95, 0, 7);
      x.fill();
    } else if (i % 3 === 1) {
      x.globalAlpha = 0.5;
      for (let j = 0; j < 16; j++) {
        x.beginPath();
        x.moveTo(0, 160 + j * 22);
        x.lineTo(512, 40 + j * 25);
        x.lineWidth = 2;
        x.strokeStyle = "#eee6d3";
        x.stroke();
      }
      x.globalAlpha = 1;
    } else {
      x.globalAlpha = 0.3;
      for (let j = 0; j < 17; j++)
        x.fillRect(j * 35, 160 - rand() * 120, 25, 350);
      x.globalAlpha = 1;
    }
    x.fillStyle = "#eee6d3";
    x.font = "bold 18px monospace";
    x.fillText("THA TRUTH / RECORDS & TAPES", 25, 40);
    x.fillStyle = "#1d241b";
    x.fillRect(18, 270, 476, 203);
    x.fillStyle = "#eee6d3";
    x.font = "900 60px Impact, sans-serif";
    const words = title.toUpperCase().split(" ");
    let line = "",
      yy = 330;
    for (const w of words) {
      if (x.measureText(line + w).width > 435) {
        x.fillText(line, 30, yy);
        line = "";
        yy += 62;
      }
      line += w + " ";
    }
    x.fillText(line, 30, yy);
    x.font = "14px monospace";
    x.fillText(
      "HOUSTON, TX   •   CONCEPT VOL. " + String(i + 1).padStart(2, "0"),
      30,
      493,
    );
    for (let j = 0; j < 6500; j++) {
      x.fillStyle = rand() > 0.5 ? "#fff" : "#000";
      x.globalAlpha = rand() * 0.1;
      x.fillRect(rand() * 512, rand() * 512, rand() * 3, 1);
    }
    x.globalAlpha = 1;
    return c.toDataURL("image/jpeg", 0.85);
  }
  return cover;
}
