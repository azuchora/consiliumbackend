const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { UPLOAD_DIR } = require('./fileService');

const regexPatterns = {
    phone: /\d{3}[\s-]?\d{3}[\s-]?\d{3}/g,
    pesel: /\b\d{11}\b/g,
    email: /[^\s@]+@[^\s@]+\.[^\s@]+/g
};

const censorFile = async (filename) => {
    if (!(/\.(png|jpe?g)$/i.test(filename))) return;

    const filePath = path.join(UPLOAD_DIR, filename);
    const { data } = await Tesseract.recognize(filePath, 'eng');

    if (!data.words?.length) return;

    const image = await loadImage(filePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const lines = {};
    for(const word of data.words){
        const { line_num, text, bbox } = word;
        if (!lines[line_num]) lines[line_num] = [];
        lines[line_num].push({ text: text.trim(), bbox, masked: false });
    }

    for(const lineWords of Object.values(lines)){
        const lineText = lineWords.map(w => w.text).join(' ');
        if (!lineText.match(/[\d@]/)) continue;

        let charIndex = 0;
        const wordCharRanges = lineWords.map(word => {
            const start = charIndex;
            const end = start + word.text.length;
            charIndex = end + 1;
            return { start, end };
        });

        for(const regex of Object.values(regexPatterns)){
            let match;
            while ((match = regex.exec(lineText)) !== null){
                const matchStart = match.index;
                const matchEnd = matchStart + match[0].length;

                for(let i = 0; i < wordCharRanges.length; i++){
                    if (lineWords[i].masked) continue;
                    const { start, end } = wordCharRanges[i];
                    if(!(end <= matchStart || start >= matchEnd)){
                        lineWords[i].masked = true;
                    }
                }
            }
        }
    }

    ctx.fillStyle = 'black';
    for(const lineWords of Object.values(lines)){
        for(const word of lineWords){
            if(word.masked){
                const { x0, y0, x1, y1 } = word.bbox;
                if (
                    x0 >= 0 && y0 >= 0 &&
                    x1 <= image.width && y1 <= image.height &&
                    x1 > x0 && y1 > y0
                ){
                    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
                }
            }
        }
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
};

module.exports = {
    censorFile,
};
