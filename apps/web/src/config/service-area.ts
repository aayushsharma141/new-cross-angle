/**
 * The studio's service area — the single source of truth for /locations.
 *
 * `LOCATION_DATA` in the estimator's pricing config still holds every Indian
 * city because it drives tier-based pricing; this file is the narrower,
 * editorial answer to "where do you work, and what is it like working there?".
 *
 * Everything lives on one page. Jamshedpur's neighbourhoods are districts of a
 * single city, so separate pages for each would be near-duplicate doorway
 * pages; the regional cities don't yet have the local projects, photography or
 * testimonials that would justify a page of their own. `/locations/:slug`
 * redirects to the matching anchor here.
 *
 * To promote an area back to its own page later, give it `hasOwnPage: true`
 * and add a route — nothing else needs to change.
 */

export interface ServiceArea {
  /** Anchor id and redirect target: /locations#<slug> */
  slug: string;
  name: string;
  /** Shown beside the name — district, or state for the regional cities. */
  context: string;
  /** Two or three sentences on what interior work is actually like here. */
  copy: string;
  /** The work this area most often asks for. */
  focus: string;
  /** Set true once the area has enough distinct proof to hold its own page. */
  hasOwnPage?: boolean;
}

export interface ServiceBand {
  id: string;
  label: string;
  /** What delivery concretely looks like at this distance. */
  note: string;
  areas: ServiceArea[];
}

