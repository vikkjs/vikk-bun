#!/usr/bin/env bun
import chalk from 'chalk';
import { execSync } from 'child_process';
import { copyFile, mkdir, readdir, rm } from 'fs/promises';
import { join } from 'path';

const getRepo = (a) => {
    switch (a) {
        case "-js":
            return "vikk-template-js";
    }
    return "vikk-template-ts";
}

const a2 = process.argv[2];
const a3 = process.argv[3];

const dirName = (!a2 || a2.startsWith("-")) ? "." : a2;
const repoName = getRepo((dirName == ".") ? a2 : a3);

const projectPath = join(process.cwd(), dirName);

const copyDir = async (src, dest, exclude) => {
    const entries = await readdir(src, { withFileTypes: true });
    await mkdir(dest, { recursive: true });
    for (let entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        if (exclude.includes(entry.name))
            continue;
        if (entry.isDirectory())
            await copyDir(srcPath, destPath, exclude);
        else
            await copyFile(srcPath, destPath);
    }
};

(async () => {
    try {
        if (dirName != ".")
            await mkdir(dirName, { recursive: true });
        process.chdir(projectPath);

        const repo = "https://github.com/vikkjs/" + repoName + ".git";
        execSync(`git clone --quiet ` + repo);

        const exclude = ['.git', 'package-lock.json', 'LICENSE'];
        await copyDir(repoName, projectPath, exclude);
        await rm(repoName, { recursive: true });

        execSync('bun i');
    } catch (err) {
        console.log(chalk.red("Directory", projectPath, "already exists, or something else went wrong. \n Error:", err));
        process.exit(1);
    }
    console.log(chalk.green("Project", chalk.green.bold(dirName), "created!"));
    console.log(chalk.blue("Now run the following command" + ((dirName != ".") ? "s" : "") + ":"));
    console.log(((dirName != ".") ? (`cd ${dirName}\n`) : "") + `bun run dev`);
})();