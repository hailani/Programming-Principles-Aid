import pool from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { student_id, module_slug, difficulty, problem_number, is_correct } =
      req.body;

    if (
      !student_id ||
      !module_slug ||
      !difficulty ||
      !problem_number ||
      typeof is_correct !== "boolean"
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        received: req.body,
      });
    }

    const problemResult = await pool.query(
      `
      SELECT problem_id, module_id
      FROM problems
      WHERE module_slug = $1
        AND difficulty = $2
        AND problem_number = $3
      `,
      [module_slug, difficulty, problem_number],
    );

    if (problemResult.rows.length === 0) {
      return res.status(404).json({
        error: "Problem not found",
        received: { module_slug, difficulty, problem_number },
      });
    }

    const { problem_id, module_id } = problemResult.rows[0];
    const scoreToAdd = is_correct ? 10 : 0;

    const result = await pool.query(
      `
      INSERT INTO student_problem_progress
        (student_id, module_id, problem_id, attempt_count, score, is_completed)
      VALUES
        ($1, $2, $3, 1, $4, $5)
      ON CONFLICT (student_id, problem_id)
      DO UPDATE SET
        attempt_count = student_problem_progress.attempt_count + 1,
        score = student_problem_progress.score + $4,
        is_completed = student_problem_progress.is_completed OR $5,
        last_attempted = CURRENT_TIMESTAMP
      RETURNING *;
      `,
      [student_id, module_id, problem_id, scoreToAdd, is_correct],
    );

    return res.status(200).json({
      success: true,
      progress: result.rows[0],
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return res.status(500).json({ error: "Database error" });
  }
}
