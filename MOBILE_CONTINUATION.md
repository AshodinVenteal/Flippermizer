# Mobile Continuation

Use this file as the shared instruction pad when you want to steer work from mobile.
It lives in the repo, so it can sync through OneDrive or git and can be read by Codex
at the start of a later session.

## Setup Status

- VS Code Remote - SSH is installed on this Windows machine.
- Installed extension IDs:
  - `ms-vscode-remote.remote-ssh`
  - `ms-vscode-remote.remote-ssh-edit`
  - `ms-vscode.remote-explorer`
- Current repo has existing uncommitted and untracked work. Future sessions should
  preserve that work unless you explicitly ask to clean it up.

## Desktop Remote - SSH Workflow

1. Open VS Code.
2. Open Remote Explorer from the Activity Bar.
3. Choose `SSH Targets`.
4. Add a host with a command like:

   ```powershell
   ssh username@hostname
   ```

5. Connect to that host, then open the repo folder from the remote file picker.

## Mobile Instruction Workflow

1. From mobile, open this file through OneDrive, GitHub, or any editor that can reach
   the repo.
2. Add the next request under `Mobile Inbox`.
3. Keep the request concrete: what to change, what to test, and what to avoid touching.
4. In the next Codex session, ask: `Read MOBILE_CONTINUATION.md and continue from the Mobile Inbox.`
5. After the work is done, Codex should move completed items into `Completed Notes`.

## Mobile Inbox

- [ ] Add your next instruction here.

## Active Context

- Repo: `flippermizer-essential-overlay`
- Local path: `C:\Users\maxrp\OneDrive\Desktop\VTuber Stuff\Flippermizer Code\flippermizer-essential-overlay`
- Default shell: PowerShell
- Date created: 2026-05-20

## Completed Notes

- 2026-05-20: Installed VS Code Remote - SSH and created this mobile handoff file.
