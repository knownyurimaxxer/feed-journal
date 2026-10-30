**TLDR**: it's a note-taking app with a personalizable UI that reminds you of _Tumblr_.

If you have an issue, just open an [Issue](../../issues)!

## What it does

- **Short posts.** 280 characters by default, and up to 10 tags if you feel
  organized. Add a title if you feel fancy. Want it longer, shorter, or with
  no tags at all? Settings has a Limits section: anywhere from 10 to 5,000
  characters and 0 to 30 tags. Only the text you can read counts: Markdown
  formatting (`**`, `#`, link addresses...) is free. Changing the limits never
  cuts a post you already wrote.
- **Formatting while you type.** Bold, italic, strikethrough, links,
  headings, quotes, code and lists. Links are `[text](url)`, tap them in a post to
  open them. There's a button to peek at the raw Markdown too.
- **Images.** Write `![description](https://address)` to show a picture from
  the web, or use the image button in the toolbar. Add a size with
  `![description|300](https://address)`. The editor keeps the text visible and
  previews the picture under it.
- **Obsidian (optional).** Turn it on in Settings > Folder and pick your
  vault; it only works once both are done. Then `![[photo.png]]` (also `![[photo.png|300]]` and
  `![](Attachments/photo.png)`) shows the picture from the vault, and
  `- [ ]` / `- [x]` lines become checkboxes you can tap in the feed and in the
  editor (not in the Markdown view). The vault is only read, never changed.
- **Languages.** Settings > Language: "System default" follows the phone (and
  uses English when the phone's language isn't available), or pick one.
- **Search and tags.** Find an old post by a word from it, or tap a tag to
  see everything under it.
- **Fake likes.** Each post picks up a like or two when it scrolls into view.
  Brand new posts start at zero, as is tradition. Don't like fake likes?
  Turn them off.
- **Your notes are just files.** Each post is a plain `.md` file, named after
  its title. Keep them inside the app, or pick a folder on your phone and
  open them with any other notes app. Edit one over there, pull down to
  refresh here, and it shows up.
- **Make it yours.** Pick a nickname, an avatar (an icon or your own photo),
  and a theme. There are a few ready-made ones, or you can choose each color
  yourself.
- **Edit and delete.** The little dots on a post do exactly what you think.
- **Big screens too.** Tablets and landscape get a multi-column feed (in theory, don't have a Tablet to test it).

## What it doesn't do

- No accounts, no sync, no cloud. If you want a backup, back up the folder.
- No sharing. Nobody can see your posts.
- Android only for now. There's no iPhone version available.
- The likes and the original dates of your posts live inside the app. If you
  uninstall it, the notes stay in your folder, but the likes are gone and the
  dates may reset.

## Getting it on your phone

The easy way is [Obtainium](https://obtainium.imranr.dev/), which installs
apps straight from GitHub and tells you when there's an update.

1. Install Obtainium.
2. Open it, tap **Add App**, and paste the address of this very page.
3. Tap **Add**, then install. Android will ask you to allow installing apps
   from Obtainium. Say yes.

Prefer to do it by hand? Open the [Releases](../../releases) page, download
the latest `.apk` and open it on your phone.

Every time the code on the main branch changes, a new version shows up there
by itself.

## For tinkerers

It's an [Expo](https://expo.dev) app. `npm install`, then `npm start` to run
it, and `npm run check` to run the type check and the tests.

## Credits

[Ionicons](https://ionic.io/ionicons) by [@ionic](https://ionic.io/) and
[Material Design Icons](https://pictogrammers.com/library/mdi/) by
[@pictogrammers](https://pictogrammers.com/).

The idea for this app comes from
[this post](https://www.tumblr.com/rubensmuse/831592820192280576/killer-new-startup-idea-phone-app-called-the)
by [@rubensmuse](https://www.tumblr.com/rubensmuse) on _Tumblr_.

Made by [@knownyurimaxxer](https://www.tumblr.com/knownyurimaxxer).

If you ever feel like it, I have a [Ko-fi](https://ko-fi.com/knownyurimaxxer)!
