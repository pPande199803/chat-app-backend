import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Chat backend running successfully"
    });
});

app.use("/chat", chatRoutes);

app.use("/chat", messageRoutes);

app.use("/user", userRoutes);

export default app;
