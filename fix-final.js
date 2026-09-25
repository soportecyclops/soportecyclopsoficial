const fs = require("fs");

const mapa = {
    "Ã¡": "á", "Ã©": "é", "Ã³": "ó", "Ãº": "ú", "Ã±": "ñ", "Ã‘": "Ñ",
    "Ã\xAD": "í", "Ã\x8D": "Í", // Caracteres con salto invisible
    "Ã": "Á", "Ã‰": "É", "Ã“": "Ó", "Ãš": "Ú",
    "Â¿": "¿", "Â¡": "¡", "Â·": "·",
    "â€”": "—", "â€“": "–", "â€¦": "…", 
    "â€œ": "“", "â€": "”", "â€™": "’", "â€˜": "‘"
};

// Magia clave: ordenar de mayor a menor longitud para que "â€”" se evalúe antes que "â" sola.
const clavesOrdenadas = Object.keys(mapa).sort((a, b) => b.length - a.length);

const archivos = fs.readdirSync("./").filter(f => f.endsWith(".html"));

archivos.forEach(archivo => {
    let txt = fs.readFileSync(archivo, "utf8");
    let modificado = false;

    for (const roto of clavesOrdenadas) {
        if (txt.includes(roto)) {
            txt = txt.split(roto).join(mapa[roto]);
            modificado = true;
        }
    }

    if (modificado) {
        fs.writeFileSync(archivo, txt, "utf8");
        console.log(`✅ Ajuste final aplicado en: ${archivo}`);
    }
});