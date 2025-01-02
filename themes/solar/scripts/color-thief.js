const path = require('path');
const { getColorFromURL } = require('color-thief-node');
const { pathToFileURL } = require('url');
const { page } = require('hexo/dist/plugins/helper/is');

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h, s, l = (max + min) / 2;

    if (delta === 0) {
        h = s = 0; // achromatic
    } else {
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        switch (max) {
            case r: h = (g - b) / delta + (g < b ? 6 : 0); break;
            case g: h = (b - r) / delta + 2; break;
            case b: h = (r - g) / delta + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hueToRgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = hueToRgb(p, q, h + 1 / 3);
    const g = hueToRgb(p, q, h);
    const b = hueToRgb(p, q, h - 1 / 3);

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

async function getDominantColor(imagePath) {
    try {
        const absoluteImagePath = path.join(hexo.base_dir, "source", imagePath);
        const dominantColor = await getColorFromURL(absoluteImagePath);

        const luminance = (0.299 * dominantColor[0] + 0.587 * dominantColor[1] + 0.114 * dominantColor[2]) / 255;

        let adjustedColor = dominantColor;
        if (luminance < 0.3) {
            const [h, s, l] = rgbToHsl(dominantColor[0], dominantColor[1], dominantColor[2]);
            const newL = Math.max(l, 30);
            adjustedColor = hslToRgb(h, s, newL);
        }
        return adjustedColor;
    } catch (error) {
        hexo.log.error('Error processing the image:', error);
        return [0, 0, 0]; // Default fallback color
    }
}

hexo.extend.filter.register('before_post_render', async function (data) {
    let img = '';
    if (data.layout === 'album-view') {
        img = data.cover
    } else if (data.layout === 'song-view' && data.tags && data.tags.length > 0) {
        img = "/images/album/" + data.tags.data[0].name + ".jpg"
    }

    if (!img) {
        return data;
    }

    try {
        // const getDominantColor = getHelper('getDominantColor');
        const dominantColor = await getDominantColor(img);
        data.dominantColor = dominantColor;
    } catch (error) {
        hexo.log.error('Failed to get dominant color:', error);
        data.dominantColor = [0, 0, 0];
    }

    const adjustedLuminance = (0.299 * data.dominantColor[0] + 0.587 * data.dominantColor[1] + 0.114 * data.dominantColor[2]) / 255;
    data.dominantTextColor = adjustedLuminance > 0.5 ? 'black' : 'white';
    return data;
});
