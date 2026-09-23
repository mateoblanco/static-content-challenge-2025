import path from 'node:path';

export type AppConfig = {
  contentDir: string;
  templatePath: string;
  publicDir: string;

}

type ServerConfig = AppConfig & {
  port: number;
}

export const loadConfig = (env = process.env): ServerConfig => {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PORT: ${env.PORT}`);
  }
  return {
    port,
    contentDir: path.resolve(env.CONTENT_DIR ?? 'src/content'),
    templatePath: path.resolve(env.TEMPLATE_PATH ?? 'src/render/template.html'),
    publicDir: path.resolve(env.PUBLIC_DIR ?? 'public'),
  };
}
