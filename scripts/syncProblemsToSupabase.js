require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");
const problems = require("../src/data/problems.json");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function syncProblems() {
  try {
    for (const problem of problems) {
      const moduleSlug = problem.module;
      const moduleName = titleFromSlug(moduleSlug);

      const moduleResult = await pool.query(
        `
        INSERT INTO modules (module_name, module_slug, description, total_problems)
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (module_slug)
        DO UPDATE SET
          module_name = EXCLUDED.module_name,
          description = EXCLUDED.description
        RETURNING module_id;
        `,
        [moduleName, moduleSlug, `Problems for ${moduleName}`],
      );

      const moduleId = moduleResult.rows[0].module_id;

      await pool.query(
        `
        INSERT INTO problems (
          module_id,
          question_text,
          problem_number,
          problem_name,
          prompt,
          module_slug,
          difficulty,
          answer
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (module_slug, difficulty, problem_number)
        DO UPDATE SET
          module_id = EXCLUDED.module_id,
          question_text = EXCLUDED.question_text,
          problem_name = EXCLUDED.problem_name,
          prompt = EXCLUDED.prompt,
          answer = EXCLUDED.answer;
        `,
        [
          moduleId,
          problem.prompt,
          Number(problem.number),
          problem.name,
          problem.prompt,
          problem.module,
          problem.difficulty,
          problem.answer,
        ],
      );
    }

    await pool.query(`
      UPDATE modules
      SET total_problems = counts.problem_count
      FROM (
        SELECT module_id, COUNT(*) AS problem_count
        FROM problems
        GROUP BY module_id
      ) counts
      WHERE modules.module_id = counts.module_id;
    `);

    console.log("Problems synced to Supabase successfully.");
  } catch (error) {
    console.error("Sync failed:", error);
  } finally {
    await pool.end();
  }
}

syncProblems();
