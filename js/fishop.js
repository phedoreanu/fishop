var Fishop = (function () {
    function Fishop(shop, owner) {
        var _this = this;
        this.shop = shop;
        this.owner = owner;
        var takeButton = document.querySelector('#shopTankButton');
        takeButton.addEventListener('click', function () {
            var body = document.querySelector('body');
            body.setAttribute('class', 'waiting');
            _this.compatible()
                .then(function (response) {
                if (response.canLiveTogether) {
                    _this.shop.swap(_this.owner);
                    document.querySelector('#buy').removeAttribute('disabled');
                    takeButton.setAttribute('disabled', 'true');
                }
                else
                    alert('The selected fish will eat each other!');
                body.removeAttribute('class');
            })["catch"](function (error) {
                alert(error.message);
                body.removeAttribute('class');
            });
        });
        var sellButton = document.querySelector('#ownerTankButton');
        sellButton.addEventListener('click', function () {
            _this.owner.swap(_this.shop);
            if (_this.owner.fish.length == 0)
                document.querySelector('#buy').setAttribute('disabled', 'true');
            sellButton.setAttribute('disabled', 'true');
        });
    }
    Fishop.prototype.compatible = function () {
        var options = Array.from(this.shop.select.selectedOptions);
        var newFish = this.owner.fish.slice(); // copy array
        for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
            var opt = options_1[_i];
            newFish.push(opt.text);
        }
        return http('post', 'https://fishshop.attest.tech/compatibility', JSON.stringify({ fish: newFish }));
    };
    return Fishop;
}());
var Tank = (function () {
    function Tank(element, fish) {
        this.select = document.querySelector("#" + element);
        this.select.addEventListener('change', function () {
            document.querySelector("#" + element + "Button").removeAttribute('disabled');
        });
        this.fish = new Proxy(fish, {
            set: function (target, property, value) {
                target[property] = value;
                if (property === 'length')
                    document.querySelector("#" + element + "Total").textContent = "Total: " + value;
                return true;
            }
        });
        for (var _i = 0, _a = this.fish; _i < _a.length; _i++) {
            var fish_1 = _a[_i];
            this.select.add(new Option(fish_1, fish_1));
        }
        document.querySelector("#" + element + "Total").textContent = "Total: " + this.fish.length;
    }
    Tank.prototype.swap = function (newTank) {
        var selectedOptions = Array.from(this.select.selectedOptions);
        for (var _i = 0, selectedOptions_1 = selectedOptions; _i < selectedOptions_1.length; _i++) {
            var opt = selectedOptions_1[_i];
            opt.remove();
            this.fish.splice(opt.index, 1);
            opt.selected = false;
            newTank.select.sort(opt);
            newTank.fish.push(opt.text);
        }
    };
    return Tank;
}());
HTMLSelectElement.prototype.sort = function (opt) {
    var tmp = Array.from(this.options);
    tmp.push(opt);
    tmp.sort(function (a, b) {
        return a.text.localeCompare(b.text);
    });
    for (var _i = 0, tmp_1 = tmp; _i < tmp_1.length; _i++) {
        var opt_1 = tmp_1[_i];
        this.add(opt_1);
    }
};
function http(method, url, payload, async) {
    if (async === void 0) { async = true; }
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.onload = function () {
            if (request.status === 200)
                resolve(JSON.parse(request.responseText));
            else
                reject(new Error(JSON.parse(request.responseText).errorMessage));
        };
        request.onerror = function () {
            reject(new Error(JSON.parse(request.responseText).errorMessage));
        };
        request.open(method, url, async);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(payload);
    });
}
window.onload = function () {
    var shopTankFish = ['american_crayfish', 'barreleye', 'batfish', 'battered_cod', 'betta_splendens', 'bonnethead', 'cichlids', 'cleaner_shrimp', 'cocoa_damselfish', 'coelocanth', 'cookiecutter', 'cuttlefish', 'damselfish', 'dragon_wrasse', 'electrophorus', 'elephant_seal', 'elvers', 'fanfin_seadevil', 'fish_fingers', 'french_angel_fish', 'hammerhead', 'harlequin_shrimp', 'hawksbill_turtle', 'megalodon', 'minnow', 'neon_tetra', 'oarfish', 'painted_lobster', 'prawn_cocktail', 'psychedelic_frogfish', 'robocod', 'salmon_shark', 'sand_eel', 'sea_lion', 'shortfin_mako_shark', 'slipper_lobster', 'sockeye_salmon', 'spanish_hogfish', 'spinner_dolphin', 'stauroteuthis', 'stingray', 'sunstar', 'symphysodon', 'torquigener'];
    var shopTank = new Tank('shopTank', shopTankFish);
    var ownerTank = new Tank('ownerTank', []);
    new Fishop(shopTank, ownerTank);
};
//# sourceMappingURL=fishop.js.map