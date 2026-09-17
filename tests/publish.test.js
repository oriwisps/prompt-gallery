import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const bash = process.platform === "win32" ? "C:/Program Files/Git/bin/bash.exe" : "/bin/bash";
const releaseSource = readFileSync(new URL("../scripts/release.sh", import.meta.url), "utf8");
const slash = (value) => value.replaceAll("\\", "/");

for (const scenario of ["success", "install-failure", "health-failure"]) {
  test(`publish ${scenario}: preserves online data and selects the correct code`, { skip: !existsSync(bash) }, () => {
    const root = slash(mkdtempSync(path.join(tmpdir(), "prompt-gallery-publish-test-")));
    const app = root + "/app";
    const job = root + "/job";
    const releaseId = "20260917-120000-abcdef01";
    const dirs = [app, job, root + "/bin", root + "/data", root + "/package/dist", root + "/package/server"];
    for (const dir of dirs) mkdirSync(dir, { recursive: true });
    const put = (file, value) => writeFileSync(file, value.replaceAll("\r\n", "\n"), { mode: 0o755 });
    put(app + "/marker", "old");
    put(root + "/data/gallery.sqlite", "original accounts and cases");
    put(root + "/package/dist/index.html", "new");
    put(root + "/package/server/index.js", "// new server");
    put(root + "/package/server/app.js", "// new app");
    put(root + "/package/package.json", "{}");
    put(root + "/package/package-lock.json", "{}");
    put(root + "/backup.mjs", `import {writeFileSync} from 'node:fs'; writeFileSync(${JSON.stringify(root + "/backup-done")}, 'ok');`);
    put(root + "/bin/npm", `#!/bin/bash\n${scenario === "install-failure" ? "exit 1" : "exit 0"}\n`);
    put(root + "/bin/systemctl", "#!/bin/bash\nexit 0\n");
    put(root + "/bin/flock", "#!/bin/bash\nexit 0\n");
    put(root + "/bin/sleep", "#!/bin/bash\nexit 0\n");
    put(root + "/bin/curl", `#!/bin/bash
if [[ '${scenario}' == 'health-failure' && ! -f '${app}/marker' ]]; then exit 1; fi
printf '%s' '{"initialized":true}'
`);
    let script = releaseSource
      .replace('export PATH=/usr/local/bin:/usr/bin:/bin', `export PATH='${root.replace(/^([a-z]):/i, (_, drive) => '/' + drive.toLowerCase())}/bin':$PATH`)
      .replaceAll('/opt/prompt-gallery', app)
      .replaceAll('/var/lib/prompt-gallery', root + '/data')
      .replaceAll('/run/lock/prompt-gallery-publish.lock', root + '/publish.lock')
      .replaceAll('/usr/local/sbin/prompt-gallery-backup.mjs', `'${root}/backup.mjs'`)
      .replaceAll('/usr/local/bin/node', `'${slash(process.execPath)}'`);
    // Node syntax checks also need the same executable on Windows Git Bash.
    script = script.replaceAll('node --check', `'${slash(process.execPath)}' --check`);
    put(job + "/release.sh", script);
    try {
      const pack = spawnSync(bash, ['-c', `tar --force-local -czf '${job}/app.tar.gz' -C '${root}/package' dist server package.json package-lock.json`], { encoding: 'utf8' });
      assert.equal(pack.status, 0, pack.stderr);
      const hash = createHash('sha256').update(readFileSync(job + '/app.tar.gz')).digest('hex');
      const run = spawnSync(bash, [job + '/release.sh', releaseId, hash], { encoding: 'utf8', timeout: 30000 });
      const output = run.stdout + run.stderr;
      assert.equal(readFileSync(root + '/data/gallery.sqlite', 'utf8'), 'original accounts and cases');
      if (scenario === 'success') {
        assert.equal(run.status, 0, output);
        assert.equal(readFileSync(job + '/result', 'utf8').trim(), '0');
        assert.equal(readFileSync(app + '/dist/index.html', 'utf8'), 'new');
        assert.equal(readFileSync(app + '-releases/' + releaseId + '-previous/marker', 'utf8'), 'old');
        assert.ok(existsSync(root + '/backup-done'));
      } else {
        assert.notEqual(run.status, 0, output);
        assert.equal(readFileSync(app + '/marker', 'utf8'), 'old', output);
        assert.notEqual(readFileSync(job + '/result', 'utf8').trim(), '0');
        if (scenario === 'health-failure') assert.match(output, /ROLLBACK OK/);
        else assert.equal(existsSync(root + '/backup-done'), false);
      }
    } finally {
      const resolved = path.resolve(root);
      assert.equal(path.dirname(resolved).toLowerCase(), path.resolve(tmpdir()).toLowerCase());
      assert.ok(path.basename(resolved).startsWith('prompt-gallery-publish-test-'));
      rmSync(resolved, { recursive: true, force: true });
    }
  });
}
