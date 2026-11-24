# dsh-cmd-enter-send

**Cmd+Enter sends, Enter inserts a newline** in the DeepSeek Harness composer.

[中文说明 →](README.zh.md)

DSH ships the opposite: plain Enter sends the message and Shift+Enter breaks the
line. If you write multi-line prompts, that means reaching for Shift every time
you want a newline, and losing the message every time you forget. This plugin
swaps the pair so Enter is always safe to press and sending is a deliberate
gesture.

## Keys

| Key | Result |
| --- | --- |
| `Enter` | Insert a newline |
| `Cmd+Enter` (macOS) / `Ctrl+Enter` (Windows, Linux) | Send the message |
| `Shift+Enter` | Insert a newline (unchanged) |
| `Esc` `Esc` | Stop the running response (unchanged) |

The swap applies to the conversation composer only. Every other shortcut, the
command and reference menus, and IME composition behave exactly as before.

## Why it is not a setting

DSH's composer hard-codes this mapping in
`@deepseek-ai/dsh-client-ui-conversation` (`src/client/input/editor/keymap.ts`:
plain Enter calls `handlers.submit()`, Shift+Enter falls through to Lexical's
line break). The shortcut catalogue exposes those as *fixed* bindings, which DSH
deliberately refuses to rebind, so there is no setting that could express the
swap.

Instead this plugin installs a capture-phase `keydown` listener on `window`,
which runs before the composer's own handler. A bare Enter inside the composer
is swallowed (`preventDefault` + `stopPropagation`, so the composer keymap never
sees it) and re-dispatched as a synthetic **Shift+Enter** to the same element —
the branch the composer passes through to Lexical's built-in line break.
Ctrl/Cmd+Enter is left completely untouched, so it keeps taking DSH's normal
send path.

Because it works on the DOM event rather than on DSH internals, it does not
depend on module injection order and it degrades safely: if the composer's
markup ever changes, the listener simply stops matching and DSH behaves as it
did before.

## Install

From the plugin market, or by pointing DSH at this repository:

```sh
dsh plugin --profile web add github:ay27/dsh-cmd-enter-send
```

Or install the prebuilt tarball attached to the latest release, which skips the
build-from-source step:

```sh
dsh plugin --profile web add https://github.com/ay27/dsh-cmd-enter-send/releases/latest/download/dsh-cmd-enter-send.tgz
```

Restart DSH (or reload the window) after installing.

## Uninstall

```sh
dsh plugin remove dsh-cmd-enter-send
```

Removing the plugin restores the default Enter-to-send immediately — there is
no saved state to clean up.

## Compatibility

Built against DSH `0.2.2-rc.5` and requires `>=0.2.2-rc.1 <0.3.0-0`. The plugin
relies on two attributes DSH puts on the composer (`data-composer-input` and
`data-composer-card`); if a future release renames them, the plugin stops
intervening rather than breaking input.

## License

[MIT](LICENSE)
