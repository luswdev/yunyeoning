const fs = require('fs');
const path = require('path');

hexo.extend.helper.register('js_version', function (jsPath) {
  const publicPath = path.join(hexo.public_dir, jsPath);
  let timestamp = Date.now(); // Fallback timestamp

  try {
    const stats = fs.statSync(publicPath);
    timestamp = stats.mtime.getTime(); // Use the file modification time
  } catch (err) {
    // Handle missing file gracefully
    console.warn(`File not found: ${publicPath}`);
  }

  const fullPath = this.url_for(jsPath);
  return `<script src="${fullPath}?v=${timestamp}"></script>`;
});

