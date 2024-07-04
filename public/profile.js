// scripts.js

function showTab(event, tabId) {
    // Hide all tab contents
    var tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(function (content) {
        content.style.display = 'none';
    });

    // Remove 'active' class from all tab links
    var tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(function (link) {
        link.classList.remove('active');
    });

    // Show the selected tab content
    document.getElementById(tabId).style.display = 'block';

    // Add 'active' class to the clicked tab link
    event.currentTarget.classList.add('active');
}

// Show the first tab by default
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.tab-link').click();
});

document.addEventListener('DOMContentLoaded', () => {
    // Fetch user information
    fetch('/getUserInfo')
        .then(response => response.json())
        .then(user => {
            if (user.username) {
                document.querySelector('.profile-name').textContent = user.username;
            } else {
                console.error('Failed to fetch user information');
            }
        })
        .catch(error => {
            console.error('Error fetching user information:', error);
        });

    fetch('/getRecipes')
        .then(response => response.json())
        .then(recipes => {
            const recipeContainer = document.getElementById('recipeContainer');
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
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
        });
});