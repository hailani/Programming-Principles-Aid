import pool from "../../lib/db";

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address" });
    }

    const existingStudent = await pool.query(
      "SELECT * FROM students WHERE email = $1",
      [email],
    );

    if (existingStudent.rows.length > 0) {
      return res.status(200).json(existingStudent.rows[0]);
    }

    const newStudent = await pool.query(
      "INSERT INTO students (name, email) VALUES ($1, $2) RETURNING *",
      [name, email],
    );

    return res.status(201).json(newStudent.rows[0]);
  } catch (error) {
    console.error("Login API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
