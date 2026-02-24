import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocation } from "../ToolInvocation";
import type { ToolInvocation as ToolInvocationData } from "@ai-sdk/ui-utils";

afterEach(() => {
  cleanup();
});

test("ToolInvocation displays 'Creating' message for create command", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "create",
      path: "/src/components/Button.jsx",
    },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Creating Button.jsx")).toBeDefined();
});

test("ToolInvocation displays 'Editing' message for str_replace command", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "str_replace",
      path: "/src/App.jsx",
      old_str: "old code",
      new_str: "new code",
    },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("ToolInvocation displays 'Editing' message for insert command", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "insert",
      path: "/src/utils/helpers.js",
      insert_line: 10,
      new_str: "new line",
    },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Editing helpers.js")).toBeDefined();
});

test("ToolInvocation displays 'Viewing' message for view command", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "view",
      path: "/src/config.json",
    },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Viewing config.json")).toBeDefined();
});

test("ToolInvocation displays 'Undoing edit' message for undo_edit command", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "undo_edit",
      path: "/src/index.tsx",
    },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Undoing edit in index.tsx")).toBeDefined();
});

test("ToolInvocation displays 'Deleting' message for file_manager delete command", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "file_manager",
    args: {
      command: "delete",
      path: "/src/old-component.jsx",
    },
    state: "result" as const,
    result: { success: true },
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Deleting old-component.jsx")).toBeDefined();
});

test("ToolInvocation displays 'Renaming' message for file_manager rename command", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "file_manager",
    args: {
      command: "rename",
      path: "/src/OldName.jsx",
      new_path: "/src/NewName.jsx",
    },
    state: "result" as const,
    result: { success: true },
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Renaming OldName.jsx to NewName.jsx")).toBeDefined();
});

test("ToolInvocation extracts filename from nested path", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "create",
      path: "/src/components/ui/cards/ProfileCard.tsx",
    },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Creating ProfileCard.tsx")).toBeDefined();
});

test("ToolInvocation shows green dot for completed tools", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "create",
      path: "/App.jsx",
    },
    state: "result" as const,
    result: "Success",
  };

  const { container } = render(<ToolInvocation tool={tool} />);

  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();
});

test("ToolInvocation shows loading spinner for in-progress tools", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "create",
      path: "/App.jsx",
    },
    state: "call" as const,
  };

  const { container } = render(<ToolInvocation tool={tool} />);

  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
});

test("ToolInvocation handles unknown tool names gracefully", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "unknown_tool",
    args: {},
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("ToolInvocation handles missing path gracefully", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "create",
    },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Creating file")).toBeDefined();
});

test("ToolInvocation handles rename without new_path", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "file_manager",
    args: {
      command: "rename",
      path: "/src/Component.jsx",
    },
    state: "result" as const,
    result: { success: true },
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Renaming Component.jsx")).toBeDefined();
});

test("ToolInvocation handles unknown str_replace_editor command", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "str_replace_editor",
    args: {
      command: "unknown_command",
      path: "/src/file.js",
    },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Working on file.js")).toBeDefined();
});

test("ToolInvocation handles unknown file_manager command", () => {
  const tool: ToolInvocationData = {
    toolCallId: "123",
    toolName: "file_manager",
    args: {
      command: "unknown_command",
      path: "/src/file.js",
    },
    state: "result" as const,
    result: { success: true },
  };

  render(<ToolInvocation tool={tool} />);

  expect(screen.getByText("Managing file.js")).toBeDefined();
});
