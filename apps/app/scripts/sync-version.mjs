/* eslint-env node */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const appDir = resolve(process.cwd());
const pkgPath = resolve(appDir, "package.json");
const pkgJson = JSON.parse(readFileSync(pkgPath, "utf8"));
const version = pkgJson.version;

if (typeof version !== "string" || !/^\d+\.\d+\.\d+(?:[-+].+)?$/.test(version)) {
  throw new Error(`package.json の version "${version}" が SemVer として解釈できません。`);
}

const versionCodeBase = semverToVersionCode(version);

const buildNumberFromEnv = readBuildNumberFromEnv();

const androidResult = updateAndroid(version, versionCodeBase, buildNumberFromEnv);
const iosResult = updateIos(version, androidResult.versionCode, buildNumberFromEnv);

globalThis.console.log(
  `Synced native project versions to ${version} (android code ${androidResult.versionCode}, ios build ${iosResult.buildNumber}).`,
);

function updateAndroid(versionName, versionCodeBase, envBuildNumber) {
  const gradlePath = resolve(appDir, "android/app/build.gradle");
  let gradle = readFileSync(gradlePath, "utf8");

  const nameRegex = /versionName\s+"[^"]+"/;
  const codeRegex = /versionCode\s+\d+/;

  if (!nameRegex.test(gradle) || !codeRegex.test(gradle)) {
    throw new Error("build.gradle で versionName/versionCode を見つけられませんでした。");
  }

  const existingMatch = gradle.match(codeRegex);
  const existingCode = existingMatch ? Number.parseInt(existingMatch[0].replace(/\D/g, ""), 10) : 0;
  const versionCodeNumber = resolveBuildNumber(versionCodeBase, existingCode, envBuildNumber);

  gradle = gradle.replace(nameRegex, `versionName "${versionName}"`);
  gradle = gradle.replace(codeRegex, `versionCode ${versionCodeNumber}`);

  writeFileSync(gradlePath, gradle);

  return { versionCode: versionCodeNumber };
}

function updateIos(versionName, androidVersionCode, envBuildNumber) {
  const pbxprojPath = resolve(appDir, "ios/App/App.xcodeproj/project.pbxproj");
  let pbxproj = readFileSync(pbxprojPath, "utf8");

  const marketingRegex = /MARKETING_VERSION = [^;]+;/g;
  const currentVersionRegex = /CURRENT_PROJECT_VERSION = [^;]+;/g;

  if (!marketingRegex.test(pbxproj) || !currentVersionRegex.test(pbxproj)) {
    throw new Error("project.pbxproj で MARKETING_VERSION/CURRENT_PROJECT_VERSION を見つけられませんでした。");
  }

  const existingMatch = pbxproj.match(currentVersionRegex);
  const existingBuild = existingMatch
    ? Number.parseInt(existingMatch[0].replace(/\D/g, ""), 10)
    : 0;
  const buildNumber = resolveBuildNumber(androidVersionCode, existingBuild, envBuildNumber);

  pbxproj = pbxproj.replace(marketingRegex, `MARKETING_VERSION = ${versionName};`);
  pbxproj = pbxproj.replace(currentVersionRegex, `CURRENT_PROJECT_VERSION = ${buildNumber};`);

  writeFileSync(pbxprojPath, pbxproj);

  return { buildNumber };
}

function semverToVersionCode(semver) {
  const [majorStr, minorStr = "0", patchWithMeta = "0"] = semver.split(".");
  const patchStr = patchWithMeta.split(/[-+]/)[0];

  const major = Number.parseInt(majorStr, 10) || 0;
  const minor = Number.parseInt(minorStr, 10) || 0;
  const patch = Number.parseInt(patchStr, 10) || 0;

  return major * 10000 + minor * 100 + patch;
}

function readBuildNumberFromEnv() {
  const candidate = process.env.BUILD_NUMBER ?? process.env.GITHUB_RUN_NUMBER;
  if (!candidate) return null;
  const parsed = Number.parseInt(candidate, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}

function resolveBuildNumber(baseCode, existingCode, envCode) {
  if (envCode && envCode > 0) {
    return envCode;
  }

  if (existingCode >= baseCode) {
    return existingCode + 1;
  }

  return baseCode;
}
