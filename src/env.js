// Injected document and jQuery values
export let document, $;

// Inject the document and jQuery values
export function init(doc, jQuery) {
    document = doc || window.document;
    $ = jQuery || window.$;
}