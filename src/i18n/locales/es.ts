import type { Messages } from "./en";

export const es: Messages = {
	// shared
	"common.cancel": "Cancelar",
	"common.continue": "Continuar",
	"common.delete": "Eliminar",
	"common.done": "Listo",
	"common.edit": "Editar",

	// feed
	"feed.search": "Busca en tus publicaciones",
	"feed.all": "Todas",
	"feed.empty":
		"Aquí no hay nada todavía.\nAnda, cuéntalo todo. Nadie te está mirando.",
	"feed.loading": "Cargando tus notas…",
	"feed.noMatch": "Ninguna publicación coincide.",
	"feed.fallbackBanner":
		"No se puede acceder a tu carpeta de notas, así que se está usando el almacenamiento de la app. Toca para elegir una carpeta de nuevo.",
	"feed.you": "tú",
	"feed.deleteTitle": "¿Eliminar esta publicación?",
	"feed.deleteBody":
		"Se eliminará el archivo .md. (De todos modos, nadie la vio.)",
	"feed.resetTitle": "¿Eliminar todo?",
	"feed.resetBody":
		"Esto elimina para siempre todas las notas de tu carpeta de notas, además de todos los likes y ajustes, y restablece la app. No se puede deshacer.",
	"feed.resetSureTitle": "¿Seguro del todo?",
	"feed.resetSureBody": "Se eliminarán todas las notas.",
	"feed.resetSureConfirm": "Eliminar todo",
	"feed.resetFailed": "No se pudo restablecer",

	// post card
	"post.edited": " · editado",
	"time.now": "ahora mismo",
	"time.minutes": "{n} min",
	"time.hours": "{n} h",
	"time.days": "{n} d",

	// composer
	"composer.titlePlaceholder": "Título (opcional)",
	"composer.bodyPlaceholder": "¿Qué tienes en mente? (nadie lo verá)",
	"composer.tagAdd": "Añadir una etiqueta",
	"composer.tagAddAnother": "Añadir otra",
	"composer.removeTag": "Quitar la etiqueta {tag}",
	"composer.post": "Publicar",
	"composer.save": "Guardar",
	"composer.showMarkdown": "Mostrar código Markdown",
	"composer.showLive": "Volver al formato en vivo",
	"tool.bold": "Negrita",
	"tool.italic": "Cursiva",
	"tool.strike": "Tachado",
	"tool.link": "Enlace",
	"tool.image": "Imagen",
	"tool.heading": "Encabezado",
	"tool.quote": "Cita",
	"tool.code": "Bloque de código",
	"tool.bullets": "Lista con viñetas",
	"tool.numbers": "Lista numerada",
	"tool.checklist": "Lista de tareas",

	// images and links in posts
	"image.vaultUnreadable":
		"No se puede abrir la carpeta de la bóveda. Vuelve a elegirla en Ajustes.",
	"image.looking": "Buscando la imagen…",
	"image.notFound": "Imagen no encontrada en la bóveda: {name}",
	"image.loadFailed": "No se pudo cargar la imagen.",
	"link.openFailed": "No se pudo abrir el enlace",

	// errors
	"error.savePost": "No se pudo guardar la publicación",
	"error.saveChanges": "No se pudieron guardar los cambios",
	"error.deletePost": "No se pudo eliminar la publicación",

	// settings
	"settings.title": "Ajustes",
	"settings.language": "Idioma",
	"settings.languageHint":
		"«Predeterminado del sistema» sigue el idioma de tu teléfono, y usa inglés si tu idioma no está disponible.",
	"settings.languageSystem": "Predeterminado del sistema",
	"settings.folder": "Carpeta",
	"settings.folderHint":
		"Cada publicación se guarda como un archivo .md con el nombre de su título y sus etiquetas al principio. Cambiar de carpeta no mueve las notas existentes.",
	"settings.chooseFolder": "Elegir carpeta",
	"settings.useAppStorage": "Usar almacenamiento de la app",
	"folder.appStorage": "Almacenamiento de la app (predeterminado)",
	"settings.obsidian": "Obsidian",
	"settings.obsidianHint":
		"Muestra desde tu bóveda las imágenes escritas como ![[foto.png]], y convierte las líneas «- [ ]» y «- [x]» en casillas que puedes tocar (salvo en la vista Markdown). Necesita una carpeta de bóveda para funcionar.",
	"settings.noVault":
		"Ninguna bóveda elegida. Obsidian sigue desactivado hasta que elijas una.",
	"settings.vaultHint":
		"Elige tu bóveda de Obsidian (la carpeta que contiene la carpeta .obsidian). Las imágenes se buscan ahí por nombre o ruta. No se cambia nada de la bóveda.",
	"settings.clear": "Quitar",
	"settings.user": "Usuario",
	"settings.showNickname": "Mostrar apodo",
	"settings.showNicknameHint":
		"Oculta el nombre en las publicaciones y en el editor.",
	"settings.nicknamePlaceholder": "Apodo",
	"settings.showAvatar": "Mostrar avatar",
	"settings.showAvatarHint":
		"Oculta el avatar en las publicaciones y en el editor.",
	"settings.changePhoto": "Cambiar foto",
	"settings.choosePhoto": "Elegir foto",
	"settings.removePhoto": "Quitar foto",
	"settings.ui": "Interfaz",
	"settings.likes": "Likes falsos",
	"settings.likesHint":
		"Si lo apagas, se oculta el contador y no se añaden likes nuevos. Los que ya hay se conservan.",
	"settings.maxChars": "Caracteres por publicación",
	"settings.maxCharsHint":
		"De {min} a {max}. Las publicaciones que ya escribiste nunca se recortan.",
	"settings.maxTags": "Etiquetas por publicación",
	"settings.maxTagsHint":
		"De {min} a {max}. Con 0 se oculta el cuadro de etiquetas al escribir.",
	"settings.theme": "Tema",
	"settings.presets": "Preajustes",
	"role.background": "Fondo",
	"role.card": "Tarjeta de publicación",
	"role.text": "Texto",
	"role.accent": "Contraste / acento",
	"preset.navy": "Marino",
	"preset.midnight": "Medianoche",
	"preset.paper": "Papel",
	"preset.forest": "Bosque",
	"preset.grape": "Uva",
	"settings.reset": "Restablecer",
	"settings.resetHint":
		"Elimina todas las notas de tu carpeta de notas, además de todos los likes y ajustes, y deja la app como estaba la primera vez que la abriste. No se puede deshacer.",
	"settings.resetButton": "Eliminar todas las notas y restablecer la app",

	// about
	"credits.about": "Acerca de",
	"credits.idea":
		"La idea de esta app viene de {post} de {author} en Tumblr.",
	"credits.ideaPost": "esta publicación",
	"credits.madeBy": "Hecho por {developer}.",
	"credits.icons": "{ionicons} de {ionic} y {mdi} de {pictogrammers}.",
	"credits.kofi": "Si algún día te apetece, ¡tengo Ko-fi!",
};
