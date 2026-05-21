# Space Engineers Coordinate Registry

A static web app for collecting Space Engineers GPS coordinates for a server.

## What it does

The project has two pages:

- `index.html`: Trade Station Index
- `add.html`: Add Trade Stations
- `atlas.html`: Star System Navigator
- `center.html`: 3 Point Center Calculator

The Add Trade Stations page:

- Parses GPS strings like `GPS:Hollis Launchway:9674.61475777626:142623.007626683:-111462.180489533:#FF75C9F1:`
- Accepts bulk GPS entry, one coordinate per line
- Detects duplicates within 1 km using 3D distance
- Auto-detects nearest default Star System planet or moon
- Labels entries as surface, orbital, or deep space
- Copies saved GPS strings back to the clipboard
- Reads the 4-character faction tag from the GPS name and infers faction details

The Trade Station Index:

- Searches and filters saved coordinates
- Filters by trade need, such as ships/rovers, ore, components, weapons, or confirmed zone chips
- Shows station locations on the shared 3D map
- Runs locally with browser storage until Supabase is connected

The Star System Navigator:

- Shows the same default Star System map style
- Lists six Planet Jump Coord GPS points for each planet/body: X+, X-, Y+, Y-, Z+, and Z-
- Calculates travel time for a pasted route at a chosen velocity
- Draws the route line on the 3D map
- Supports one-way and two-way trip estimates

The 3 Point Center Calculator:

- Accepts exactly three GPS coordinates
- Calculates the average center point
- Shows the center as a copyable Space Engineers GPS string
- Draws the triangle and center point on the same star-system map style

## Run locally

Open `index.html` in a browser, or run a small static server from this folder.

```powershell
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Bulk Entry

Paste one GPS coordinate per line. Optional notes and submitter name are applied to every coordinate in that submission.

## Connect Supabase

1. Create a Supabase project.
2. Open the SQL editor and run `supabase-schema.sql`.
3. Put your project URL and anon key in `config.js`.

Deploy the folder to Cloudflare Pages, Vercel, Netlify, or GitHub Pages.

The app stays in local browser-storage mode while `config.js` is blank. Once both values are filled in, it switches to shared Supabase mode automatically.

## Factions

Users do not enter faction details. The app reads a 4-character faction tag from the GPS name using common patterns such as `[SPRT] Base`, `(SPRT) Base`, or `Supreme Shipbuilding SMSB`.

For vanilla economy factions, the app reads the full 4-character tag using the known faction-name tables from the Space Engineers NPC Factions wiki page. The first two characters infer the first part of the faction name, and the last two infer the trade type:

- Miner suffixes usually sell and buy ores/raw materials.
- Trader suffixes usually sell and buy components/general goods.
- Builder suffixes usually sell rovers, ships, and components.
- Zone chips are tracked explicitly from user submissions instead of being inferred.

Each coordinate card shows the inferred first name, second name, and faction type when the tag matches the built-in table.

The "Looking for" filter uses those inferred faction types:

- Ships or rovers: Builder factions
- Ore or raw materials: Miner factions
- Components or general goods: Trader and Builder factions
- Weapons or ammo: Pirate/special hostile factions
- Has zone chips: stations explicitly marked during submission or admin edit

## Detection constants

The app uses the vanilla/default Star System centers and approximate radii for:

- EarthLike
- Moon
- Mars
- Europa
- Alien
- Titan
- Triton
- Pertam

Surface is currently `<= 5 km` above the planet radius or anything below the radius. Orbital is anything up to `150 km` above the radius. These are easy to tune in `app.js`.
