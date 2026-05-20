# Supabase Setup

Use this when you are ready for one shared online database.

## 1. Create the project

Create a Supabase project, then open the project dashboard.

## 2. Run the schema

Open the Supabase SQL editor and run the full contents of `supabase-schema.sql`.

This creates:

- `coordinates` table
- duplicate-checking `submit_coordinate` function
- public read policy
- function permissions for public submissions

## 3. Fill in config.js

In the project dashboard, open Project Settings, then API.

Copy:

- Project URL
- anon public key

Paste them into `config.js`:

```js
window.SUPABASE_URL = "https://your-project.supabase.co";
window.SUPABASE_ANON_KEY = "your-anon-key";
```

## 4. Test locally

Refresh the local app. The top status should change from local demo mode to shared database mode.

## 5. Deploy

Deploy the `coordinate-registry` folder to your host. Make sure `config.js` is included.

## Later changes

Edit the files locally, test them, then redeploy or push to GitHub if your host is connected to a repo.
