var mhkc = {
    egcd: function (a, b) {
        if (a == 0) {
            return [b, 0, 1];
        } else {
            var s = this.egcd(b % a, a)
            return [s[0], s[2] - Math.floor(b / a) * s[1], s[1]];
        }
    },

    gen_inv_mod: function (a, b) {
        b = parseInt(b);
        var s = this.egcd(a, b);

        if (s[0] != 1) {
            console.log("Модуль и множитель не взаимно простые.");
            return null;
        } else {
            return (s[1] + b) % b;    
        }
    },

    gen_private_key: function (length) {
        var a = [],
            sum = 0;
        
        for (var i = 0; i < parseInt(length); i++) {
            a[i] = sum + Math.floor((Math.random()*20)+1); 
            sum += a[i];
        }

        return a.join(", ");
    },

    gen_multiplier: function (modulo) {
        var n = modulo

        while (n == modulo) {
            n = Math.floor(Math.random() * modulo / 2) * 2 + 1;
            
            while (this.egcd(n,modulo)[0] != 1) {
                n += 2;
            }
        }

        return n;
    },

    gen_mod: function (privateKey, length) {
        return this.get_private_key(privateKey, length)[length] + Math.floor((Math.random() * 100) + 1); 
    },

    get_private_key: function (privateKey, length) {
        var a = privateKey.split(",");

        if (a.length != length) {
            console.log("Длина закрытого ключа " + a.length + ", отличается от указанной ранее");
            return null;
        }
        var sum = 0;
        for (i = 0; i < length; i++) {
        a[i] = parseInt(a[i],10);
        if (a[i] <= sum) {
            console.log("Закрытый ключ не является супервозрастающей последовательностью." + a[i] + " " + sum);
            return null;
        }
        sum += a[i];
        }
        a[length] = sum;
        return a;
    },

    gen_public_key: function (privateKey, length, modulo, multiplier) {
        var a = this.get_private_key(privateKey,length)
        var b = [];
        for (i = 0; i < parseInt(length); i++) {
        b[i] = a[i] * multiplier % modulo;
        }
        return b.join(", ");
    },

    encode: function (text, length, pubkey) {
        var key = pubkey.split(","),
            letter;
        
        if (key.length != length) {
            console.log('Пожалуйста, создайте открытый ключ заново.');
            return null;
        }
        
        letter = [];

        for (var i = 0; i < text.length; i++) {
            var t = text.substring(i, i + 1).charCodeAt(0).toString(2);
            letter[i] = 0;
            
            while (t.length < length) {
                t = '0' + t;
            }

            for (var j = 0; j < length; j++) {
                letter[i] += parseInt(t.substring(j, j + 1)) * parseInt(key[j]);
            }
        }

        return letter.join(", ");
    },

    decode: function (text, length, pKey, invMod, modulo) {
        var privateKey = this.get_private_key(pKey,length),
            a = text.split(","),
            letter = [],
            outText = [];
        
        for (var i = 0; i < a.length; i++) {
            var dec = a[i] * parseInt(invMod,10) % parseInt(modulo,10);
            for (var j = length-1; j>=0; j--)
            {
                if (dec >= privateKey[j]) { 
                    dec -= privateKey[j];
                    letter[j] = 1;
                } else {
                    letter[j] = 0;
                }
            }
            
            outText[i] = String.fromCharCode(parseInt(letter.join(""), 2));
        }
        return outText.join("");
    },

    gen_keys: function (k_len) {
        var pr_key = mhkc.gen_private_key(k_len),
            modulo = this.gen_mod(pr_key, k_len),
            multiplier = this.gen_multiplier(modulo),
            invmodulo = this.gen_inv_mod(multiplier, modulo),
            pub_key = this.gen_public_key(pr_key, k_len, modulo, multiplier);

        return {
            pr_key: pr_key,
            pub_key: pub_key,
            modulo: modulo,
            multiplier: multiplier,
            invmodulo: invmodulo
        }
    }
};

module.exports = mhkc;
