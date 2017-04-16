class Fishop {
    private shop: Tank;
    private owner: Tank;

    constructor(shop: Tank, owner: Tank) {
        this.shop = shop;
        this.owner = owner;
        const takeButton = document.querySelector('#shopTankButton')!;
        takeButton.addEventListener('click', () => {
            const body = document.querySelector('body')!;
            body.setAttribute('class', 'waiting');
            this.compatible()
                .then(response => {
                    if (response.canLiveTogether) {
                        this.shop.swap(this.owner);
                        document.querySelector('#buy')!.removeAttribute('disabled');
                        takeButton.setAttribute('disabled', 'true');
                    } else
                        alert('The selected fish will eat each other!');
                    body.removeAttribute('class');
                })
                .catch(error => {
                    alert(error.message);
                    body.removeAttribute('class');
                });
        });
        const sellButton = document.querySelector('#ownerTankButton')!;
        sellButton.addEventListener('click', () => {
            this.owner.swap(this.shop);
            if (this.owner.fish.length == 0)
                document.querySelector('#buy')!.setAttribute('disabled', 'true');
            sellButton.setAttribute('disabled', 'true');
        });
    }

    compatible(): Promise<any> {
        const options = Array.from(this.shop.select.selectedOptions);
        const newFish = this.owner.fish.slice(); // copy array
        for (let opt of options)
            newFish.push((<HTMLOptionElement>opt).text);
        return http('post', 'https://fishshop.attest.tech/compatibility', JSON.stringify({fish: newFish}));
    }
}

class Tank {
    select: HTMLSelectElement;
    fish: string[];

    constructor(element: string, fish: string[]) {
        this.select = <HTMLSelectElement>document.querySelector(`#${element}`);
        this.select.addEventListener('change', function () {
            document.querySelector(`#${element}Button`)!.removeAttribute('disabled');
        });
        this.fish = new Proxy(fish, {
            set: function (target: any, property: any, value: any) {
                target[property] = value;
                if (property === 'length')
                    document.querySelector(`#${element}Total`)!.textContent = `Total: ${value}`;
                return true;
            }
        });
        for (let fish of this.fish)
            this.select.add(new Option(fish, fish));
        document.querySelector(`#${element}Total`)!.textContent = `Total: ${this.fish.length}`;
    }

    swap(newTank: Tank) {
        const selectedOptions = Array.from(this.select.selectedOptions);
        for (let opt of selectedOptions) {
            opt.remove();
            this.fish.splice(opt.index, 1);
            opt.selected = false;
            newTank.select.sort(opt);
            newTank.fish.push(opt.text);
        }
    }
}

HTMLSelectElement.prototype.sort = function (opt: HTMLOptionElement) {
    const tmp = Array.from(this.options);
    tmp.push(opt);
    tmp.sort(function (a: HTMLOptionElement, b: HTMLOptionElement): number {
        return a.text.localeCompare(b.text);
    });
    for (let opt of tmp)
        this.add(opt);
};

function http(method: string, url: string, payload: string, async: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
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

window.onload = () => {
    const shopTankFish = ['american_crayfish', 'barreleye', 'batfish', 'battered_cod', 'betta_splendens', 'bonnethead', 'cichlids', 'cleaner_shrimp', 'cocoa_damselfish', 'coelocanth', 'cookiecutter', 'cuttlefish', 'damselfish', 'dragon_wrasse', 'electrophorus', 'elephant_seal', 'elvers', 'fanfin_seadevil', 'fish_fingers', 'french_angel_fish', 'hammerhead', 'harlequin_shrimp', 'hawksbill_turtle', 'megalodon', 'minnow', 'neon_tetra', 'oarfish', 'painted_lobster', 'prawn_cocktail', 'psychedelic_frogfish', 'robocod', 'salmon_shark', 'sand_eel', 'sea_lion', 'shortfin_mako_shark', 'slipper_lobster', 'sockeye_salmon', 'spanish_hogfish', 'spinner_dolphin', 'stauroteuthis', 'stingray', 'sunstar', 'symphysodon', 'torquigener'];
    const shopTank = new Tank('shopTank', shopTankFish);
    const ownerTank = new Tank('ownerTank', []);

    new Fishop(shopTank, ownerTank);
};
