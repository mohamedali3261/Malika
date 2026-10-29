# Perfume bottle model — asset integration

Drop your exploded-view model here as **`perfume-bottle.glb`**, then flip one flag.

## 1. Enable the GLB

`src/config/perfumeModelConfig.ts`

```ts
export const perfumeAsset = {
  useGlb: true,                        // ← was false
  glbPath: "/models/perfume-bottle.glb",
  glbScale: 1,                         // uniform scale to match the rig
  glbYOffset: 0,
};
```

No animation code changes are required. The timeline, camera, connectors and
labels all read from `partsConfig`, never from the asset.

## 2. Name the meshes

Every part must be a **separate, independently transformable mesh** whose name
matches `nodeName` in `partsConfig`:

| Required node name | Part |
| --- | --- |
| `BottleGlass`     | main transparent body |
| `PerfumeLiquid`   | liquid volume (sits inside the body) |
| `BottleBase`      | bottom glass section |
| `BottleNeck`      | neck |
| `Collar`          | metal collar / crimp ring |
| `SprayPump`       | pump mechanism |
| `AtomizerNozzle`  | nozzle / actuator |
| `DipTube`         | internal dip tube |
| `BottleCap`       | cap |
| `BottleLabel`     | label / logo plane |

Using different names is fine — just change `nodeName` for that entry; `id`
(used by the animation) stays the same. Any part the loader cannot find
automatically falls back to the procedural geometry, so a partial model works.

## 3. Model requirements

- **Origin at the world centre**, Y-up, bottle standing upright.
- **Overall height ≈ 2 units** (body ≈ 1.2). Otherwise set `glbScale`.
- **Each part's own origin at its natural pivot** — the cap pivots at its base,
  the collar at its centre, the dip tube at its top. Transforms are applied to
  the part group, so a wrong pivot shows up as a wrong rotation.
- No baked parent transforms; apply/freeze transforms before export.
- Draco or Meshopt compression recommended. For Draco add:
  `useGLTF(path, "/draco/")` in `PerfumeBottleModel.tsx`.
- Keep textures ≤ 2K and prefer KTX2.

## 4. Tune the choreography

`assembled` is the resting transform, `exploded` is the **offset added** at full
explosion, and `stagger` is that part's window inside the separation stage:

```ts
{
  id: "BottleCap",
  nodeName: "BottleCap",
  assembled: { position: [0, 1.17, 0], rotation: [0, 0, 0] },
  exploded:  { position: [0, 0.78, 0], rotation: [0, 0.6, 0] },
  stagger:   { start: 0, end: 0.55 },
}
```

Because reassembly replays the same curve in reverse, parts always return to
exactly their `assembled` transform — there is no separate "return" animation
that could drift.

## 5. Note on this build

`vite-plugin-singlefile` inlines JS/CSS into one HTML file, but a `.glb` in
`public/` is still fetched over the network at runtime. Keep it compressed, or
switch the build off single-file mode if you need a fully offline bundle.
