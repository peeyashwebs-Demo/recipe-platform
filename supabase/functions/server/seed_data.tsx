// Seed content for Larder. Creator ids here are placeholders that the seeding
// routine maps to real auth user ids via the `email` field.

export const seedCooks = [
  { key: "u_amara", name: "Amara Okafor", email: "amara@table.co", avatar: "https://i.pravatar.cc/160?img=47", role: "creator", bio: "West-African home cooking, reimagined for weeknights." },
  { key: "u_leo", name: "Leo Marchetti", email: "leo@table.co", avatar: "https://i.pravatar.cc/160?img=12", role: "creator", bio: "Third-generation Roman cook. Pasta is a love language." },
  { key: "u_sana", name: "Sana Rehman", email: "sana@table.co", avatar: "https://i.pravatar.cc/160?img=32", role: "creator", bio: "Baker, gardener, and firm believer in second helpings." },
  { key: "u_admin", name: "Editorial Desk", email: "curators@table.co", avatar: "https://i.pravatar.cc/160?img=68", role: "admin", bio: "The curation team behind Larder." },
];

export const categories = [
  { id: "mains", name: "Mains", blurb: "Centre-of-the-plate comfort", image: "1598103442097-8b74394b95c6" },
  { id: "pasta", name: "Pasta & Noodles", blurb: "Twirl-worthy classics", image: "1546549032-9571cd6b27df" },
  { id: "salads", name: "Salads & Bowls", blurb: "Bright, crunchy, alive", image: "1512621776951-a57141f2eefd" },
  { id: "baking", name: "Baking & Sweets", blurb: "For the ones with a sweet tooth", image: "1517427294546-5aa121f68e8a" },
  { id: "brunch", name: "Brunch", blurb: "Slow mornings, done right", image: "1621523131496-0a1af8e2b20c" },
  { id: "soups", name: "Soups & Broths", blurb: "A bowl that hugs back", image: "1638866281450-3933540af86a" },
];

const ing = (quantity: number | null, unit: string, name: string) => ({ quantity, unit, name });
const step = (text: string) => ({ text });

