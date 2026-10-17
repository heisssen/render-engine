# Contributing

Thanks for looking. Some honest context first: this engine was built for one channel and one 25-minute episode, on
Windows, by people who were mostly trying to finish a film. It works. It also has opinions hard-coded in places you
would not put them. Issues and pull requests are welcome all the same.

**Good contributions**

- Bug reports with the command, the output, and your OS. "It rendered Siberia in Times New Roman" is a fine title.
- Portability: macOS/Linux versions of the PowerShell scripts, paths that do not assume a drive letter.
- Moving the episode knobs that still live in code (`SPECIAL` transitions, music bed names, the `SHORT` name map)
  into episode data.
- Speed. Map frames are about 0.9 s each; there is surely another 2x in there.
- Docs that explain something you had to work out the hard way.

**House rules apply to code too**

- No generated images in examples or tests. Real public-domain sources, credited.
- No film grain filters. No Russian dub or subtitle targets.
- The editing rules live in `docs/bibles/`. If you change what `timings.mjs` enforces, change the bible in the
  same pull request, so the prose and the numbers keep agreeing.

**Before you open a pull request**

```powershell
node scripts/check_imports.mjs
py -3.12 -m py_compile en/*.py scripts/*.py tools/*.py
py -3.12 -m unittest discover tests
npx tsc -p .
```

Never commit media, renders, `.env`, API keys, voice IDs of real people, or absolute paths from your machine. The
`.gitignore` catches most of it, gitleaks in CI catches keys, and a quick search catches the rest:

```bash
git grep -nIiE 'api[_-]?key|token|password|Bearer|BEGIN [A-Z ]*PRIVATE KEY|[A-Z]:\\\\|/Users/|/home/|@gmail' -- ':!package-lock.json'
```

By contributing you agree that your contribution is licensed under the MIT licence of this repository.
