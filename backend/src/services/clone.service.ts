import simpleGit from "simple-git";
import fs from "fs";
import path from "path";

interface CloneParams {
  owner: string;
  name: string;
  headSha: string;
  githubAccessToken: string;
}

export const cloneRepo = async ({ owner, name, headSha, githubAccessToken }: CloneParams): Promise<string> => {
  const tmpDir = path.join(process.cwd(), "tmp", `${owner}-${name}-${Date.now()}`);

  fs.mkdirSync(tmpDir, { recursive: true });

  const authenticatedUrl = `https://${githubAccessToken}@github.com/${owner}/${name}.git`;

  const git = simpleGit();

  await git.clone(authenticatedUrl, tmpDir, ["--depth", "50"]);

  const repoGit = simpleGit(tmpDir);
  await repoGit.checkout(headSha);

  return tmpDir;
};

export const cleanupClone = (dirPath: string) => {
  fs.rmSync(dirPath, { recursive: true, force: true });
};