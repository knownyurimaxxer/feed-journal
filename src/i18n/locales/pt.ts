import type { Messages } from "./en";

export const pt: Messages = {
	// shared
	"common.cancel": "Cancelar",
	"common.continue": "Continuar",
	"common.delete": "Eliminar",
	"common.done": "Concluído",
	"common.edit": "Editar",

	// feed
	"feed.search": "Pesquisar nas tuas publicações",
	"feed.all": "Todas",
	"feed.empty":
		"Ainda não há nada aqui.\nVá, conta tudo. Ninguém está a ver.",
	"feed.loading": "A carregar as tuas notas…",
	"feed.noMatch": "Nenhuma publicação corresponde.",
	"feed.fallbackBanner":
		"Não é possível aceder à tua pasta de notas, por isso está a ser usado o armazenamento da app. Toca para escolher uma pasta de novo.",
	"feed.you": "tu",
	"feed.deleteTitle": "Eliminar esta publicação?",
	"feed.deleteBody":
		"O ficheiro .md será eliminado. (De qualquer forma, ninguém a viu.)",
	"feed.resetTitle": "Eliminar tudo?",
	"feed.resetBody":
		"Isto elimina permanentemente todas as notas da tua pasta de notas, além de todos os likes e definições, e repõe a app. Não pode ser desfeito.",
	"feed.resetSureTitle": "Tens mesmo a certeza?",
	"feed.resetSureBody": "Todas as notas serão eliminadas.",
	"feed.resetSureConfirm": "Eliminar tudo",
	"feed.resetFailed": "Não foi possível repor",

	// post card
	"post.edited": " · editado",
	"time.now": "agora mesmo",
	"time.minutes": "{n} min",
	"time.hours": "{n} h",
	"time.days": "{n} d",

	// composer
	"composer.titlePlaceholder": "Título (opcional)",
	"composer.bodyPlaceholder": "O que tens em mente? (ninguém vai ver)",
	"composer.tagAdd": "Adicionar uma etiqueta",
	"composer.tagAddAnother": "Adicionar outra",
	"composer.removeTag": "Remover a etiqueta {tag}",
	"composer.post": "Publicar",
	"composer.save": "Guardar",
	"composer.showMarkdown": "Mostrar código Markdown",
	"composer.showLive": "Voltar à formatação em direto",
	"tool.bold": "Negrito",
	"tool.italic": "Itálico",
	"tool.strike": "Rasurado",
	"tool.link": "Ligação",
	"tool.image": "Imagem",
	"tool.heading": "Título",
	"tool.quote": "Citação",
	"tool.code": "Bloco de código",
	"tool.bullets": "Lista com marcadores",
	"tool.numbers": "Lista numerada",
	"tool.checklist": "Lista de tarefas",

	// images and links in posts
	"image.vaultUnreadable":
		"Não é possível abrir a pasta do cofre. Escolhe-a de novo nas Definições.",
	"image.looking": "A procurar a imagem…",
	"image.notFound": "Imagem não encontrada no cofre: {name}",
	"image.loadFailed": "Não foi possível carregar a imagem.",
	"link.openFailed": "Não foi possível abrir a ligação",

	// errors
	"error.savePost": "Não foi possível guardar a publicação",
	"error.saveChanges": "Não foi possível guardar as alterações",
	"error.deletePost": "Não foi possível eliminar a publicação",

	// settings
	"settings.title": "Definições",
	"settings.language": "Idioma",
	"settings.languageHint":
		"“Predefinição do sistema” segue o idioma do teu telemóvel e usa inglês se o teu idioma não estiver disponível.",
	"settings.languageSystem": "Predefinição do sistema",
	"settings.haptics": "Vibração",
	"settings.hapticsToggle": "Resposta háptica",
	"settings.hapticsHint": "Vibrações curtas ao tocar em botões.",
	"settings.hapticsTriggers": "Escolhe o que vibra",
	"haptics.done": "Botão Concluído",
	"haptics.save": "Botão Guardar / Publicar",
	"haptics.cancel": "Cancelar (fechar o editor)",
	"haptics.menu": "Botão de menu ⋯",
	"haptics.action": "Botões Editar e Eliminar",
	"haptics.settings": "Botão de definições",
	"haptics.refresh": "Puxar para atualizar",
	"haptics.compose": "Botão de nova publicação",
	"haptics.checklist": "Marcar uma tarefa",
	"haptics.tag": "Tocar numa etiqueta",
	"haptics.delete": "Confirmar uma eliminação",
	"haptics.error": "Erros",
	"settings.folder": "Pasta",
	"settings.folderHint":
		"Cada publicação é guardada como um ficheiro .md com o nome do seu título, com as etiquetas no topo. Mudar de pasta não move as notas existentes.",
	"settings.chooseFolder": "Escolher pasta",
	"settings.useAppStorage": "Usar o armazenamento da app",
	"folder.appStorage": "Armazenamento da app (predefinição)",
	"settings.obsidian": "Obsidian",
	"settings.obsidianHint":
		"Mostra as imagens escritas como ![[photo.png]] do teu cofre e transforma as linhas “- [ ]” e “- [x]” em caixas em que podes tocar (exceto na vista Markdown). Precisa de uma pasta de cofre para funcionar.",
	"settings.noVault":
		"Nenhum cofre escolhido. O Obsidian fica desligado até escolheres um.",
	"settings.vaultHint":
		"Escolhe o teu cofre do Obsidian (a pasta que contém a pasta .obsidian). As imagens são procuradas aí pelo nome ou caminho. Nada no cofre é alterado.",
	"settings.clear": "Limpar",
	"settings.user": "Utilizador",
	"settings.showNickname": "Mostrar alcunha",
	"settings.showNicknameHint": "Esconde o nome nas publicações e no editor.",
	"settings.nicknamePlaceholder": "Alcunha",
	"settings.showAvatar": "Mostrar avatar",
	"settings.showAvatarHint": "Esconde o avatar nas publicações e no editor.",
	"settings.changePhoto": "Mudar foto",
	"settings.choosePhoto": "Escolher foto",
	"settings.removePhoto": "Remover foto",
	"settings.ui": "Interface",
	"settings.likes": "Likes falsos",
	"settings.likesHint":
		"Desligado esconde o contador e impede novos likes. As contagens existentes são mantidas.",
	"settings.maxChars": "Carateres por publicação",
	"settings.maxCharsHint":
		"De {min} a {max}. As publicações que já escreveste nunca são cortadas.",
	"settings.maxTags": "Etiquetas por publicação",
	"settings.maxTagsHint":
		"De {min} a {max}. 0 esconde a caixa de etiquetas ao escrever.",
	"settings.theme": "Tema",
	"settings.presets": "Predefinições",
	"role.background": "Fundo",
	"role.card": "Cartão de publicação",
	"role.text": "Texto",
	"role.accent": "Contraste / destaque",
	"preset.navy": "Marinho",
	"preset.midnight": "Meia-noite",
	"preset.paper": "Papel",
	"preset.forest": "Floresta",
	"preset.grape": "Uva",
	"settings.reset": "Repor",
	"settings.resetHint":
		"Elimina todas as notas da tua pasta de notas, além de todos os likes e definições, e deixa a app como estava no primeiro arranque. Não pode ser desfeito.",
	"settings.resetButton": "Eliminar todas as notas e repor a app",

	// about
	"credits.about": "Sobre",
	"credits.idea": "A ideia desta app vem de {post} de {author} no Tumblr.",
	"credits.ideaPost": "esta publicação",
	"credits.madeBy": "Feito por {developer}.",
	"credits.icons": "{ionicons} de {ionic} e {mdi} de {pictogrammers}.",
	"credits.kofi": "Se um dia te apetecer, tenho um Ko-fi!",
};
