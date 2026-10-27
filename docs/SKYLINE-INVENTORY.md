# Downtown skyline reference layout — October 27, 2026

Owner correction: the first added towers were too tightly packed into rows. The current scene instead projects public latitude/longitude reference points onto an east-X/north-Z plane at0.15 scene units per meter. Center origin29.7581N,95.3676W maps to(0,-175). Building heights remain the established stylized scale; other Houston districts remain compressed. This is not a claim that the entire city is a surveyed digital twin.

Source-of-truth module: assets/skyline-layout.mjs.13 named complexes (Pennzoil represents its twin towers), each with a registered parcel. **Enterprise Plaza and1100 Louisiana are one building**, so the duplicate model was removed. Anonymous secondary downtown skyscrapers were removed. Low-rise shops/office infill remain separately generated and checked. A west-facing Skyline viewpoint avoids the welcome sign/year-sign occlusion.

## Named inventory

JPMorgan Chase Tower; Wells Fargo Plaza; Heritage Plaza; TC Energy Center; Pennzoil Place; One Shell Plaza; Enterprise Plaza/1100 Louisiana; CenterPoint Energy Plaza;1600 Smith Street;609 Main at Texas; Texas Tower;1500 Louisiana;1400 Smith Street.

Coordinates for the linked buildings were retrieved from the public English Wikipedia coordinates API with redirects enabled. Texas Tower uses the coordinate in the Houston tallest-buildings map, rather than the Nominatim search result that incorrectly returned Chase Tower. Nominatim's ambiguous match was rejected. Footprints and model shapes are stylized and not surveyed cadastral polygons. The photograph is a visual reference, not proof that every small/distant structure in it is identified or modeled.

## Sources

- [Houston skyscraper coordinate map](https://en.wikipedia.org/wiki/List_of_tallest_buildings_in_Houston)
- [609 Main — developer reference](https://www.hines.com/properties/609-main-at-texas-houston)
- [Texas Tower — developer reference](https://www.hines.com/properties/texas-tower-houston)
- [1100 Louisiana — Hines identifies its rose granite and stepped bays](https://www.hines.com/properties/1100-louisiana-houston)
- [One Shell Plaza — Hines](https://www.hines.com/news/hines-one-shell-plaza-and-two-shell-plaza-receive-leed-gold-certification)
- [1500 Louisiana — Chevron property announcement](https://chevroncorp.gcs-web.com/news-releases/news-release-details/chevrontexaco-concentrate-houston-operations-downtown-location)

## Validation

Pure layout tests assert geographic relative directions, the merged identity, block-scale spread and no overlapping registered named tower plots. Runtime cityAudit includes skylineRoadConflicts and skylineFreewayConflicts. Both must be0; the I-45/I-69 approaches and ramps were moved clear of the new downtown placements. Ground streets are clipped at registered plots; no road is emitted through a tower. This does not certify every unregistered decorative mesh or real-world street as exact. Browser proof: handoff/verification/truthston-expanded-skyline.png.
