A social feed where the only person on it is you.

You write posts, they show up in a nice scrollable feed, and the likes keep
coming in. Nobody sees any of it. No account, no followers, no internet
needed. It's a journal wearing a social media (Tumblr) costume.

The idea for this app comes from
[this post](https://www.tumblr.com/rubensmuse/831592820192280576/killer-new-startup-idea-phone-app-called-the)
by [@rubensmuse](https://www.tumblr.com/rubensmuse) on Tumblr.

If you ever feel like it, I have a [Ko-fi page](https://ko-fi.com/knownyurimaxxer)!

## What it does

- **Short posts.** 280 characters by default, and up to 10 tags if you feel
  organized. Add a title if you feel fancy. Want it longer, shorter, or with
  no tags at all? Settings has a Limits section: anywhere from 10 to 5,000
  characters and 0 to 30 tags. Changing the limits never cuts a post you
  already wrote.
- **Formatting while you type.** Bold, italic, strikethrough, headings,
  quotes, code and lists. There's a button to peek at the raw Markdown too.
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

[Ionicons](https://ionic.io/ionicons) and
[Material Design Icons](https://pictogrammers.com/library/mdi/) by
[@pictogrammers](https://pictogrammers.com/).
