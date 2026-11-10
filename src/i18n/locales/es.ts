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
	"settings.haptics": "Vibración",
	"settings.hapticsToggle": "Respuesta háptica",
	"settings.hapticsHint": "Vibraciones cortas al tocar botones.",
	"settings.hapticsTriggers": "Elige qué vibra",
	"settings.hapticsStrength": "Intensidad de la vibración",
	"settings.hapticsStrengthHint":
		"Desliza hacia la derecha para una vibración más intensa.",
	"haptics.done": "Botón Listo",
	"haptics.save": "Botón Guardar / Publicar",
	"haptics.cancel": "Cancelar (cerrar el editor)",
	"haptics.menu": "Botón de menú ⋯",
	"haptics.action": "Botones Editar y Eliminar",
	"haptics.settings": "Botón de ajustes",
	"haptics.refresh": "Tirar para actualizar",
	"haptics.compose": "Botón de nueva publicación",
	"haptics.checklist": "Marcar una tarea",
	"haptics.tag": "Tocar una etiqueta",
	"haptics.delete": "Confirmar un borrado",
	"haptics.error": "Errores",
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
		"Elige tu bóveda de Obsidian (la carpeta que contiene la carpeta .obsidian). Las imágenes se buscan ahí por nombre o ruta. La app solo añade archivos a la bóveda (imágenes, notas de voz, grabaciones de pantalla); nunca cambia ni borra lo que ya hay.",
	"settings.clear": "Quitar",

	// pictures, voice notes and screen recordings saved in the vault
	"media.addImage": "Añadir imagen",
	"media.recordAudio": "Grabar nota de voz",
	"media.recordScreen": "Grabar pantalla",
	"media.recordingAudio": "Grabando nota de voz",
	"media.recordingScreen": "Grabando pantalla",
	"media.saving": "Guardando en la bóveda…",
	"media.stop": "Parar",
	"media.failed": "No se pudo guardar en la bóveda",
	"media.needVault": "Elige primero tu bóveda en Ajustes.",
	"media.micDenied":
		"El micrófono no está permitido. Actívalo en los ajustes del teléfono.",
	"media.nothingRecorded": "No se grabó nada.",
	"settings.media": "Imágenes, notas de voz y vídeos",
	"settings.mediaHint":
		"Carpetas dentro de tu bóveda donde se guardan los archivos nuevos, escritas desde la carpeta de la bóveda (por ejemplo Attachments/Audio). Las carpetas que falten se crean. Los archivos se nombran por fecha y hora, como 20261107125555. Las imágenes se guardan en WebP al 100 % de calidad, las notas de voz en AAC comprimido (.m4a) y las grabaciones de pantalla en MP4 comprimido.",
	"settings.mediaImages": "Carpeta de imágenes",
	"settings.mediaAudio": "Carpeta de notas de voz",
	"settings.mediaVideo": "Carpeta de grabaciones de pantalla",
	"settings.mediaRoot": "La propia carpeta de la bóveda",

	// quality of voice notes and screen recordings, and the player
	"settings.voice": "Notas de voz",
	"settings.voiceHint":
		"Los números más bajos dan archivos más pequeños. Mono a 64 kbps se oye claro para hablar; usa estéreo y 128 kbps o más para música.",
	"settings.channels": "Canales",
	"settings.mono": "Mono",
	"settings.stereo": "Estéreo",
	"settings.compression": "Compresión",
	"settings.screen": "Grabaciones de pantalla",
	"settings.screenHint":
		"H.265 (HEVC) da archivos un tercio más pequeños que H.264 con la misma calidad, pero algunos ordenadores no lo reproducen. Solo se muestran los códecs que tu teléfono puede grabar. 2 Mbps se ve claro para texto en un teléfono.",
	"settings.codec": "Códec",
	"player.play": "Reproducir",
	"player.pause": "Pausar",
	"player.playVideo": "Reproducir vídeo",
	"player.notFound": "no está en la bóveda",
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
	"color.custom": "Color personalizado",
	"color.hue": "Tono",
	"color.saturation": "Saturación",
	"color.lightness": "Luminosidad",
	"color.hex": "Código hex",
	"color.apply": "Aplicar",
	"settings.themeTransfer": "Compartir temas",
	"settings.exportTheme": "Exportar tema",
	"settings.importTheme": "Importar tema",
	"settings.importHint":
		"Pega un tema exportado desde esta app o desde cualquier app que use los mismos nombres de color: background, card, text y accent.",
	"settings.importInvalid":
		"Ese no es un tema válido. Necesita background, card, text y accent, cada uno como un color #RRGGBB.",
	"settings.importButton": "Importar",
	"code.copy": "Copiar código",
	"code.copied": "Copiado",
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
