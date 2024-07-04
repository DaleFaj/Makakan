const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 3000;

// Setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Database connection
const dbPath = path.join(__dirname, 'database', 'recipes.db');
const db = new sqlite3.Database(dbPath);

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to check if the user is logged in
const checkLogin = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Route to add a new recipe
app.post('/addRecipe', checkLogin, upload.single('image'), (req, res) => {
    const { recipeName, ingredients, instructions } = req.body;
    const image = req.file ? req.file.filename : null;
    const username = req.session.username;

    if (!recipeName || !ingredients || !instructions) {
        return res.status(400).json({ error: 'Please provide all fields: recipeName, ingredients, instructions' });
    }

    const sql = `INSERT INTO recipes (name, ingredients, instructions, image, username) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [recipeName, ingredients, instructions, image, username], function(err) {
        if (err) {
            console.error('Error adding recipe:', err.message);
            return res.status(500).json({ error: 'Failed to add recipe' });
        }
        console.log(`Recipe added with ID: ${this.lastID}`);
        res.status(200).send('Recipe added successfully');
    });
});

// Route to login the user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const sql = `SELECT * FROM profile_information WHERE username = ?`;
    db.get(sql, [username], async (err, row) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (row) {
            try {
                const match = await bcrypt.compare(password, row.password);
                if (match) {
                    req.session.username = username;
                    res.status(200).json({ success: true });
                } else {
                    res.status(401).json({ error: 'Invalid username or password' });
                }
            } catch (error) {
                console.error('Error comparing passwords:', error.message);
                res.status(500).json({ error: 'Internal server error' });
            }
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});

// Route to logout the user
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.status(200).json({ success: true });
    });
});

// Route to sign up a new user
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const checkSql = `SELECT * FROM profile_information WHERE username = ? OR email = ?`;
        const row = await new Promise((resolve, reject) => {
            db.get(checkSql, [username, email], (err, row) => {
                if (err) {
                    console.error('Error querying the database:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        if (row) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertSql = `INSERT INTO profile_information (username, email, password) VALUES (?, ?, ?)`;
        await new Promise((resolve, reject) => {
            db.run(insertSql, [username, email, hashedPassword], function (err) {
                if (err) {
                    console.error('Error adding user:', err.message);
                    reject(err);
                } else {
                    console.log(`User added with ID: ${this.lastID}`);
                    resolve();
                }
            });
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error hashing password or inserting user:', error.message);
        res.status(500).json({ error: 'Failed to sign up' });
    }
});

// Route to fetch recipes for the logged-in user
app.get('/getRecipes', checkLogin, (req, res) => {
    const username = req.session.username;
    const sql = `SELECT id, name, image FROM recipes WHERE username = ?`;

    db.all(sql, [username], (err, rows) => {
        if (err) {
            console.error('Error fetching recipes:', err.message);
            return res.status(500).json({ error: 'Failed to fetch recipes' });
        }

        // Map rows to include the full URL for the image
        const recipes = rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                image: row.image ? `/uploads/${row.image}` : null
            };
        });

        res.json(recipes);
    });
});

// Route to fetch details of a single recipe
app.get('/getRecipeDetails/:id', checkLogin, (req, res) => {
    const recipeId = req.params.id;
    const sql = `SELECT name, ingredients, instructions, image FROM recipes WHERE id = ?`;

    db.get(sql, [recipeId], (err, row) => {
        if (err) {
            console.error('Error fetching recipe details:', err.message);
            return res.status(500).json({ error: 'Failed to fetch recipe details' });
        }

        if (row) {
            const recipe = {
                name: row.name,
                ingredients: row.ingredients,
                instructions: row.instructions,
                image: row.image ? `/uploads/${row.image}` : null
            };
            res.json(recipe);
        } else {
            res.status(404).json({ error: 'Recipe not found' });
        }
    });
});

// Route to serve landing page
app.get('/landing.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Route to check if username or email is unique during signup
app.post('/check-credentials', async (req, res) => {
    const { email, username } = req.body;

    const sql = `SELECT * FROM profile_information WHERE username = ? OR email = ?`;
    const row = await new Promise((resolve, reject) => {
        db.get(sql, [username, email], (err, row) => {
            if (err) {
                console.error('Error querying the database:', err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });

    res.json({ isUnique: !row });
});

// Route to get the logged-in user's information
app.get('/getUserInfo', checkLogin, (req, res) => {
    const username = req.session.username;

    const sql = `SELECT username FROM profile_information WHERE username = ?`;
    db.get(sql, [username], (err, row) => {
        if (err) {
            console.error('Error fetching user information:', err.message);
            return res.status(500).json({ error: 'Failed to fetch user information' });
        }

        if (row) {
            res.json({ username: row.username });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
});

// Route to get all recipes
app.get('/getAllRecipes', (req, res) => {
    const sql = `SELECT id, name, image FROM recipes`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching recipes:', err.message);
            return res.status(500).json({ error: 'Failed to fetch recipes' });
        }

        // Map rows to include the full URL for the image
        const recipes = rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                image: row.image ? `/uploads/${row.image}` : null
            };
        });

        res.json(recipes);
    });
});

// Route to search recipes by name
app.get('/searchRecipes', (req, res) => {
    const searchTerm = req.query.term;
    const sql = `SELECT id, name, image FROM recipes WHERE name LIKE ?`;
    const formattedSearchTerm = `%${searchTerm}%`;

    db.all(sql, [formattedSearchTerm], (err, rows) => {
        if (err) {
            console.error('Error searching recipes:', err.message);
            return res.status(500).json({ error: 'Failed to search recipes' });
        }

        // Map rows to include the full URL for the image
        const recipes = rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                image: row.image ? `/uploads/${row.image}` : null
            };
        });

        res.json(recipes);
    });
});


app.post('/getRecipesByIngredients', checkLogin, (req, res) => {
    const ingredients = req.body.ingredients;

    const placeholders = ingredients.map(() => 'ingredients LIKE ?').join(' OR ');
    const sql = `SELECT id, name, image FROM recipes WHERE ${placeholders}`;

    const queryParams = ingredients.map(ingredient => `%${ingredient}%`);

    db.all(sql, queryParams, (err, rows) => {
        if (err) {
            console.error('Error fetching recipes:', err.message);
            return res.status(500).json({ error: 'Failed to fetch recipes' });
        }
        const recipes = rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                image: row.image ? `/uploads/${row.image}` : null
            };
        });

        res.json(recipes);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});