const fs = require('fs');
const path = require('path');

hexo.extend.helper.register('js_version', function (jsPath) {
  let timestamp = Date.now();
  const fullPath = this.url_for(jsPath);
  return `<script src="${fullPath}?v=${timestamp}"></script>`;
});

