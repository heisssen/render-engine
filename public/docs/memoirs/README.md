# Period quotes and page scans: "What if Germany attacked Russia first in 1914?"

Every quote below was checked word for word against the scanned page, using both the hOCR text layer and a look at the image. The full data is in `quotes.json`: file, page, original and English text, source URL, license, highlight box in image pixels, and the narration paragraph it supports.

- Book pages are full-resolution JPGs from Internet Archive. Each one is the original page image, not upscaled.
- `highlight_box` is `[x0, y0, x1, y1]` in pixels of the file as saved. It is measured from the OCR line boxes, padded by about 18 px, and covers whole lines.
- Translations marked `translated_by: "Switchyard"` are our own. The English-language books are quoted as printed.
- Text in `[...]` is editorial: it marks a cut or adds context, and is not on the page.

## What was found (33 quotes: 28 for screen, 5 for the article)

| para | id | source | page | file |
|---|---|---|---|---|
| 4 (+28) | moltke-now-you-can | Moltke, *Erinnerungen* 1922 | 23 | moltke1922_p23_nun_koennen_sie.jpg |
| 6 | moltke-half-hour | Moltke 1922 | 23 | moltke1922_p23_halbe_stunde.jpg |
| 12 | hoffmann-stay-defensive-west | Hoffmann, *Aufzeichnungen* Bd. 1, 1929 | 233 | hoffmann1929_bd1_p233_bleiben_wir_im_westen.jpg |
| 12 | kaiser-firebrand (dossier) | Wilhelm II, *My Memoirs* 1922 | 323 | wilhelm2_memoirs1922_p323_firebrand.jpg |
| 13 | reichsarchiv-ostaufmarsch-1913 | Reichsarchiv, *Der Weltkrieg* Bd. 1, 1925 | 17 | reichsarchiv1925_bd1_p17_ostaufmarsch.jpg |
| 15 | nicky-hague | Kautsky, *Outbreak of the World War* 1924 | 320 | kautsky1924_p320_nicky_hague.jpg |
| 16 | willy-unmistakable | Kautsky 1924 | 463 | kautsky1924_p463_willy_unmistakable.jpg |
| 17 | mobilmachung-extra-1914 | Uetersener Nachrichten extra, 2 Aug 1914 | sheet | uetersener_nachrichten_1914-08-02_mobilmachung.jpg |
| 18 | moltke-joyfully-excited | Moltke 1922 | 19 | moltke1922_p19_freudig_erregt.jpg |
| 18 | lichnowsky-neutral | Kautsky 1924 | 444 | kautsky1924_p444_lichnowsky_neutral.jpg |
| 19 | kaiser-whole-army-east | Moltke 1922 | 19 | moltke1922_p19_ganze_armee_osten.jpg |
| 20 | moltke-cannot-improvise | Moltke 1922 | 20 | moltke1922_p20_wuester_haufen.jpg |
| 21 | moltke-wild-heap | Moltke 1922 | 20 | moltke1922_p20_wuester_haufen.jpg |
| 23 | kaiser-your-uncle | Moltke 1922 | 20 | moltke1922_p20_ihr_onkel.jpg |
| 24 | moltke-tears | Moltke 1922 | 22 | moltke1922_p22_traenen.jpg |
| 24 | moltke-refuses-to-sign | Moltke 1922 | 22 | moltke1922_p22_traenen.jpg |
| 25 | ulflingen-station | Kautsky 1924 | 475 | kautsky1924_p475_ulflingen_station.jpg |
| 27 | george-misunderstanding | Kautsky 1924 | 471 | kautsky1924_p471_george_misunderstanding.jpg |
| 42 | ludendorff-samsonoff | Ludendorff, *My War Memories* vol. 1, 1919 | 57 | ludendorff1919_v1_p57_samsonoff.jpg |
| 42 | knox-samsonov-shot | Knox, *With the Russian Army* vol. 1, 1921 | 82 | knox1921_v1_p82_samsonov.jpg |
| 42 | ludendorff-90000 (dossier) | Ludendorff vol. 1 | 66 | ludendorff1919_v1_p66_90000_prisoners.jpg |
| 51 | ludendorff-novo-georgievsk | Ludendorff vol. 1 | 156 | ludendorff1919_v1_p156_novo_georgievsk.jpg |
| 53 | nyt-lusitania | New York Times, 8 May 1915 | p. 1 | nyt_1915-05-08_lusitania_sunk.png |
| 55 | falkenhayn-bleed-to-death (dossier) | Falkenhayn, *General Headquarters* 1919 | 217 | falkenhayn1919_p217_bleed_to_death.jpg |
| 62 | knox-bread-queues | Knox vol. 2, 1921 | 388 | knox1921_v2_p388_bread_queues.jpg |
| 71 | extrablatt-friede-ukraine | Lübeckische Anzeigen extra, 9 Feb 1918 | sheet | luebeckische_anzeigen_1918-02-09_friede_ukraine.jpg |
| 71 | ludendorff-ukraine-bread-corn | Ludendorff vol. 2, 1919 | 625 | ludendorff1919_v2_p625_ukraine_bread_corn.jpg |
| 73 | ludendorff-lenin | Ludendorff vol. 2 | 509 | ludendorff1919_v2_p509_lenin.jpg |
| 73 | churchill-plague-bacillus (dossier) | Churchill, *The Aftermath* 1929 | 63 | churchill1929_aftermath_p63_lenin_sealed_truck.jpg |
| 73 | trotsky-new-york | Trotsky, *My Life* 1930 | 270 | trotsky1930_p270_new_york.jpg |
| 77 | punch-in-flanders-fields | *Punch*, 8 Dec 1915 (first printing) | 468 | punch1915_v149_p468_in_flanders_fields.jpg |
| 83 | hoffmann-thin-air | Hoffmann 1929 | 234 | hoffmann1929_bd1_p234_luftstoss.jpg |
| none | grey-lamps (dossier) | Grey, *Twenty-Five Years* vol. 2, 1925 | 20 | grey1925_v2_p20_lamps.jpg |

