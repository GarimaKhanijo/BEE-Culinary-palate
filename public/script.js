document.addEventListener("DOMContentLoaded", function () {
    const recipesContainer = document.getElementById('recipes');
    const userNav = document.getElementById('userNav');
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    const searchInput = document.getElementById("searchInput");
    const searchForm = document.getElementById("searchForm");
    const searchResultsContainer = document.getElementById("searchResults");
    // Update the navbar based on the login status
    if (userNav) {
        if (token && userEmail) {
            const emailInitials = userEmail.split('@')[0].charAt(0).toUpperCase();

            userNav.innerHTML = `
                <a href="search.html">
                <img src="search-icon.png" alt="Search" id="searchIcon" />
                </a>
                <a href="liked.html">❤️</a>
                <a href="profile.html" class="circle-initials">${emailInitials}</a>
                <button id="logoutButton" class="nbutton">Logout</button>
            `;
            // Add logout functionality
            document.getElementById('logoutButton').addEventListener('click', function () {
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                window.location.href = 'login.html';
            });
        } else {
            userNav.innerHTML = `
                <a href="login.html" class="nbutton"><button>Login</button></a>
                <a href="register.html" class="nbutton"><button>Register</button></a>
            `;
        }
    }

    // Fetch and display all recipes on the index.html page
    fetch('/api/recipes')
        .then(response => response.json())
        .then(recipes => {
            recipes.forEach(recipe => {
                const recipeDiv = document.createElement('div');
                recipeDiv.className = 'recipe';

                const imageHTML = recipe.coverImage ? `<img src="${recipe.coverImage}" alt="${recipe.title}" />` : '';

                const likeButton = document.createElement('button');
                likeButton.className = 'likeButton';
                likeButton.textContent = recipe.isLiked ? '❤️' : '♡';
                likeButton.setAttribute('data-recipe-id', recipe._id);

                const titleAndButton = document.createElement('h2');
                titleAndButton.innerHTML = `${recipe.title}`;

                recipeDiv.appendChild(titleAndButton);
                recipeDiv.innerHTML += imageHTML;

                recipesContainer.appendChild(recipeDiv);

                // Add event listener for "Like" button
                likeButton.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const recipeId = likeButton.getAttribute('data-recipe-id');
                    toggleLike(recipeId, likeButton);
                });

                // When recipe is clicked, navigate to recipe details page
                recipeDiv.onclick = () => {
                    window.location.href = `/recipe.html?id=${recipe._id}`;
                };
            });
        })
        .catch(error => console.error('Error fetching recipes:', error));


    // Check if the current page is recipe.html
    if (window.location.pathname.includes('recipe.html')) {
        const params = new URLSearchParams(window.location.search);
        const recipeId = params.get('id');

        if (recipeId) {
            // Fetch the recipe details using the ID
            fetch(`/api/recipes/${recipeId}`)
                .then(response => response.json())
                .then(recipe => {
                    if (recipe) {
                        document.getElementById('title').innerText = recipe.title;
                        document.getElementById('ingredients').innerText = `Ingredients: ${recipe.ingredients.join(', ')}`;
                        document.getElementById('instructions').innerText = `Instructions: ${recipe.instructions}`;
                        document.getElementById('time').innerText = `Cooking Time: ${recipe.time}`;

                        if (recipe.coverImage) {
                            document.getElementById('recipeImage').src = recipe.coverImage;
                        } else {
                            document.getElementById('recipeImage').alt = 'No image available';
                        }

                        // Ensure recipeDetails element exists before appending like button
                        const recipeDetailsElement = document.getElementById('recipeDetails');
                        if (recipeDetailsElement) {
                            const likeButton = document.createElement('button');
                            likeButton.className = 'likeButton';
                            likeButton.textContent = recipe.isLiked ? '❤️' : '♡';
                            recipeDetailsElement.appendChild(likeButton);

                            // Add click event to toggle like/unlike
                            likeButton.addEventListener('click', async function () {
                                if (likeButton.textContent === '♡') {
                                    const success = await likeRecipe(recipeId);
                                    if (success) likeButton.textContent = '❤️';
                                } else {
                                    const success = await unlikeRecipe(recipeId);
                                    if (success) likeButton.textContent = '♡';
                                }
                            });
                        } else {
                            console.error("recipeDetails element not found");
                        }
                    } else {
                        document.getElementById('title').innerText = "Recipe not found";
                    }
                })
                .catch(error => {
                    console.error('Error fetching recipe:', error);
                    document.getElementById('title').innerText = "Error loading recipe";
                });
        }
    }
