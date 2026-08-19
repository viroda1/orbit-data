window.orbitGames = [
  { name: "2048", category: "Puzzle", url: "https://play2048.co/", mark: "2" },
  { name: "TETR.IO", category: "Arcade", url: "https://tetr.io/", mark: "T" },
  { name: "Agar.io", category: "Action", url: "https://agar.io/", mark: "A" },
  { name: "Diep.io", category: "Action", url: "https://diep.io/", mark: "D" },
  { name: "Slither.io", category: "Arcade", url: "https://slither.io/", mark: "S" },
  { name: "Shell Shockers", category: "Shooter", url: "https://shellshock.io/", mark: "S" },
  { name: "Krunker", category: "Shooter", url: "https://krunker.io/", mark: "K" },
  { name: "Chess", category: "Strategy", url: "https://chess.org/", mark: "C" },
];
async function loadGames() { 
  container.innerHTML = '<div class="empty-state"><i class="fas fa-circle-notch fa-spin"></i><p>Loading games...</p></div>'; 
  allGames = []; 
  const provider = providerSelect.value; 
  
  try { 
    if (provider === 'gn-math') { 
      const res = await fetch("https://cdn.jsdelivr.net/gh/freebuisness/assets/zones.json"); 
      const raw = await res.json(); 
      allGames = raw.filter(g => g.id !== -1 && !g.name.startsWith("[!]")).map((z, i) => { 
        let coverUrl = (z.cover || "").replace('{COVER_URL}', ''); 
        if (coverUrl.startsWith('/')) coverUrl = coverUrl.substring(1); 
        return { 
          provider: 'gn-math', 
          name: z.name, 
          cover: 'https://cdn.jsdelivr.net/gh/freebuisness/covers@main/' + coverUrl, 
          url: z.url, 
          isAbsolute: z.url.startsWith('http'), 
          addedOrder: i 
        }; 
      }); 
    } else if (provider === 'elite') { 
      const res = await fetch("https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/games.json"); 
      const data = await res.json(); 
      allGames = data.map((g, i) => { 
        let title = g.title || g.name || "Unknown Game"; 
        let url = g.url; 
        if (!url.startsWith('http')) { 
          url = "https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/" + url; 
        } 
        return { 
          provider: 'elite', 
          name: title, 
          cover: g.image ? ('https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/' + g.image) : getFallbackImage(title), 
          url: url, 
          isAbsolute: true, 
          addedOrder: i 
        }; 
      }); 
    } else if (provider === 'sea-bean') { 
      const res = await fetch("https://cdn.jsdelivr.net/gh/sea-bean-unblocked/sde@main/zzz.json"); 
      const data = await res.json(); 
      allGames = data.map((g, i) => { 
        let title = g.name || g.id || "Unknown Game"; 
        let htmlUrl = g.html || g.url || ""; 
        if (htmlUrl.includes("{HTML_URL}")) { 
          htmlUrl = htmlUrl.replace("{HTML_URL}", "https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/games/"); 
        } else { 
          htmlUrl = resolveGameUrl(htmlUrl); 
        } 
        let cover = (g.cover || g.img || "").replace("{COVER_URL}/", ""); 
        let finalCover = cover.startsWith("http") ? cover : (cover ? 'https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/Icon/' + cover : getFallbackImage(title)); 
        return { 
          provider: 'sea-bean', 
          name: title, 
          cover: finalCover, 
          url: htmlUrl, 
          isAbsolute: true, 
          addedOrder: i 
        }; 
      }); 
    } else if (provider === 'ugs') { 
      // FIX: Fetching a single index file from jsDelivr avoids GitHub's 60 req/hour rate limit
      const res = await fetch("https://jsdelivr.net");
      const data = await res.json(); 
      allGames = data.map((g, i) => ({
        provider: 'ugs',
        name: g.name,
        cover: "https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/5968517.png",
        url: g.url,
        isAbsolute: true,
        addedOrder: i
      }));
    } else if (provider === 'truffled') { 
      const proxyBase = truffledProxySelect.value.replace(/\/$/, ""); 
      try { 
        await fetch(proxyBase + '/png/logo.png', { mode: 'no-cors', cache: 'no-store' }); 
      } catch (err) { 
        blockedModal.style.display = 'flex'; 
        container.innerHTML = '<div class="empty-state"><i class="fas fa-ban" style="color:#ff4444;"></i><p style="color:#ff4444;">Proxy blocked. Please select another from Settings.</p></div>'; 
        return; 
      } 
      const res = await fetch("https://cdn.jsdelivr.net/gh/aukak/truffled@main/public/js/json/g.json"); 
      const data = await res.json(); 
      allGames = (data.games || []).map((g, i) => { 
        let rawUrl = g.url; 
        let gameUrl = g.url; 
        let thumb = g.thumbnail; 
        if (!gameUrl.startsWith('http')) { 
          gameUrl = proxyBase + (gameUrl.startsWith('/') ? '' : '/') + gameUrl; 
        } 
        if (!thumb.startsWith('http')) { 
          thumb = proxyBase + (thumb.startsWith('/') ? '' : '/') + thumb; 
        } 
        return { 
          provider: 'truffled', 
          name: g.name, 
          cover: thumb, 
          url: gameUrl, 
          rawUrl: rawUrl, 
          isAbsolute: g.url.startsWith('http'), 
          frameType: g.frameType || 'iframe', 
          addedOrder: i 
        }; 
      }); 
    } else if (provider === 'seraph') { 
      const res = await fetch('https://cdn.jsdelivr.net/gh/DominumNetwork/dominum@main/src/assets/libraries/seraph/games.json'); 
      const data = await res.json(); 
      allGames = data.map((g, i) => { 
        const path = g.url.endsWith('index.html') ? g.url : g.url.replace(/\/?$/, '/index.html'); 
        return { 
          provider: 'seraph', 
          name: g.name, 
          cover: g.img || getFallbackImage(g.name), 
          url: resolveGameUrl(path, 'seraph'), 
          isAbsolute: true, 
          addedOrder: i 
        }; 
      }); 
    } else if (provider === 'petezah') { 
      const res = await fetch("https://cdn.jsdelivr.net/gh/PeteZah-G/singlefile-json@main/search.json"); 
      const data = await res.json(); 
      allGames = (data.games || []).map((g, i) => { 
        let finalUrl = g.url; 
        if (finalUrl && !finalUrl.endsWith('index.html') && !finalUrl.match(/\.\w+$/)) { 
          finalUrl = finalUrl.replace(/\/$/, '') + '/index.html'; 
        } 
        return { 
          provider: 'petezah', 
          name: g.label, 
          cover: g.imageUrl || getFallbackImage(g.label), 
          url: finalUrl, 
          isAbsolute: finalUrl.startsWith('http'), 
          addedOrder: i, 
          categories: g.categories || [] 
        }; 
      }); 
    } 
    applyFilters(); 
  } catch (e) { 
    console.error(e); 
    container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle" style="color:#ff4444;"></i><p style="color:#ff4444;">Failed to load games. Check console.</p></div>'; 
  } 
}
