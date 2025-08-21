import fs from "node:fs/promises";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, PLAYLIST_ID } = process.env;

async function getToken() {
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  const data = await r.json();
  if (!data.access_token) throw new Error("No token");
  return data.access_token;
}

async function fetchAllTrackUris(token, playlistId) {
  let items = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=items(track(uri,is_local,restrictions)),next`;
  while (url) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Spotify error ${r.status}`);
    const data = await r.json();
    items = items.concat(
      (data.items || [])
        .map(i => i.track)
        .filter(t => t && t.uri && !t.is_local && (!t.restrictions || !t.restrictions.reason))
        .map(t => t.uri)
    );
    url = data.next;
  }
  return items;
}

async function main() {
  const token = await getToken();
  const uris = await fetchAllTrackUris(token, PLAYLIST_ID);

  // Ensure public/ exists; write tracks.json
  await fs.mkdir("public", { recursive: true });
  await fs.writeFile("public/tracks.json", JSON.stringify({ uris }, null, 2));
  console.log(`Wrote ${uris.length} URIs to public/tracks.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});