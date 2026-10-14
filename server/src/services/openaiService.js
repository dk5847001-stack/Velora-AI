import crypto from "node:crypto";

import OpenAI from "openai";

const DEFAULT_MODEL = "gpt-5-mini";
const DEFAULT_MAX_OUTPUT_TOKENS = 1200;
const DEFAULT_CONTEXT_WINDOW = 20;
const MESSAGE_CONTENT_MAX_LENGTH = 8000;
const SYSTEM_INSTRUCTIONS =
  "You are the assistant inside a premium AI chat application. Give clear, accurate, practical answers. Use Markdown when it helps readability, and format code in fenced blocks with a language when possible.";

let cachedClient;

export const isOpenAIConfigured = (env = process.env) => Boolean(env.OPENAI_API_KEY?.trim());

const getClient = () => {
  if (!isOpenAIConfigured()) {
    const error = new Error("OPENAI_API_KEY is not configured.");
    error.statusCode = 503;
    throw error;
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return cachedClient;
};

const buildSafetyIdentifier = (email) =>
  crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");

const getContextWindowSize = () => {
  const configured = Number(process.env.OPENAI_CONTEXT_WINDOW);

  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_CONTEXT_WINDOW;
  }

  return Math.min(Math.max(Math.floor(configured), 4), 100);
};

const sanitizeMessage = (message) => {
  const role = message?.role === "assistant" ? "assistant" : "user";
  const content = String(message?.content || "").trim();

  if (!content) {
    return null;
  }

  return {
    role,
    content: content.slice(0, MESSAGE_CONTENT_MAX_LENGTH),
  };
};

const toOpenAIInput = (messages) => {
  const recentMessages = Array.isArray(messages)
    ? messages.slice(-getContextWindowSize()).map(sanitizeMessage).filter(Boolean)
    : [];

  return recentMessages.map((message) => ({
    type: "message",
    role: message.role,
    content: message.content,
  }));
};

export const generateOpenAIReply = async ({ messages, email }) => {
  const input = toOpenAIInput(messages);

  if (input.length === 0) {
    const error = new Error("Cannot generate a reply without conversation context.");
    error.statusCode = 400;
    throw error;
  }

  const response = await getClient().responses.create({
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
    instructions: SYSTEM_INSTRUCTIONS,
    input,
    max_output_tokens:
      Number(process.env.OPENAI_MAX_OUTPUT_TOKENS) || DEFAULT_MAX_OUTPUT_TOKENS,
    safety_identifier: buildSafetyIdentifier(email),
  });

  const assistantReply = response.output_text?.trim();

  if (!assistantReply) {
    const error = new Error("The AI provider returned an empty response.");
    error.statusCode = 502;
    throw error;
  }

  return assistantReply;
};
