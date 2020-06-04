// Global app controller
// API URL https://superheroapi.com/api/key
// API key 10101631768465499

// Marvel API Public Key: ecd5a195baae7957b0d43cacbe0cd4d7
// Marvel API Private Key: db1ae940531cb9726485651880a68aaaee537f57
// Marvel endpoint: http(s)://gateway.marvel.com/
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';


/** Global state of the app
* - Includes search object
* - current recipe object
* - shopping list object
* - Liked recipes
*/

const state = {};
window.state = state;

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => 
{
// 1. Get qeury from the view
    const query = searchView.getInput();

if (query)
    {
        // 2. New search object and add it to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4. Search for recipes
            await state.search.getResults();

            // 5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('There is an error displaying the search results');
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-inline');
    if (btn)
    {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    // 1. Get the ID from the URL
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id)
    {
        // 2. Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Higlight selected search item
        if(state.search) searchView.highlightSelected(id);

        // 3. Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Try...catch error handling

            // 4. Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // 5. Calculate serving and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // 6. Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err) {
            console.log(err);
            alert('Error processing recipe');
        }
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
// This does the same thing as above, but in one line
['hashchange', 'load'].forEach((event) => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */
// state.likes = new Likes();
const controlList = () => {
    // Create a new list IF there is none yet
    if (!state.list) state.list = new List();
    
    // Add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {

    // Goes to closest shopping item
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *'))
    {
        // delete from state
        state.list.deleteItem(id);

        // delete from UI
        listView.deleteItem(id);

    } else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }

});

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {

    if (!state.likes) state.likes = new Likes();    
    const currentID = state.recipe.id;

    // User has not yet liked current recipe
    if (!state.likes.isLiked(currentID))
    {
        // add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // toggle the like button
        likesView.toggleLikeBtn(true);

        // add like to the UI list
        likesView.renderLike(newLike);

    // User HAS liked the current recipe    
    } else {
        // remove like from the state
        state.likes.deleteLike(currentID);
        // toggle the like button
        likesView.toggleLikeBtn(false);

        // remove the like from the UI
        likesView.deleteLike(currentID);        
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease button is clicked
        if(state.recipe.servings > 1) 
        {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        // Like controller
        controlLike();
    }
});
