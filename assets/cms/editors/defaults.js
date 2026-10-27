export function blankRecord(section) {
  const common = { title: "", status: "draft", version: 0, featured: false };
  if (section === "articles")
    return {
      ...common,
      date: "",
      precision: "day",
      section: "Community",
      kind: "Original",
      summary: "",
      body: "",
      byline: "ABN Journal",
      sourceName: "",
      sourceUrl: "",
      sourceDate: "",
      imageId: "",
      verified: false,
    };
  if (section === "photos")
    return {
      ...common,
      caption: "",
      alt: "",
      date: "",
      precision: "unknown",
      collection: "Community",
      credit: "ABN team",
      license: "Team supplied",
      sourceUrl: "",
      src: "",
      fullSrc: "",
    };
  if (section === "events")
    return {
      ...common,
      startDate: "",
      endDate: "",
      category: "Community",
      venue: "",
      description: "",
      sourceName: "",
      sourceUrl: "",
      imageId: "",
      linkLabel: "Event details",
    };
  if (section === "projects")
    return {
      ...common,
      date: "",
      type: "Album",
      description: "",
      cover: "",
      coverFileId: "",
      access: "member",
      djEligible: false,
      tracks: [],
    };
  return {
    ...common,
    description: "",
    category: "Apparel",
    kind: "tee",
    color: "#202622",
    image: "",
    imageId: "",
    imageFileId: "",
    priceCents: null,
    currency: "USD",
    sizes: ["S", "M", "L", "XL", "2XL"],
    availability: "coming-soon",
    stock: null,
    checkoutUrl: "",
  };
}
