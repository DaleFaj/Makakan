document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const recipeContainer = document.getElementById('recipeContainer');

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            searchRecipes(searchTerm);
        }
    });

    fetchRecipes();
});

function fetchRecipes() {
    fetch('/getAllRecipes')
        .then(response => response.json())
        .then(recipes => {
            recipes.sort((a, b) => a.name.localeCompare(b.name));
            displayRecipes(recipes);
        })
        .catch(error => console.error('Error fetching recipes:', error));
}

function searchRecipes(term) {
    fetch(`/searchRecipes?term=${encodeURIComponent(term)}`)
        .then(response => response.json())
        .then(recipes => {
            recipes.sort((a, b) => a.name.localeCompare(b.name));
            displayRecipes(recipes);
        })
        .catch(error => console.error('Error searching recipes:', error));
}

function displayRecipes(recipes) {
    const container = document.getElementById('recipeContainer');
    container.innerHTML = '';

    if (recipes.length === 0) {
        const noRecipesMessage = document.createElement('p');
        noRecipesMessage.textContent = 'No recipes found. ';
        noRecipesMessage.className = 'no-recipes-message';
        container.appendChild(noRecipesMessage);
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

            container.appendChild(recipeCard);
        });
    }
}
