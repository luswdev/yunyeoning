const fs = require('fs');
const path = require('path');

hexo.extend.helper.register('css_version', function (cssPath) {
  const publicPath = path.join(hexo.public_dir, cssPath);
  let timestamp = Date.now(); // Fallback timestamp

  try {
    const stats = fs.statSync(publicPath);
    timestamp = stats.mtime.getTime(); // Use the file modification time
  } catch (err) {
    // Handle missing file gracefully
    console.warn(`File not found: ${publicPath}`);
  }

  const fullPath = this.url_for(cssPath);
  return `<link rel="stylesheet" href="${fullPath}?v=${timestamp}">`;
});

