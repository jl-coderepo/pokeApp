/*
    Plan:
    1. Module in sending/retrieving from PokeAPI
    2. Module for caching
    3. Module in interacting with dom
    4. Module for model, the only thing the other module interacts with
*/

class PokeCard{
    constructor(name,id,types,abilities){
        this.name = name;
        this.id = id;
        this.types = types;
        this.abilities = abilities;
    }
}

/* ----------------------------------------------- */
const pokeCache = (function(){
    /*
        local cache
    */
    const _ABSOLUTESIZE = 2048; //in kb for now, not accounting for _SIZE...
    const _SIZE = "_SIZE"; //quick way to figure out the size

    function _getSize(str){
        return 2*(3+((str.length*16)/(8*1024)));
    }
    function _removeOld(curSize,localStorageSize){
        //didn't wanted to implement a minheap...and just ease of use just randomly removing one
        if(window.localStorage.length<1) return; //can't remove
        let keyToRemove = window.localStorage.key(0);
        let deadPokeCardSize = window.localStorage.getItem(keyToRemove);
        let idToRemove = deadPokeCardSize.id;
        deadPokeCardSize = _getSize(deadPokeCard);
        let newSize = (localStorageSize-deadPokeCardSize);
        newSize = newSize.toString();
        window.localStorage.setItem(_SIZE,newSize);
        window.localStorage.removeItem(keyToRemove);
        window.localStorage.removeItem(idToRemove);
        return;
    };
    function cache(pokeCard){
        console.log(`  __IN pokeCache.cache:: with localStorage.length = ${window.localStorage.length}`);
        let strPokeCard = JSON.stringify(pokeCard);
        let curSize = _getSize(strPokeCard);
        let localStorageSize = parseInt(JSON.parse(window.localStorage.getItem(_SIZE)));
        console.log(`  __IN pokeCache.cache:: current localStorage size = ${localStorageSize}kb`);
        localStorageSize=(Number.isNaN(localStorageSize))?0:localStorageSize;
        if(window.localStorage.getItem(pokeCard.name)!=null && 
            localStorageSize+curSize > _ABSOLUTESIZE){
            console.log('  __IN pokeCache.cache:: about to remove one random card from cache');
            _removeOld(curSize,localStorageSize);
            //just do it twice...not good code, but tired
            localStorageSize = parseInt(JSON.parse(window.localStorage.getItem(_SIZE)));
            _removeOld(curSize,localStorageSize);
        }
        if(window.localStorage.getItem(pokeCard.name)==null && 
            window.localStorage.getItem(pokeCard.id)==null){
            localStorageSize=window.localStorage.getItem(_SIZE);
            localStorageSize = parseInt(localStorageSize);
            localStorageSize=(Number.isNaN(localStorageSize))?0:localStorageSize;
            console.log(localStorageSize);
            localStorageSize += curSize;
            console.log(`  __IN pokeCache.cache:: about to set localStorage size as = ${localStorageSize}kb`);
            localStorageSize= JSON.stringify(localStorageSize);
            window.localStorage.setItem(_SIZE,localStorageSize);
            window.localStorage.setItem(pokeCard.name,JSON.stringify(pokeCard));
            window.localStorage.setItem(pokeCard.id,JSON.stringify(pokeCard));
        }
    };
    function request(input){
        if(window.localStorage.length<1) return null;
        let pokeCard = window.localStorage.getItem(input);
        if(pokeCard!=null){
            console.log(" __In pokeCache.request:: found cache");
            pokeCard = JSON.parse(pokeCard);
        }
        return pokeCard;
    }
    function requestAll(){
        if(window.localStorage.length<1) return null;
        let cardList = [];
        let regnums = /^[0-9]+$/;
        let curKey;
        let curCard;
        for(let i = 0; i<window.localStorage.length; i++){
            curKey = window.localStorage.key(i);
            if(curKey.match(regnums)){
                curCard = window.localStorage.getItem(curKey);
                curCard = JSON.parse(curCard);
                cardList.push(curCard);
            }
        }
        return cardList;
    };

    return {cache: cache, request: request, requestAll: requestAll};
})();

