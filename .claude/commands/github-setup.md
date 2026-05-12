# /github-setup — Connect project to a GitHub repository

Run this command when `.ai/config/project.json` does not exist or when the user wants to change the repo connection.

## Steps — follow in order, do not skip

### Step 1 — New or existing?

Ask the user:
> "Is this a **new** GitHub repository (I'll help create it) or an **existing** one you already have?"

- **New** → go to Step 2A
- **Existing** → go to Step 2B

---

### Step 2A — New repository

Ask:
1. "What would you like to name the repository?" (e.g. `my-project`)
2. "What is your GitHub username?"

Construct: `repo_url = https://github.com/<username>/<repo-name>`

Then go to Step 3.

---

### Step 2B — Existing repository

Ask:
1. "Paste the full GitHub repository URL:" (e.g. `https://github.com/username/repo`)
2. "Confirm your GitHub username:" (extract from URL if obvious, but always confirm)

Then go to Step 3.

---

### Step 3 — Save config

Create `.ai/config/project.json`. **`repo_url` is always the HTTPS browser URL** (even when you push over SSH).

**Default (HTTPS pushes with PAT when an agent runs `/git-push-verify`):**

```json
{
  "github": {
    "repo_url": "https://github.com/<username>/<repo>",
    "username": "<username>"
  }
}
```

**Optional — SSH pushes** (add `push_transport` and set `origin` to SSH in Step 4):

```json
{
  "github": {
    "repo_url": "https://github.com/<owner>/<repo>",
    "username": "<github-login>",
    "push_transport": "ssh"
  }
}
```

Create the `.ai/config/` directory if it does not exist.

---

### Step 4 — Configure git remote

**HTTPS** — replace `<repo_url>` with the saved HTTPS URL:

```bash
git init 2>/dev/null || true
git remote get-url origin 2>/dev/null \
  && git remote set-url origin <repo_url> \
  || git remote add origin <repo_url>
```

**SSH** — if `push_transport` is `"ssh"`, use SSH for `origin` (same `<owner>/<repo>` as in `repo_url`):

```bash
git init 2>/dev/null || true
git remote get-url origin 2>/dev/null \
  && git remote set-url origin git@github.com:<owner>/<repo>.git \
  || git remote add origin git@github.com:<owner>/<repo>.git
```

---

### Step 5 — Confirm to user

Tell the user:
- Config saved to `.ai/config/project.json`
- Git remote `origin` set (HTTPS or SSH as chosen)
- **HTTPS:** a PAT will be asked before agent-assisted HTTPS pushes — never stored
- **SSH:** pushes use local SSH keys; first connection may show a host-key fingerprint — compare to [GitHub's SSH key fingerprints](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints) before typing `yes`
- For new repos: they still need to create the repo on GitHub at `https://github.com/new` before the first push

---

## Security rules — always enforce

- **Never** save a password, token, or PAT to any file
- **Never** put credentials in `.ai/config/project.json` or anywhere else on disk
- **HTTPS pushes:** ask for the PAT at push time and use it once via the remote URL:
  `git push https://<username>:<PAT>@github.com/<owner>/<repo>.git`
- The PAT is used for that one push and then discarded
- **SSH pushes:** no PAT in the URL; rely on the user's SSH agent and verified host keys
