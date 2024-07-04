function submitIngredients() {
    const selectedIngredients = Array.from(document.querySelectorAll('.ingredient-list input:checked'))
        .map(checkbox => checkbox.value);

    fetch('/getRecipesByIngredients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingredients: selectedIngredients })
    })
    .then(response => response.json())
    .then(recipes => {
        const recipeContainer = document.getElementById('recipeContainer');
        recipeContainer.innerHTML = '';

        if (recipes.length === 0) {
            const noRecipesMessage = document.createElement('p');
            noRecipesMessage.textContent = 'No recipes found for the selected ingredients.';
            noRecipesMessage.className = 'no-recipes-message';
            recipeContainer.appendChild(noRecipesMessage);
        } else {
            recipes.forEach(recipe => {
                const recipeCard = document.createElement('div');
                recipeCard.className = 'recipe-card';

                const recipeImage = document.createElement('img');
                recipeImage.src = recipe.image ? recipe.image : 'assets/default_recipe_image.png';
                recipeImage.alt = recipe.name;
                recipeCard.appendChild(recipeImage);

                const recipeName = document.createElement('h3');
                recipeName.textContent = recipe.name;
                recipeCard.appendChild(recipeName);

                recipeCard.addEventListener('click', () => {
                    window.location.href = `recipeDetail.html?id=${recipe.id}`;
                });

                recipeContainer.appendChild(recipeCard);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching recipes:', error);
    });
}
