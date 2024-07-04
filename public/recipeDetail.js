document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (recipeId) {
        fetchRecipeDetails(recipeId);
    } else {
        displayError('No recipe ID provided in the URL.');
    }
});

function fetchRecipeDetails(recipeId) {
    fetch(`/getRecipeDetails/${recipeId}`)
        .then(response => response.json())
        .then(recipe => displayRecipeDetails(recipe))
        .catch(error => displayError('Error fetching recipe details: ' + error));
}

function displayRecipeDetails(recipe) {
    const container = document.getElementById('recipeDetailContainer');
    container.innerHTML = `
        <img src="${recipe.image || 'assets/default_recipe_image.png'}" alt="${recipe.name}">
        <h1>${recipe.name}</h1>
        <div>
            <h2>Ingredients</h2>
            <p>${recipe.ingredients}</p>
        </div>
        <div>
            <h2>Instructions</h2>
            <p>${recipe.instructions}</p>
        </div>
    `;
}

function displayError(message) {
    const container = document.getElementById('recipeDetailContainer');
    container.innerHTML = `<p class="error">${message}</p>`;
}