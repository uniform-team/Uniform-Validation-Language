/**
 * In JavaScript, using a global variable actually looks it up in the
 * runtime's globally accessible object.
 *
 * In browsers, window is the globally accessible object.
 * window.foo = "bar";
 * console.log(foo); // bar
 *
 * In Node, global is the globally accessible object.
 * global.foo = "bar";
 * console.log(foo); // bar
 *
 * Since these helpers are run in both browser and Node environments,
 * we need a singular globalObj which works in both cases.
 */
try {
    window; // Passes in browser, throws error in Node
    window.globalObj = window; // Must be in browser, use window as globally accessible object
} catch (err) {
    global.globalObj = global; // Must be in Node, use global as globally accessible object
}