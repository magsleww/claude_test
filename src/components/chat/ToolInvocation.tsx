import { Loader2 } from "lucide-react";
import { ToolInvocation as ToolInvocationData } from "@ai-sdk/ui-utils";

interface ToolInvocationProps {
  tool: ToolInvocationData;
}

export function ToolInvocation({ tool }: ToolInvocationProps) {
  const message = getToolMessage(tool);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {tool.state === "result" && tool.result ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}

function getToolMessage(tool: ToolInvocationData): string {
  const { toolName, args } = tool;

  if (toolName === "str_replace_editor") {
    return getStrReplaceMessage(args);
  }

  if (toolName === "file_manager") {
    return getFileManagerMessage(args);
  }

  return toolName;
}

function getStrReplaceMessage(args: Record<string, any>): string {
  const command = args.command;
  const path = args.path;
  const fileName = getFileName(path);

  switch (command) {
    case "view":
      return `Viewing ${fileName}`;
    case "create":
      return `Creating ${fileName}`;
    case "str_replace":
      return `Editing ${fileName}`;
    case "insert":
      return `Editing ${fileName}`;
    case "undo_edit":
      return `Undoing edit in ${fileName}`;
    default:
      return `Working on ${fileName}`;
  }
}

function getFileManagerMessage(args: Record<string, any>): string {
  const command = args.command;
  const path = args.path;
  const newPath = args.new_path;
  const fileName = getFileName(path);

  switch (command) {
    case "rename":
      if (newPath) {
        const newFileName = getFileName(newPath);
        return `Renaming ${fileName} to ${newFileName}`;
      }
      return `Renaming ${fileName}`;
    case "delete":
      return `Deleting ${fileName}`;
    default:
      return `Managing ${fileName}`;
  }
}

function getFileName(path: string | undefined): string {
  if (!path) return "file";

  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}
