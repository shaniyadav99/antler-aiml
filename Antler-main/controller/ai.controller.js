import { redis } from "../redis/redis.connection.js";
import crypto from 'crypto';

const generateRedisKey = (messages) => {
    const jsonString = JSON.stringify(messages);
    return crypto.createHash('sha256').update(jsonString).digest('hex').slice(0, 10);
};

const ai = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ msg: "Invalid input. 'messages' should be a non-empty." });
        }

        const systemMessage = {
            role: "system",
            content: "You are a helpful assistant. Please respond in English only."
        };

        const userMessage = {
            role: "user",
            content: message
        };

        const updatedMessages = [systemMessage, userMessage];
        const redisKey = generateRedisKey(updatedMessages);
        // console.log(redisKey)
        const dataRedis = await redis.get(redisKey);
        if (dataRedis) {
            // console.log("redis");
            return res.status(200).json({ response: dataRedis });
        }

        // console.log("Miss redis");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.AI_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: updatedMessages
            })
        });

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        await redis.set(redisKey, data.choices[0].message.content);

        res.json({ response: data.choices[0].message.content });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Internal Server Error"});
    }
};





const aiAnalysis = async (req, res) => {
  try {
    const documentText = req.text;

    const systemMessage = {
      role: "system",
      content: "You are an expert document analyst. Your job is to analyze the following document tone, clarity, and give a concise summary. Provide only the analysis and do not repeat the document. Respond in English."
    };

    const userMessage = {
      role: "user",
      content: `Analyze this document:\n\n${documentText}`
    };

    const messages = [systemMessage, userMessage];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status ${response.status}`);
    }

    const data = await response.json();

    const aiResponse = data?.choices?.[0]?.message?.content || "No analysis returned.";

    res.status(200).json({ analysis: aiResponse });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};


export { aiAnalysis, ai };
