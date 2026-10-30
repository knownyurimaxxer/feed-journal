import type { Messages } from "./en";

export const ca: Messages = {
	// shared
	"common.cancel": "Cancel·la",
	"common.continue": "Continua",
	"common.delete": "Elimina",
	"common.done": "Fet",
	"common.edit": "Edita",

	// feed
	"feed.search": "Cerca a les teves publicacions",
	"feed.all": "Totes",
	"feed.empty":
		"Encara no hi ha res aquí.\nVinga, explica-ho tot. Ningú no t'està mirant.",
	"feed.loading": "Carregant les teves notes…",
	"feed.noMatch": "Cap publicació coincideix.",
	"feed.fallbackBanner":
		"No es pot accedir a la teva carpeta de notes, així que s'està fent servir l'emmagatzematge de l'app. Toca per triar una carpeta de nou.",
	"feed.you": "tu",
	"feed.deleteTitle": "Vols eliminar aquesta publicació?",
	"feed.deleteBody":
		"S'eliminarà el fitxer .md. (De tota manera, ningú no la va veure.)",
	"feed.resetTitle": "Vols eliminar-ho tot?",
	"feed.resetBody":
		"Això elimina per sempre totes les notes de la teva carpeta de notes, a més de tots els likes i ajustos, i restableix l'app. No es pot desfer.",
	"feed.resetSureTitle": "Segur que vols continuar?",
	"feed.resetSureBody": "S'eliminaran totes les notes.",
	"feed.resetSureConfirm": "Elimina-ho tot",
	"feed.resetFailed": "No s'ha pogut restablir",

	// post card
	"post.edited": " · editat",
	"time.now": "ara mateix",
	"time.minutes": "{n} min",
	"time.hours": "{n} h",
	"time.days": "{n} d",

	// composer
	"composer.titlePlaceholder": "Títol (opcional)",
	"composer.bodyPlaceholder": "Què tens al cap? (ningú ho veurà)",
	"composer.tagAdd": "Afegeix una etiqueta",
	"composer.tagAddAnother": "Afegeix-ne una altra",
	"composer.removeTag": "Treu l'etiqueta {tag}",
	"composer.post": "Publica",
	"composer.save": "Desa",
	"composer.showMarkdown": "Mostra el codi Markdown",
	"composer.showLive": "Torna al format en directe",
	"tool.bold": "Negreta",
	"tool.italic": "Cursiva",
	"tool.strike": "Ratllat",
	"tool.link": "Enllaç",
	"tool.image": "Imatge",
	"tool.heading": "Encapçalament",
	"tool.quote": "Cita",
	"tool.code": "Bloc de codi",
	"tool.bullets": "Llista amb punts",
	"tool.numbers": "Llista numerada",
	"tool.checklist": "Llista de tasques",

	// images and links in posts
	"image.vaultUnreadable":
		"No es pot obrir la carpeta del vault. Torna a triar-la a Ajustos.",
	"image.looking": "Cercant la imatge…",
	"image.notFound": "Imatge no trobada al vault: {name}",
	"image.loadFailed": "No s'ha pogut carregar la imatge.",
	"link.openFailed": "No s'ha pogut obrir l'enllaç",

	// errors
	"error.savePost": "No s'ha pogut desar la publicació",
	"error.saveChanges": "No s'han pogut desar els canvis",
	"error.deletePost": "No s'ha pogut eliminar la publicació",

	// settings
	"settings.title": "Ajustos",
	"settings.language": "Idioma",
	"settings.languageHint":
		"«Predeterminat del sistema» segueix l'idioma del teu telèfon, i fa servir l'anglès si el teu idioma no està disponible.",
	"settings.languageSystem": "Predeterminat del sistema",
	"settings.haptics": "Vibració",
	"settings.hapticsToggle": "Resposta tàctil",
	"settings.hapticsHint": "Vibracions curtes en tocar botons.",
	"settings.hapticsTriggers": "Tria què vibra",
	"haptics.done": "Botó Fet",
	"haptics.save": "Botó Desa / Publica",
	"haptics.cancel": "Cancel·la (tanca l'editor)",
	"haptics.menu": "Botó de menú ⋯",
	"haptics.action": "Botons Edita i Elimina",
	"haptics.settings": "Botó d'ajustes",
	"haptics.refresh": "Estirar per actualitzar",
	"haptics.compose": "Botó de nova publicació",
	"haptics.checklist": "Marcar una tasca",
	"haptics.tag": "Tocar una etiqueta",
	"haptics.delete": "Confirmar una eliminació",
	"haptics.error": "Errors",
	"settings.folder": "Carpeta",
	"settings.folderHint":
		"Cada publicació es desa com un fitxer .md amb el nom del seu títol i les seves etiquetes al principi. Canviar de carpeta no mou les notes existents.",
	"settings.chooseFolder": "Tria una carpeta",
	"settings.useAppStorage": "Fes servir l'emmagatzematge de l'app",
	"folder.appStorage": "Emmagatzematge de l'app (predeterminat)",
	"settings.obsidian": "Obsidian",
	"settings.obsidianHint":
		"Mostra des del teu vault les imatges escrites com ![[foto.png]], i converteix les línies «- [ ]» i «- [x]» en caselles que pots tocar (excepte a la vista Markdown). Necessita una carpeta de vault per funcionar.",
	"settings.noVault":
		"Cap vault triat. Obsidian continua desactivat fins que en triïs un.",
	"settings.vaultHint":
		"Tria el teu vault d'Obsidian (la carpeta que conté la carpeta .obsidian). Les imatges es cerquen allà per nom o ruta. No es canvia res del vault.",
	"settings.clear": "Treu",
	"settings.user": "Usuari",
	"settings.showNickname": "Mostra el sobrenom",
	"settings.showNicknameHint":
		"Amaga el nom a les publicacions i a l'editor.",
	"settings.nicknamePlaceholder": "Sobrenom",
	"settings.showAvatar": "Mostra l'avatar",
	"settings.showAvatarHint":
		"Amaga l'avatar a les publicacions i a l'editor.",
	"settings.changePhoto": "Canvia la foto",
	"settings.choosePhoto": "Tria una foto",
	"settings.removePhoto": "Treu la foto",
	"settings.ui": "Interfície",
	"settings.likes": "Likes falsos",
	"settings.likesHint":
		"Si ho apagues, s'amaga el comptador i no s'afegeixen likes nous. Els que ja hi són es conserven.",
	"settings.maxChars": "Caràcters per publicació",
	"settings.maxCharsHint":
		"De {min} a {max}. Les publicacions que ja has escrit mai no es retallen.",
	"settings.maxTags": "Etiquetes per publicació",
	"settings.maxTagsHint":
		"De {min} a {max}. Amb 0 s'amaga el quadre d'etiquetes en escriure.",
	"settings.theme": "Tema",
	"settings.presets": "Predefinits",
	"role.background": "Fons",
	"role.card": "Targeta de publicació",
	"role.text": "Text",
	"role.accent": "Contrast / accent",
	"preset.navy": "Marí",
	"preset.midnight": "Mitjanit",
	"preset.paper": "Paper",
	"preset.forest": "Bosc",
	"preset.grape": "Raïm",
	"settings.reset": "Restableix",
	"settings.resetHint":
		"Elimina totes les notes de la teva carpeta de notes, a més de tots els likes i ajustos, i deixa l'app com estava la primera vegada que la vas obrir. No es pot desfer.",
	"settings.resetButton": "Elimina totes les notes i restableix l'app",

	// about
	"credits.about": "Quant a",
	"credits.idea": "La idea d'aquesta app ve de {post} de {author} a Tumblr.",
	"credits.ideaPost": "aquesta publicació",
	"credits.madeBy": "Feta per {developer}.",
	"credits.icons": "{ionicons} de {ionic} i {mdi} de {pictogrammers}.",
	"credits.kofi": "Si algun dia et ve de gust, tinc un Ko-fi!",
};
