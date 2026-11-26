#!/usr/bin/env node

/**
 * archaeology — a very small CLI for excavating one very confident misreading.
 *
 * The program intentionally has no dependencies. Node 22 can execute the
 * type annotations in this file directly through its native type stripping.
 */

const TOOL_NAME = "archaeology";
const VERSION = "1.0.0";
const ENTRY_LINE =
  "My agent reads code it wrote an hour ago like it's excavating a ruin: slowly, reverently, and with a completely wrong theory about what it was for.";

const DEFAULT_WIDTH = 72;
const MIN_WIDTH = 20;
const MAX_WIDTH = 120;

type OutputMode = "plain" | "fancy" | "json";

interface CliOptions {
  help: boolean;
  version: boolean;
  mode: OutputMode;
  width: number;
}

class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}

function usage(): string {
  return `${TOOL_NAME} ${VERSION}

Usage:
  node main.ts [options]

Options:
  --help            Show this help text (written to stderr)
  --version         Print the version
  --plain           Write plain text output (default)
  --fancy           Write a box-drawn presentation, with ANSI color on terminals
  --json            Write machine-readable JSON
  --width <columns> Wrap output to columns, from ${MIN_WIDTH} to ${MAX_WIDTH} (default: ${DEFAULT_WIDTH})

Examples:
  node main.ts
  node main.ts --fancy --width 64
  node main.ts --json
`;
}

function selectMode(current: OutputMode | undefined, next: OutputMode): OutputMode {
  if (current !== undefined) {
    throw new CliError(`output mode already selected; choose only one of --plain, --fancy, or --json`);
  }
  return next;
}

function parseWidth(rawValue: string | undefined): number {
  if (rawValue === undefined) {
    throw new CliError("--width expects a column count");
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new CliError(`--width expects a positive integer, got "${rawValue}"`);
  }

  const width = Number(rawValue);
  if (width < MIN_WIDTH || width > MAX_WIDTH) {
    throw new CliError(`--width must be between ${MIN_WIDTH} and ${MAX_WIDTH}, got ${width}`);
  }

  return width;
}

function parseArguments(argv: string[]): CliOptions {
  const options: CliOptions = {
    help: false,
    version: false,
    mode: "plain",
    width: DEFAULT_WIDTH,
  };

  let selectedMode: OutputMode | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else if (argument === "--version") {
      options.version = true;
    } else if (argument === "--plain") {
      selectedMode = selectMode(selectedMode, "plain");
    } else if (argument === "--fancy") {
      selectedMode = selectMode(selectedMode, "fancy");
    } else if (argument === "--json") {
      selectedMode = selectMode(selectedMode, "json");
    } else if (argument === "--width") {
      index += 1;
      options.width = parseWidth(argv[index]);
    } else if (argument.startsWith("--width=")) {
      options.width = parseWidth(argument.slice("--width=".length));
    } else if (argument.startsWith("-")) {
      throw new CliError(`unknown option: ${argument}`);
    } else {
      throw new CliError(`unexpected argument: ${argument}`);
    }
  }

  if (selectedMode !== undefined) {
    options.mode = selectedMode;
  }

  return options;
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (word.length > width) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = "";
      }

      let remainder = word;
      while (remainder.length > width) {
        lines.push(remainder.slice(0, width));
        remainder = remainder.slice(width);
      }
      currentLine = remainder;
      continue;
    }

    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= width) {
      currentLine = `${currentLine} ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

function renderPlain(width: number): string {
  const textWidth = width - 4;
  const lines = wrapText(ENTRY_LINE, textWidth);
  const renderedLines = lines.map((line, index) => {
    const prefix = index === 0 ? "  “" : "   ";
    const suffix = index === lines.length - 1 ? "”" : "";
    return `${prefix}${line}${suffix}`;
  });

  return `${renderedLines.join("\n")}\n`;
}

function supportsColor(): boolean {
  return process.stdout.isTTY === true && process.env.NO_COLOR === undefined;
}

function ansi(text: string, code: string, enabled: boolean): string {
  if (!enabled) {
    return text;
  }
  return `\u001b[${code}m${text}\u001b[0m`;
}

function repeatVisible(character: string, count: number): string {
  return character.repeat(Math.max(0, count));
}

function renderFancy(width: number): string {
  const color = supportsColor();
  const contentWidth = width - 4;
  const lines = wrapText(ENTRY_LINE, contentWidth);
  const output: string[] = [];

  const title = ` ${TOOL_NAME} `;
  const titleWidth = title.length;
  const topFill = repeatVisible("─", width - 2 - titleWidth);
  const dim = (text: string): string => ansi(text, "2", color);
  const top = `${dim("╭")}${ansi(title, "1;33", color)}${dim(`${topFill}╮`)}`;
  const emptyInterior = `${dim("│")}${repeatVisible(" ", width - 2)}${dim("│")}`;
  const bottom = dim(`╰${repeatVisible("─", width - 2)}╯`);

  output.push(top);
  output.push(emptyInterior);

  for (const line of lines) {
    const padding = repeatVisible(" ", contentWidth - line.length);
    const styledText = `${ansi(line, "1", color)}${padding}`;
    output.push(`${dim("│")} ${styledText} ${dim("│")}`);
  }

  output.push(emptyInterior);
  output.push(bottom);

  return `${output.join("\n")}\n`;
}

function renderJson(width: number): string {
  return `${JSON.stringify(
    {
      tool: TOOL_NAME,
      version: VERSION,
      line: ENTRY_LINE,
      width,
    },
    null,
    2,
  )}\n`;
}

function writeError(error: CliError): void {
  process.stderr.write(`${TOOL_NAME}: ${error.message}\n\n${usage()}`);
}

function main(argv: string[]): number {
  let options: CliOptions;

  try {
    options = parseArguments(argv);
  } catch (error) {
    if (error instanceof CliError) {
      writeError(error);
      return 2;
    }
    throw error;
  }

  if (options.help) {
    process.stderr.write(usage());
    return 0;
  }

  if (options.version) {
    process.stdout.write(`${TOOL_NAME} ${VERSION}\n`);
    return 0;
  }

  if (options.mode === "json") {
    process.stdout.write(renderJson(options.width));
  } else if (options.mode === "fancy") {
    process.stdout.write(renderFancy(options.width));
  } else {
    process.stdout.write(renderPlain(options.width));
  }

  return 0;
}

process.exitCode = main(process.argv.slice(2));
