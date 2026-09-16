import { useState } from "react";
import {
  Download,
  Upload,
  Database,
  FileJson,
  CheckCircle2,
} from "lucide-react";
import { api, download } from "./api";
export default function Backup({
  count,
  onImported,
  notify,
}: {
  count: number;
  onImported: () => Promise<void>;
  notify: (s: string) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <section className="backup-page">
      <header className="page-heading">
        <div>
          <h1>数据备份</h1>
          <p>你的灵感与作品，始终由你掌握</p>
        </div>
      </header>
      <div className="backup-summary">
        <Database size={26} />
        <div>
          <h2>{count} 个案例，完整保留</h2>
          <p>备份包含所有版本、提示词、模型、代码、标签和封面。</p>
        </div>
      </div>
      <div className="backup-grid">
        <article>
          <Download size={25} />
          <h2>导出完整备份</h2>
          <p>
            下载一份 JSON
            文件，保存你的全部案例。管理员密码和登录凭证不会包含在内。
          </p>
          <button
            className="primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const data = await api("/backup");
                download(
                  "prompt-gallery-" +
                    new Date().toISOString().slice(0, 10) +
                    ".json",
                  JSON.stringify(data, null, 2),
                );
                notify("备份已导出");
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Download size={16} />
            导出备份
          </button>
        </article>
        <article>
          <Upload size={25} />
          <h2>从备份恢复</h2>
          <p>
            导入完整备份或单个案例。相同标识的案例将被覆盖，其余现有案例会保留。
          </p>
          <label className={"upload-button " + (busy ? "disabled" : "")}>
            <FileJson size={16} />
            {busy ? "处理中…" : "选择 JSON 文件"}
            <input
              disabled={busy}
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setError("");
                if (file.size > 40 * 1024 * 1024) {
                  setError("备份文件不能超过 40 MB");
                  return;
                }
                try {
                  const data = JSON.parse(await file.text());
                  if (
                    data.format !== "prompt-gallery" ||
                    data.version !== 1 ||
                    !Array.isArray(data.cases)
                  )
                    throw new Error("不是有效的 Prompt Gallery 备份");
                  if (
                    !confirm(
                      `即将导入 ${data.cases.length} 个案例。同标识案例会被覆盖，建议先导出备份。继续吗？`,
                    )
                  )
                    return;
                  setBusy(true);
                  const result = await api<{ count: number }>(
                    "/import",
                    "POST",
                    data,
                  );
                  await onImported();
                  notify(`已恢复 ${result.count} 个案例`);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
        </article>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <p className="backup-tip">
        <CheckCircle2 size={16} />
        导入前会校验全部数据；校验失败时不会修改现有案例。
      </p>
    </section>
  );
}
