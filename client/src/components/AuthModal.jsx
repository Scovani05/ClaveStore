import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  email: "",
  password: "",
  city: "",
  adminCode: ""
};

const roleLabels = {
  client: "cliente",
  admin: "admin"
};

export default function AuthModal({ defaultMode = "login", defaultRole = "client", isOpen, onClose, onSubmit }) {
  const [mode, setMode] = useState(defaultMode);
  const [role, setRole] = useState(defaultRole);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setMode(defaultMode);
    setRole(defaultRole);
    setError("");
    setForm(initialForm);
  }, [defaultMode, defaultRole, isOpen]);

  if (!isOpen) {
    return null;
  }

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({ ...form, mode, role });
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message || "Não foi possível iniciar sessão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === "login" ? `Entrar como ${roleLabels[role]}` : `Criar conta ${roleLabels[role]}`;

  return (
    <div className="auth-backdrop" role="presentation">
      <section className="auth-modal" aria-label="Autenticação">
        <button className="modal-close" onClick={onClose} type="button" aria-label="Fechar janela de autenticação">
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>

        <div className="auth-heading">
          <span className="section-kicker">Sessão</span>
          <h2>{title}</h2>
          <p>A conta guarda o carrinho para sessões futuras. O backoffice só abre com perfil admin.</p>
        </div>

        <div className="auth-tabs" role="group" aria-label="Modo de autenticação">
          <button className={mode === "login" ? "active" : ""} onClick={() => selectMode("login")} type="button">
            Entrar
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => selectMode("register")} type="button">
            Registar
          </button>
        </div>

        <div className="auth-role-grid" role="group" aria-label="Tipo de conta">
          <button className={role === "client" ? "active" : ""} onClick={() => selectRole("client")} type="button">
            <i className="bi bi-person" aria-hidden="true" />
            Cliente
          </button>
          <button className={role === "admin" ? "active" : ""} onClick={() => selectRole("admin")} type="button">
            <i className="bi bi-shield-lock" aria-hidden="true" />
            Admin
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              Nome
              <input
                className="form-control"
                maxLength="80"
                onChange={(event) => updateForm("name", event.target.value)}
                required
                type="text"
                value={form.name}
              />
            </label>
          )}

          <label>
            Email
            <input
              autoComplete="email"
              className="form-control"
              maxLength="160"
              onChange={(event) => updateForm("email", event.target.value)}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Palavra-passe
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="form-control"
              minLength="8"
              onChange={(event) => updateForm("password", event.target.value)}
              required
              type="password"
              value={form.password}
            />
          </label>

          {mode === "register" && (
            <label>
              Cidade
              <input
                className="form-control"
                maxLength="80"
                onChange={(event) => updateForm("city", event.target.value)}
                type="text"
                value={form.city}
              />
            </label>
          )}

          {mode === "register" && role === "admin" && (
            <label>
              Código admin
              <input
                autoComplete="one-time-code"
                className="form-control"
                onChange={(event) => updateForm("adminCode", event.target.value)}
                required
                type="password"
                value={form.adminCode}
              />
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button className="btn btn-gold w-100" disabled={isSubmitting} type="submit">
            <i className={mode === "login" ? "bi bi-box-arrow-in-right" : "bi bi-person-plus"} aria-hidden="true" />
            <span>{isSubmitting ? "A validar..." : mode === "login" ? "Entrar" : "Criar conta"}</span>
          </button>
        </form>
      </section>
    </div>
  );
}