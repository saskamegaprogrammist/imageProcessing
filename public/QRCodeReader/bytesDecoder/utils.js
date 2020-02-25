const modes = {
    '0111' : "ECI",
    '0001' : "NUM",
    '0010' : "ALPHANUM",
    '0100' : "BYTE"
};

const charCount = {
    '0001' :  10,
    '0010' : 9,
    '0100' : 8
};

export {modes, charCount};