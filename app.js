const $ = s => document.querySelector(s);
const audio = $("#audio");
let currentTrack = null, queue = [], queueIndex = -1, searchTracks = [], localTracks = [], liked = JSON.parse(localStorage.getItem("suara-liked") || "[]"), playlists = JSON.parse(localStorage.getItem("suara-playlists") || "[]");
const AUDIUS_API = "https://api.audius.co/v1";
// Audius public API key (safe for client-side use per Audius developer docs).
// Personal-use Bearer token. WARNING: visible to anyone who can access this public frontend.
const AUDIUS_API_KEY = "0x59a6fbc278fb54292c1503cb6dbdcfdd381884f6";
const AUDIUS_BEARER_TOKEN = "ZcPIAl6sBmSXI4k4fSfe_PCp4gDzuyf8c5B70HjBEoU=";
function audiusUrl(path, params = {}) {
  const url = new URL(`${AUDIUS_API}${path}`);
  url.searchParams.set("api_key", AUDIUS_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}
let toastTimer;
const fmt = n => { if(!Number.isFinite(n)) return "0:00"; return `${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,"0")}`; };
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2500)}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function persist(){localStorage.setItem("suara-liked",JSON.stringify(liked));localStorage.setItem("suara-playlists",JSON.stringify(playlists))}
function trackKey(t){return t.key || `${t.source}-${t.title}-${t.artist}`}
function isLiked(t){return liked.some(x=>trackKey(x)===trackKey(t))}
function makeCard(t){const canDownload=!!t.downloadUrl;return `<article class="track-card"><div class="track-top"><div class="track-art">${t.image?`<img src="${esc(t.image)}" alt="">`:"♫"}</div><div class="track-info"><b title="${esc(t.title)}">${esc(t.title)}</b><small>${esc(t.artist||"Artis tidak diketahui")}</small></div></div><div class="track-meta">${esc(t.sourceLabel)}${t.duration?` · ${fmt(t.duration)}`:""}${t.license?` · ${esc(t.license)}`:""}</div><div class="track-actions"><button class="small-btn play" data-play="${esc(trackKey(t))}">▶ Putar</button><button class="small-btn" data-like="${esc(trackKey(t))}">${isLiked(t)?"♥":"♡"}</button><button class="small-btn" data-add="${esc(trackKey(t))}">＋ Playlist</button>${canDownload?`<a class="small-btn" href="${esc(t.downloadUrl)}" target="_blank" rel="noopener">↓ Unduh</a>`:""}</div></article>`}
function renderTracks(items,target){const el=$(target);if(!items.length){el.classList.add("empty-state");el.innerHTML="<p>Tidak ada hasil yang bisa ditampilkan.</p>";return}el.classList.remove("empty-state");el.innerHTML=items.map(makeCard).join("")}
function allTracks(){return [...searchTracks,...localTracks,...liked,...playlists.flatMap(p=>p.tracks||[])]}
function resolveTrack(key){return allTracks().find(t=>trackKey(t)===key)}
function playTrack(t,list){if(!t||!t.url){toast("Sumber audio tidak tersedia.");return}queue=list||[t];queueIndex=queue.findIndex(x=>trackKey(x)===trackKey(t));if(queueIndex<0)queueIndex=0;currentTrack=t;audio.src=t.url;audio.load();audio.play().then(()=>{$("#playBtn").textContent="Ⅱ";updatePlayer()}).catch(()=>toast("Browser tidak dapat memutar audio ini. Coba sumber atau file lain."));updatePlayer()}
function updatePlayer(){if(!currentTrack)return;$("#nowTitle").textContent=currentTrack.title;$("#nowArtist").textContent=currentTrack.artist||currentTrack.sourceLabel;$("#playerLike").textContent=isLiked(currentTrack)?"♥":"♡";$("#playerCover").innerHTML=currentTrack.image?`<img src="${esc(currentTrack.image)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`:"♫"}
function playNext(){if(!queue.length)return;queueIndex=(queueIndex+1)%queue.length;playTrack(queue[queueIndex],queue)}
function switchView(name){document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(`#${name}View`)?.classList.remove("hidden");document.querySelectorAll(".nav-item[data-view],.mobile-nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===name));window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".nav-item[data-view],.mobile-nav-item[data-view]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
$("#searchForm").addEventListener("submit",async e=>{e.preventDefault();const q=$("#searchInput").value.trim();if(!q)return;$("#resultsTitle").textContent=`Hasil untuk “${q}”`;$("#results").classList.add("empty-state");$("#results").innerHTML="<p>Mencari musik…</p>";$("#resultCount").textContent="";searchTracks=[];
 try{await searchAudius(q)}catch(err){console.error(err);$("#results").innerHTML=`<p>Gagal mengambil data. Periksa koneksi internet lalu coba lagi.<br><small>${esc(err.message||"API error")}</small></p>`;return}
 $("#resultCount").textContent=`${searchTracks.length} hasil`;renderTracks(searchTracks,"#results");});
async function searchAudius(q){
 const url=audiusUrl("/tracks/search",{query:q,limit:30});
 const r=await fetch(url,{headers:{Accept:"application/json",Authorization:`Bearer ${AUDIUS_BEARER_TOKEN}`}});
 if(!r.ok)throw new Error(`Audius API: ${r.status}`);
 const payload=await r.json();
 const records=Array.isArray(payload.data)?payload.data:[];
 searchTracks=records.filter(t=>t&&t.id&&t.title).map(t=>({
   key:`audius-${t.id}`,title:t.title,artist:t.user?.name||t.artist_name||"Artis Audius",
   url:audiusUrl(`/tracks/${encodeURIComponent(t.id)}/stream`),
   image:t.artwork?.["480x480"]||t.artwork?.["150x150"]||t.user?.profile_picture?.["480x480"]||"",
   duration:Number(t.duration)||0,source:"audius",sourceLabel:"Audius",
   license:"Periksa izin penggunaan dari kreator",permalink:t.permalink?`https://audius.co${t.permalink}`:""
 }));
 if(!searchTracks.length)toast("Tidak ada lagu ditemukan. Coba kata kunci lain.");
}
document.addEventListener("click",e=>{const p=e.target.closest("[data-play]");if(p){const t=resolveTrack(p.dataset.play);if(t)playTrack(t,searchTracks.includes(t)?searchTracks:[t]);return}const l=e.target.closest("[data-like]");if(l){const t=resolveTrack(l.dataset.like);if(!t)return;if(isLiked(t))liked=liked.filter(x=>trackKey(x)!==trackKey(t));else liked.unshift(t);persist();refreshLists();if(currentTrack)updatePlayer();return}const a=e.target.closest("[data-add]");if(a){const t=resolveTrack(a.dataset.add);if(!t)return;if(!playlists.length){toast("Buat playlist terlebih dahulu.");return}const p=playlists[0];if(!p.tracks.some(x=>trackKey(x)===trackKey(t)))p.tracks.push(t);persist();toast(`Ditambahkan ke ${p.name}`);}}
);
function refreshLists(){renderTracks(liked,"#likedList");$("#localCount").textContent=`${localTracks.length} lagu`;const el=$("#localList");if(localTracks.length){el.classList.remove("empty-state");el.innerHTML=localTracks.map(t=>`<div class="list-row"><div class="track-art">♫</div><div class="track-info"><b>${esc(t.title)}</b><small>File dari perangkat · ${esc(t.artist)}</small></div><button class="small-btn play" data-play="${esc(trackKey(t))}">▶ Putar</button><a class="small-btn" href="${esc(t.downloadUrl)}" download>↓ Simpan</a></div>`).join("")}else{el.classList.add("empty-state");el.innerHTML="<p>Belum ada file audio. Tambahkan lagu dari perangkatmu.</p>"}renderPlaylistNav()}
function renderPlaylistNav(){$("#playlistNav").innerHTML=playlists.map((p,i)=>`<button class="nav-item" data-playlist="${i}"><span>♫</span>${esc(p.name)}</button>`).join("");}
$("#fileInput").addEventListener("change",e=>{const files=[...e.target.files];files.forEach(f=>{if(!f.type.startsWith("audio/"))return;const url=URL.createObjectURL(f);localTracks.push({key:"local-"+Date.now()+"-"+Math.random(),title:f.name.replace(/\.[^.]+$/,""),artist:"File lokal",url,downloadUrl:url,source:"local",sourceLabel:"File lokal",duration:0})});refreshLists();toast(`${files.length} file ditambahkan`);e.target.value=""});
$("#newPlaylist").addEventListener("click",()=>$("#playlistDialog").showModal());
$("#playlistForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#playlistName").value.trim();if(!name)return;playlists.push({name,tracks:[]});persist();$("#playlistName").value="";$("#playlistDialog").close();renderPlaylistNav();toast("Playlist berhasil dibuat")});
document.addEventListener("click",e=>{const b=e.target.closest("[data-playlist]");if(!b)return;const p=playlists[Number(b.dataset.playlist)];if(!p)return;document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$("#playlistView").classList.remove("hidden");$("#playlistTitle").textContent=p.name;$("#playlistDescription").textContent=`${p.tracks.length} lagu dalam playlist ini`;renderTracks(p.tracks,"#playlistTracks")});
$("#playBtn").addEventListener("click",()=>{if(!audio.src){toast("Pilih lagu terlebih dahulu.");return}if(audio.paused)audio.play().then(()=>$("#playBtn").textContent="Ⅱ").catch(()=>toast("Audio tidak dapat diputar."));else{audio.pause();$("#playBtn").textContent="▶"}});
$("#nextBtn").addEventListener("click",playNext);$("#prevBtn").addEventListener("click",()=>{if(audio.currentTime>3){audio.currentTime=0;return}if(queue.length){queueIndex=(queueIndex-1+queue.length)%queue.length;playTrack(queue[queueIndex],queue)}});
audio.addEventListener("ended",playNext);audio.addEventListener("play",()=>$("#playBtn").textContent="Ⅱ");audio.addEventListener("pause",()=>$("#playBtn").textContent="▶");audio.addEventListener("timeupdate",()=>{if(audio.duration){$("#seekBar").value=audio.currentTime/audio.duration*100;$("#currentTime").textContent=fmt(audio.currentTime);$("#duration").textContent=fmt(audio.duration)}});audio.addEventListener("loadedmetadata",()=>$("#duration").textContent=fmt(audio.duration));audio.addEventListener("error",()=>{if(currentTrack)toast("File audio gagal dimuat. Coba lagu lain.")});$("#seekBar").addEventListener("input",e=>{if(audio.duration)audio.currentTime=audio.duration*Number(e.target.value)/100});$("#volumeBar").addEventListener("input",e=>audio.volume=Number(e.target.value));$("#playerLike").addEventListener("click",()=>{if(!currentTrack)return;const key=trackKey(currentTrack);if(isLiked(currentTrack))liked=liked.filter(t=>trackKey(t)!==key);else liked.unshift(currentTrack);persist();refreshLists();updatePlayer()});
refreshLists();