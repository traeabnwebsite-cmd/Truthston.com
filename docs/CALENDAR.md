# Current Events calendar

October27,2026 · Working branch only, no production refactor merge.

Current Events now has a real month grid, Previous/Next/Today controls, month picker, category filter, selected-date agenda, upcoming dates and a jump to the latest published date. Day arrows move keyboard focus across month boundaries. Phone cells remain touch-sized with event counts and the agenda below. Site-title/intro copy still comes from the CMS.

Only the events collection supplies appointments. Newsroom articles are never converted into calendar entries. The current two published event records are past dates; the October2026/upcoming view honestly shows no published upcoming dates. Team console → Current events controls real dates, venue, category, description and sources. Refresh the page after publishing locally. Production staff/cloud publishing remains unfinished.

Multi-day events occupy each date inclusively. Add to calendar downloads a real all-day ICS file with the correct exclusive end, escaped values and UTF-8-safe line folding. Structural dates use UTC arithmetic; today uses America/Chicago. Date labels do not shift at timezone boundaries.

Verified: July16–22 Trae Day week includes July22; selected agenda shows its actual venue and past status; native browser ICS download checked; Today returns October27;31 October day buttons and no newsroom cards;390px viewport has zero horizontal overflow. Four pure date/export tests cover leap years, month crossing, invalid ranges, Houston midnight and ICS safety.
