export function format(number) {
    if (number < 1000)
        return Math.floor(number);

    if (number === Infinity || number > Number.MAX_VALUE)
        return "∞";

    let tier = Math.floor(Math.log10(number) / 3) - 1;
    tier = Math.min(tier, suffixes.length - 1);

    const scale = 10 ** ((tier + 1) * 3);
    const value = number / scale;

    return value.toFixed(2).replace(/\.00$/, "") + suffixes[tier];
}

export const suffixes = [
    "K",   // thousand
    "M",   // million
    "B",   // billion
    "T",   // trillion
    "Qa",  // quadrillion
    "Qi",  // quintillion
    "Sx",  // sextillion
    "Sp",  // septillion
    "Oc",  // octillion
    "No",  // nonillion
    "Dc",   // decillion
    "UDc",  // undecillion
    "DDc",  // duodecillion
    "TDc",  // tredecillion
    "QaDc", // quattuordecillion
    "QiDc", // quindecillion
    "SxDc", // sexdecillion
    "SpDc", // septendecillion
    "OcDc", // octodecillion
    "NoDc", // novemdecillion
    "Vg",   // vigintillion
    "UVg",  // unvigintillion
    "DVg",  // duovigintillion
    "TVg",  // trevigintillion
    "QaVg", // quattuorvigintillion
    "QiVg", // quinvigintillion
    "SxVg", // sexvigintillion
    "SpVg", // septenvigintillion
    "OcVg", // octovigintillion
    "NoVg", // novemvigintillion
    "Tg",   // trigintillion
    "UTg",  // untrigintillion
    "DTg",  // duotrigintillion
    "TTg",  // tretrigintillion
    "QaTg", // quattuortrigintillion
    "QiTg", // quintrigintillion
    "SxTg", // sextrigintillion
    "SpTg", // septentrigintillion
    "OcTg", // octotrigintillion
    "NoTg", // novemtrigintillion
    "QaTg", // quattuordecillion
    "QiTg", // quindecillion
    "SxTg", // sexdecillion
    "SpTg", // septendecillion
    "OcTg", // octodecillion
    "NoTg", // novemdecillion
    "Vg",   // vigintillion
    "UVg",  // unvigintillion
    "DVg",  // duovigintillion
    "TVg",  // trevigintillion
    "QaVg", // quattuorvigintillion
    "QiVg", // quinvigintillion
    "SxVg", // sexvigintillion
    "SpVg", // septenvigintillion
    "OcVg", // octovigintillion
    "NoVg", // novemvigintillion
    "Tg",   // trigintillion
    "UTg",  // untrigintillion
    "DTg",  // duotrigintillion
    "TTg",  // tretrigintillion
    "QaTg", // quattuortrigintillion
    "QiTg", // quintrigintillion
    "SxTg", // sextrigintillion
    "SpTg", // septentrigintillion
    "OcTg", // octotrigintillion
    "NoTg", // novemtrigintillion
    "QaTg", // quattuordecillion
    "QiTg", // quindecillion
    "SxTg", // sexdecillion
    "SpTg", // septendecillion
    "OcTg", // octodecillion
    "NoTg", // novemdecillion
    "Vg",   // vigintillion
    "UVg",  // unvigintillion
    "DVg",  // duovigintillion
    "TVg",  // trevigintillion
    "QaVg", // quattuorvigintillion
    "QiVg", // quinvigintillion
    "SxVg", // sexvigintillion
    "SpVg", // septenvigintillion
    "OcVg", // octovigintillion
    "NoVg", // novemvigintillion
    "Tg",   // trigintillion
    "UTg",  // untrigintillion
    "DTg",  // duotrigintillion
    "TTg",  // tretrigintillion
    "QaTg", // quattuortrigintillion
    "QiTg", // quintrigintillion
    "SxTg", // sextrigintillion
    "SpTg", // septentrigintillion
    "OcTg", // octotrigintillion
    "NoTg", // novemtrigintillion
    "QaTg", // quattuordecillion
    "QiTg", // quindecillion
    "SxTg", // sexdecillion
    "SpTg", // septendecillion
    "OcTg", // octodecillion
    "NoTg", // novemdecillion
    "Vg",   // vigintillion
    "UVg",  // unvigintillion
    "DVg",  // duovigintillion
    "TVg",  // trevigintillion
    "QaVg", // quattuorvigintillion
    "QiVg", // quinvigintillion
    "SxVg", // sexvigintillion
    "SpVg", // septenvigintillion
    "OcVg", // octovigintillion
    "NoVg", // novemvigintillion
    "Tg",   // trigintillion
    "UTg",  // untrigintillion
    "DTg",  // duotrigintillion
    "TTg",  // tretrigintillion
    "QaTg", // quattuortrigintillion
    "QiTg", // quintrigintillion
    "SxTg", // sextrigintillion
    "SpTg", // septentrigintillion
    "OcTg", // octotrigintillion
    "NoTg", // novemtrigintillion
];
