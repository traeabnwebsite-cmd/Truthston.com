// Materials/textures/geometries can be shared by hundreds of instances: dispose each once.
export function disposeScene(scene, extraTextures = []) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set(extraTextures.filter(Boolean));
  const texture = (value) => {
    if (value?.isTexture) textures.add(value);
  };
  scene?.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) texture(value);
      for (const uniform of Object.values(material.uniforms || {}))
        texture(uniform?.value);
    }
    object.shadow?.map?.dispose();
  });
  texture(scene?.background);
  texture(scene?.environment);
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
  scene?.clear();
  return {
    geometries: geometries.size,
    materials: materials.size,
    textures: textures.size,
  };
}
