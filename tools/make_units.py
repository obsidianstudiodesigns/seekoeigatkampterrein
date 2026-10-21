"""Writes one detail page per accommodation into src/ (then run build.py).

Run:  python tools/make_units.py && python tools/build.py
Edit the UNITS list below to change copy, prices or photos.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# photos: (image name, alt text). The first photo is the page header.
UNITS = [
    {
        "slug": "staanplekke", "key": "staanplek", "name": "Staanplekke",
        "title": "Staanplekke vir woonwaens en tente",
        "tagline": "Groot staanplekke op gras, onder koelte bome langs die Olifantsrivier.",
        "price": "R480", "per": "per nag vir 4 persone",
        "desc": [
            "Seekoeigat het 28 staanplekke vir woonwaens en tente. Die meeste is op gras, onder groot koelte bome, en baie lê reg op die oewer van die Olifantsrivier.",
            "Elke staanplek is genommer en het sy eie braaier en vullisdrom. Daar is krag by die staanplekke en mooi, skoon ablusies naby: klein geboutjies met 'n stort, wasbak en toilet.",
        ],
        "facts": [("users", "4 persone ingesluit"), ("plus", "R120 per ekstra persoon"), ("users", "Maksimum 6 per staanplek"),
                  ("lightning", "Krag by die staanplek"), ("fire", "Eie braaier"), ("car", "1 voertuig ingesluit, R30 per ekstra voertuig"),
                  ("tent", "Maksimum een ekstra tent")],
        "photos": [("u-staan-02", "Grasstaanplek met braaier langs die rivier"), ("u-staan-01", "Staanplek in die skaduwee met die rivier agter"),
                   ("u-staan-04", "Woonwaens in 'n ry op die grasperk"), ("u-staan-05", "Oop grasstaanplek reg op die rivier"),
                   ("u-staan-03", "Staanplek onder 'n groot boom by die water"), ("u-staan-08", "Woonwa met afdak op die gras"),
                   ("u-staan-06", "Groot koelte boom op die kampeerterrein"), ("u-staan-07", "Genommerde staanplekke langs die rivier"),
                   ("u-staan-09", "Skaduryke staanplek op die rivieroewer"), ("u-staan-10", "Kampeerders se woonwaens en tente tussen die bome"),
                   ("u-staan-11", "Oggend op die kampeerterrein"), ("u-staan-12", "Genommerde staanplek met braaier"),
                   ("u-staan-13", "Motorfiets en tent op die gras"), ("u-staan-14", "Tente op die grasperk by die rivier"),
                   ("u-staan-15", "Ablusiegeboutjie van klip met stort en wasbak"), ("u-staan-16", "Wasbakke by die ablusieblok")],
    },
    {
        "slug": "safari-tente", "key": "safari", "name": "Safari-tente",
        "title": "Safari Tented Kamp",
        "tagline": "Ons nuutste toevoeging. Slaap in 'n safari-tent op 'n klipterras met uitsig oor die rivier.",
        "price": "R500", "per": "per nag vir 2 persone",
        "desc": [
            "Die safari-tente staan op 'n klipterras tussen die bome, net bo die rivier. Ingerig vir twee, met genoeg plek om lekker uit te span na 'n dag op die oewer.",
            "Elke tent het twee enkelbeddens, 'n LED-lig en krag, 'n eie braaier, twee stoele en 'n klein tafeltjie. Bring net jou eie beddegoed.",
        ],
        "facts": [("users", "2 persone"), ("tent", "Twee enkelbeddens"), ("lightning", "LED-lig en krag"),
                  ("fire", "Eie braaier"), ("house-line", "Twee stoele en 'n tafeltjie"), ("info", "Bring eie beddegoed")],
        "photos": [("u-safari-01", "Safari-tente op 'n klipterras tussen die bome"), ("u-safari-02", "Binne 'n safari-tent met twee enkelbeddens"),
                   ("u-safari-03", "Safari-tent met 'n vuur in die braaier"), ("u-safari-04", "Safari-tent snags met sagte lig"),
                   ("u-safari-05", "Uitsig vanaf die tent oor die rivier"), ("u-safari-06", "Die rivier deur die tent se gaasdeur"),
                   ("u-safari-07", "Safari-tent onder groot bome"), ("u-safari-08", "Twee enkelbeddens in die tent"),
                   ("u-safari-09", "Ry safari-tente op die terras"), ("u-safari-10", "Safari-tent met braaier voor"),
                   ("u-safari-11", "Safari-tent met tafel en stoele buite"), ("u-safari-12", "Braaivuur met die rivier agter"),
                   ("u-safari-13", "Uitsig oor die rivier vanaf die terras"), ("u-safari-14", "Vuur in die braaier voor 'n safari-tent")],
    },
    {
        "slug": "huisies", "key": "huisie", "name": "Huisies",
        "title": "Huisies",
        "tagline": "Selfsorg-huisies van klip en grasdak, met 'n eie stoep en braai-area.",
        "price": "R560", "per": "per nag vir 2 persone",
        "desc": [
            "Die huisies is gebou van klip met grasdakke, tussen die bome naby die rivier. Elkeen het 'n oop stoep met 'n kombuisbank, tafel en stoele, en 'n eie braai-area.",
            "Binne is daar twee driekwartbeddens, ingebou in klip. Tot vier persone kan die beddens deel. Die huisies is selfsorg, met gedeelde ablusie naby. Huisie 3 kan saam met die terras bespreek word vir 'n groter familie.",
        ],
        "facts": [("users", "2 persone ingesluit"), ("plus", "R120 per ekstra persoon"), ("users", "Maksimum 4 persone"),
                  ("house-line", "Twee driekwartbeddens"), ("fire", "Eie braai-area"), ("info", "Selfsorg, gedeelde ablusie")],
        "photos": [("u-huisie-01", "Huisie 3 se stoep met kombuisbank, tafel en stoele"), ("u-huisie-02", "Binne 'n huisie met twee beddens van klip"),
                   ("u-huisie-03", "Huisie met grasdak en stoep"), ("u-huisie-04", "Braai-area met uitsig oor die rivier"),
                   ("u-huisie-05", "Stoep en braai-area van 'n huisie"), ("u-huisie-06", "Binne 'n huisie met klipmure en 'n venster"),
                   ("u-huisie-07", "Uitsig vanaf die huisie oor die rivier"), ("u-huisie-08", "Huisie onder die bome"),
                   ("u-huisie-09", "Huisie met 'n grasdak tussen tuinplante"), ("u-huisie-10", "Sitplek by die braai-area"),
                   ("u-huisie-12", "Gedeelde ablusie met wasbakke")],
    },
    {
        "slug": "boskamp", "key": "boskamp", "name": "Boskamp",
        "title": "Boskamp",
        "tagline": "Afgesonderde grasperk en bos reg op die rivier, ideaal vir groepe en klubs.",
        "price": "R500", "per": "per nag vir 4 persone",
        "desc": [
            "Die boskamp is 'n rustige stuk grasperk en bos op die oewer van die Olifantsrivier, effens weg van die hoofterrein. Met plek vir tot tien staanplekke is dit ideaal vir 'n groep vriende, families of 'n klub.",
            "Bespreek 'n enkele staanplek, of huur die hele kamp vir 'n naweek sodat julle die plek vir julleself het.",
        ],
        "facts": [("users", "4 persone ingesluit"), ("plus", "R100 per ekstra persoon"), ("tent", "Maksimum 10 staanplekke"),
                  ("users", "Hele kamp R4 500 per gewone naweek"), ("calendar-blank", "Hele kamp R6 500 vir 'n langnaweek (4 nagte)")],
        "photos": [("u-boskamp-01", "Boom op die grasperk by die rivier in die boskamp"), ("u-boskamp-02", "Skaduryke grasperk met bome langs die water"),
                   ("u-boskamp-03", "Oop grasperk op die rivieroewer"), ("u-boskamp-04", "Woonwaens in die skaduwee van die bome"),
                   ("u-boskamp-05", "Grasperk wat afloop na die rivier"), ("u-boskamp-06", "Groen gras en riete by die water"),
                   ("u-boskamp-07", "Braaier op die grasperk langs die rivier"), ("u-boskamp-08", "Uitsig oor die rivier vanaf die boskamp")],
    },
    {
        "slug": "terras", "key": "terras", "name": "Terras by Huisie 3",
        "title": "Terras by Huisie 3",
        "tagline": "Plek vir tot twee karavane op die terras, naby genoeg aan staanplekke 1 en 2.",
        "price": "R480", "per": "per nag vir 4 persone",
        "desc": [
            "Die terras langs Huisie 3 bied plek vir tot twee karavane, met die rivier net 'n entjie verder. Dit is naby staanplekke 1 en 2, so groter families kan maklik naby mekaar kamp.",
            "Bespreek die terras saam met Huisie 3 sodat ouma en oupa onder dak slaap terwyl die res van die familie langsaan kamp.",
        ],
        "facts": [("users", "4 persone ingesluit"), ("plus", "R120 per ekstra persoon"), ("users", "Maksimum 6 persone"),
                  ("van", "Tot twee karavane"), ("house-line", "Langs Huisie 3")],
        "photos": [("u-terras-01", "Huisie 3 met die terras onder die bome"), ("u-terras-02", "Terras met die rivier in die agtergrond"),
                   ("u-terras-03", "Braai-area by die terras"), ("u-terras-04", "Huisie 3 se stoep"),
                   ("u-terras-05", "Binne Huisie 3"), ("u-terras-06", "Die terras se oop ruimte tussen die bome")],
    },
    {
        "slug": "wildkamp", "key": "wildkamp", "name": "Wildkamp",
        "title": "Wildkamp",
        "tagline": "Stil en ongerep, sonder krag. Net vier staanplekke, slegs vir groepe.",
        "price": "R480", "per": "per nag vir 4 persone",
        "desc": [
            "Vir groepe wat die bosveld op sy rustigste wil beleef. Die wildkamp het geen krag nie, net die bos, die sterre en die geluide van die nag.",
            "Daar is slegs vier staanplekke en die kamp word net aan groepe verhuur. Bespreek per nag, of die hele naweek vir R3 500.",
        ],
        "facts": [("users", "4 persone ingesluit, maksimum 6"), ("plus", "R50 per ekstra persoon"), ("tent", "Slegs 4 staanplekke"),
                  ("users", "Slegs groepe"), ("sun-horizon", "Geen krag"), ("calendar-blank", "R3 500 per naweek")],
        "photos": [("u-wild-01", "Rooibokke tussen die bosse"), ("u-wild-02", "Sonsondergang oor die bosveld"),
                   ("u-wild-03", "Oop veld met bosse"), ("u-wild-04", "Sonsondergang oor die toegangspad"),
                   ("u-wild-05", "Groen grasperk met bome"), ("u-wild-06", "Skemer oor die bos")],
    },
    {
        "slug": "lapa", "key": "lapa", "name": "Lapa en bos troues",
        "title": "Lapa en bos troues",
        "tagline": "Die groot lapa vir tot 20 gaste, of die hele terrein vir 'n saamtrek of 'n bos troue.",
        "price": "R1 800", "per": "per dag vir 20 persone",
        "desc": [
            "Die lapa is 'n groot onderdak area met 'n grasdak, sitplek, 'n kroeg area en 'n binnehof tussen die bome. Perfek vir verjaarsdae, klubbyeenkomste en saamtrekke.",
            "Vir 'n bos troue, \"iets anders\", kan die hele terrein vir 'n naweek gehuur word. Kontak ons vir 'n kwotasie.",
        ],
        "facts": [("users", "20 gaste ingesluit"), ("plus", "R50 per ekstra persoon"), ("house-line", "Grasdak lapa met sitplek"),
                  ("info", "Hele terrein R20 000 per gewone naweek"), ("calendar-blank", "Bos troues op kwotasie")],
        "photos": [("u-lapa-01", "Groot lapa met grasdak en sitplek"), ("u-lapa-02", "Binne die lapa met tafels en stoele"),
                   ("u-lapa-03", "Die lapa se kroeg area"), ("u-lapa-04", "Seekoeigat-bord in die lapa"),
                   ("u-lapa-05", "Tafel in die lapa met klipwerk"), ("u-lapa-06", "Binnehof by die lapa tussen die bome"),
                   ("u-lapa-07", "Gaste kuier saans by die lapa"), ("u-lapa-08", "Buite-sitplek by die lapa"),
                   ("u-lapa-09", "Lapa met grasdak tussen plante"), ("u-lapa-10", "Wit tent vir 'n bos troue op die grasperk"),
                   ("u-lapa-11", "Klokstent met stoele vir gaste"), ("u-lapa-12", "Sitplek in die binnehof")],
    },
]


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;")


def page(u):
    hero, hero_alt = u["photos"][0]
    facts = "\n".join(f'            <li>{{{{icon {i}}}}}<span>{t}</span></li>' for i, t in u["facts"])
    desc = "\n".join(f"          <p>{p}</p>" for p in u["desc"])
    shots = []
    for n, (img, alt) in enumerate(u["photos"]):
        cls = " feature" if n == 0 else ""
        sizes = "(max-width: 760px) 100vw, 66vw" if n == 0 else "(max-width: 760px) 50vw, 33vw"
        shots.append(f'        <figure class="shot{cls}" tabindex="0">{{{{img {img}|{alt}|{sizes}}}}}<figcaption>{alt}</figcaption></figure>')
    others = []
    for o in UNITS:
        if o is u:
            continue
        others.append(f'''        <a class="other" href="{o["slug"]}.html">
          {{{{img {o["photos"][0][0]}|{o["photos"][0][1]}|(max-width: 720px) 70vw, 22vw}}}}
          <span class="other-row"><b>{o["name"]}</b><span>{o["price"]}</span></span>
        </a>''')
    meta = {
        "title": f'{u["title"]} | Seekoeigat Kampterrein',
        "desc": f'{u["tagline"]} Vanaf {u["price"]} {u["per"]} by Seekoeigat Kampterrein op die Olifantsrivier naby Groblersdal.',
        "path": f'{u["slug"]}.html',
    }
    book = f'bespreek.html?verblyf={u["key"]}'
    return f'''<!-- @meta {json.dumps(meta, ensure_ascii=False)} -->
{{{{> head}}}}
<body>
{{{{> nav}}}}
<main id="inhoud">
  <section class="page-hero unit-hero">
    {{{{img {hero}|{hero_alt}|100vw||eager}}}}
    <div class="wrap">
      <a class="crumb" href="index.html#verblyf">{{{{icon caret-left}}}}Alle verblyf</a>
      <h1>{u["title"]}</h1>
      <p>{u["tagline"]}</p>
      <div class="unit-actions">
        <a class="btn btn-primary" href="{book}">Bespreek nou{{{{icon arrow-right}}}}</a>
        <a class="btn btn-glass" href="#fotos">{{{{icon binoculars}}}}Kyk rond</a>
      </div>
    </div>
  </section>

  <section class="section unit-intro">
    <div class="wrap unit-grid">
      <div class="unit-copy">
        <div class="unit-text" data-reveal>
{desc}
        </div>
        <ul class="unit-facts" data-reveal>
{facts}
        </ul>
      </div>
      <aside class="unit-card" data-reveal>
        <span class="unit-price">{u["price"]}</span>
        <span class="unit-per">{u["per"]}</span>
        <p>Kinders onder 3 bly gratis. Aankoms vanaf 13:00, vertrek teen 10:00. 'n Deposito van 50% bevestig jou bespreking.</p>
        <a class="btn btn-primary" href="{book}">Bespreek nou</a>
        <a class="btn btn-ghost" href="https://wa.me/27603514738?text={esc("Goeie dag, ek het 'n vraag oor " + u["name"] + " by Seekoeigat.").replace(" ", "%20")}" target="_blank" rel="noopener">{{{{icon whatsapp-logo}}}}Vra Sam op WhatsApp</a>
        <a class="link-arrow" href="tariewe.html">Alle tariewe en reëls{{{{icon arrow-right}}}}</a>
      </aside>
    </div>
  </section>

  <section class="section unit-photos" id="fotos" aria-labelledby="fotos-title">
    <div class="wrap">
      <div class="strip-head">
        <h2 id="fotos-title" data-reveal>Kyk rond.</h2>
        <span class="lead">{len(u["photos"])} foto's. Klik op 'n foto om dit groot te sien.</span>
      </div>
      <div class="shots" data-gallery>
{chr(10).join(shots)}
      </div>
    </div>
  </section>

  <section class="section unit-more" aria-labelledby="ander-title">
    <div class="wrap">
      <div class="strip-head">
        <h2 id="ander-title" data-reveal>Ander verblyf.</h2>
        <a class="btn btn-primary" href="{book}">Bespreek nou{{{{icon arrow-right}}}}</a>
      </div>
      <div class="others">
{chr(10).join(others)}
      </div>
    </div>
  </section>
</main>
{{{{> lightbox}}}}
{{{{> footer}}}}
{{{{> scripts}}}}
<script src="assets/js/gallery.js?v={{{{ver}}}}" defer></script>
</body>
</html>
'''


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    for u in UNITS:
        open(os.path.join(ROOT, "src", u["slug"] + ".html"), "w", encoding="utf-8", newline="\n").write(page(u))
    json.dump([{"slug": u["slug"], "key": u["key"], "name": u["name"]} for u in UNITS],
              open(os.path.join(ROOT, "tools", "units.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("units:", ", ".join(u["slug"] for u in UNITS))
