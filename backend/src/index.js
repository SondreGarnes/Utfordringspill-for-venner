require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const PORT = 5001;
const SECRET_KEY = process.env.SECRET_KEY;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("PostgreSQL connection error:", err));


app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Create a user api
app.post("/api/users", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);

    // Generate a token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "0.5h" });
    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login api
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Find the user in the database
    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if the password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "0.5h" });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/groups", async (req, res) => {
  const { name, userId } = req.body;

  // Validate userId
  if (!userId) {
    return res.status(400).json({ message: "User ID is required to create a group" });
  }

  try {
    // Check if the user exists
    const userResult = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the group
    const groupResult = await pool.query(
      "INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING id",
      [name, userId]
    );
    const groupId = groupResult.rows[0].id;

    // Automatically add the user to the group
    await pool.query(
      "INSERT INTO user_group (user_id, group_id) VALUES ($1, $2)",
      [userId, groupId]
    );

    res.status(201).json({ groupId, message: "Group created and joined successfully" });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/groups/:groupId/join", async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    // Check if the user is already a member of the group
    const existingMembership = await pool.query(
      "SELECT * FROM user_group WHERE user_id = $1 AND group_id = $2",
      [userId, groupId]
    );

    if (existingMembership.rows.length > 0) {
      return res.status(400).json({ message: "User is already a member of the group" });
    }

    // Add the user to the group
    await pool.query("INSERT INTO user_group (user_id, group_id) VALUES ($1, $2)", [userId, groupId]);
    res.status(200).json({ message: "Joined group successfully" });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/groups/:groupId", async (req, res) => {
  const { groupId } = req.params;

  try {
    const groupResult = await pool.query(
      `SELECT groups.name, users.username AS created_by, users.id AS created_by_id
       FROM groups 
       JOIN users ON groups.created_by = users.id 
       WHERE groups.id = $1`,
      [groupId]
    );
    const group = groupResult.rows[0];

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const memberCountResult = await pool.query("SELECT COUNT(*) FROM user_group WHERE group_id = $1", [groupId]);
    const memberCount = parseInt(memberCountResult.rows[0].count, 10);

    res.status(200).json({
      name: group.name,
      createdBy: group.created_by, // Username
      createdById: group.created_by_id, // User ID
      memberCount,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a post in a group
app.post("/api/groups/:groupId/posts", async (req, res) => {
  const { groupId } = req.params;
  const { content, userId } = req.body;

  try {
    const result = await pool.query("INSERT INTO posts (content, group_id, created_by) VALUES ($1, $2, $3) RETURNING id", [content, groupId, userId]);
    res.status(201).json({ postId: result.rows[0].id });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a group (and cascade delete posts)
app.delete("/api/groups/:groupId", async (req, res) => {
  const { groupId } = req.params;

  try {
    await pool.query("DELETE FROM posts WHERE group_id = $1", [groupId]); // Delete all posts in the group
    await pool.query("DELETE FROM groups WHERE id = $1", [groupId]); // Delete the group
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Leave a group
app.post("/api/groups/:groupId/leave", async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    // Remove the user from the group
    await pool.query("DELETE FROM user_group WHERE user_id = $1 AND group_id = $2", [userId, groupId]);

    // Check if the group has any users left
    const userCountResult = await pool.query("SELECT COUNT(*) FROM user_group WHERE group_id = $1", [groupId]);
    const userCount = parseInt(userCountResult.rows[0].count, 10);

    if (userCount === 0) {
      // Delete the group if no users are left
      await pool.query("DELETE FROM groups WHERE id = $1", [groupId]);
      res.status(200).json({ message: "Group deleted as it has no users left" });
    } else {
      res.status(200).json({ message: "User left the group successfully" });
    }
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//Get userId by username
app.get("/api/users/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const userResult = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ userId: user.id });
  } catch (error) {
    console.error("Error fetching user ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});