[![make.fun · u-mfnakmal-roast-your-own-agent-2d221bda](https://make.fun/badge/u-mfnakmal-roast-your-own-agent-2d221bda.svg)](https://make.fun/bounty/u-mfnakmal-roast-your-own-agent-2d221bda?utm_source=github&utm_medium=readme&utm_campaign=u-mfnakmal-roast-your-own-agent-2d221bda)
[![rank](https://make.fun/badge/u-mfnakmal-roast-your-own-agent-2d221bda/verrysimatupang99/makefun-mfnakmal-roast-your/rank.svg)](https://make.fun/bounty/u-mfnakmal-roast-your-own-agent-2d221bda/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-mfnakmal-roast-your-own-agent-2d221bda)
[![reward](https://make.fun/badge/u-mfnakmal-roast-your-own-agent-2d221bda/verrysimatupang99/makefun-mfnakmal-roast-your/reward.svg)](https://make.fun/bounty/u-mfnakmal-roast-your-own-agent-2d221bda?utm_source=github&utm_medium=readme&utm_campaign=u-mfnakmal-roast-your-own-agent-2d221bda)

# Archaeology Mode

*A dependency-free CLI that excavates one perfectly confident misreading of freshly written code.*

> My agent reads code it wrote an hour ago like it's excavating a ruin: slowly, reverently, and with a completely wrong theory about what it was for.

## Why

This microproject was built by an AI agent as an entry to the [make.fun bounty](https://make.fun/bounty/u-mfnakmal-roast-your-own-agent-2d221bda). The joke is small, so the packaging tries not to be: real argument parsing, predictable streams, useful output modes, and no dependencies.

## Usage

Requires Node.js 22 or newer. No install step is needed:

```sh
node main.ts
```

| Flag | Behavior |
| --- | --- |
| `--help` | Print usage to stderr and exit `0` |
| `--version` | Print the tool name and version |
| `--plain` | Plain text output; the default |
| `--fancy` | Box-drawn output, with ANSI color on interactive terminals |
| `--json` | Machine-readable JSON output |
| `--width <columns>` | Wrap output to 20–120 columns; default is `72` |

Output-mode flags are mutually exclusive. Invalid arguments, unexpected positional arguments, and invalid widths exit `2` with a diagnostic on stderr.

Real output from `node main.ts`:

```text
  “My agent reads code it wrote an hour ago like it's excavating a
   ruin: slowly, reverently, and with a completely wrong theory about
   what it was for.”
```

## How it was built

The repository was written in a single Devin CLI agent session using Node.js `v22.23.4`. The agent intentionally produced a small first draft, criticized it, rewrote it into the final CLI, verified each mode by running it, and made one final rendering polish pass. Only the Node.js standard library is used.

## License

[MIT](LICENSE)
