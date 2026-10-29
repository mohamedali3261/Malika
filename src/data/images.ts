/**
 * External editorial imagery (Pexels CDN) so the single-file build stays light.
 * Card images are requested at 800px; the hero gets a larger crop.
 */
const base = "https://images.pexels.com/photos";
const card = "?auto=compress&cs=tinysrgb&fit=crop&w=800&h=1100";

export const IMG = {
  hero: `${base}/31022283/pexels-photo-31022283.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900&h=1300`,
  minimalWhite: `${base}/27357173/pexels-photo-27357173.jpeg${card}`,
  magazines: `${base}/30405427/pexels-photo-30405427.jpeg${card}`,
  redBlack: `${base}/31847827/pexels-photo-31847827.jpeg${card}`,
  smoke: `${base}/31022283/pexels-photo-31022283.jpeg${card}`,
  glass: `${base}/7364096/pexels-photo-7364096.jpeg${card}`,
  blue: `${base}/20419734/pexels-photo-20419734.jpeg${card}`,
  chanel: `${base}/11122042/pexels-photo-11122042.jpeg${card}`,
  hand: `${base}/40397481/pexels-photo-40397481.jpeg${card}`,
  shell: `${base}/16266295/pexels-photo-16266295.jpeg${card}`,
  anemone: `${base}/7814961/pexels-photo-7814961.jpeg${card}`,
  stone: `${base}/27357179/pexels-photo-27357179.jpeg${card}`,
  incense: `${base}/7814956/pexels-photo-7814956.jpeg${card}`,
  stoneRed: `${base}/31847826/pexels-photo-31847826.jpeg${card}`,
  stonesFloral: `${base}/7814959/pexels-photo-7814959.jpeg${card}`,
  blackRed: `${base}/31847821/pexels-photo-31847821.jpeg${card}`,
  grayStones: `${base}/7814957/pexels-photo-7814957.jpeg${card}`,
  shadow: `${base}/34036480/pexels-photo-34036480.jpeg${card}`,
  wood: `${base}/15096784/pexels-photo-15096784.jpeg${card}`,
  atelier:
    "https://images.pexels.com/photos/8450127/pexels-photo-8450127.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1400&h=900",
  atelierHands:
    "https://images.pexels.com/photos/8450122/pexels-photo-8450122.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1400&h=900",
  bottleEditorial:
    "https://images.pexels.com/photos/7814961/pexels-photo-7814961.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1000&h=1300",
} as const;
