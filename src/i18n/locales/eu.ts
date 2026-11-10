import type { Messages } from "./en";

export const eu: Messages = {
	// shared
	"common.cancel": "Utzi",
	"common.continue": "Jarraitu",
	"common.delete": "Ezabatu",
	"common.done": "Eginda",
	"common.edit": "Editatu",

	// feed
	"feed.search": "Bilatu zure argitalpenetan",
	"feed.all": "Denak",
	"feed.empty":
		"Hemen ez dago ezer oraindik.\nHala ere, kontatu dena. Inork ez dizu begiratzen.",
	"feed.loading": "Zure oharrak kargatzen…",
	"feed.noMatch": "Ez dago bat datorren argitalpenik.",
	"feed.fallbackBanner":
		"Ezin da zure oharren karpetara sartu, beraz aplikazioaren biltegiratzea erabiltzen ari da. Sakatu karpeta bat berriro aukeratzeko.",
	"feed.you": "zu",
	"feed.deleteTitle": "Argitalpen hau ezabatu?",
	"feed.deleteBody":
		".md fitxategia ezabatuko da. (Inork ez zuen ikusi, hala ere.)",
	"feed.resetTitle": "Dena ezabatu?",
	"feed.resetBody":
		"Honek zure oharren karpetako ohar guztiak betiko ezabatzen ditu, baita like eta ezarpen guztiak ere, eta aplikazioa berrezartzen du. Ezin da desegin.",
	"feed.resetSureTitle": "Guztiz ziur zaude?",
	"feed.resetSureBody": "Ohar guztiak ezabatuko dira.",
	"feed.resetSureConfirm": "Ezabatu dena",
	"feed.resetFailed": "Ezin izan da berrezarri",

	// post card
	"post.edited": " · editatua",
	"time.now": "oraintxe bertan",
	"time.minutes": "{n} min",
	"time.hours": "{n} h",
	"time.days": "{n} egun",

	// composer
	"composer.titlePlaceholder": "Izenburua (aukerakoa)",
	"composer.bodyPlaceholder": "Zer duzu buruan? (inork ez du ikusiko)",
	"composer.tagAdd": "Gehitu etiketa bat",
	"composer.tagAddAnother": "Gehitu beste bat",
	"composer.removeTag": "Kendu {tag} etiketa",
	"composer.post": "Argitaratu",
	"composer.save": "Gorde",
	"composer.showMarkdown": "Erakutsi Markdown kodea",
	"composer.showLive": "Itzuli zuzeneko formatura",
	"tool.bold": "Lodia",
	"tool.italic": "Etzana",
	"tool.strike": "Marratua",
	"tool.link": "Esteka",
	"tool.image": "Irudia",
	"tool.heading": "Goiburua",
	"tool.quote": "Aipua",
	"tool.code": "Kode-blokea",
	"tool.bullets": "Buletdun zerrenda",
	"tool.numbers": "Zenbakidun zerrenda",
	"tool.checklist": "Zeregin-zerrenda",

	// images and links in posts
	"image.vaultUnreadable":
		"Ezin da gordailuaren karpeta ireki. Aukeratu berriro Ezarpenetan.",
	"image.looking": "Irudia bilatzen…",
	"image.notFound": "Ez da irudia aurkitu gordailuan: {name}",
	"image.loadFailed": "Ezin izan da irudia kargatu.",
	"link.openFailed": "Ezin izan da esteka ireki",

	// errors
	"error.savePost": "Ezin izan da argitalpena gorde",
	"error.saveChanges": "Ezin izan dira aldaketak gorde",
	"error.deletePost": "Ezin izan da argitalpena ezabatu",

	// settings
	"settings.title": "Ezarpenak",
	"settings.language": "Hizkuntza",
	"settings.languageHint":
		"“Sistemaren lehenetsia” zure telefonoaren hizkuntza jarraitzen du, eta ingelesa erabiltzen du zure hizkuntza erabilgarri ez badago.",
	"settings.languageSystem": "Sistemaren lehenetsia",
	"settings.haptics": "Bibrazioa",
	"settings.hapticsToggle": "Ukipen-erantzuna",
	"settings.hapticsHint": "Bibrazio laburrak botoiak sakatzean.",
	"settings.hapticsTriggers": "Aukeratu zerk egiten duen bibrazioa",
	"settings.hapticsStrength": "Bibrazioaren indarra",
	"settings.hapticsStrengthHint":
		"Irristatu eskuinera bibrazio biziagoa lortzeko.",
	"haptics.done": "Eginda botoia",
	"haptics.save": "Gorde / Argitaratu botoia",
	"haptics.cancel": "Utzi (editorea itxi)",
	"haptics.menu": "⋯ menuko botoia",
	"haptics.action": "Editatu eta Ezabatu botoiak",
	"haptics.settings": "Ezarpenen botoia",
	"haptics.refresh": "Tira eguneratzeko",
	"haptics.compose": "Argitalpen berriaren botoia",
	"haptics.checklist": "Zeregin bat markatzea",
	"haptics.tag": "Etiketa bat ukitzea",
	"haptics.delete": "Ezabatzea berrestea",
	"haptics.error": "Erroreak",
	"settings.folder": "Karpeta",
	"settings.folderHint":
		"Argitalpen bakoitza .md fitxategi gisa gordetzen da, bere izenburuaren izenarekin eta etiketak goian dituela. Karpetaz aldatzeak ez ditu lehendik dauden oharrak mugitzen.",
	"settings.chooseFolder": "Aukeratu karpeta",
	"settings.useAppStorage": "Erabili aplikazioaren biltegiratzea",
	"folder.appStorage": "Aplikazioaren biltegiratzea (lehenetsia)",
	"settings.obsidian": "Obsidian",
	"settings.obsidianHint":
		"![[photo.png]] bezala idatzitako irudiak erakusten ditu zure gordailutik, eta “- [ ]” eta “- [x]” lerroak sakatu daitezkeen kontrol-laukiak bihurtzen ditu (Markdown ikuspegian izan ezik). Gordailuaren karpeta bat behar du funtzionatzeko.",
	"settings.noVault":
		"Ez da gordailurik aukeratu. Obsidian desaktibatuta egongo da bat aukeratu arte.",
	"settings.vaultHint":
		"Aukeratu zure Obsidian gordailua (.obsidian karpeta daukan karpeta). Irudiak bertan bilatzen dira, izenaren edo bidearen arabera. Aplikazioak fitxategiak gehitzen ditu gordailura soilik (irudiak, ahots-oharrak, pantaila-grabaketak); ez du inoiz lehendik dagoena aldatzen edo ezabatzen.",
	"settings.clear": "Garbitu",

	// pictures, voice notes and screen recordings saved in the vault
	"media.addImage": "Gehitu irudia",
	"media.recordAudio": "Grabatu ahots-oharra",
	"media.recordScreen": "Grabatu pantaila",
	"media.recordingAudio": "Ahots-oharra grabatzen",
	"media.recordingScreen": "Pantaila grabatzen",
	"media.saving": "Gordailuan gordetzen…",
	"media.stop": "Gelditu",
	"media.failed": "Ezin izan da gordailuan gorde",
	"media.needVault": "Aukeratu lehenik zure gordailua Ezarpenetan.",
	"media.micDenied":
		"Mikrofonoa ez dago baimenduta. Aktibatu telefonoaren ezarpenetan.",
	"media.nothingRecorded": "Ez da ezer grabatu.",
	"settings.media": "Irudiak, ahots-oharrak eta bideoak",
	"settings.mediaHint":
		"Zure gordailuaren barruko karpetak, fitxategi berriak gordetzeko, gordailuaren karpetatik idatziak (adibidez Attachments/Audio). Falta diren karpetak sortzen dira. Fitxategiek data eta orduaren izena dute, 20261107125555 bezala. Irudiak WebP formatuan gordetzen dira %100eko kalitatearekin, ahots-oharrak AAC konprimituan (.m4a) eta pantaila-grabaketak MP4 konprimituan.",
	"settings.mediaImages": "Irudien karpeta",
	"settings.mediaAudio": "Ahots-oharren karpeta",
	"settings.mediaVideo": "Pantaila-grabaketen karpeta",
	"settings.mediaRoot": "Gordailuaren karpeta bera",

	// quality of voice notes and screen recordings, and the player
	"settings.voice": "Ahots-oharrak",
	"settings.voiceHint":
		"Zenbaki txikiagoek fitxategi txikiagoak sortzen dituzte. 64 kbps-ko monoa argia da hitz egiteko; erabili estereoa eta 128 kbps edo gehiago musikarako.",
	"settings.channels": "Kanalak",
	"settings.mono": "Mono",
	"settings.stereo": "Estereo",
	"settings.compression": "Konpresioa",
	"settings.screen": "Pantaila-grabaketak",
	"settings.screenHint":
		"H.265 (HEVC) formatuak H.264 baino heren bat txikiagoak diren fitxategiak sortzen ditu kalitate berarekin, baina ordenagailu batzuek ezin dute erreproduzitu. Zure telefonoak grabatu ditzakeen kodekak bakarrik erakusten dira. 2 Mbps-k testua argi erakusten du telefono batean.",
	"settings.codec": "Kodeka",
	"player.play": "Erreproduzitu",
	"player.pause": "Pausatu",
	"player.playVideo": "Erreproduzitu bideoa",
	"player.notFound": "ez dago gordailuan",
	"settings.user": "Erabiltzailea",
	"settings.showNickname": "Erakutsi ezizena",
	"settings.showNicknameHint":
		"Izena ezkutatzen du argitalpenetan eta editorean.",
	"settings.nicknamePlaceholder": "Ezizena",
	"settings.showAvatar": "Erakutsi avatarra",
	"settings.showAvatarHint":
		"Avatarra ezkutatzen du argitalpenetan eta editorean.",
	"settings.changePhoto": "Aldatu argazkia",
	"settings.choosePhoto": "Aukeratu argazkia",
	"settings.removePhoto": "Kendu argazkia",
	"settings.ui": "Interfazea",
	"settings.likes": "Like faltsuak",
	"settings.likesHint":
		"Desaktibatuta, kontagailua ezkutatzen da eta like berriak gelditzen dira. Dauden kopuruak gorde egiten dira.",
	"settings.maxChars": "Karaktereak argitalpen bakoitzeko",
	"settings.maxCharsHint":
		"{min} eta {max} artean. Dagoeneko idatzi dituzun argitalpenak ez dira inoiz mozten.",
	"settings.maxTags": "Etiketak argitalpen bakoitzeko",
	"settings.maxTagsHint":
		"{min} eta {max} artean. 0 jartzean etiketen kutxa ezkutatzen da idaztean.",
	"settings.theme": "Gaia",
	"settings.presets": "Aurrezarpenak",
	"role.background": "Atzeko planoa",
	"role.card": "Argitalpen-txartela",
	"role.text": "Testua",
	"role.accent": "Kontrastea / azentua",
	"color.custom": "Kolore pertsonalizatua",
	"color.hue": "Tonua",
	"color.saturation": "Saturazioa",
	"color.lightness": "Argitasuna",
	"color.hex": "Hex kodea",
	"color.apply": "Aplikatu",
	"settings.themeTransfer": "Gaiak partekatu",
	"settings.exportTheme": "Esportatu gaia",
	"settings.importTheme": "Inportatu gaia",
	"settings.importHint":
		"Itsatsi aplikazio honetatik edo kolore-izen berdinak erabiltzen dituen edozein aplikaziotatik esportatutako gai bat: background, card, text eta accent.",
	"settings.importInvalid":
		"Hori ez da baliozko gai bat. background, card, text eta accent behar ditu, bakoitza #RRGGBB kolore gisa.",
	"settings.importButton": "Inportatu",
	"code.copy": "Kopiatu kodea",
	"code.copied": "Kopiatuta",
	"preset.navy": "Itsas urdina",
	"preset.midnight": "Gauerdia",
	"preset.paper": "Papera",
	"preset.forest": "Basoa",
	"preset.grape": "Mahatsa",
	"settings.reset": "Berrezarri",
	"settings.resetHint":
		"Zure oharren karpetako ohar guztiak ezabatzen ditu, baita like eta ezarpen guztiak ere, eta aplikazioa lehen aldiz irekitzean zegoen moduan uzten du. Ezin da desegin.",
	"settings.resetButton": "Ezabatu ohar guztiak eta berrezarri aplikazioa",

	// about
	"credits.about": "Honi buruz",
	"credits.idea":
		"Aplikazio honen ideia {post} dator, {author}(e)k Tumblr-en idatzia.",
	"credits.ideaPost": "argitalpen honetatik",
	"credits.madeBy": "{developer}(e)k egina.",
	"credits.icons": "{ionicons} ({ionic}) eta {mdi} ({pictogrammers}).",
	"credits.kofi": "Noizbait gogoa baduzu, Ko-fi bat daukat!",
};
