let loaded = false;
let flask;
//Класс каталога
class Workplace {
    constructor(items) {
        this.content = items;
    }
    generateFlask () {
        flask = new Flask('Основной сосуд', 'unlimited');
    }
    loadList = () => {
        this.generateFlask();
        let items = [];
 
        let gettingIngredients = new XMLHttpRequest();
        gettingIngredients.open('GET', './ingredients.php?function=get', true);
        gettingIngredients.onreadystatechange = function () {
            if (gettingIngredients.readyState !== 4) {
                return;
            }
            if (gettingIngredients.status !== 200) {
                console.log('Не удалось получить список субстанций!');
                return;
            }
            let IngredientsArray = JSON.parse(gettingIngredients.responseText);
            for (let i = 0; i < IngredientsArray.length; i++) {
                items.push(new Ingredient(IngredientsArray[i].id, IngredientsArray[i].name, IngredientsArray[i].property));
            }
            requestIsDone();
        };
        gettingIngredients.send();
        function requestIsDone() {
            this.content = items;
            this.renderList();
        }
    }
    renderList = () => {
        let wrapper = document.querySelector(".ingredient-list-wrapper");
        wrapper.innerHTML = '';
        let renderResult = '';
        for (let i = 0; i < this.content.length; i++) {
            if (this.content[i] instanceof Ingredient) {
                renderResult += this.content[i].render(true);
            }
        }
        wrapper.innerHTML += renderResult;
        let cards = document.querySelectorAll('.ingredient-item');
        let buttonsAdd = document.querySelectorAll('.btn__add');
        let volumes = document.querySelectorAll('.ingredient-volume');
        let volumeRE = /^[1-9][0-9]*/;
        if (!loaded) {
            let target = document.querySelector('.mixture-zone');
            target.addEventListener('dragover', dragOver);
            target.addEventListener('dragenter', dragEnter);
            target.addEventListener('dragleave', dragLeave);
            target.addEventListener('drop', dragDrop);
            loaded = true;
            let buttonSave = document.querySelector('.btn__save');
            buttonSave.addEventListener('click', saveMixture);
        }
        for (let i = 0; i < buttonsAdd.length; i++) {
            cards[i].addEventListener('dblclick', function () {
                if (volumes[i].value.match(volumeRE)) {
                    console.log(volumes[i].value);
                    this.content[i]['volume'] = volumes[i].value;
                    this.addToFlask(i);
                    return true;
                } else {
                    alert("Объем в миллилитрах задан неверно!");
                    return false;
                }
            }, false);
            cards[i].addEventListener('dragstart', dragStart);
            cards[i].addEventListener('dragend', dragEnd);
            buttonsAdd[i].addEventListener('click', function () {
                if (volumes[i].value.match(volumeRE)) {
                    console.log(volumes[i].value);
                    this.content[i]['volume'] = volumes[i].value;
                    this.addToFlask(i);
                    return true;
                } else {
                    alert("Объем в миллилитрах задан неверно!");
                    return false;
                }
            }, false);
        }

        function dragStart() {
            this.className += ' hold';
            setTimeout(() => (this.className += ' invisible'), 0);
        }

        function dragEnd() {
            this.className = 'ingredient-item';

        }

        function dragOver(e) {
            e.preventDefault();

        }

        function dragEnter(e) {
            e.preventDefault();
            this.className += ' hovered';
        }

        function dragLeave() {
            this.className = 'mixture-zone';
        }

        function dragDrop() {
            this.className = 'mixture-zone';
            let volumes = document.querySelectorAll('.ingredient-volume');
            let volumeRE = /^[1-9][0-9]*/;
            let cardsDraggable = document.querySelectorAll('[draggable="true"]');
            for (let i = 0; i < cardsDraggable.length; i++) {
                if (cardsDraggable[i].matches('.invisible')) {
                    console.log(i);
                    if (volumes[i].value.match(volumeRE)) {
                        this.content[i]['volume'] = volumes[i].value;
                        this.addToFlask(i);
                        return true;
                    } else {
                        alert("Объем в миллилитрах задан неверно!");
                        return false;
                    }
                }
            }
        }
        function saveMixture() {
            let namefield = document.querySelector('.mixture-name');
            let ingArr = [];
            let volArr = [];
            console.log(flask.content.length);
            for (let i = 0; i < flask.content.length; i++) {
                ingArr.push(flask.content[i]['id']);
                volArr.push(flask.content[i]['volume']);
            }
            let data = {
                'name': namefield.value || 'Без названия',
                'ingredients': ingArr,
                'volumes': volArr
            };
            let postMixture = new XMLHttpRequest();
            postMixture.open('POST', './save.php', true);
            postMixture.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            postMixture.onreadystatechange = function () {
                if (postMixture.readyState !== 4) {
                    return;
                }
                if (postMixture.status !== 200) {
                    console.log('Не удалось отправить!');
                    return;
                }
                location.reload();
            };
            postMixture.send(JSON.stringify(data));
        }
    }
    addToFlask(index) {
        flask.addIngredient(this.content[index])
        this.content.splice(index, 1);
        this.renderList();
    }
    removeFromFlask(ingredient) {
        this.content.push(ingredient);
    }
}