export const seedRecipes = [
  {
    id: "r_cacio", title: "Cacio e Pepe, the Roman Way",
    description: "Three ingredients, one silky emulsion, zero shortcuts. The dish that separates cooks from cooks.",
    image: "1546549032-9571cd6b27df", creatorKey: "u_leo", category: "pasta", cuisine: "Italian",
    difficulty: "Medium", prepMinutes: 5, cookMinutes: 15, baseServings: 2,
    ingredients: [ing(200, "g", "tonnarelli or spaghetti"), ing(100, "g", "Pecorino Romano, finely grated"), ing(2, "tsp", "black peppercorns, freshly cracked"), ing(null, "", "sea salt, for the pasta water")],
    steps: [step("Toast the cracked pepper in a dry pan until fragrant, about 45 seconds."), step("Boil pasta in lightly salted water until very al dente, reserving a mug of starchy water."), step("Whisk pecorino with a splash of cool pasta water into a loose paste."), step("Toss pasta with pepper, then fold in the pecorino paste off the heat, loosening with pasta water until glossy."), step("Serve immediately with an extra shower of pecorino.")],
    tags: ["vegetarian", "30-minutes", "date-night"], featured: true, status: "published", createdAt: "2026-05-02",
  },
  {
    id: "r_jollof", title: "Smoky Party Jollof Rice",
    description: "The centrepiece of every celebration — deeply spiced, gently charred at the edges, impossible to stop eating.",
    image: "1591814468924-caf88d1232e1", creatorKey: "u_amara", category: "mains", cuisine: "West African",
    difficulty: "Medium", prepMinutes: 20, cookMinutes: 45, baseServings: 6,
    ingredients: [ing(3, "cups", "long-grain parboiled rice"), ing(6, "", "plum tomatoes"), ing(2, "", "red bell peppers"), ing(2, "", "scotch bonnet peppers"), ing(1, "", "large onion"), ing(0.33, "cup", "vegetable oil"), ing(2, "tbsp", "tomato paste"), ing(2, "tsp", "curry powder"), ing(null, "", "salt & bouillon to taste")],
    steps: [step("Blend tomatoes, red peppers, scotch bonnet and half the onion until smooth."), step("Fry sliced onion in oil, add tomato paste and cook until it darkens."), step("Pour in the blend and simmer hard until reduced and jammy, 15–20 minutes."), step("Season with curry, bouillon and salt, then stir in rinsed rice to coat."), step("Add stock to just cover, cover tightly and steam on low until tender, letting the bottom lightly char for smokiness.")],
    tags: ["crowd-pleaser", "gluten-free", "spicy"], featured: true, status: "published", createdAt: "2026-06-11",
  },
  {
    id: "r_ramen", title: "Weeknight Miso Butter Ramen",
    description: "A restaurant-deep bowl in 30 minutes, thanks to a shortcut broth enriched with miso and brown butter.",
    image: "1638866281450-3933540af86a", creatorKey: "u_amara", category: "soups", cuisine: "Japanese",
    difficulty: "Easy", prepMinutes: 10, cookMinutes: 20, baseServings: 2,
    ingredients: [ing(2, "portions", "fresh ramen noodles"), ing(3, "tbsp", "white miso"), ing(2, "tbsp", "butter"), ing(4, "cups", "chicken or vegetable stock"), ing(2, "", "soft-boiled eggs"), ing(2, "cloves", "garlic, grated"), ing(1, "tbsp", "fresh ginger, grated"), ing(null, "", "scallions & chilli oil to finish")],
    steps: [step("Brown the butter with garlic and ginger until nutty and fragrant."), step("Whisk in miso, then the stock, and simmer gently for 10 minutes."), step("Cook noodles separately until just springy."), step("Divide noodles into bowls, ladle over broth, and top with halved eggs, scallions and chilli oil.")],
    tags: ["30-minutes", "cozy", "slurpable"], featured: true, status: "published", createdAt: "2026-06-28",
  },
  {
    id: "r_choccake", title: "Olive Oil Chocolate Cake",
    description: "Fudgy, glossy and secretly dairy-light. The olive oil keeps it moist for days — if it lasts that long.",
    image: "1517427294546-5aa121f68e8a", creatorKey: "u_sana", category: "baking", cuisine: "Modern",
    difficulty: "Easy", prepMinutes: 15, cookMinutes: 35, baseServings: 8,
    ingredients: [ing(1.5, "cups", "all-purpose flour"), ing(0.75, "cup", "cocoa powder"), ing(1.5, "cups", "sugar"), ing(1, "cup", "extra-virgin olive oil"), ing(3, "", "eggs"), ing(1, "cup", "hot coffee"), ing(1, "tsp", "baking soda"), ing(null, "", "flaky salt to finish")],
    steps: [step("Whisk the dry ingredients in one bowl and the wet in another."), step("Combine, then stream in the hot coffee — the batter will be thin. That's right."), step("Bake at 175°C for 32–36 minutes until the centre springs back."), step("Cool, glaze if you like, and finish with flaky salt.")],
    tags: ["dessert", "make-ahead", "crowd-pleaser"], featured: false, status: "published", createdAt: "2026-04-19",
  },
  {
    id: "r_saladbowl", title: "Charred Corn & Herb Grain Bowl",
    description: "A bowl that eats like summer — sweet charred corn, cooling herbs, a punchy lime dressing over nutty grains.",
    image: "1512621776951-a57141f2eefd", creatorKey: "u_amara", category: "salads", cuisine: "Californian",
    difficulty: "Easy", prepMinutes: 15, cookMinutes: 10, baseServings: 4,
    ingredients: [ing(2, "cups", "cooked farro or quinoa"), ing(3, "ears", "corn, kernels cut"), ing(1, "cup", "cherry tomatoes, halved"), ing(1, "", "avocado, diced"), ing(1, "cup", "mixed soft herbs"), ing(2, "tbsp", "lime juice"), ing(3, "tbsp", "olive oil"), ing(null, "", "salt & chilli flakes")],
    steps: [step("Char the corn in a dry, screaming-hot pan until spotty."), step("Whisk lime, oil, salt and chilli into a bright dressing."), step("Fold grains, corn, tomatoes and herbs together with the dressing."), step("Top with avocado just before serving so it stays vivid.")],
    tags: ["vegan", "meal-prep", "bright"], featured: false, status: "published", createdAt: "2026-07-01",
  },
  {
    id: "r_chicken", title: "Crispy Butter-Basted Chicken Thighs",
    description: "Shatteringly crisp skin, juicy within, finished with a foaming garlic-thyme butter. A ten-minute hero.",
    image: "1598103442097-8b74394b95c6", creatorKey: "u_leo", category: "mains", cuisine: "French",
    difficulty: "Easy", prepMinutes: 5, cookMinutes: 20, baseServings: 4,
    ingredients: [ing(8, "", "bone-in chicken thighs"), ing(3, "tbsp", "butter"), ing(4, "cloves", "garlic, smashed"), ing(6, "sprigs", "thyme"), ing(1, "", "lemon, halved"), ing(null, "", "salt & pepper")],
    steps: [step("Pat thighs bone-dry and season hard. Lay skin-down in a cold pan, then turn the heat to medium."), step("Render slowly, undisturbed, until the skin is deep gold and releases easily."), step("Flip, add butter, garlic and thyme, and baste for 3–4 minutes."), step("Rest, then finish with a squeeze of lemon.")],
    tags: ["30-minutes", "gluten-free", "one-pan"], featured: true, status: "published", createdAt: "2026-05-22",
  },
  {
    id: "r_pancakes", title: "Ricotta Cloud Pancakes",
    description: "Impossibly light, tangy from ricotta, with crisp lacy edges. The brunch your weekend deserves.",
    image: "1621523131496-0a1af8e2b20c", creatorKey: "u_sana", category: "brunch", cuisine: "American",
    difficulty: "Easy", prepMinutes: 10, cookMinutes: 15, baseServings: 3,
    ingredients: [ing(1, "cup", "ricotta"), ing(0.75, "cup", "flour"), ing(2, "", "eggs, separated"), ing(0.5, "cup", "milk"), ing(1, "tbsp", "sugar"), ing(1, "tsp", "baking powder"), ing(null, "", "butter & maple syrup")],
    steps: [step("Whisk ricotta, yolks, milk and sugar, then fold in flour and baking powder."), step("Whip whites to soft peaks and fold through gently to keep the air."), step("Cook on buttered medium heat until bubbles set, then flip once."), step("Stack high and drown in maple syrup.")],
    tags: ["brunch", "vegetarian", "kid-friendly"], featured: false, status: "published", createdAt: "2026-06-05",
  },
  {
    id: "r_berrycake", title: "Skillet Blueberry Breakfast Cake",
    description: "Halfway between a cobbler and a cake, baked in one pan and best eaten warm with a cup of coffee.",
    image: "1777394681129-d2a43a0c19fe", creatorKey: "u_sana", category: "baking", cuisine: "American",
    difficulty: "Easy", prepMinutes: 15, cookMinutes: 40, baseServings: 8,
    ingredients: [ing(2, "cups", "flour"), ing(2, "cups", "blueberries"), ing(0.75, "cup", "sugar"), ing(0.5, "cup", "butter, softened"), ing(2, "", "eggs"), ing(0.5, "cup", "milk"), ing(2, "tsp", "baking powder")],
    steps: [step("Cream butter and sugar until pale, then beat in eggs one at a time."), step("Alternate folding in the dry mix and milk until just combined."), step("Scrape into a buttered skillet and scatter blueberries over the top."), step("Bake at 180°C for 38–42 minutes until golden and set.")],
    tags: ["brunch", "make-ahead", "fruit"], featured: false, status: "pending", createdAt: "2026-07-18",
  },
  {
    id: "r_steak", title: "Reverse-Seared Ribeye",
    description: "Edge-to-edge rosy, with a crust like a steakhouse. Low oven first, blistering pan second.",
    image: "1615557960916-5f4791effe9d", creatorKey: "u_leo", category: "mains", cuisine: "American",
    difficulty: "Advanced", prepMinutes: 10, cookMinutes: 45, baseServings: 2,
    ingredients: [ing(1, "", "thick-cut ribeye (500g)"), ing(2, "tbsp", "beef tallow or oil"), ing(3, "tbsp", "butter"), ing(2, "sprigs", "rosemary"), ing(null, "", "coarse salt & pepper")],
    steps: [step("Salt the steak and rest at room temp for 45 minutes."), step("Warm in a 120°C oven until the internal temp hits 48°C."), step("Sear in a ripping-hot pan, basting with butter and rosemary, 45 seconds a side."), step("Rest 8 minutes before slicing against the grain.")],
    tags: ["date-night", "gluten-free", "special-occasion"], featured: false, status: "published", createdAt: "2026-03-30",
  },
  {
    id: "r_tacos", title: "Charred Cauliflower Tacos",
    description: "Smoky, spice-rubbed cauliflower with a lime crema and quick pickled onions. Nobody misses the meat.",
    image: "1706267701248-fbbeeb1f8c7c", creatorKey: "u_amara", category: "mains", cuisine: "Mexican",
    difficulty: "Easy", prepMinutes: 15, cookMinutes: 25, baseServings: 4,
    ingredients: [ing(1, "", "large cauliflower, in florets"), ing(2, "tbsp", "olive oil"), ing(2, "tsp", "smoked paprika"), ing(1, "tsp", "cumin"), ing(8, "", "corn tortillas"), ing(0.5, "cup", "sour cream"), ing(1, "", "lime"), ing(1, "", "red onion, pickled")],
    steps: [step("Toss cauliflower with oil and spices, then roast at 220°C until deeply charred."), step("Stir lime juice and zest into the sour cream for a bright crema."), step("Warm tortillas directly over the flame until blistered."), step("Build with cauliflower, crema and pickled onions.")],
    tags: ["vegetarian", "weeknight", "spicy"], featured: false, status: "published", createdAt: "2026-07-09",
  },
  {
    id: "r_carbonara", title: "Proper Carbonara",
    description: "No cream, ever. Just eggs, guanciale, pecorino and technique for a sauce that clings to every strand.",
    image: "1608897013039-887f21d8c804", creatorKey: "u_leo", category: "pasta", cuisine: "Italian",
    difficulty: "Medium", prepMinutes: 10, cookMinutes: 15, baseServings: 2,
    ingredients: [ing(200, "g", "spaghetti"), ing(100, "g", "guanciale, diced"), ing(3, "", "egg yolks"), ing(1, "", "whole egg"), ing(60, "g", "Pecorino Romano"), ing(null, "", "black pepper")],
    steps: [step("Render guanciale slowly until crisp; keep the rendered fat."), step("Beat yolks, egg and pecorino with plenty of pepper."), step("Toss drained hot pasta with the guanciale and fat off the heat."), step("Add the egg mixture and a little pasta water, tossing fast to a silky sauce.")],
    tags: ["date-night", "quick", "classic"], featured: false, status: "published", createdAt: "2026-05-14",
  },
  {
    id: "r_berrytart", title: "Raspberry Almond Tart",
    description: "A crumbly almond frangipane crowned with fresh raspberries. Looks like the patisserie, made in your kitchen.",
    image: "1673974798330-23e8f4c9ae05", creatorKey: "u_sana", category: "baking", cuisine: "French",
    difficulty: "Advanced", prepMinutes: 30, cookMinutes: 35, baseServings: 10,
    ingredients: [ing(1, "", "blind-baked tart shell"), ing(150, "g", "ground almonds"), ing(120, "g", "butter, softened"), ing(120, "g", "sugar"), ing(2, "", "eggs"), ing(200, "g", "fresh raspberries"), ing(null, "", "flaked almonds & icing sugar")],
    steps: [step("Cream butter and sugar, beat in eggs, then fold through the ground almonds."), step("Spread the frangipane into the tart shell and press raspberries into the top."), step("Scatter flaked almonds and bake at 175°C for 30–35 minutes until golden."), step("Cool fully, then dust with icing sugar before slicing.")],
    tags: ["dessert", "special-occasion", "showstopper"], featured: false, status: "published", createdAt: "2026-06-20",
  },
];

export const seedReviews = [
  { recipeId: "r_cacio", authorKey: "u_sana", rating: 5, comment: "The pasta-water trick finally clicked for me. Restaurant silky.", createdAt: "2026-06-30" },
  { recipeId: "r_cacio", authorKey: "u_amara", rating: 4, comment: "Toasting the pepper is non-negotiable now.", createdAt: "2026-07-02" },
  { recipeId: "r_jollof", authorKey: "u_leo", rating: 5, comment: "Made this for 12 people. Not a grain left.", createdAt: "2026-07-05" },
  { recipeId: "r_ramen", authorKey: "u_sana", rating: 5, comment: "Brown butter in ramen is genius. Weeknight staple.", createdAt: "2026-07-10" },
  { recipeId: "r_chicken", authorKey: "u_amara", rating: 5, comment: "Cold pan start = crispiest skin ever. Thank you.", createdAt: "2026-07-12" },
  { recipeId: "r_choccake", authorKey: "u_leo", rating: 4, comment: "Still moist on day three. Rare for chocolate cake.", createdAt: "2026-06-25" },
];

export const DEMO_PASSWORD = "larderdemo";
