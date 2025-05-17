const BASE_WORKER_DIR = process.env.BASE_WORKER_DIR || "/home/shivaji-raut/tmp/mobile-builder";

if(!Bun.file(BASE_WORKER_DIR).exists()){
    Bun.write(BASE_WORKER_DIR,"");
}

export async function onFileUpdate(filePath:string , fileContent:string){
    Bun.write(`${BASE_WORKER_DIR}/${filePath}`,fileContent);
}
export async function onShellCommand(shellCommand: string) {
    console.log(`Running Command: ${shellCommand}`);
    const result = Bun.spawnSync({
        cmd: ["sh", "-c", shellCommand],
        cwd: BASE_WORKER_DIR
    });
    console.log(result.stdout.toString());
    console.log(result.stderr);
}