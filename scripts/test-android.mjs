import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: 'inherit', ...options });
}

function commandOutput(command, args, options = {}) {
  return execFileSync(command, args, { encoding: 'utf8', ...options }).trim();
}

function directory(path) {
  try { return statSync(path).isDirectory(); } catch { return false; }
}

function findJavaHome() {
  const configured = process.env.JAVA_HOME;
  if (configured && existsSync(join(configured, 'bin', 'java'))) return configured;
  try {
    const executable = realpathSync(commandOutput('sh', ['-lc', 'command -v java']));
    const home = dirname(dirname(executable));
    return existsSync(join(home, 'bin', 'java')) ? home : undefined;
  } catch {
    return undefined;
  }
}

function findAndroidHome() {
  const candidates = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, '/opt/android-sdk'].filter(Boolean);
  const localProperties = join(root, 'android', 'local.properties');
  if (existsSync(localProperties)) {
    const match = readFileSync(localProperties, 'utf8').match(/^sdk\.dir=(.+)$/m);
    if (match) candidates.push(match[1].replace(/\\:/g, ':').replace(/\\\\/g, '\\'));
  }
  return candidates.find((candidate) => directory(candidate));
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

async function verifyHostedAndroidEvidence() {
  const remote = commandOutput('git', ['config', '--get', 'remote.origin.url']);
  const match = remote.match(/github\.com[/:]([^/]+\/[^/.]+)(?:\.git)?$/);
  if (!match) throw new Error('No GitHub origin is available for hosted Android evidence. Install a JDK and Android SDK to build locally.');
  const repository = match[1];
  const revision = commandOutput('git', ['rev-parse', 'HEAD']);
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'speaker-lane-captions-android-verifier' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const runsUrl = `https://api.github.com/repos/${repository}/actions/workflows/android-package.yml/runs?head_sha=${revision}&status=completed&per_page=20`;
  const runsResponse = await fetch(runsUrl, { headers });
  if (!runsResponse.ok) throw new Error(`GitHub Actions lookup returned ${runsResponse.status}. Install a JDK and Android SDK to build locally.`);
  const runs = await runsResponse.json();
  const successful = runs.workflow_runs?.find((run) => run.head_sha === revision && run.conclusion === 'success');
  if (!successful) throw new Error(`No successful Android package workflow exists for ${revision}. Push this revision and wait for “Android package”, or install a JDK and Android SDK.`);
  const artifactsResponse = await fetch(successful.artifacts_url, { headers });
  if (!artifactsResponse.ok) throw new Error(`GitHub Actions artifact lookup returned ${artifactsResponse.status}.`);
  const artifacts = await artifactsResponse.json();
  const expected = `android-apks-${revision}`;
  const artifact = artifacts.artifacts?.find((item) => item.name === expected && !item.expired);
  if (!artifact) throw new Error(`The successful Android package workflow did not retain ${expected}.`);
  console.log(`Verified hosted Android evidence: run ${successful.html_url}`);
  console.log(`Verified retained debug/test APK artifact: ${artifact.name} (id ${artifact.id}).`);
}

async function main() {
  const javaHome = findJavaHome();
  const androidHome = findAndroidHome();
  if (!javaHome || !androidHome) {
    console.log('No complete local Android toolchain found; verifying the immutable GitHub Actions result for this revision.');
    await verifyHostedAndroidEvidence();
    return;
  }

  const environment = { ...process.env, JAVA_HOME: javaHome, ANDROID_HOME: androidHome, ANDROID_SDK_ROOT: androidHome };
  console.log(`Using JAVA_HOME=${javaHome}`);
  console.log(`Using ANDROID_HOME=${androidHome}`);
  run('npm', ['run', 'cap:sync'], { cwd: root, env: environment });
  run('./gradlew', [':app:assembleDebug', ':app:assembleDebugAndroidTest', ':app:testDebugUnitTest', '--console=plain'], {
    cwd: join(root, 'android'), env: environment
  });

  const debugApk = join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const testApk = join(root, 'android', 'app', 'build', 'outputs', 'apk', 'androidTest', 'debug', 'app-debug-androidTest.apk');
  if (!existsSync(debugApk) || !existsSync(testApk)) throw new Error('Gradle completed without both required APKs.');
  console.log(`Debug APK SHA-256: ${sha256(debugApk)}`);
  console.log(`Android-test APK SHA-256: ${sha256(testApk)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
