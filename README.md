![](https://img.shields.io/badge/Foundry-v13-informational)


# Dieses Modul dient als Abhängigkeit für meine Kartenmodule
Du kannst es aber auch für deine Karten verwenden. Hierzu musst du deine Lichter und Kacheln mit Tagger-Tags versehen
diese Tags kannst du dann wie folgt in deiner Karte speichern:

zuerst baust du dir selbst eine JSON zusammen, die die folgende Struktur besitzt:
```json
{
	"tiles": {
		"scriptoriumTileTag": "Der Tag deiner Scriptorium-Kachel", 
		"frameTileTag": "Der Tag deiner Rahmen-Kachel",
		"scenicTiles": [
			{
				"tag": "Zusätzliche Kachel",
				"icon": "fa-regular fa-icon"
		    	},
			{
				...
			}
		],
	},
	"lights": {
		"lanternTag": "Der Tag deiner Laternen-Lichter",
		"residenceTag": "Der Tag deiner Wohnhäuser-Lichter",
    	"citywallTag": "Der Tag deiner Stadtmauer-Lichter",
		"scenicLights": [
			{
				"tag": "Zusätzliches Licht",
				"icon": "fa-regular fa-icon"
		    	},
			{
				...
			}
		],
		"districtTags": [ "Stadtviertel", ... ],
		"specialTagsbyDistricts": {
			"Stadtviertel": ["Spezielle Tags", ...], //Stadtviertel hier müssen mit Stadtviertel aus "districtTags" übereinstimmen
      ...
		},
	}
}
```
In der JSON sind alle Eigenschaften optional, hast du also keine Lichter an den Stadtmauern, keinen Rahmen oder hast keinen generellen Tag für deine Wohnhäuser lässt du die entsprechende Zeile einfach aus.

Um die Daten jetzt als Flag zu deiner Szene hinzuzufügen öffnest du mit F12 die Konsole und gibst ein:
```
game.scenes.getName("<Name deiner Szene>").setFlag("dsa5", "lyynix-map-tags", <Hier die JSON>)
```

Wenn alles funktioniert hat, sollte mit diesem Befehl deine JSON in die Konsole ausgegeben werden und das Szenenmenü sollte in der Linken Spalte auftauchen.
```
game.scenes.getName("<Name deiner Szene>").getFlag("dsa5", "lyynix-map-tags")
```
