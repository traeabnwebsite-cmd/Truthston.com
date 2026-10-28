import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
import { constrainShopOrbit } from "./framing.js";
export function createWorldAnimation({
  audio,
  appState,
  view,
  ballpark,
  ballparkPanels,
  parkZ,
  stadium,
  roofPanels,
  stadiumZ,
  camera,
  T,
  sleeves,
  warm,
  crts,
  waterTexture,
  ghosts,
  disc,
  playerDock,
  discLabel,
  discB,
  discLabelB,
  rand,
  ix,
  ink,
  drops,
  roomGuideController,
  theaterProjection,
  renderer,
  scene,
}) {
  const lifetime = createLifetime();
  let running = false,
    requested = false;
  const bins = new Uint8Array(1024);
  let bass = 0,
    mid = 0,
    treble = 0,
    acc = 0,
    visitorTime = 0,
    glow = 0;
  function bands() {
    if (!audio.playing || !audio.analyser) {
      bass = mid = treble = 0;
      return;
    }
    audio.analyser.getByteFrequencyData(bins);
    const avg = (a, b) => {
      let sum = 0;
      for (let i = a; i < b; i++) sum += bins[i];
      return sum / (b - a) / 255;
    };
    const hz = audio.ctx.sampleRate / 2048;
    bass = avg(1, Math.ceil(250 / hz));
    mid = avg(Math.ceil(250 / hz), Math.ceil(2500 / hz));
    treble = avg(Math.ceil(2500 / hz), Math.min(1024, Math.ceil(10000 / hz)));
  }
  let raf,
    lastSceneDraw = 0;
  function render(ts) {
    if (document.hidden || !running) return;
    raf = lifetime.frame(render);
    if (appState.station === 2 && ts - lastSceneDraw < 42) return;
    lastSceneDraw = ts;
    const dt = Math.min((ts - view.lastFrame) / 1000 || 0.016, 0.08);
    view.lastFrame = ts;
    const t = ts / 1000;
    if (
      appState.mode !== "immersive" ||
      document.body.classList.contains("account-view")
    )
      return;
    // Let the guide finish his entrance before expensive WebGL shader compilation.
    // Otherwise a busy GPU can leave him invisible in the portal-born state.
    if (
      !document.body.classList.contains("companion-dismissed") &&
      (!$("#companion-home").dataset.journey ||
        $("#companion-home").dataset.journey === "arriving")
    )
      return;
    const ballparkStep = appState.calm ? 1 : dt / 24;
    ballpark.ballparkOpen +=
      Math.sign(ballpark.ballparkTarget - ballpark.ballparkOpen) *
      Math.min(
        Math.abs(ballpark.ballparkTarget - ballpark.ballparkOpen),
        ballparkStep,
      );
    const parkEase =
      ballpark.ballparkOpen *
      ballpark.ballparkOpen *
      (3 - 2 * ballpark.ballparkOpen);
    ballparkPanels.forEach(
      ({ group, panel }) =>
        (group.position.z =
          parkZ +
          (-8.4 + panel * 8.4) * (1 - parkEase) +
          (8.8 + panel * 0.35) * parkEase),
    );
    const parkState =
      ballpark.ballparkOpen === 1
        ? "BALLPARK ROOF OPEN"
        : ballpark.ballparkOpen === 0
          ? "BALLPARK ROOF CLOSED"
          : ballpark.ballparkTarget
            ? "OPENING BALLPARK ROOF"
            : "CLOSING BALLPARK ROOF";
    $("#ballpark-roof").dataset.progress = ballpark.ballparkOpen.toFixed(3);
    if ($("#ballpark-roof-status").textContent !== parkState)
      $("#ballpark-roof-status").textContent = parkState;
    const roofStep = appState.calm ? 1 : dt / 6;
    if (Math.abs(stadium.roofTarget - stadium.roofOpen) <= roofStep)
      stadium.roofOpen = stadium.roofTarget;
    else
      stadium.roofOpen +=
        Math.sign(stadium.roofTarget - stadium.roofOpen) * roofStep;
    const roofEase =
      stadium.roofOpen * stadium.roofOpen * (3 - 2 * stadium.roofOpen);
    roofPanels.forEach(
      (p) =>
        (p.group.position.z = stadiumZ + p.side * (6.05 + roofEase * 10.3)),
    );
    const roofState =
      stadium.roofOpen === 0
        ? "ROOF CLOSED"
        : stadium.roofOpen === 1
          ? "ROOF OPEN"
          : stadium.roofTarget
            ? "OPENING ROOF"
            : "CLOSING ROOF";
    if ($("#roof-status").textContent !== roofState)
      $("#roof-status").textContent = roofState;
    bands();
    if (appState.station === 2) {
      view.angleGoal = -Math.PI / 2;
      view.radiusGoal = 9.2;
      view.elevationGoal = 4.15;
      view.targetGoal.set(18.2, 3.65, -0.8);
    }
    if (appState.station === 1) {
      view.radiusGoal = Math.max(3.5, Math.min(5.5, view.radiusGoal));
      view.elevationGoal = Math.max(2.2, Math.min(5.6, view.elevationGoal));
    }
    const smoothing = appState.calm ? 1 : Math.min(1, dt * 4);
    view.angle += (view.angleGoal - view.angle) * smoothing;
    view.radius += (view.radiusGoal - view.radius) * smoothing;
    view.elevation += (view.elevationGoal - view.elevation) * smoothing;
    view.target.lerp(view.targetGoal, smoothing);
    camera.position.set(
      view.target.x + Math.sin(view.angle) * view.radius,
      view.elevation,
      view.target.z + Math.cos(view.angle) * view.radius,
    );
    constrainShopOrbit(camera.position, view.target, appState.station);
    camera.lookAt(view.target);
    if (appState.calm) view.streetJourney = null;
    if (view.streetJourney) {
      const elapsed = Math.max(0, (ts - view.streetJourney.start) / 1000);
      const points = view.streetJourney.points || [
        view.streetJourney.from,
        new T.Vector3(6.65, 2.25, -3),
        new T.Vector3(6.65, 2.25, -8.2),
        new T.Vector3(6.65, 3.4, -11),
      ];
      const segment = Math.min(2, Math.floor(elapsed / 1.05));
      let u = Math.min(1, (elapsed - segment * 1.05) / 1.05);
      u = u * u * (3 - 2 * u);
      camera.position.lerpVectors(points[segment], points[segment + 1], u);
      const look = view.streetJourney.look
        .clone()
        .lerp(
          view.streetJourney.endLook || new T.Vector3(6.65, 6, -33),
          Math.min(1, elapsed / 0.9),
        );
      camera.lookAt(look);
      if (elapsed >= 3.15) {
        view.streetJourney = null;
        view.angle = view.angleGoal;
        view.radius = view.radiusGoal;
        view.elevation = view.elevationGoal;
        view.target.copy(view.targetGoal);
      }
    }
    sleeves.forEach((s) => {
      const lift = view.hovering === s && !appState.calm ? 0.18 : 0;
      s.position.y += (s.userData.base.y + lift - s.position.y) * 0.15;
      const normal = s.userData.normal || { x: 0, z: 1 },
        out = view.hovering === s ? 0.3 : 0;
      s.position.x +=
        (s.userData.base.x + normal.x * out - s.position.x) * 0.15;
      s.position.z +=
        (s.userData.base.z + normal.z * out - s.position.z) * 0.15;
      s.material.emissiveIntensity = appState.calm ? 0.07 : 0.07 + glow;
    });
    if (!appState.calm && t - view.lastGlitch > 0.5) {
      glow = Math.min(0.07, bass * 0.07);
      warm.intensity = 70 + bass * 8;
      warm.color.setHSL(0.09 + mid * 0.015, 0.65, 0.68);
      view.lastGlitch = t;
    }
    if (appState.calm) warm.intensity = 70;
    crts.forEach((s) => {
      s.material.uniforms.time.value = t;
      s.material.uniforms.hover.value = view.hovering === s ? 1 : 0;
      s.material.uniforms.calm.value = appState.calm ? 1 : 0;
    });
    if (!appState.calm) {
      waterTexture.offset.y = -t * 0.1;
      ghosts.forEach((g) => {
        g.position.x =
          g.userData.x + Math.sin(t * 0.14 + g.userData.phase) * 0.65;
        g.position.z =
          g.userData.z + Math.cos(t * 0.12 + g.userData.phase) * 0.4;
      });
      disc.rotation.y += dt * playerDock.spinSpeed * 3;
      discLabel.rotation.y = disc.rotation.y;
      if (audio.decks[1].running && !audio.decks[1].holding) {
        discB.rotation.y += dt * audio.decks[1].pitch * 3;
        discLabelB.rotation.y = discB.rotation.y;
      }
      visitorTime += dt;
      if (visitorTime > 40) {
        const count = 5 + Math.floor(rand() * 4);
        ghosts.forEach((g, i) => (g.visible = i < count));
        $("#people").textContent = count;
        visitorTime = 0;
      }
    }
    ix.clearRect(0, 0, ink.width, ink.height);
    if (!appState.calm) {
      drops.forEach((d) => {
        d.life -= dt * 0.55;
        d.x += d.vx + Math.sin(t * 2 + d.y * 0.01) * bass;
        d.y += d.vy;
        const size = (1 - d.life) * 35 + 8;
        ix.strokeStyle = `rgba(217,144,43,${Math.max(0, d.life) * 0.45})`;
        ix.lineWidth = 1 + treble * 2;
        ix.beginPath();
        ix.arc(d.x, d.y, size, 0, Math.PI * 1.6);
        ix.stroke();
      });
      while (drops.length && drops[0].life < 0) drops.shift();
    }
    roomGuideController.update(ts);
    theaterProjection.update(dt);
    renderer.render(scene, camera);
    view.frames++;
    view.frameTotal += dt;
    if (view.frames >= 180) {
      // Keep the selected display resolution stable; do not soften the room over time.
      view.frames = 0;
      view.frameTotal = 0;
    }
  }

  function pauseFrames() {
    running = false;
    lifetime.cancelFrame(raf);
  }
  function startFrames() {
    if (running || lifetime.disposed || document.hidden) return;
    running = true;
    view.lastFrame = performance.now();
    raf = lifetime.frame(render);
  }
  function suspend() {
    requested = false;
    pauseFrames();
  }
  function resume() {
    requested = true;
    startFrames();
  }
  lifetime.listen(document, "visibilitychange", () => {
    if (document.hidden) pauseFrames();
    else if (requested) startFrames();
  });
  return {
    suspend,
    resume,
    destroy() {
      suspend();
      lifetime.dispose();
    },
  };
}
