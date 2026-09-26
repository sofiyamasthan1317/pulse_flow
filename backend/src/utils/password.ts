import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const hashTokenValue = async (token: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(token, salt);
};

export const compareHash = async (value: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(value, hash);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return compareHash(password, hash);
};
