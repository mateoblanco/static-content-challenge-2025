import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

export type AppConfig = {
  contentDir: string;
  templatePath: string;
  publicDir: string;
};

type ServerConfig = AppConfig & {
  port: number;
};

export const loadConfig = (env = process.env): ServerConfig => {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PORT: ${env.PORT}`);
  }
  return {
    port,
    contentDir: path.resolve(projectRoot, env.CONTENT_DIR ?? 'src/content'),
    templatePath: path.resolve(projectRoot, env.TEMPLATE_PATH ?? 'src/render/template.html'),
    publicDir: path.resolve(projectRoot, env.PUBLIC_DIR ?? 'public'),
  };
};
