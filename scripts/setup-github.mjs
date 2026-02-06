/**
 * GitHub 업로드 준비: Git 초기화 + 첫 커밋
 * 실행 후 안내에 따라 GitHub에서 저장소를 만들고 푸시하세요.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const gitDir = path.join(projectRoot, ".git");

function run(cmd, opts = {}) {
  execSync(cmd, { cwd: projectRoot, stdio: "inherit", ...opts });
}

const hasGit = fs.existsSync(gitDir);

if (!hasGit) {
  console.log("Git 저장소 초기화 중...");
  run("git init -b main");
} else {
  console.log("이미 Git 저장소가 있습니다.");
}

// 커밋을 위해 로컬 user 설정 (미설정 시에만)
try {
  execSync("git config user.email", { cwd: projectRoot, stdio: "pipe" });
} catch {
  run('git config user.email "jebu@localhost"');
  run('git config user.name "JEBU"');
  console.log("(이 저장소에만 커밋용 이름/이메일 설정됨. 변경: git config user.name / user.email)\n");
}

console.log("파일 추가 및 커밋 중...");
run("git add .");
try {
  run('git commit -m "Initial commit: 제부도 바닷길 안내"');
} catch (e) {
  if (e.status === 1 && /nothing to commit/.test(e.message || "")) {
    console.log("커밋할 변경 사항이 없습니다.");
  } else throw e;
}

console.log("\n========================================");
console.log("다음 단계: GitHub에 저장소 만들고 푸시");
console.log("========================================\n");
console.log("1. https://github.com/new 접속");
console.log("2. Repository name: JEBU 또는 jebu-tide-guide (원하는 이름)");
console.log("3. Public 선택 후 Create repository 클릭");
console.log("4. 아래 명령을 프로젝트 폴더에서 실행:\n");
console.log("   git remote add origin https://github.com/JEBU/jebu-tide-guide.git");
console.log("   git push -u origin main\n");
console.log("   (JEBU를 본인 GitHub 사용자명/조직명으로, jebu-tide-guide를 저장소 이름으로 바꾸세요.)");
console.log("========================================\n");
