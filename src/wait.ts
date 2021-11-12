export const wait = (time: number) => new Promise<void>((r) => setTimeout(() => r(), time));
export default { wait };
