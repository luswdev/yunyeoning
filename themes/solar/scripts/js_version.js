/**
* javascript tag generate helper
* @description generate javascript html tag with current timestamp
* @example
*     <%- js_version('js/main.js') %>
*/

hexo.extend.helper.register('js_version', function (jsPath) {
    let timestamp = Date.now();
    const fullPath = this.url_for(jsPath);
    return `<script src="${fullPath}?v=${timestamp}"></script>`;
});
