const fs = require('fs');
const path = require('path');

hexo.extend.helper.register('css_version', function (cssPath) {
  let timestamp = Date.now();
  const fullPath = this.url_for(cssPath);
  return `<link rel="stylesheet" href="${fullPath}?v=${timestamp}">`;
});

