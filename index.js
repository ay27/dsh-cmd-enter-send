/**
 * Host half of the plugin: nothing to do.
 *
 * The whole behaviour lives in the client half (./client.js), which installs a
 * capture-phase keydown listener in the browser window. The empty apply keeps
 * the bundle loadable on the host plane.
 */
export function apply() {}
