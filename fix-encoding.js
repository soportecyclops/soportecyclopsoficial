const fs = require("fs");

// Mapa de mojibake a caracteres correctos.
// IMPORTANTE: las claves de 2 caracteres van ANTES que "Ã" sola,
// si no, "Ã" se reemplaza primero y corrompe todo lo demás.
const mapa = {
    "Ã¡": "á", "Ã©": "é", "Ã³": "ó", "Ãº": "ú", "Ã±": "ñ", "Ã‘": "Ñ",
    "Ã\u00AD": "í", // í (con carácter invisible U+00AD)
    "Ã\u008D": "Í", // Í (con carácter invisible U+008D)
    "Ã‰": "É", "Ã“": "Ó", "Ãš": "Ú",
    "Â¿": "¿", "Â¡": "¡", "Â·": "·",
    "â€”": "—",
    "â€“": "–",
    "â€¦": "…",
    "â€œ": "\u201C", "â€": "\u201D", "â€™": "'", "â€˜": "'",
    "Ã": "Á" // clave suelta: va AL FINAL para no interferir con las de arriba
};

const archivos = fs.readdirSync("./").filter(f => f.endsWith(".html"));

console.log(`Encontrados ${archivos.length} archivos .html`);

archivos.forEach(archivo => {
    let txt = fs.readFileSync(archivo, "utf8");
    let modificado = false;

    for (const [roto, arreglado] of Object.entries(mapa)) {
        if (txt.includes(roto)) {
            txt = txt.split(roto).join(arreglado);
            modificado = true;
        }
    }

    if (modificado) {
        fs.writeFileSync(archivo + ".bak", fs.readFileSync(archivo));
        fs.writeFileSync(archivo, txt, "utf8");
        console.log(`✅ Ajuste final aplicado en: ${archivo}`);
    } else {
        console.log(`Sin cambios: ${archivo}`);
    }
});

console.log("Listo.");
