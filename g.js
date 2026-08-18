   async function loadGames() {
            container.innerHTML =
                '<div class="empty-state"><i class="fas fa-circle-notch fa-spin"></i><p>Loading games...</p></div>';
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
                    const res = await fetch(
                    "https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/games.json");
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
                            cover: g.image ? ('https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/' +
                                g.image) : getFallbackImage(title),
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
                            htmlUrl = htmlUrl.replace("{HTML_URL}",
                            "https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/games/");
                        } else {
                            htmlUrl = resolveGameUrl(htmlUrl);
                        }
                        let cover = (g.cover || g.img || "").replace("{COVER_URL}/", "");
                        let finalCover = cover.startsWith("http") ?
                            cover :
                            (cover ? 'https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/Icon/' + cover :
                                getFallbackImage(title));
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
                    const repos = ["tharun9772/ugs-1", "tharun9772/ugs-2", "tharun9772/ugs-3"];
                    let games = [];
                    let idx = 0;
                    for (const repo of repos) {
                        try {
                            const r = await fetch(`https://api.github.com/repos/${repo}/contents/`);
                            const d = await r.json();
                            d.forEach(f => {
                                if (f.type === "file" && f.name.startsWith("cl") && f.name.endsWith(".html")) {
                                    let clean = f.name.replace(/^cl/, "").replace(".html", "");
                                    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
                                    games.push({
                                        provider: 'ugs',
                                        name: clean,
                                        cover: "https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/5968517.png",
                                        url: `https://cdn.jsdelivr.net/gh/${repo}@main/${f.name}`,
                                        isAbsolute: true,
                                        addedOrder: idx++
                                    });
                                }
                            });
                        } catch (e) { console.warn("UGS fetch failed:", repo); }
                    }
                    allGames = games;

                } else if (provider === 'truffled') {
                    const proxyBase = truffledProxySelect.value.replace(/\/$/, "");
                    try {
                        await fetch(proxyBase + '/png/logo.png', { mode: 'no-cors', cache: 'no-store' });
                    } catch (err) {
                        blockedModal.style.display = 'flex';
                        container.innerHTML =
                            '<div class="empty-state"><i class="fas fa-ban" style="color:#ff4444;"></i><p style="color:#ff4444;">Proxy blocked. Please select another from Settings.</p></div>';
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
                    const res = await fetch(
                        'https://cdn.jsdelivr.net/gh/DominumNetwork/dominum@main/src/assets/libraries/seraph/games.json'
                        );
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
                container.innerHTML =
                    '<div class="empty-state"><i class="fas fa-exclamation-triangle" style="color:#ff4444;"></i><p style="color:#ff4444;">Failed to load games. Check console.</p></div>';
            }
        }