export const SERVICE_BANDS: ServiceBand[] = [
  {
    id: "jamshedpur",
    label: "Jamshedpur",
    note: "Our home city. Resident design team, daily site supervision, same-day visits.",
    areas: [
      {
        slug: "jamshedpur",
        name: "Jamshedpur",
        context: "Home city",
        focus: "Full turn-key interiors, residential and commercial",
        copy:
          "Jamshedpur is where the studio is based, and it is the only city where we hold a resident design and supervision team rather than travelling to site. That changes what we can promise: same-day visits when something needs a decision, daily oversight during execution, and a materials network we have used long enough to know which suppliers hold their dates. The city's housing runs from planned company townships to older bungalows and new apartment stock, and we work across all of it — the districts below describe what each part of the city usually asks for.",
      },
      {
        slug: "bistupur",
        name: "Bistupur",
        context: "Central Jamshedpur",
        focus: "Retail fit-outs and bungalow renovations",
        copy:
          "Bistupur carries the city's commercial centre and some of its oldest planned housing, so the work here splits two ways: showroom and clinic fit-outs on the main roads, and careful renovation of large older bungalows behind them. The period homes usually need structural and services work — rewiring, plumbing, damp treatment — before any surface decision is worth making, and we scope them in that order.",
      },
      {
        slug: "kadma",
        name: "Kadma",
        context: "West Jamshedpur",
        focus: "Family homes and full-flat interiors",
        copy:
          "Kadma is settled, residential and quieter than the commercial belt, with a mix of independent houses and mid-rise flats. Most briefs here are whole-home: families who have lived in the space for years and want it reorganised around how they actually use it now, rather than restyled room by room.",
      },
      {
        slug: "sonari",
        name: "Sonari",
        context: "Riverside Jamshedpur",
        focus: "Bungalow interiors and light-led living spaces",
        copy:
          "Sonari sits along the Subarnarekha with generous plots and older bungalow stock. Light and cross-ventilation are the real assets here, so our layouts tend to open sightlines toward the river side and keep heavy joinery on the closed walls. Riverside humidity also shapes material choice — we favour engineered and treated surfaces over solid wood at ground level.",
      },
      {
        slug: "sakchi",
        name: "Sakchi",
        context: "Old Jamshedpur",
        focus: "Compact homes and shop interiors",
        copy:
          "Sakchi is the city's older market quarter: dense, busy, and tight on access. Flats and shops here are typically compact with awkward columns, so the gains come from millwork built to the millimetre rather than from moving walls. Delivery needs planning too — we schedule material movement around market hours to avoid losing days to access.",
      },
      {
        slug: "mango",
        name: "Mango",
        context: "North of the river",
        focus: "New apartment interiors",
        copy:
          "Mango has absorbed most of the city's recent apartment growth, which means a lot of handover-condition flats with builder-standard finishes. The usual brief is to take a bare shell to move-in ready in one contract — modular kitchen, wardrobes, false ceiling, lighting and painting — on a fixed timeline before the family shifts in.",
      },
      {
        slug: "adityapur",
        name: "Adityapur",
        context: "Saraikela-Kharsawan",
        focus: "Industrial offices and new-build homes",
        copy:
          "Adityapur is an industrial estate first, with residential growth following the factories. Work here is split between functional office and administrative-block interiors for manufacturing units — durable, low-maintenance, fast to install — and new houses for families settling near work.",
      },
      {
        slug: "telco",
        name: "Telco",
        context: "Company township",
        focus: "Quarters renovation and storage planning",
        copy:
          "Telco is township housing, which means standardised layouts and fixed footprints. The design problem is almost always storage: getting a growing family's things into a quarter that was planned decades ago, without making the rooms feel smaller. Modular, ceiling-height joinery does most of the work.",
      },
      {
        slug: "golmuri",
        name: "Golmuri",
        context: "East Jamshedpur",
        focus: "Township homes and hospitality interiors",
        copy:
          "Golmuri mixes company housing with independent plots and a steady run of small hospitality and clinic projects. The residential briefs are usually renovations of long-occupied homes; the commercial ones are short-turnaround fit-outs where the space has to reopen quickly, so we phase the work to keep part of the premises trading.",
      },
      {
        slug: "baridih",
        name: "Baridih",
        context: "East Jamshedpur",
        focus: "Quarters upgrades and kitchen remodels",
        copy:
          "Baridih is township and near-township housing close to the works. Kitchens and bathrooms are where most of the budget goes here — they are the oldest parts of these homes and the ones families feel daily — so we often stage projects to do those first and the rest later.",
      },
      {
        slug: "dimna",
        name: "Dimna",
        context: "Eastern edge",
        focus: "New builds and plotted houses",
        copy:
          "Dimna is where the city is still expanding, with plotted development and newer construction toward the lake. Because we are often involved before the building is finished, we can coordinate with the civil contractor on electrical points, plumbing runs and floor levels — which is far cheaper than correcting them after handover.",
      },
    ],
  },
  {
    id: "jharkhand",
    label: "Across Jharkhand",
    note: "Within a half-day drive. Full turn-key delivery with scheduled on-site supervision.",
    areas: [
      {
        slug: "ranchi",
        name: "Ranchi",
        context: "Jharkhand",
        focus: "Apartment interiors and professional offices",
        copy:
          "As the state capital, Ranchi brings a steady mix of new apartment interiors and offices for professional practices. Briefs here lean contemporary and are often decided remotely by clients working elsewhere, so we run these projects on a documented approval trail — drawings, finish samples and progress video — rather than assuming site visits.",
      },
      {
        slug: "dhanbad",
        name: "Dhanbad",
        context: "Jharkhand",
        focus: "Large independent homes",
        copy:
          "Dhanbad work is dominated by large independent houses for established business families, where the scope usually covers several floors at once. These projects reward planning that treats the whole building as one system — services, storage and circulation resolved together — instead of finishing one floor and improvising the next.",
      },
      {
        slug: "bokaro",
        name: "Bokaro",
        context: "Jharkhand",
        focus: "Sector housing and modular kitchens",
        copy:
          "Bokaro is a planned steel township laid out in sectors, so homes repeat in form and the design question is how to make a standard plan feel specific. Modular kitchens and built-in storage carry most projects here, with lighting doing the rest of the work to differentiate rooms that start out identical.",
      },
      {
        slug: "deoghar",
        name: "Deoghar",
        context: "Jharkhand",
        focus: "Guest houses and second homes",
        copy:
          "Deoghar's pilgrim traffic shapes its interiors: guest houses, lodges and family second homes that sit empty between visits and then run at full occupancy. That pattern favours hard-wearing, easily cleaned finishes and furniture that tolerates heavy intermittent use over delicate detailing.",
      },
    ],
  },
  {
    id: "regional",
    label: "Neighbouring states",
    note: "Regional projects run with milestone site visits and weekly video walk-throughs.",
    areas: [
      {
        slug: "kolkata",
        name: "Kolkata",
        context: "West Bengal",
        focus: "Compact flats and heritage renovation",
        copy:
          "Kolkata projects are usually about constraint: tight floor plates in newer high-rises, or old apartments with beautiful proportions and difficult services. Humidity is a real material consideration here, so we specify moisture-stable substrates and detail ventilation into joinery rather than treating it as an afterthought.",
      },
      {
        slug: "durgapur",
        name: "Durgapur",
        context: "West Bengal",
        focus: "Township homes and small commercial",
        copy:
          "Durgapur is another planned industrial town, with township housing alongside a growing private apartment market. Projects tend to be practical and budget-disciplined, and clients here usually want the full cost picture settled in the BOQ before anything starts.",
      },
      {
        slug: "asansol",
        name: "Asansol",
        context: "West Bengal",
        focus: "Family homes and retail fit-outs",
        copy:
          "Asansol is a regional commercial hub, so residential and retail briefs arrive in roughly equal measure — often from the same family. Retail work is scheduled around trading hours, and homes are usually phased so the family can stay in occupation while the project runs.",
      },
      {
        slug: "rourkela",
        name: "Rourkela",
        context: "Odisha",
        focus: "Sector housing and durable finishes",
        copy:
          "Rourkela is the closest major city across the Odisha border and, like Bokaro, is a planned steel township of repeating sector housing. The emphasis is on finishes that survive hard water and heavy use, and on storage that fits floor plans which were never generous to begin with.",
      },
      {
        slug: "bhubaneswar",
        name: "Bhubaneswar",
        context: "Odisha",
        focus: "New apartments and contemporary interiors",
        copy:
          "Bhubaneswar has grown quickly and most of our work there is in recently completed apartments taken from bare shell to move-in ready. Briefs skew contemporary and light, and because the buildings are new we can plan services properly rather than working around legacy wiring.",
      },
      {
        slug: "patna",
        name: "Patna",
        context: "Bihar",
        focus: "Apartment interiors and family homes",
        copy:
          "Patna combines dense older neighbourhoods with a fast-expanding apartment market along the newer corridors. Projects are frequently commissioned by families with members living outside the city, so remote approvals and scheduled progress reporting are built into how we run them.",
      },
    ],
  },
];

export const SERVICE_AREAS = SERVICE_BANDS.flatMap((band) => band.areas);

/** Slugs that still resolve as routes; everything else redirects to an anchor. */
export const AREAS_WITH_OWN_PAGE = SERVICE_AREAS.filter((a) => a.hasOwnPage).map((a) => a.slug);

export const findArea = (slug?: string) =>
  SERVICE_AREAS.find((a) => a.slug === (slug || "").toLowerCase());
