import { disposeScene } from "./dispose.js";
import { responsiveFieldOfView } from "./framing.js";
import { buildShopShell } from "./rooms/shell.js";
import { createWorldAnimation } from "./animation.js";
import { createRoomGuide } from "./room-guide.js";
import { createWorldInput } from "./input.js";
import { createWorldNavigation } from "./navigation.js";
import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
import { createTheaterScreen } from "../features/theater/world-screen.js";
import { createWorldResources } from "./resources.js";
import { buildCrates } from "./rooms/crates.js";
import { buildDJRoom } from "./rooms/dj-room.js";
import { buildStoreExpansion } from "./rooms/store-expansion.js";
import { buildTheaterRoom } from "./rooms/theater.js";
import { buildStreet } from "./city/street.js";
import { buildBridge } from "./city/bridge.js";
import { buildSkyline } from "./landmarks/skyline.js";
import { buildTransco } from "./landmarks/transco.js";
import { createVenueMaterials } from "./landmarks/materials.js";
import { buildStadiumDistrict } from "./landmarks/stadium.js";
import { buildBallpark } from "./landmarks/ballpark.js";
import { buildArena } from "./landmarks/arena.js";
import { buildCityRoads } from "./city/roads.js";
import { buildUptown } from "./landmarks/uptown.js";
import { buildCityInfill } from "./city/infill.js";
import { buildStorefront } from "./rooms/storefront.js";
import { buildGivingRoom } from "./rooms/giving.js";
import { buildVisitors } from "./rooms/visitors.js";
export async function createWorld({
  releases,
  release,
  dj,
  go,
  twin,
  rand,
  commerce,
  cinema,
  today,
  timeline,
  modal,
  giving,
  data,
  audio,
  appState,
  playerDock,
  setMode,
  store,
  three,
  rendererFactory,
  autoStart = true,
  signal,
}) {
  const lifetime = createLifetime();
  const registerTwin = twin;
  twin = (...args) => {
    const remove = registerTwin(...args);
    if (typeof remove === "function") lifetime.add(remove);
    return remove;
  };
  let sceneAPI;
  const T =
    three ||
    (await import(
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js"
    ));
  signal?.throwIfAborted();
  const canvas = $("#scene");
  const renderer = rendererFactory
    ? rendererFactory(canvas)
    : new T.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new T.Scene();
  let disposed = false;
  const owned = [],
    extraTextures = [];
  function dispose() {
    if (disposed) return;
    disposed = true;
    for (const item of owned.reverse()) item.destroy();
    lifetime.dispose();
    const result = disposeScene(scene, extraTextures);
    renderer.dispose();
    renderer.renderLists?.dispose();
    return result;
  }
  try {
    scene.background = new T.Color("#25251d");
    scene.fog = new T.FogExp2("#25251d", 0);
    const camera = new T.PerspectiveCamera(43, 1, 0.25, 1600);
    const world = new T.Group();
    const view = {
      hovering: null,
      angle: 0.23,
      elevation: 6.7,
      radius: 15.5,
      target: new T.Vector3(0, 2, 0),
      targetGoal: new T.Vector3(0, 2, 0),
      angleGoal: 0.23,
      radiusGoal: 15.5,
      elevationGoal: 6.7,
      lastFrame: 0,
      frames: 0,
      frameTotal: 0,
      lastGlitch: -10,
      streetJourney: null,
    };
    scene.add(world);
    const interact = [],
      sleeves = [],
      ghosts = [],
      crts = [];
    const ray = new T.Raycaster();
    const pointer = new T.Vector2();

    const warm = new T.PointLight("#ffaf5c", 70, 25, 2);
    warm.position.set(-3, 7, 3);
    const roomAmbient = new T.HemisphereLight("#eed6a4", "#303a27", 2.6);
    scene.add(warm, roomAmbient);
    const sun = new T.DirectionalLight("#f1bb7a", 3);
    sun.position.set(-5, 10, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    scene.add(sun);
    const greenLight = new T.PointLight("#4a9668", 0, 14);
    greenLight.position.set(5, 4, 0);
    scene.add(greenLight);
    const vaultLight = new T.PointLight("#ffbc51", 0, 18);
    vaultLight.position.set(0, 4, -5);
    scene.add(vaultLight);
    const resources = createWorldResources({
      canvas,
      T,
      world,
      renderer,
      interact,
    });
    const { loadVenueMark, mat, wood, dark, paper, red, box, label, hit } =
      resources;
    buildShopShell({ box, mat, wood, dark });
    const crates = buildCrates({
      T,
      renderer,
      world,
      label,
      releases,
      sleeves,
      hit,
      release,
      box,
      wood,
      dark,
      canvas,
      store,
    });
    const { abnTexture, abnMark } = crates;
    if (store)
      buildStoreExpansion({
        T,
        world,
        box,
        mat,
        wood,
        dark,
        paper,
        label,
        hit,
        twin,
        go,
        store,
        commerce,
      });
    const djRoom = buildDJRoom({
      world,
      box,
      wood,
      dark,
      paper,
      hit,
      dj: {
        ...dj,
        open: () => (appState.station === 1 ? dj.open() : go(1)),
      },
      T,
      mat,
      red,
      label,
      scene,
      go,
      twin,
      abnMark,
      rand,
      commerce: {
        ...commerce,
        bumpboxDisplay: (...args) =>
          appState.station === 1 ? commerce.bumpboxDisplay(...args) : go(1),
      },
    });
    const { disc, discLabel, discB, discLabelB } = djRoom;
    const theaterRoom = buildTheaterRoom({
      world,
      mat,
      box,
      paper,
      wood,
      label,
      hit,
      go,
      T,
      scene,
      cinema,
      roomAmbient,
      sun,
    });
    const { companionSeat, theatreLights, screenLight, screen } = theaterRoom;
    const street = buildStreet({
      box,
      wood,
      paper,
      T,
      world,
      mat,
      hit,
      go,
      label,
      rand,
      dark,
      scene,
      canvas,
      red,
      getWorld: () => sceneAPI,
      twin,
      today,
      timeline,
    });
    const {
      doorPivot,
      streetSky,
      asphalt,
      concrete,
      streetGlow,
      glowMat,
      beam,
    } = street;
    const exteriorStart = world.children.length;
    const bridge = buildBridge({
      world,
      box,
      mat,
      concrete,
      wood,
      label,
      T,
      dark,
    });
    const skyline = await buildSkyline({
      rand,
      T,
      renderer,
      mat,
      box,
      world,
      dark,
      glowMat,
      canvas,
      twin,
      modal,
    });
    signal?.throwIfAborted();
    const { skylineTowerFootprints, skylineInventory } = skyline;
    const transco = buildTransco({ world, rand, T, renderer, mat, box });
    const venueMaterials = createVenueMaterials({ T, rand, mat, world });
    const {
      architecturalBrick,
      limestone,
      copperGreen,
      venueGlass,
      venueArch,
      venueSphere,
    } = venueMaterials;
    const stadium = buildStadiumDistrict({
      world,
      mat,
      T,
      box,
      asphalt,
      paper,
      label,
      dark,
      concrete,
      wood,
      venueSphere,
      beam,
      loadVenueMark,
      scene,
    });
    const {
      stadiumZ,
      roofSteel,
      campusRoadFootprints,
      contactTexture,
      roofPanels,
    } = stadium;
    const ballpark = buildBallpark({
      world,
      mat,
      T,
      box,
      concrete,
      architecturalBrick,
      limestone,
      copperGreen,
      venueArch,
      venueGlass,
      loadVenueMark,
      label,
      dark,
      renderer,
    });
    const { parkZ, ballparkPanels } = ballpark;
    const arena = buildArena({
      world,
      mat,
      box,
      concrete,
      venueGlass,
      limestone,
      T,
      canvas,
      label,
      renderer,
      loadVenueMark,
    });
    const { arenaRoof, lip } = arena;
    const cityRoads = buildCityRoads({
      campusRoadFootprints,
      T,
      glowMat,
      contactTexture,
      mat,
      skylineTowerFootprints,
      asphalt,
      label,
      world,
    });
    const {
      planRoads,
      planBuildings,
      planCurves,
      urbanBatches,
      urbanDummy,
      urbanAmber,
      urbanContact,
      unitCityBox,
      cityCurb,
      cityPaint,
      cityRoof,
      cityBark,
      cityLeaves,
      cityPaving,
      cityBlack,
      cityBox,
      rectIntersects,
      sxMin,
      sxMax,
      szMin,
      szMax,
      skylineBounds,
      protectedBlocks,
      gridX,
      gridZ,
    } = cityRoads;
    const uptown = buildUptown({
      mat,
      rand,
      T,
      world,
      box,
      cityBox,
      cityPaving,
      cityBark,
      urbanDummy,
      wood,
      cityBlack,
      urbanAmber,
      cityRoof,
      venueGlass,
      label,
      planBuildings,
    });
    const { waterTexture } = uptown;
    const infill = buildCityInfill({
      T,
      renderer,
      mat,
      protectedBlocks,
      skylineBounds,
      rectIntersects,
      planRoads,
      planBuildings,
      planCurves,
      cityBox,
      urbanContact,
      cityPaving,
      cityRoof,
      cityCurb,
      cityBlack,
      sxMin,
      sxMax,
      szMin,
      szMax,
      rand,
      gridX,
      gridZ,
      asphalt,
      cityPaint,
      cityLeaves,
      cityBark,
      urbanDummy,
      world,
      urbanAmber,
      urbanBatches,
      unitCityBox,
      canvas,
      skylineTowerFootprints,
      skylineInventory,
    });
    const storefront = buildStorefront({
      world,
      box,
      concrete,
      limestone,
      mat,
      architecturalBrick,
      roofSteel,
      hit,
      go,
      abnMark,
      label,
      glowMat,
      T,
      twin,
    });
    const { shopExterior } = storefront;
    const cityViews = {
      skyline: { a: -Math.PI / 2 - 0.12, r: 165, e: 31, t: [-5, 20, -177] },
      downtown: { a: 0, r: 22, e: 3.4, t: [6.65, 6, -33] },
      bridge: { a: 0, r: 32, e: 18, t: [6.65, 8, -57] },
      transco: { a: Math.PI - 0.55, r: 88, e: 32, t: [-295, 26, -185] },
      waterwall: { a: 0.08, r: 12, e: 8, t: [-295, 1.8, -204] },
      galleria: { a: Math.PI - 0.45, r: 57, e: 32, t: [-329, 3, -167] },
      arches: { a: 0.1, r: 76, e: 3.5, t: [-284, 18, -185] },
      stadium: { a: Math.PI - 0.45, r: 68, e: 36, t: [-110, 4, -400] },
      dome: { a: Math.PI - 0.55, r: 34, e: 18, t: [-81, 3, -400] },
      ballpark: { a: Math.PI + 0.55, r: 45, e: 29, t: [80, 3, -125] },
      arena: { a: 0.6, r: 42, e: 24, t: [75, 2.5, -175] },
      court: { a: 0.4, r: 17, e: 23, t: [75, 1, -175] },
      shop: { a: 0.12, r: 25, e: 10, t: [0, 2.2, 4] },
      cars: { a: 2, r: 18, e: 10, t: [-12.4, 1, -15.5] },
      map: { a: Math.PI - 0.1, r: 260, e: 790, t: [-125, 0, -250] },
    };
    world.children
      .slice(exteriorStart)
      .forEach((object) => object.traverse((child) => child.layers.set(3)));
    const givingRoom = buildGivingRoom({
      box,
      wood,
      dark,
      T,
      world,
      hit,
      giving,
      data,
      label,
      mat,
      paper,
    });
    extraTextures.push(streetSky, waterTexture, abnTexture);
    const visitors = buildVisitors({ T, rand, world, ghosts });
    sceneAPI = createWorldNavigation({
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
    });
    const input = createWorldInput({
      canvas,
      view,
      appState,
      pointer,
      ray,
      camera,
      interact,
      rand,
    });
    owned.push(input);
    const { ink, ix, drops } = input;
    function resize() {
      const r = canvas.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.fov = responsiveFieldOfView(
        camera.userData.baseFov || 43,
        camera.aspect,
        appState.station === 2 ? 125 : 90,
      );
      camera.updateProjectionMatrix();
      ink.width = r.width;
      ink.height = r.height;
    }
    lifetime.observe(new ResizeObserver(resize), canvas.parentElement);
    lifetime.observe(new ResizeObserver(resize), canvas);
    resize();
    // The approved illustrated companion is a depth-tested billboard inside the actual room.
    const roomGuideController = createRoomGuide({
      companionSeat,
      sceneAPI,
      T,
      scene,
      hit,
      twin,
      appState,
      camera,
      canvas,
    });
    owned.push(roomGuideController);
    const theaterProjection = createTheaterScreen({
      T,
      scene,
      screen,
      renderer,
      appState,
      camera,
      canvas,
      sun,
      roomAmbient,
      theatreLights,
      screenLight,
    });
    owned.push(theaterProjection);
    sceneAPI.setCinemaLights = theaterProjection.setCinemaLights;
    sceneAPI.theaterView = () => {
      view.streetJourney = null;
      camera.userData.baseFov = 45;
      camera.fov = responsiveFieldOfView(45, camera.aspect, 125);
      camera.updateProjectionMatrix();
      view.angleGoal = -Math.PI / 2;
      view.radiusGoal = 9.2;
      view.elevationGoal = 4.15;
      view.targetGoal.set(18.2, 3.65, -0.8);
    };
    const animation = createWorldAnimation({
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
    });
    owned.push(animation);
    $("#loading")?.remove();

    Object.assign(sceneAPI, {
      suspend: animation.suspend,
      resume: animation.resume,
      destroy: dispose,
      diagnostics() {
        let objects = 0;
        const layers = {};
        const probe = new T.Raycaster();
        probe.layers.mask = camera.layers.mask;
        probe.setFromCamera(new T.Vector2(0, 0), camera);
        const centerHits = probe
          .intersectObjects(world.children, true)
          .filter(
            (hit) => hit.object.visible && hit.object.material?.opacity !== 0,
          )
          .slice(0, 5)
          .map((hit) => ({
            label: hit.object.userData.text || hit.object.userData.label || "",
            geometry: hit.object.geometry?.parameters,
            position: hit.object.getWorldPosition(new T.Vector3()).toArray(),
          }));
        scene.traverse(() => objects++);
        world.traverse((object) => {
          if (object.isMesh)
            layers[object.layers.mask] = (layers[object.layers.mask] || 0) + 1;
        });
        return {
          objects,
          renderer: renderer.info?.memory || {},
          drawCalls: renderer.info?.render?.calls,
          centerHits,
          disposed,
          camera: {
            position: camera.position.toArray(),
            target: view.target.toArray(),
            fov: camera.fov,
            aspect: camera.aspect,
            layers: camera.layers.mask,
          },
          meshLayers: layers,
          pixelRatio: renderer.getPixelRatio(),
          shopDoors: (() => {
            const doors = [];
            world.traverse((object) => {
              if (object.userData?.shopDoor)
                doors.push({
                  ...object.userData.shopDoor,
                  position: object.getWorldPosition(new T.Vector3()).toArray(),
                });
            });
            return doors;
          })(),
          floorPlan: {
            cashierFeetY: 0,
            cashierZ: -4.08,
            counterRearZ: -4,
            counterHeight: 1.22,
            aisleWidth: 11.5,
          },
        };
      },
    });
    if (autoStart) animation.resume();
    return sceneAPI;
  } catch (error) {
    dispose();
    throw error;
  }
}
