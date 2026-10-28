import { $ as query, $$ as queryAll, esc } from "../core/dom.js";
export function createWorldNavigation({
  $ = query,
  $$ = queryAll,
  document = globalThis.document,
  audio,
  appState,
  ballpark,
  stadium,
  camera,
  cityViews,
  arenaRoof,
  lip,
  canvas,
  scene,
  view,
  shopExterior,
  doorPivot,
  T,
  sun,
  roomAmbient,
  streetGlow,
  streetSky,
  warm,
  greenLight,
  vaultLight,
}) {
  const positions = [
    { a: 0.23, r: 15.5, e: 6.7, t: [0, 2, 0] },
    { a: 0, r: 5.5, e: 4.6, t: [-14.5, 2.7, 0] },
    { a: -Math.PI / 2, r: 9.2, e: 3.1, t: [18.2, 3.05, -0.8] },
    { a: 0, r: 22, e: 3.4, t: [6.65, 6, -33] },
    { a: 0.5, r: 7.4, e: 5.7, t: [-5.5, 1.2, 3.4] },
    { a: 0.2, r: 7, e: 4.9, t: [4.4, 1.5, 1] },
  ];
  function audioPosition() {
    audio.setSpatialPosition(
      [
        [-4, 0, -3],
        [-5, 0, -1],
        [4, 0, -3],
        [3, 0, -5],
        [-3, 0, -2],
        [4, 0, -1],
      ][appState.station] || [0, 0, 0],
    );
  }

  const navigation = {
    toggleBallparkRoof() {
      ballpark.ballparkTarget = ballpark.ballparkTarget > 0.5 ? 0 : 1;
      $("#ballpark-roof").textContent = ballpark.ballparkTarget
        ? "Close ballpark roof"
        : "Open ballpark roof";
      $("#ballpark-roof").setAttribute(
        "aria-pressed",
        String(!ballpark.ballparkTarget),
      );
      if (appState.calm) ballpark.ballparkOpen = ballpark.ballparkTarget;
    },
    toggleRoof() {
      stadium.roofTarget = stadium.roofTarget > 0.5 ? 0 : 1;
      $("#roof-toggle").textContent = stadium.roofTarget
        ? "Close roof"
        : "Retract roof";
      $("#roof-toggle").setAttribute(
        "aria-pressed",
        Boolean(stadium.roofTarget),
      );
      if (appState.calm) stadium.roofOpen = stadium.roofTarget;
    },
    stadiumView(viewName) {
      $$("[data-stadium-view]").forEach((b) =>
        b.classList.toggle("active", b.dataset.stadiumView === viewName),
      );
      const v = {
        exterior: { a: Math.PI - 0.45, r: 68, e: 36, t: [-110, 4, -400] },
        front: { a: Math.PI - 0.03, r: 18, e: 9, t: [-110, 5.5, -420] },
        field: { a: Math.PI - 0.06, r: 32, e: 38, t: [-110, 3, -400] },
        campus: { a: Math.PI - 0.18, r: 116, e: 81, t: [-102, 0, -400] },
      }[viewName];
      if (!v) return;
      view.streetJourney = null;
      view.angleGoal = v.a;
      view.radiusGoal = v.r;
      view.elevationGoal = v.e;
      view.targetGoal.set(...v.t);
    },
    cityView(id) {
      camera.layers.set(0);
      const p = cityViews[id];
      if (!p) return;
      arenaRoof.visible = lip.visible = id !== "court";
      canvas.dataset.arenaRoof = id === "court" ? "court-cutaway" : "closed";
      document.body.classList.toggle(
        "at-uptown",
        ["transco", "waterwall", "galleria", "arches"].includes(id),
      );
      document.body.classList.toggle("at-stadium", id === "stadium");
      document.body.classList.toggle("at-ballpark", id === "ballpark");
      $(".room-label b").textContent =
        id === "shop" ? "ABN RECORDS, CDs AND TAPES" : "TRUTHSTON, TEXAS";
      $(".room-label small").textContent =
        id === "shop" ? "THE RECORD SHOP / HOUSTON" : "THE CITY / THIRD COAST";
      scene.fog.density = id === "map" ? 0.00045 : 0.00125;
      const cityLabels = {
        skyline: [
          "Houston.<br>In full view.",
          "DOWNTOWN SKYLINE / 13 NAMED BUILDING COMPLEXES",
        ],
        downtown: [
          "Houston.<br>After hours.",
          "A STYLIZED HOUSTON CITYSCAPE / PICK A LANDMARK",
        ],
        bridge: ["Be someone.", "THE I-45 RAILWAY BRIDGE / A HOUSTON LANDMARK"],
        transco: [
          "Transco.<br>Still iconic.",
          "WILLIAMS TOWER / UPTOWN HOUSTON",
        ],
        waterwall: ["The Waterwall.", "GERALD D. HINES WATERWALL PARK"],
        galleria: [
          "Around the<br>corner.",
          "THE GALLERIA / WESTIN GALLERIA / GALLERIA TOWER I",
        ],
        arches: ["Post Oak.", "THE SILVER ARCHES / TRANSCO APPROACH"],
        stadium: ["Home field.<br>Houston.", "RELIANT / NRG STADIUM"],
        dome: ["The Eighth<br>Wonder.", "THE ASTRODOME / RELIANT PARK"],
        ballpark: [
          "For the<br>home team.",
          "DAIKIN PARK / THE ASTROS’ BALLPARK",
        ],
        arena: ["Clutch city.", "TOYOTA CENTER / HOME OF THE ROCKETS"],
        court: ["Home court.", "HOUSTON ROCKETS / TOYOTA CENTER CUTAWAY"],
        shop: ["The front door.", "THA TRUTH & NOTHING BUT THA TRUTH"],
        cars: ["The shop lot.", "CYBERTRUCK / SILVERADO / LAMBORGHINI"],
        map: [
          "One city.",
          "CONNECTED HOUSTON DISTRICTS / NORTH ↑ / DISTANCES COMPRESSED",
        ],
      };
      $("#station-title").innerHTML = cityLabels[id][0];
      $("#station-note").textContent = cityLabels[id][1];
      view.streetJourney = null;
      view.angleGoal = p.a;
      view.radiusGoal = p.r;
      view.elevationGoal = p.e;
      view.targetGoal.set(...p.t);
      $$("[data-city]").forEach((b) =>
        b.classList.toggle("active", b.dataset.city === id),
      );
    },
    travel(i) {
      arenaRoof.visible = lip.visible = true;
      canvas.dataset.arenaRoof = "closed";
      view.streetJourney = null;
      shopExterior.visible = i === 3;
      if (i === 3) {
        doorPivot.rotation.y = -1.5;
        if (!appState.calm)
          view.streetJourney = {
            start: performance.now(),
            from: camera.position.clone(),
            look: view.target.clone(),
          };
      }
      if (i === 1 && !appState.calm)
        view.streetJourney = {
          start: performance.now(),
          from: camera.position.clone(),
          look: view.target.clone(),
          points: [
            camera.position.clone(),
            new T.Vector3(-6.9, 2.3, 2.6),
            new T.Vector3(-10.3, 2.6, 2.6),
            new T.Vector3(-14.5, 4.6, 5.5),
          ],
          endLook: new T.Vector3(-14.5, 2.7, 0),
        };
      if (i === 2 && !appState.calm)
        view.streetJourney = {
          start: performance.now(),
          from: camera.position.clone(),
          look: view.target.clone(),
          points: [
            camera.position.clone(),
            new T.Vector3(7, 2.3, -2),
            new T.Vector3(10.3, 2.5, -2),
            new T.Vector3(9.3, 4.8, 0),
          ],
          endLook: new T.Vector3(18.2, 2, 0),
        };
      camera.layers.set(i === 2 ? 1 : 0);
      sun.castShadow = i !== 2;
      camera.fov = i === 3 ? 50 : i === 1 ? 52 : i === 2 ? 45 : 43;
      camera.updateProjectionMatrix();
      sun.intensity = i === 3 ? 1.65 : 3;
      sun.color.set(i === 3 ? "#f8d7b3" : "#f1bb7a");
      roomAmbient.intensity = i === 3 ? 0.45 : 2.6;
      roomAmbient.color.set(i === 3 ? "#b1c5dd" : "#eed6a4");
      roomAmbient.groundColor.set(i === 3 ? "#253241" : "#303a27");
      streetGlow.intensity = i === 3 ? 1.5 : 1;
      streetGlow.color.set(i === 3 ? "#b6ccdf" : "#8daccb");
      streetGlow.groundColor.set(i === 3 ? "#26323d" : "#242b2c");
      scene.background =
        i === 3 ? streetSky : new T.Color(i === 2 ? "#20251f" : "#25251d");
      scene.fog.color.set(
        i === 3 ? "#345a83" : i === 2 ? "#20251f" : "#25251d",
      );
      scene.fog.density = i === 3 ? 0.00125 : 0.025;
      const p = positions[i];
      view.angleGoal = p.a;
      view.radiusGoal = p.r;
      view.elevationGoal = p.e;
      view.targetGoal.set(...p.t);
      audioPosition();
    },
    audioPosition,
    unlock(i) {
      if (i === 0) doorPivot.rotation.y = -1.1;
      if (i === 1) warm.color.set("#ffc275");
      if (i === 2) greenLight.intensity = 22;
      if (i === 3) vaultLight.intensity = 35;
    },
  };

  return navigation;
}
