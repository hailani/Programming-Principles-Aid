CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modules (
    module_id SERIAL PRIMARY KEY,
    module_name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE problems (
    problem_id SERIAL PRIMARY KEY,
    module_id INT REFERENCES modules(module_id),
    question_text TEXT NOT NULL
);

CREATE TABLE student_progress (
    progress_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id),
    module_id INT REFERENCES modules(module_id),
    last_problem_id INT REFERENCES problems(problem_id),
    score INT DEFAULT 0,
    completion_status BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);