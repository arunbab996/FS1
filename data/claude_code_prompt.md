I need you to add 10 people to this FirstSignal prototype and fill in their profile pages, so my dev team can see exactly what the finished product should show.

The data is in `fs_people.json` (I'll drop it in the repo root, or tell you where it is). It is placeholder data for the prototype. Credentials text was drafted by Claude as a stand-in for what the OpenAI prompts will produce later.

## Step 1: read the repo first, change nothing yet
Find out and tell me in a few lines:
- how people are stored today (a data file, a mock array, an API route)
- which component renders a person tile and which renders the profile page
- which profile sections already exist (Credentials, Founder DNA, Social Activity, About, Experience, and so on)
Reuse what exists. Do not redesign the layout, restyle components or rename things.

## Step 2: add the 10 people
Add the people from `fs_people.json` the same way existing people are stored. Keep the names, text and numbers exactly as written. Do not invent data. Do not rewrite any wording.

Tile view: use the fields the tile already has (name, current role or headline, location, and so on). Fill them from `headline` (or `current_title` when `headline` is null), `location`, and the first line of `credentials.career_summary` if the tile has room for a summary.

## Step 3: fill the profile page
Map each field to the right place:
- Header: `name`, `headline` or `current_title`, `location`, `linkedin_url` as the LinkedIn link.
- About: `about`. Several people have none. Hide the section when it is null.
- Experience and Education: `experience` and `education`. Dates are `YYYY-MM`, and `end: null` means present.
- Credentials has five categories, in this order: Pedigree, Career signals, Affiliations, Recognition and media, Track record.
  - Track record is new. Add it using the same pattern as the other four. Give it its own color.
  - Show `credentials.career_summary` as a one-line trajectory at the top of Career signals.
  - Each item has `title` and `detail`. Show them as a title with the detail under it. Also show `year` and `tag` if the design has a place for them.
  - Show `confidence` and `claim_type` quietly (a small label). Put `evidence` (a field path and a quote) behind a small "Evidence" toggle. If the design has no place for it, skip it and tell me.
  - Hide a category that has no items, or show a short empty state, whichever matches the existing pattern. Do not pad empty categories.
- Founder DNA: show one tile with an icon, the `label` as the heading and the `subtitle` under it. For `Not a founder`, use a neutral style. The `ventures` list can sit behind a toggle if there is room. Do not recalculate anything, just display what is in the file.
- Insight section (Signals): each person has `signals`, a list of the Equity cards from FirstSignal, newest first. Show `card_text` as the card line and `date` next to it. `type` can pick the icon: EVERTRACE and NEW_COMPANY are news items, SELF_SOURCED and STRATEGIC_INTELLIGENCE_TALENT are sourcing items, INVESTOR_INTEREST is a handshake. `score` and `ai_*` fields (`ai_bucket`, `ai_reason`, `ai_pros`, `ai_cons`) are optional detail, keep them behind a toggle or skip them and tell me. Do not recompute or reword anything. A person with one signal shows one card.
- Social Activity: there is no data yet. Keep whatever empty state exists.

## Step 4: tell me what did not map
List every field in the file that has no place in the current design, and every existing section I have no data for. Do not drop data silently and do not invent UI to hold it.

## Rules
- No em dashes in any text you write.
- Do not change the Credentials wording in the file. If something looks wrong, tell me and leave it.
- Work on a new branch called `add-10-profiles`. Do not push to main or deploy without asking me.

## Check before you say it's done
- Run the app locally and open all 10 profile pages and the tile view.
- Check these four: Don Liu (4 pedigree items, no founder history), Rahul Bhati (all 5 categories filled), Anil Amesur (empty Pedigree, Serial founder), Avi Singh (Affiliations, Recognition and Track record all empty).
- Check phone width has no sideways scroll.
- Give me a short list of what you did, what did not map, and any screenshots of those four pages.
