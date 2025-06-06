document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const recipeContainer = document.getElementById("recipe-container");
  const recipeDetail = document.getElementById("recipe-detail");
  const closeDetail = document.getElementById("close-detail");
  const detailContent = document.getElementById("detail-content");
  const surpriseBtn = document.getElementById("surprise-btn");
  const cuisineFilter = document.getElementById("cuisine");
  const courseFilter = document.getElementById("course");
  const dietFilter = document.getElementById("diet");
  const timeFilter = document.getElementById("time");
  const sortButtons = document.querySelectorAll(".sort-btn");
  const loadMoreBtn = document.getElementById("load-more-btn");

  // Configuration
  const INITIAL_RECIPES_TO_SHOW = 6;
  const ADDITIONAL_RECIPES_TO_SHOW = 6;

  let recipes = [];
  let filteredRecipes = [];
  let displayedRecipeCount = 0;
  let currentSortMethod = "random";

  // Load recipe data from CSV (converted to JSON)
  async function loadRecipes() {
    try {
      // In a real implementation, you would fetch this from your CSV converted to JSON
      const response = await fetch("recipes.json");
      recipes = await response.json();

      // Process recipes
      processRecipes();

      // Initialize filters
      initFilters();

      // Display initial recipes
      filterRecipes();
    } catch (error) {
      console.error("Error loading recipes:", error);
      recipeContainer.innerHTML =
        '<div class="error">Failed to load recipes. Please try again later.</div>';
    }
  }

  // Process recipes data
  function processRecipes() {
    recipes.forEach((recipe) => {
      // Ensure all fields have values
      recipe.Cuisine = recipe.Cuisine || "Indian";
      recipe.Course = recipe.Course || "Main Course";
      recipe.Diet = recipe.Diet || "Vegetarian";
      recipe.PrepTimeInMins = recipe.PrepTimeInMins || 15;
      recipe.CookTimeInMins = recipe.CookTimeInMins || 30;
      recipe.TotalTimeInMins =
        recipe.TotalTimeInMins || recipe.PrepTimeInMins + recipe.CookTimeInMins;
      recipe.Servings = recipe.Servings || 4;
    });
  }

  // Initialize filter dropdowns
  function initFilters() {
    // Get unique values for each filter
    const cuisines = [...new Set(recipes.map((r) => r.Cuisine))].filter(
      Boolean
    );
    const courses = [...new Set(recipes.map((r) => r.Course))].filter(Boolean);
    const diets = [...new Set(recipes.map((r) => r.Diet))].filter(Boolean);

    // Populate cuisine filter
    cuisines.forEach((cuisine) => {
      const option = document.createElement("option");
      option.value = cuisine;
      option.textContent = cuisine;
      cuisineFilter.appendChild(option);
    });

    // Populate course filter
    courses.forEach((course) => {
      const option = document.createElement("option");
      option.value = course;
      option.textContent = course;
      courseFilter.appendChild(option);
    });

    // Populate diet filter
    diets.forEach((diet) => {
      const option = document.createElement("option");
      option.value = diet;
      option.textContent = diet;
      dietFilter.appendChild(option);
    });

    // Add event listeners to filters
    cuisineFilter.addEventListener("change", filterRecipes);
    courseFilter.addEventListener("change", filterRecipes);
    dietFilter.addEventListener("change", filterRecipes);
    timeFilter.addEventListener("change", filterRecipes);
  }

  // Filter recipes based on selected filters
  function filterRecipes() {
    const cuisine = cuisineFilter.value;
    const course = courseFilter.value;
    const diet = dietFilter.value;
    const maxTime = parseInt(timeFilter.value);

    filteredRecipes = recipes.filter((recipe) => {
      return (
        (cuisine === "all" || recipe.Cuisine === cuisine) &&
        (course === "all" || recipe.Course === course) &&
        (diet === "all" || recipe.Diet === diet) &&
        recipe.TotalTimeInMins <= maxTime
      );
    });

    // Reset displayed count when filters change
    displayedRecipeCount = 0;

    // Sort recipes
    sortRecipes(currentSortMethod);

    // Show initial recipes
    displayRecipes(INITIAL_RECIPES_TO_SHOW);
  }

  // Sort recipes based on selected option
  function sortRecipes(sortBy) {
    currentSortMethod = sortBy;

    switch (sortBy) {
      case "time":
        filteredRecipes.sort((a, b) => a.TotalTimeInMins - b.TotalTimeInMins);
        break;
      case "servings":
        filteredRecipes.sort((a, b) => b.Servings - a.Servings);
        break;
      case "random":
      default:
        // Shuffle array
        filteredRecipes = filteredRecipes.sort(() => Math.random() - 0.5);
        break;
    }
  }

  // Display recipes in the container
  function displayRecipes(numToShow) {
    if (filteredRecipes.length === 0) {
      recipeContainer.innerHTML =
        '<div class="no-results">No recipes match your filters. Try adjusting your criteria.</div>';
      loadMoreBtn.classList.add("hidden");
      return;
    }

    // Clear container only if we're showing initial set
    if (displayedRecipeCount === 0) {
      recipeContainer.innerHTML = "";
    }

    // Calculate how many recipes to show
    const endIndex = Math.min(
      displayedRecipeCount + numToShow,
      filteredRecipes.length
    );

    // Add recipes to container
    for (let i = displayedRecipeCount; i < endIndex; i++) {
      const recipe = filteredRecipes[i];
      const recipeCard = document.createElement("div");
      recipeCard.className = "recipe-card";
      recipeCard.innerHTML = `
                <div class="recipe-info">
                    <h3 class="recipe-title">${
                      recipe.TranslatedRecipeName || recipe.RecipeName
                    }</h3>
                    <span class="recipe-cuisine">${recipe.Cuisine}</span>
                    <span class="recipe-diet">${recipe.Diet}</span>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${
                          recipe.TotalTimeInMins
                        } mins</span>
                        <span><i class="fas fa-users"></i> ${
                          recipe.Servings
                        } servings</span>
                    </div>
                </div>
            `;

      recipeCard.addEventListener("click", () => showRecipeDetail(recipe));
      recipeContainer.appendChild(recipeCard);
    }

    displayedRecipeCount = endIndex;

    // Show or hide load more button
    if (displayedRecipeCount >= filteredRecipes.length) {
      loadMoreBtn.classList.add("hidden");
    } else {
      loadMoreBtn.classList.remove("hidden");
    }
  }

  // Show recipe detail modal
  function showRecipeDetail(recipe) {
    detailContent.innerHTML = `
            <div class="detail-header">
                <h2 class="detail-title">${
                  recipe.TranslatedRecipeName || recipe.RecipeName
                }</h2>
                <div class="detail-meta">
                    <span><i class="fas fa-clock"></i> Prep: ${
                      recipe.PrepTimeInMins
                    } mins | Cook: ${recipe.CookTimeInMins} mins | Total: ${
      recipe.TotalTimeInMins
    } mins</span>
                    <span><i class="fas fa-users"></i> Serves: ${
                      recipe.Servings
                    }</span>
                </div>
                <div class="detail-meta">
                    <span><i class="fas fa-globe-asia"></i> ${
                      recipe.Cuisine
                    }</span>
                    <span><i class="fas fa-list"></i> ${recipe.Course}</span>
                    <span><i class="fas fa-leaf"></i> ${recipe.Diet}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Ingredients</h3>
                <ul class="ingredients-list">
                    ${(recipe.TranslatedIngredients || recipe.Ingredients)
                      .split(",")
                      .map((ing) => `<li>${ing.trim()}</li>`)
                      .join("")}
                </ul>
            </div>
            
            <div class="detail-section">
                <h3>Instructions</h3>
                <ol class="instructions-list">
                    ${(recipe.TranslatedInstructions || recipe.Instructions)
                      .split(".")
                      .filter((step) => step.trim())
                      .map((step, i) => `<li>${step.trim()}.</li>`)
                      .join("")}
                </ol>
            </div>
            
            ${
              recipe.URL
                ? `<div class="detail-section">
                <a href="${recipe.URL}" target="_blank" class="original-link"><i class="fas fa-external-link-alt"></i> View Original Recipe</a>
            </div>`
                : ""
            }
        `;

    recipeDetail.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  // Close recipe detail modal
  function closeRecipeDetail() {
    recipeDetail.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // Get a surprise recipe (completely random from all recipes)
  function getSurpriseRecipe() {
    if (recipes.length === 0) return;

    const randomIndex = Math.floor(Math.random() * recipes.length);
    showRecipeDetail(recipes[randomIndex]);
  }

  // Event Listeners
  closeDetail.addEventListener("click", closeRecipeDetail);
  surpriseBtn.addEventListener("click", getSurpriseRecipe);
  loadMoreBtn.addEventListener("click", () =>
    displayRecipes(ADDITIONAL_RECIPES_TO_SHOW)
  );

  // Sort buttons
  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sortButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentSortMethod = button.dataset.sort;
      sortRecipes(currentSortMethod);

      // Reset and show initial recipes
      displayedRecipeCount = 0;
      displayRecipes(INITIAL_RECIPES_TO_SHOW);
    });
  });

  // Close modal when clicking outside
  recipeDetail.addEventListener("click", (e) => {
    if (e.target === recipeDetail) {
      closeRecipeDetail();
    }
  });

  // Load recipes when page loads
  loadRecipes();
});