## Corrections to the narration suggested by the sources

- **Para 25:** the Luxembourg report (Kautsky p. 475) says the German soldiers destroyed the Ulflingen/Troisvierges telegraph office. No scan found supports "the station clerk smashed his own telegraph".
- **Para 13:** the Reichsarchiv confirms "1913". The OCR text says 1915, but that is an OCR error.
- **Para 77:** the first printing reads "the poppies blow".

## Famous quotes or claims NOT verified

- **The Kaiser's "Now you can do what you want":** this exists only as Moltke's account (p. 23). The Kaiser's own memoirs (English 1922) never mention the 1 August scene.
- **Staabs, *Aufmarsch nach zwei Fronten* (1925), para 29–30:** no public-domain scan was found on Internet Archive, so the "four of seven armies by 15 August" claim is unverified.
- **Bread Peace figures (para 71):** "about a million tonnes expected, about 130,000 delivered, Germany's share 49,000" was not found in any period scan. Ludendorff p. 625 only says the bread-corn hoped for never came.
- **"A thousand calories a day" in the Turnip Winter (para 60):** not found in Starling, *Feeding of Nations* (1919).
- **The elder Moltke's "Woe to him who hurls the firebrand of war upon Europe!":** verified only as the Kaiser quoting it (p. 323), not in the elder Moltke's own text.
- **Falkenhayn's "bleed to death":** the page is verified, but historians dispute whether the "Christmas memorandum" was really written in 1915. Use it as "Falkenhayn later claimed".
- **Grey's "lamps are going out":** verified, but Grey himself gives it as a friend's later recollection.
- **Tolkien's foreword** ("all but one of my close friends were dead", 1966), Hemingway, Rommel's *Infanterie greift an* (1937) and anything by Hitler: not public domain or excluded. Not used.
- **Lusitania "128 Americans", the Zimmermann telegram, and press headlines for Tannenberg, Novogeorgievsk and the March 1918 Brest-Litovsk treaty:** Chronicling America (loc.gov), ANNO and Gallica all sit behind Cloudflare/Turnstile bot checks, which were not bypassed. The WTB *Amtliche Kriegsdepeschen* scan has unusable OCR, so the official Novogeorgievsk bulletin was not located.
- **Not used:** Paléologue, Sukhomlinov, Brusilov, Kerensky, Lenin's own texts, Tirpitz, Bethmann's *Betrachtungen* and Hindenburg. They were not mined for this pass, or no better matching line was found than those above.

## Licensing notes

- **Knox (d. 1964), Churchill (d. 1965) and Ybarra's 1922 translation of the Kaiser (translator d. 1971):** public domain in the US only. They are still in copyright in the UK/EU.
- **Trotsky's *My Life* (1930):** public domain in the US since 1 Jan 2026. Trotsky died in 1940.
- **Hoffmann's *Aufzeichnungen* (1929):** public domain in the US since 2025, and worldwide (author d. 1927). A ~1940 Koehler reprint with a 1939 publisher's preface was deliberately not used.
- **NYT Lusitania image:** 1500 px tall, below the 1600 px target. No larger public-domain copy was found.
- **Lübeck extra:** 1653 px tall.
- **Newspaper clippings:** both German extras come from Wikimedia Commons, tagged public domain.
