import mongoose from "mongoose";

const stripWrappingQuotes = (value = "") => {
  const trimmed = String(value).trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

const getMongoUri = (value = "") => {
  const normalizedValue = stripWrappingQuotes(value);

  if (!normalizedValue) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const uri = normalizedValue.replace(/^MONGODB_URI\s*=\s*/i, "").trim();

  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new Error(
      'MONGODB_URI must start with "mongodb://" or "mongodb+srv://". On Render, set only the raw URI value, not "MONGODB_URI=...".'
    );
  }

  return uri;
};

export const connectDatabase = async () => {
  const mongoUri = getMongoUri(process.env.MONGODB_URI);

  await mongoose.connect(mongoUri);

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};
