/**
 * Cmd+Enter send / Enter newline for the DSH composer.
 *
 * Why this file exists: the composer's Enter handling lives in
 * @deepseek-ai/dsh-client-ui-conversation (src/client/input/editor/keymap.ts),
 * where plain Enter calls `handlers.submit()`, Shift+Enter falls through to
 * Lexical's native line break, and Ctrl/Cmd+Enter submits in "accelerated"
 * mode. The shortcut catalogue registers those as fixed bindings, which DSH
 * refuses to rebind, so the swap has to happen on the DOM event itself.
 *
 * How it works: a capture-phase `keydown` listener on `window` runs before
 * Lexical's own listener on the contenteditable root. A bare Enter inside the
 * composer is swallowed there (preventDefault + stopPropagation, so the
 * composer keymap never sees it) and re-dispatched as a synthetic Shift+Enter
 * to the same element. Shift+Enter is the branch that returns `false` from the
 * composer keymap, letting Lexical's builtin KeyEnter handler insert a line
 * break. Modifier combos, IME composition, and open menus are left untouched.
 */

window.__ModuleLoader__.load({
  id: 'dsh-cmd-enter-send',

  factory(require) {
    const COMPOSER_INPUT = '[data-composer-input]'
    const COMPOSER_CARD = '[data-composer-card]'
    const MENU_SELECTOR = [
      '[data-composer-overlay] [role="listbox"]',
      '[data-composer-overlay] [role="option"]',
      '[data-composer-overlay] [data-trigger-menu]',
    ].join(', ')

    /** True when the event carries no modifier that DSH already gives a meaning. */
    function isBareEnter(event) {
      return event.key === 'Enter'
        && !event.shiftKey
        && !event.altKey
        && !event.ctrlKey
        && !event.metaKey
    }

    /** True while an IME is composing — Enter belongs to the IME there. */
    function isComposing(event, root) {
      return event.isComposing === true
        || event.keyCode === 229
        || root.hasAttribute('data-composer-composing')
    }

    /** True when a trigger menu (slash, mention, reference, select) owns the key. */
    function menuOwnsKey(root) {
      const card = root.closest(COMPOSER_CARD)
      return card !== null && card.querySelector(MENU_SELECTOR) !== null
    }

    function reinsertAsLineBreak(root) {
      root.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
        composed: true,
      }))
    }

    function onKeyDown(event) {
      if (!isBareEnter(event)) return
      const target = event.target
      if (!(target instanceof Element)) return
      const root = target.closest(COMPOSER_INPUT)
      if (root === null) return
      if (root.getAttribute('contenteditable') !== 'true') return
      if (isComposing(event, root)) return
      if (menuOwnsKey(root)) return

      event.preventDefault()
      event.stopPropagation()
      reinsertAsLineBreak(root)
    }

    return {
      inject: [],

      apply(ctx) {
        ctx.effect(() => {
          window.addEventListener('keydown', onKeyDown, true)
          return () => window.removeEventListener('keydown', onKeyDown, true)
        }, 'cmd-enter-send: composer keydown')
      },
    }
  },
})
