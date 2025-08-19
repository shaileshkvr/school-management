import crypto from 'crypto';

const generateUniqueCode = (length = 16) => {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
};

const generateUniqueUsername = async (fullName, UserModel) => {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.') // normalize
    .replace(/\.+/g, '.') // collapse dots
    .replace(/^\.|\.$/g, '') // trim edge dots
    .slice(0, 20);

  for (let i = 0; i < 5; i++) {
    const candidate = `${base}.${generateUniqueCode(4)}`;
    if (!(await UserModel.exists({ username: candidate }))) return candidate;
  }

  // ultra-rare fallback
  let fallback;
  do {
    fallback = `${base}.${generateUniqueCode(8)}`;
  } while (await UserModel.exists({ username: fallback }));
  return fallback;
};
export { generateUniqueCode, generateUniqueUsername };
