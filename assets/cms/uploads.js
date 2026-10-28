export function createUploader({ api, say }) {
  async function upload(file, kind) {
    say("Uploading " + file.name + "…");
    const info = await api("uploads", {
      name: file.name,
      size: file.size,
      kind,
    });
    for (let offset = 0; offset < file.size; offset += 4 * 1024 * 1024) {
      await api(
        "uploads/" + info.id + "/chunk",
        file.slice(offset, offset + 4 * 1024 * 1024),
        true,
        offset,
      );
      say(
        "Uploading " +
          file.name +
          " / " +
          Math.min(
            100,
            Math.round(((offset + 4 * 1024 * 1024) / file.size) * 100),
          ) +
          "%",
      );
    }
    const done = await api("uploads/" + info.id + "/complete", {});
    say(file.name + " uploaded. Save this item to keep the change.");
    return done;
  }
  return upload;
}