//Класс сосуда
class Flask {
    constructor(name = 'default flask', volume = 1000) {
        this.name = name;
        this.volume = volume;
        this.content = [];
        this.summary = 0;
    }
    addIngredient(sub) {
        this.content.push(sub);
        this.renderFlask();
        this.calculate();
    }
    removeIngredient(sub) {
        catalog.removeFromFlask(this.content[sub]);
        this.content.splice(sub, 1);
        this.renderFlask();
        this.calculate();
        catalog.renderList();
    }
    renderFlask = () => {
        let wrapper = document.querySelector(".mixture-zone");
        wrapper.innerHTML = '';
        let renderResult = '';
        for (let i = 0; i < this.content.length; i++) {
            if (this.content[i] instanceof Ingredient) {
                renderResult += this.content[i].render(false);
            }
        }
        wrapper.innerHTML += renderResult;
        let buttonsChange = document.querySelectorAll('.btn__changeVolume');
        for (let i = 0; i < buttonsChange.length; i++) {
            buttonsChange[i].addEventListener('click', function () {
                let volumes = document.querySelectorAll('.ingredient-volume__inFlask');
                let volumeRE = /^[1-9][0-9]*/;
                if (volumes[i].value.match(volumeRE)) {
                    console.log(volumes[i].value);
                    this.content[i]['volume'] = volumes[i].value;
                    this.calculate();
                    return true;
                } else {
                    alert("Объем в миллилитрах задан неверно!");
                    return false;
                }
            }, false);
        }
        let buttonsRemove = document.querySelectorAll('.btn__remove');
        for (let p = 0; p < buttonsRemove.length; p++) {
            buttonsRemove[p].addEventListener('click', function () {
                this.removeIngredient(p);
            }, false);
        }
    }
    calculate = () => {

        let summary = 0;
        for (let i = 0; i < this.content.length; i++) {
            summary += parseFloat(this.content[i]['volume']);
        }
        this.summary = summary;
        this.result();
    }
    result() {
        let resultWrapper = document.querySelector('.mixture-result');
        let saveWrapper = document.querySelector('.save-wrapper');
        if (this.summary > 0) {

            console.log('result');
            let finalResult = 'Полный объем - ' + this.summary + 'мл.:</br>';
            for (let i = 0; i < this.content.length; i++) {
                let percentage = this.content[i]['volume'] / this.summary * 100;
                percentage = (parseFloat(percentage)).toFixed(2);
                finalResult += 'На ' + percentage + '% ' + this.content[i]['property'] + ' (' + this.content[i]['name'] + ' - ' + this.content[i]['volume'] + 'мл.)</br>'
            }
            resultWrapper.innerHTML = finalResult;
            console.log(JSON.stringify(flask));
            saveWrapper.style.display = "block";
        } else {
            let namefield = document.querySelector('.mixture-name');
            namefield.value = '';
            resultWrapper.innerHTML = '';
            saveWrapper.style.display = "none";
        }
    }
}

//Класс субстанции
class Ingredient {
    constructor(id, name, property, volume = 100, soa = 'liquid') {
        this.id = id;
        this.name = name;
        this.property = property;
        this.volume = volume;
        this.stateOfAggregation = soa;
    }
    render(bool) {
        if (bool) {
            let renderResult = '';
            renderResult = '<div class="ingredient-item" draggable="true"><p class="ingredient ingredient-name">' + this.name + '</p><p class="ingredient ingredient-property">' + this.property + '</p><input class="ingredient ingredient-volume" type="number" min="1" step="1" placeholder="Объем, мл." value="' + this.volume + '"><button class="btn__add">Добавить</button></div>';
            return renderResult;
        } else {
            let renderResult = '';
            renderResult = '<div class="ingredient-item" draggable="false"><p class="ingredient ingredient-name">' + this.name + '</p><p class="ingredient ingredient-property">' + this.property + '</p><input class="ingredient ingredient-volume__inFlask" type="number" min="1" step="1" placeholder="Объем, мл." value="' + this.volume + '"><button class="btn__changeVolume">Изменить объем</button><button class="btn__remove">Удалить</button></div>';
            return renderResult;
        }
    }
}

let workplace = new Workplace();
workplace.loadList();