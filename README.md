Pokemon Card Collection App
================================================================================
Responsive, accessible, and not-so-pretty web app to gather your Pokemon cards.

Getting Started
--------------------------------------------------------------------------------
Just search your desired Pokemon either by name or id in the search field.

Design
--------------------------------------------------------------------------------
This app follows a very simple model which is diagrammed below:

![Alt text](images/pokeAppUml.jpg?raw=true "UML of Pokemon Web App")

#### pokeView
The module which only knows the DOM and pokeModel. Main purpose is to interact with DOM.

#### pokeModel
Controls the internal logic of where to retrieve and send relevant data.

#### pokeCache
Instead of relying on the api call leverage client-side local storage for cache (initial limit at 2MB).

#### pokeAPI
The module which is this app's liaison with [PokeApi](https://pokeapi.co).

Built With
--------------------------------------------------------------------------------
* [PokeApi](https://pokeapi.co) - RESTFUL pokemon api for all your pokemon needs.
* HTML/CSS/JS - All vanilla.

Motivation
--------------------------------------------------------------------------------
Build a responsive, accessible web app all front-end. Cement in basic fundamentals.

Aside
--------------------------------------------------------------------------------
In need of a refactor (the script is kind of messy). Need a better UI, for now imitated my personal profile page.