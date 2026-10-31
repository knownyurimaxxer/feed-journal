import type { Messages } from "./en";

export const gl: Messages = {
	// shared
	"common.cancel": "Cancelar",
	"common.continue": "Continuar",
	"common.delete": "Eliminar",
	"common.done": "Feito",
	"common.edit": "Editar",

	// feed
	"feed.search": "Busca nas túas publicacións",
	"feed.all": "Todas",
	"feed.empty":
		"Aquí aínda non hai nada.\nVai, cóntao todo. Ninguén está mirando.",
	"feed.loading": "Cargando as túas notas…",
	"feed.noMatch": "Ningunha publicación coincide.",
	"feed.fallbackBanner":
		"Non se pode acceder ao teu cartafol de notas, así que se está a usar o almacenamento da app. Toca para elixir un cartafol de novo.",
	"feed.you": "ti",
	"feed.deleteTitle": "Eliminar esta publicación?",
	"feed.deleteBody":
		"Eliminarase o ficheiro .md. (Ninguén a viu, de todos os xeitos.)",
	"feed.resetTitle": "Eliminar todo?",
	"feed.resetBody":
		"Isto elimina para sempre todas as notas do teu cartafol de notas, ademais de todos os likes e axustes, e restablece a app. Non se pode desfacer.",
	"feed.resetSureTitle": "Seguro de todo?",
	"feed.resetSureBody": "Eliminaranse todas as notas.",
	"feed.resetSureConfirm": "Eliminar todo",
	"feed.resetFailed": "Non se puido restablecer",

	// post card
	"post.edited": " · editado",
	"time.now": "agora mesmo",
	"time.minutes": "{n} min",
	"time.hours": "{n} h",
	"time.days": "{n} d",

	// composer
	"composer.titlePlaceholder": "Título (opcional)",
	"composer.bodyPlaceholder": "Que tes en mente? (ninguén o verá)",
	"composer.tagAdd": "Engadir unha etiqueta",
	"composer.tagAddAnother": "Engadir outra",
	"composer.removeTag": "Quitar a etiqueta {tag}",
	"composer.post": "Publicar",
	"composer.save": "Gardar",
	"composer.showMarkdown": "Mostrar o código Markdown",
	"composer.showLive": "Volver ao formato en vivo",
	"tool.bold": "Negra",
	"tool.italic": "Cursiva",
	"tool.strike": "Riscado",
	"tool.link": "Ligazón",
	"tool.image": "Imaxe",
	"tool.heading": "Cabeceira",
	"tool.quote": "Cita",
	"tool.code": "Bloque de código",
	"tool.bullets": "Lista con viñetas",
	"tool.numbers": "Lista numerada",
	"tool.checklist": "Lista de tarefas",

	// images and links in posts
	"image.vaultUnreadable":
		"Non se pode abrir o cartafol da bóveda. Volve elixilo en Axustes.",
	"image.looking": "Buscando a imaxe…",
	"image.notFound": "Imaxe non atopada na bóveda: {name}",
	"image.loadFailed": "Non se puido cargar a imaxe.",
	"link.openFailed": "Non se puido abrir a ligazón",

	// errors
	"error.savePost": "Non se puido gardar a publicación",
	"error.saveChanges": "Non se puideron gardar os cambios",
	"error.deletePost": "Non se puido eliminar a publicación",

	// settings
	"settings.title": "Axustes",
	"settings.language": "Idioma",
	"settings.languageHint":
		"“Predeterminado do sistema” segue o idioma do teu teléfono e usa inglés se o teu idioma non está dispoñible.",
	"settings.languageSystem": "Predeterminado do sistema",
	"settings.haptics": "Vibración",
	"settings.hapticsToggle": "Resposta táctil",
	"settings.hapticsHint": "Vibracións curtas ao tocar botóns.",
	"settings.hapticsTriggers": "Elixe que vibra",
	"haptics.done": "Botón Feito",
	"haptics.save": "Botón Gardar / Publicar",
	"haptics.cancel": "Cancelar (pechar o editor)",
	"haptics.menu": "Botón de menú ⋯",
	"haptics.action": "Botóns Editar e Eliminar",
	"haptics.settings": "Botón de axustes",
	"haptics.refresh": "Tirar para actualizar",
	"haptics.compose": "Botón de nova publicación",
	"haptics.checklist": "Marcar unha tarefa",
	"haptics.tag": "Tocar unha etiqueta",
	"haptics.delete": "Confirmar un borrado",
	"haptics.error": "Erros",
	"settings.folder": "Cartafol",
	"settings.folderHint":
		"Cada publicación gárdase como un ficheiro .md co nome do seu título, coas súas etiquetas na parte de arriba. Cambiar de cartafol non move as notas existentes.",
	"settings.chooseFolder": "Elixir cartafol",
	"settings.useAppStorage": "Usar o almacenamento da app",
	"folder.appStorage": "Almacenamento da app (predeterminado)",
	"settings.obsidian": "Obsidian",
	"settings.obsidianHint":
		"Mostra as imaxes escritas como ![[photo.png]] da túa bóveda e converte as liñas “- [ ]” e “- [x]” en caixas que podes tocar (excepto na vista Markdown). Necesita un cartafol de bóveda para funcionar.",
	"settings.noVault":
		"Non hai ningunha bóveda elixida. Obsidian queda desactivado ata que elixas unha.",
	"settings.vaultHint":
		"Elixe a túa bóveda de Obsidian (o cartafol que contén o cartafol .obsidian). As imaxes búscanse alí polo nome ou pola ruta. Non se cambia nada na bóveda.",
	"settings.clear": "Quitar",
	"settings.user": "Usuario",
	"settings.showNickname": "Mostrar o alcume",
	"settings.showNicknameHint": "Oculta o nome nas publicacións e no editor.",
	"settings.nicknamePlaceholder": "Alcume",
	"settings.showAvatar": "Mostrar o avatar",
	"settings.showAvatarHint": "Oculta o avatar nas publicacións e no editor.",
	"settings.changePhoto": "Cambiar a foto",
	"settings.choosePhoto": "Elixir foto",
	"settings.removePhoto": "Quitar a foto",
	"settings.ui": "Interface",
	"settings.likes": "Likes falsos",
	"settings.likesHint":
		"Desactivado oculta o contador e detén os likes novos. Os recontos existentes consérvanse.",
	"settings.maxChars": "Caracteres por publicación",
	"settings.maxCharsHint":
		"De {min} a {max}. As publicacións que xa escribiches nunca se cortan.",
	"settings.maxTags": "Etiquetas por publicación",
	"settings.maxTagsHint":
		"De {min} a {max}. 0 oculta a caixa de etiquetas ao escribir.",
	"settings.theme": "Tema",
	"settings.presets": "Predefinidos",
	"role.background": "Fondo",
	"role.card": "Tarxeta de publicación",
	"role.text": "Texto",
	"role.accent": "Contraste / acento",
	"preset.navy": "Mariño",
	"preset.midnight": "Medianoite",
	"preset.paper": "Papel",
	"preset.forest": "Bosque",
	"preset.grape": "Uva",
	"settings.reset": "Restablecer",
	"settings.resetHint":
		"Elimina todas as notas do teu cartafol de notas, ademais de todos os likes e axustes, e deixa a app como estaba no primeiro inicio. Non se pode desfacer.",
	"settings.resetButton": "Eliminar todas as notas e restablecer a app",

	// about
	"credits.about": "Acerca de",
	"credits.idea": "A idea desta app vén de {post} de {author} en Tumblr.",
	"credits.ideaPost": "esta publicación",
	"credits.madeBy": "Feito por {developer}.",
	"credits.icons": "{ionicons} de {ionic} e {mdi} de {pictogrammers}.",
	"credits.kofi": "Se algún día che apetece, teño un Ko-fi!",
};
