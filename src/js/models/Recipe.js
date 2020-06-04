import axios from 'axios';
// import { key, proxy } from '../config';

export default class Recipe 
{
    constructor(id)
    {
        this.id = id;
    }

    async getRecipe()
    {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error)
        {
            console.log(error);
            alert('Something went wrong!');
        }
    }

    calcTime()
    {
        // Assuming that we need 15 min for each 3 ingredients.
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings()
    {
        this.servings = 4;
    }

    /** The purpose of this method is to create an array 
    *  that returns new ingredients based on the old ones.
    */
    parseIngredients()
    {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        // ... destructering takes all the elements from unitsShort and places them in units so that we can add two new units.
        const units = [...unitsShort, 'kg', 'g'];
    
        // 1. Loop over ingredients so that you can add new ingredients to the array. .Map creates a new array.
        /** 
         * Returns a new Ingredient object
        */
        const newIngredients = this.ingredients.map((el) => {
            // 2. Uniform units
            // Set ingredients to all elements in the array
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            // 3. Remove Parenthesis. Regular expression.
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 4. Parse ingredients into count, unit and ingredient. Return to new array.
            /* Test if there is a unit in the string and if so, where it is located.
            * only way to find the position of a unit, if you don't know what it already is or if it varies
            */
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;

            // -1 in this case means that it couldn't find the element. So they all turned out to be false.
            if (unitIndex > -1)
            {
                // There is a unit
                // example: 4 1/2 cups, arrCount = [4, 1/2]
                // example2: 4 cups, arrCount = [4]
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1)
                {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    // count = array of ingredients from the beginning to the UnitIndex
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };

            } else if (parseInt(arrIng[0], 10)){
                // There is NO unit, but first element is a number.
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }

            } else if (unitIndex === -1){
                // There is NO unit and NO number in the first position.
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;

        });
        this.ingredients = newIngredients;
    }

    updateServings(type)
    {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count = ing.count * (newServings / this.servings);
        });

        this.servings = newServings;
    }
}
