import { $, $$, esc } from "../core/dom.js";
export function createWorldResources({ canvas, T, world, renderer, interact }) {
  const venueMarks = {};
  function loadVenueMark(name, draw) {
    const image = new Image();
    image.onload = () => {
      draw(image);
      venueMarks[name] = "loaded";
      canvas.dataset.venueLogos = JSON.stringify(venueMarks);
    };
    image.onerror = () => {
      venueMarks[name] = "unavailable";
      canvas.dataset.venueLogos = JSON.stringify(venueMarks);
    };
    image.src = "assets/branding/" + name + ".svg";
  }
  function mat(c, extra = {}) {
    return new T.MeshStandardMaterial({ color: c, roughness: 0.85, ...extra });
  }
  const wood = mat("#57402a"),
    dark = mat("#242820"),
    paper = mat("#c4ac79"),
    red = mat("#9e3524");
  function box(w, h, d, m, x, y, z) {
    const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    world.add(o);
    return o;
  }
  function label(
    text,
    w,
    h,
    x,
    y,
    z,
    color = "#e1d1aa",
    bg = "#263026",
    size = 80,
  ) {
    const c = document.createElement("canvas");
    c.width = Math.min(4096, Math.max(1024, Math.ceil(w * 220)));
    c.height = Math.max(128, Math.round((c.width * h) / w));
    const a = c.getContext("2d"),
      pad = Math.max(10, c.height * 0.08);
    a.fillStyle = bg;
    a.fillRect(0, 0, c.width, c.height);
    a.strokeStyle = color;
    a.lineWidth = Math.max(2, c.height * 0.013);
    a.strokeRect(pad, pad, c.width - pad * 2, c.height - pad * 2);
    a.fillStyle = color;
    a.textAlign = "center";
    a.textBaseline = "middle";
    a.font = `900 ${Math.floor(c.height * 0.57)}px Impact, Arial, sans-serif`;
    if (text === "BE SOMEONE") {
      const tw = a.measureText(text).width;
      a.save();
      a.translate(c.width / 2, c.height * 0.53);
      a.scale((c.width - pad * 4) / tw, 1);
      a.fillText(text, 0, 0);
      a.restore();
    } else a.fillText(text, c.width / 2, c.height * 0.53, c.width - pad * 3);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
    const o = new T.Mesh(
      new T.PlaneGeometry(w, h),
      new T.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: "#ffffff",
        emissiveIntensity: 0.3,
        roughness: 0.85,
      }),
    );
    o.position.set(x, y, z);
    world.add(o);
    return o;
  }
  function hit(o, text, fn) {
    o.userData = { ...o.userData, text, fn };
    interact.push(o);
    return o;
  }
  // The open-front room is a cutaway: all stations can be reached from the orbit.
  return { loadVenueMark, mat, wood, dark, paper, red, box, label, hit };
}
