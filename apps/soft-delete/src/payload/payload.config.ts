import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { en } from "@payloadcms/translations/languages/en";
import { es } from "@payloadcms/translations/languages/es";
import { softDeletePlugin } from "@payload-bites/soft-delete";

import { Users } from "./collections/Users";
import { Collections } from "./collections/Collections";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    autoLogin: {
      email: process.env.TEST_USER,
    },
  },
  i18n: {
    fallbackLanguage: "en",
    supportedLanguages: { en, es },
  },
  collections: [Collections, Users],
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  plugins: [
    softDeletePlugin({
      collections: ["collections"],
    }),
  ],
  onInit: async (payload) => {
    await payload.create({
      collection: "users",
      data: {
        email: process.env.TEST_USER!,
        password: process.env.TEST_PASS!,
      },
    });
  },
});
