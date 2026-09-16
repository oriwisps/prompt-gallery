import { useState } from "react";
import { ArrowRight, Aperture, ShieldCheck } from "lucide-react";
import { api } from "./api";
export default function AuthScreen({
  initialized,
  onLogin,
}: {
  initialized: boolean;
  onLogin: () => void;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="auth-screen">
      <div className="auth-intro">
        <Aperture size={38} />
        <h1>
          Prompt Gallery<span>让灵感，有迹可循。</span>
        </h1>
        <p>
          记录一句提示词，留住一次好效果。
          <br />
          属于你的前端灵感与实验档案。
        </p>
        <div className="auth-art">
          <div className="art-orbit">
            <i />
            <i />
            <i />
            <b />
          </div>
        </div>
      </div>
      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const f = new FormData(e.currentTarget);
          try {
            await api(initialized ? "/login" : "/setup", "POST", {
              username: f.get("username"),
              password: f.get("password"),
            });
            onLogin();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <ShieldCheck size={28} />
        <h2>{initialized ? "欢迎回来" : "创建你的私人效果库"}</h2>
        <p>
          {initialized
            ? "登录后继续收集和打磨你的灵感。"
            : "首次使用，设置一个管理员账号。"}
        </p>
        <label>
          账号
          <input
            name="username"
            autoComplete="username"
            minLength={3}
            maxLength={50}
            required
            placeholder="至少 3 个字符"
          />
        </label>
        <label>
          密码
          <input
            name="password"
            type="password"
            autoComplete={initialized ? "current-password" : "new-password"}
            minLength={12}
            maxLength={200}
            required
            placeholder="至少 12 个字符"
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? "请稍候…" : initialized ? "登录效果库" : "创建并进入"}
          <ArrowRight size={17} />
        </button>
        <small>提示词、模型与代码，统一保存在你的服务器。</small>
      </form>
    </main>
  );
}
