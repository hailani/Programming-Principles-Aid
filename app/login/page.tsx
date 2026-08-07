"use client";

import { useState } from "react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleLogin = async () => {
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("student_id", String(data.student_id));
      localStorage.setItem("student_name", data.name);
      localStorage.setItem("student_email", data.email);

      window.location.href = "/modules";
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#efefef",
        color: "#111",
        fontFamily: "Arial, sans-serif",
      }}
    >

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "90px",
          paddingBottom: "80px",
        }}
      >
        <div
          style={{
            fontSize: "6rem",
            color: "#4d3ee6",
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: "18px",
          }}
        >
          {`</>`}
        </div>

        <h1
          style={{
            fontSize: "6rem",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 0.95,
            margin: 0,
          }}
        >
          Programming
          <br />
          Principles
          <br />
          Aid
        </h1>

        <p
          style={{
            marginTop: "28px",
            marginBottom: "52px",
            fontSize: "2.2rem",
            fontStyle: "italic",
            color: "#8d8d8d",
            textAlign: "center",
          }}
        >
          "Think Logically, Code Confidently"
        </p>

        <div
          style={{
            width: "min(620px, 88vw)",
            background: "#f8f8f8",
            borderRadius: "28px",
            padding: "36px 40px 40px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              margin: "0 0 26px",
              textAlign: "center",
              fontSize: "2.3rem",
              fontWeight: 700,
            }}
          >
            Log In
          </h2>

          <label
            htmlFor="name"
            style={{
              display: "block",
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "10px",
              color: "#555",
            }}
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "20px 22px",
              borderRadius: "16px",
              border: "1px solid #d7d7df",
              background: "#f6f6f8",
              fontSize: "1.45rem",
              outline: "none",
              marginBottom: "24px",
              boxSizing: "border-box",
            }}
          />

          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "10px",
              color: "#555",
            }}
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "20px 22px",
              borderRadius: "16px",
              border: "1px solid #d7d7df",
              background: "#f6f6f8",
              fontSize: "1.45rem",
              outline: "none",
              marginBottom: "28px",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "22px",
              borderRadius: "18px",
              border: "none",
              background: "#4d3ee6",
              color: "#fff",
              fontSize: "2rem",
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            LOG IN
          </button>

          {error && (
            <p
              style={{
                color: "#d93025",
                marginTop: "16px",
                fontSize: "1.2rem",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