/* ----------------------------------------------- */
const pokeAPI = (function(){
    /*
        handles api calls
    */
    const POKEURL = "https://pokeapi.co/api/v2/pokemon/";

    function _makeCard(parsed){
        let pokeCard = new PokeCard(parsed.name,parsed.id,parsed.types,parsed.abilities);
        console.log(pokeCard);
        return pokeCard;
    };

    function request(input=''){
        fetch(POKEURL+input)
        .then(res=>res.json())
        .then(parsed=>{
            let pokeCard = _makeCard(parsed);
            pokeModel.send(pokeCard);
            console.log(parsed);
        })
        .catch(err=>{
            pokeModel.badRequest();
            console.error(err);
        });
        //console.log(parseResp);
    };

    return {request: request};
})();

/* ----------------------------------------------- */
const pokeView = (function(){
    const _POKEDISPLAY = document.getElementById('display-segment');
    const _POKEQUERY = document.querySelector('#query-segment');
    const _POKEINPUT = document.querySelector('#pokemonSearchField');
    const _POKETEMPLATE = document.querySelector('div.poke-card');
    const _BADSEARCH = document.querySelector('#bad-search');
    const _REGLETTERS = /^[a-zA-Z]+$/;
    const _REGNUMS = /^[0-9]+$/;
    
    let _cardsList = []; //not strictly necessary, useful when remove is implemented

    function _initEventListeners(){
        _POKEQUERY.addEventListener("submit",()=>{_findCard(_POKEINPUT.value)});
        _POKEQUERY.addEventListener("click",(e)=>{
            if(!e.target.matches('input.btn')) return;
            _findCard(_POKEINPUT.value);
        });
        return;
    };
    function _findCard(searchInput){
        if(_BADSEARCH.style.display==='block')
            _BADSEARCH.style.display='none';
        console.log(searchInput);
        if(!searchInput.match(_REGLETTERS) && !searchInput.match(_REGNUMS)){
            _BADSEARCH.style.display='block';
            return;
        }
        pokeModel.requestHandler(searchInput);
        return;
    };
    function _buildCard(pokeCard){
        //returns node
        _cardsList.push(pokeCard);
        let pokeNode = _POKETEMPLATE.cloneNode(true);
        pokeNode.style.display = "block";
        pokeNode.querySelector("h6.poke-name").innerText = pokeCard.name;
        pokeNode.querySelector("div.poke-id div.col-right").innerText = pokeCard.id;
        let types = '';
        pokeCard.types.forEach((type,idx)=>{types+=" "+type.type.name});
        pokeNode.querySelector("div.poke-type div.col-right").innerText = types;
        let abilities = '';
        pokeCard.abilities.forEach((ability,idx)=>{abilities+=" "+ability.ability.name});
        pokeNode.querySelector("div.poke-ability div.col-right").innerText = abilities;
        return pokeNode;
    };
    function badRequest(){
        _BADSEARCH.style.display='block';
    }
    function renderCard(pokeCard){
        let pokeNode = _buildCard(pokeCard);
        _POKEDISPLAY.appendChild(pokeNode);
        return;
    };
    function initPokeView(cardList=[]){
        cardList.forEach((card)=>{
            renderCard(card);
        });
        _initEventListeners();
        return;
    };

    return {initPokeView: initPokeView, renderCard: renderCard, badRequest: badRequest};
})();

/* ----------------------------------------------- */
const pokeModel = (function(){
    /*
        brings everything together
        pokeView -> pokeModel -> pokeAPI
                              -> pokeStorage
        pokeStorage -> pokeModel -> pokeView
    */
    function send(pokeCard){
        pokeCache.cache(pokeCard);
        pokeView.renderCard(pokeCard);
        return;
    }
    function badRequest(){
        pokeView.badRequest();
        return;
    }
    function requestHandler(input){
        //try cache first (synchronous), and api if necessary (async);
        let pokeCard = pokeCache.request(input);
        if(pokeCard==null){
            pokeAPI.request(input);
            return;
        }
        pokeView.renderCard(pokeCard);
        return;
    };
    function initPokeModel(){
        let cardList = pokeCache.requestAll();
        cardList = (cardList==null)?[]:cardList;
        pokeView.initPokeView(cardList);
    };
    return {requestHandler: requestHandler, badRequest: badRequest, send: send, initPokeModel: initPokeModel};
})();


// pokeView.initPokeView([testPoke,testPoke2,testPoke]);
pokeModel.initPokeModel();