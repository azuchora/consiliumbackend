const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { UPLOAD_DIR } = require('./fileService');

const regexPatterns = {
    phone: /(?:\+48[\s-]?|\(\+48\)[\s-]?)?[5-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/g,
    pesel: /\d{11}/g,
    email: /[^\s@]+@[^\s@]+\.[^\s@]+/g
};

const isValidPesel = (pesel) => {
    if (!/^\d{11}$/.test(pesel)) return false;
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(pesel[i], 10) * weights[i];
    }
    let control = (10 - (sum % 10)) % 10;
    if (control !== parseInt(pesel[10], 10)) return false;

    let year = parseInt(pesel.substr(0, 2), 10);
    let month = parseInt(pesel.substr(2, 2), 10);
    let day = parseInt(pesel.substr(4, 2), 10);

    let century;
    if (month > 80) { century = 1800; month -= 80; }
    else if (month > 60) { century = 2200; month -= 60; }
    else if (month > 40) { century = 2100; month -= 40; }
    else if (month > 20) { century = 2000; month -= 20; }
    else { century = 1900; }

    year += century;

    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) return false;

    return true;
}

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

        for(const [key, regex] of Object.entries(regexPatterns)){
            regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(lineText)) !== null){
                const matchStart = match.index;
                const matchEnd = matchStart + match[0].length;
              
                for(let i = 0; i < wordCharRanges.length; i++){
                    if (lineWords[i].masked) continue;
                    const { start, end } = wordCharRanges[i];
                    if(!(end <= matchStart || start >= matchEnd)){
                        if (key === 'pesel') {
                            const matches = lineWords[i].text.match(regexPatterns.pesel);
                            if (matches && matches.some(isValidPesel)) {
                                lineWords[i].masked = true;
                            }
                        } else {
                            lineWords[i].masked = true;
                        }
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
                ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
            }
        }
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
};

module.exports = {
    censorFile,
};