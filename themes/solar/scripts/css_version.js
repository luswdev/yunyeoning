/**
* css tag generate helper
* @description generate css html tag with current timestamp
* @example
*     <%- css_version('css/style.css') %>
*/

hexo.extend.helper.register('css_version', function (cssPath) {
    let timestamp = Date.now();
    const fullPath = this.url_for(cssPath);
    return `<link rel="stylesheet" href="${fullPath}?v=${timestamp}">`;
});
