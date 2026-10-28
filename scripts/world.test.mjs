import test from "node:test";
import assert from "node:assert/strict";
import { createLazyFeature } from "../assets/app/core/lazy-feature.js";
import { disposeScene } from "../assets/app/world/dispose.js";
import { createWorldNavigation } from "../assets/app/world/navigation.js";
test("lazy world loads once for concurrent callers and disposes once", async () => {
  let calls = 0,
    disposed = 0;
  const feature = createLazyFeature({
    load: async () => {
      calls++;
      return {
        destroy() {
          disposed++;
        },
      };
    },
  });
  const [a, b] = await Promise.all([feature.load(), feature.load()]);
  assert.equal(a, b);
  assert.equal(calls, 1);
  feature.destroy();
  feature.destroy();
  assert.equal(disposed, 1);
  assert.equal(await feature.load(), null);
});
test("a late world cannot attach after disposal; failed initialization can retry", async () => {
  let resolve,
    destroyed = 0,
    ready = 0;
  const feature = createLazyFeature({
    load: () => new Promise((r) => (resolve = r)),
    onReady() {
      ready++;
    },
  });
  const pending = feature.load();
  await Promise.resolve();
  feature.destroy();
  resolve({
    destroy() {
      destroyed++;
    },
  });
  await pending;
  assert.equal(destroyed, 1);
  assert.equal(ready, 0);
  let calls = 0;
  const retry = createLazyFeature({
    load: async () => {
      if (!calls++) throw Error("no context");
      return {};
    },
  });
  assert.equal(await retry.load(), null);
  assert.ok(await retry.load());
  retry.destroy();
});
test("scene cleanup disposes shared geometry/material/texture and shader maps once", () => {
  let g = 0,
    m = 0,
    t = 0,
    cleared = 0;
  const texture = {
      isTexture: true,
      dispose() {
        t++;
      },
    },
    geometry = {
      dispose() {
        g++;
      },
    },
    material = {
      map: texture,
      uniforms: { ink: { value: texture } },
      dispose() {
        m++;
      },
    };
  const scene = {
    background: texture,
    traverse(fn) {
      for (let i = 0; i < 3; i++)
        fn({ geometry, material: [material, material] });
    },
    clear() {
      cleared++;
    },
  };
  const result = disposeScene(scene, [texture]);
  assert.deepEqual(result, { geometries: 1, materials: 1, textures: 1 });
  assert.deepEqual([g, m, t, cleared], [1, 1, 1, 1]);
});
test("stadium entrance camera mutates shared orbit state and both roof toggles retain their own state", () => {
  const element = {
    setAttribute() {},
    classList: { toggle() {} },
    dataset: {},
  };
  const view = {
    targetGoal: {
      set(...p) {
        this.p = p;
      },
    },
    streetJourney: {},
  };
  const stadium = { roofTarget: 0, roofOpen: 0 },
    ballpark = { ballparkTarget: 0, ballparkOpen: 0 };
  const api = createWorldNavigation({
    $: () => element,
    $$: () => [],
    document: { body: element },
    view,
    stadium,
    ballpark,
    appState: { calm: true },
  });
  api.stadiumView("front");
  assert.equal(view.streetJourney, null);
  assert.deepEqual(view.targetGoal.p, [-110, 5.5, -420]);
  api.toggleRoof();
  api.toggleBallparkRoof();
  assert.equal(stadium.roofOpen, 1);
  assert.equal(ballpark.ballparkOpen, 1);
  api.toggleRoof();
  assert.equal(stadium.roofOpen, 0);
  assert.equal(ballpark.ballparkOpen, 1);
});

import { constrainShopOrbit } from "../assets/app/world/framing.js";
test("full shop orbit stays within closed walls while entrance overview and other rooms retain their views", () => {
  const target = { x: 0, y: 1.8, z: -1 };
  for (const station of [0, 8, 9])
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
      const p = {
        x: Math.sin(angle) * 12.5,
        y: 8,
        z: -1 + Math.cos(angle) * 12.5,
      };
      constrainShopOrbit(p, target, station);
      assert.ok(p.x >= -7.95001 && p.x <= 7.95001);
      assert.ok(p.z >= -4.95001);
      assert.ok(p.y <= 6.10001);
    }
  const front = { x: 1.5, y: 4.6, z: 11.4 };
  assert.deepEqual(constrainShopOrbit({ ...front }, target, 0), front);
  const city = { x: 140, y: 100, z: -400 };
  assert.deepEqual(constrainShopOrbit({ ...city }, target, 3), city);
  const booth = { x: -14.5, y: 4.6, z: 5.5 };
  assert.deepEqual(constrainShopOrbit({ ...booth }, target, 1), booth);
});

test("narrow theater framing preserves enough horizontal field for the projected picture", async () => {
  const { responsiveFieldOfView } = await import(
    "../assets/app/world/framing.js"
  );
  // 252px stage after the 138px rail on a portrait phone. Nine-unit screen
  // lies 9.2 units from the projector; it must fit without stretching geometry.
  const aspect = 252 / 787;
  const fov = responsiveFieldOfView(45, aspect, 125);
  const visibleWidth = 2 * 9.2 * Math.tan((fov * Math.PI) / 360) * aspect;
  assert.ok(
    visibleWidth >= 9,
    `Projected width ${visibleWidth} clips the screen`,
  );
  assert.ok(fov <= 125);
  assert.ok(responsiveFieldOfView(43, aspect) <= 90);
});
