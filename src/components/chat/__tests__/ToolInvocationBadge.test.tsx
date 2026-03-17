import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// getToolLabel unit tests

test("getToolLabel: str_replace_editor create", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "create", path: "src/components/Card.tsx" })
  ).toBe("Creating Card.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "str_replace", path: "src/App.tsx" })
  ).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "insert", path: "src/index.tsx" })
  ).toBe("Editing index.tsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "view", path: "src/utils.ts" })
  ).toBe("Reading utils.ts");
});

test("getToolLabel: file_manager rename", () => {
  expect(
    getToolLabel("file_manager", { command: "rename", path: "src/OldName.tsx" })
  ).toBe("Renaming OldName.tsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(
    getToolLabel("file_manager", { command: "delete", path: "src/Unused.tsx" })
  ).toBe("Deleting Unused.tsx");
});

test("getToolLabel: unknown tool falls back to tool name", () => {
  expect(getToolLabel("some_other_tool", { path: "src/file.ts" })).toBe(
    "some_other_tool"
  );
});

test("getToolLabel: extracts filename from nested path", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "create",
      path: "src/components/ui/Button.tsx",
    })
  ).toBe("Creating Button.tsx");
});

// ToolInvocationBadge component tests

test("shows spinner and label while pending", () => {
  const invocation: ToolInvocation = {
    state: "call",
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/Card.tsx" },
  };

  render(<ToolInvocationBadge toolInvocation={invocation} />);

  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
  expect(document.querySelector(".animate-spin")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot and label when done", () => {
  const invocation = {
    state: "result",
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "src/App.tsx" },
    result: "ok",
  } as ToolInvocation;

  render(<ToolInvocationBadge toolInvocation={invocation} />);

  expect(screen.getByText("Editing App.tsx")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeDefined();
  expect(document.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when result is null", () => {
  const invocation = {
    state: "result",
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/New.tsx" },
    result: null,
  } as unknown as ToolInvocation;

  render(<ToolInvocationBadge toolInvocation={invocation} />);

  expect(document.querySelector(".animate-spin")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
});
