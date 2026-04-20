import pc from 'picocolors';

export const logger = {
  info(msg: string): void {
    console.log(pc.cyan(msg));
  },
  success(msg: string): void {
    console.log(pc.green(msg));
  },
  warn(msg: string): void {
    console.log(pc.yellow(`WARN: ${msg}`));
  },
  error(msg: string): void {
    console.error(pc.red(`ERROR: ${msg}`));
  },
  log(msg: string): void {
    console.log(msg);
  },
  heading(msg: string): void {
    console.log(pc.bold(pc.cyan(`\n▸ ${msg}`)));
  },
};
