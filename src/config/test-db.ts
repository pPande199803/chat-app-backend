import pool from "./database";

async function testConnection() {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time"
        );

        console.log("PostgreSQL connected successfully!");
        console.log(result.rows[0]);
    } catch (error) {
        console.error("PostgreSQL connection failed:", error);
    } finally {
        await pool.end();
    }
}

testConnection();