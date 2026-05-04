import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";

type CommandState = Record<string, boolean>;

interface ToolbarCommand {
  command: string;
  icon?: string;
  text?: string;
  label: string;
}

interface RichContentEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const COMMANDS: ToolbarCommand[][] = [
  [
    { command: "bold", icon: "bi-type-bold", label: "Podebljano" },
    { command: "italic", icon: "bi-type-italic", label: "Kurziv" },
    { command: "underline", icon: "bi-type-underline", label: "Podvučeno" },
    { command: "strikeThrough", icon: "bi-type-strikethrough", label: "Precrtano" },
  ],
  [
    { command: "insertUnorderedList", icon: "bi-list-ul", label: "Lista" },
    { command: "insertOrderedList", icon: "bi-list-ol", label: "Numerisana lista" },
    { command: "outdent", icon: "bi-text-indent-left", label: "Smanji uvlačenje" },
    { command: "indent", icon: "bi-text-indent-right", label: "Povećaj uvlačenje" },
  ],
  [
    { command: "justifyLeft", icon: "bi-text-left", label: "Poravnaj levo" },
    { command: "justifyCenter", icon: "bi-text-center", label: "Centriraj" },
    { command: "justifyRight", icon: "bi-text-right", label: "Poravnaj desno" },
    { command: "justifyFull", icon: "bi-justify", label: "Poravnaj obostrano" },
  ],
  [
    { command: "subscript", text: "x2", label: "Subscript" },
    { command: "superscript", text: "x²", label: "Superscript" },
  ],
];

const BLOCK_OPTIONS = [
  { value: "p", label: "Pasus" },
  { value: "h1", label: "Naslov 1" },
  { value: "h2", label: "Naslov 2" },
  { value: "h3", label: "Naslov 3" },
  { value: "h4", label: "Naslov 4" },
  { value: "blockquote", label: "Citat" },
  { value: "pre", label: "Kod blok" },
];

const normalizeHtml = (html: string) => {
  const trimmed = html.trim();
  return trimmed === "<br>" ? "" : trimmed;
};

export default function RichContentEditor({
  id,
  value,
  onChange,
  placeholder = "Unesite sadržaj članka...",
}: RichContentEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [commandState, setCommandState] = useState<CommandState>({});
  const [blockValue, setBlockValue] = useState("p");
  const [sourceMode, setSourceMode] = useState(false);

  useEffect(() => {
    if (!editorRef.current || sourceMode) {
      return;
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [sourceMode, value]);

  const selectionIsInsideEditor = () => {
    if (!editorRef.current || typeof window === "undefined") {
      return false;
    }

    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;

    return Boolean(anchorNode && editorRef.current.contains(anchorNode));
  };

  const saveSelection = () => {
    if (typeof window === "undefined") {
      return;
    }

    const selection = window.getSelection();

    if (!selection?.rangeCount || !selectionIsInsideEditor()) {
      return;
    }

    savedRangeRef.current = selection.getRangeAt(0);
  };

  const restoreSelection = () => {
    if (typeof window === "undefined" || !savedRangeRef.current) {
      return;
    }

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedRangeRef.current);
  };

  const emitChange = () => {
    if (!editorRef.current) {
      return;
    }

    const html = normalizeHtml(editorRef.current.innerHTML);
    onChange(html);
    saveSelection();
    refreshToolbarState();
  };

  const refreshToolbarState = () => {
    const nextState: CommandState = {};

    COMMANDS.forEach((group) => {
      group.forEach((item) => {
        try {
          nextState[item.command] = document.queryCommandState(item.command);
        } catch {
          nextState[item.command] = false;
        }
      });
    });

    setCommandState(nextState);

    try {
      const currentBlock = document.queryCommandValue("formatBlock").toLowerCase();
      const nextBlock = currentBlock.replace(/[<>]/g, "") || "p";
      const hasBlockOption = BLOCK_OPTIONS.some((option) => option.value === nextBlock);
      setBlockValue(hasBlockOption ? nextBlock : "p");
    } catch {
      setBlockValue("p");
    }
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const preventToolbarBlur = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    saveSelection();
  };

  const handleBlockChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextBlock = event.target.value;
    runCommand("formatBlock", nextBlock);
    setBlockValue(nextBlock);
  };

  const handleSourceChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleCreateLink = () => {
    saveSelection();
    const url = window.prompt("Unesite URL linka");

    if (!url) {
      return;
    }

    const href = /^https?:\/\//i.test(url) || url.startsWith("/") ? url : `https://${url}`;
    runCommand("createLink", href);
  };

  const handleToggleSource = () => {
    setSourceMode((current) => !current);
  };

  return (
    <div className="cms-rich-editor">
      <div className="cms-rich-editor-toolbar" aria-label="Alati za uređivanje sadržaja">
        <div className="cms-rich-editor-group">
          <select
            className="cms-rich-editor-select"
            value={blockValue}
            onMouseDown={saveSelection}
            onChange={handleBlockChange}
            disabled={sourceMode}
            aria-label="Format bloka"
          >
            {BLOCK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {COMMANDS.map((group, groupIndex) => (
          <div className="cms-rich-editor-group" key={groupIndex}>
            {group.map((item) => (
              <button
                type="button"
                key={item.command}
                className={`cms-rich-editor-button ${
                  commandState[item.command] ? "is-active" : ""
                }`}
                onMouseDown={preventToolbarBlur}
                onClick={() => runCommand(item.command)}
                disabled={sourceMode}
                title={item.label}
                aria-label={item.label}
                aria-pressed={Boolean(commandState[item.command])}
              >
                {item.icon ? (
                  <i className={item.icon}></i>
                ) : (
                  <span className="cms-rich-editor-button-text">{item.text}</span>
                )}
              </button>
            ))}
          </div>
        ))}

        <div className="cms-rich-editor-group">
          <button
            type="button"
            className="cms-rich-editor-button"
            onMouseDown={preventToolbarBlur}
            onClick={handleCreateLink}
            disabled={sourceMode}
            title="Dodaj link"
            aria-label="Dodaj link"
          >
            <i className="bi-link-45deg"></i>
          </button>
          <button
            type="button"
            className="cms-rich-editor-button"
            onMouseDown={preventToolbarBlur}
            onClick={() => runCommand("unlink")}
            disabled={sourceMode}
            title="Ukloni link"
            aria-label="Ukloni link"
          >
            <i className="bi-link"></i>
          </button>
          <button
            type="button"
            className="cms-rich-editor-button"
            onMouseDown={preventToolbarBlur}
            onClick={() => runCommand("backColor", "#e6c882")}
            disabled={sourceMode}
            title="Istakni tekst"
            aria-label="Istakni tekst"
          >
            <i className="bi-pen"></i>
          </button>
          <button
            type="button"
            className="cms-rich-editor-button"
            onMouseDown={preventToolbarBlur}
            onClick={() => runCommand("insertHorizontalRule")}
            disabled={sourceMode}
            title="Horizontalna linija"
            aria-label="Horizontalna linija"
          >
            <i className="bi-hr"></i>
          </button>
          <button
            type="button"
            className="cms-rich-editor-button"
            onMouseDown={preventToolbarBlur}
            onClick={() => runCommand("removeFormat")}
            disabled={sourceMode}
            title="Ukloni formatiranje"
            aria-label="Ukloni formatiranje"
          >
            <i className="bi-eraser"></i>
          </button>
        </div>

        <div className="cms-rich-editor-group">
          <button
            type="button"
            className={`cms-rich-editor-button ${sourceMode ? "is-active" : ""}`}
            onClick={handleToggleSource}
            title="HTML prikaz"
            aria-label="HTML prikaz"
            aria-pressed={sourceMode}
          >
            <i className="bi-code-slash"></i>
          </button>
        </div>
      </div>

      {sourceMode ? (
        <textarea
          className="cms-rich-editor-source"
          value={value}
          onChange={handleSourceChange}
          spellCheck={false}
          aria-label="HTML sadržaj"
        />
      ) : (
        <div
          id={id}
          ref={editorRef}
          className="cms-rich-editor-content"
          contentEditable
          data-placeholder={placeholder}
          onInput={emitChange}
          onFocus={saveSelection}
          onBlur={saveSelection}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          role="textbox"
          aria-multiline="true"
          suppressContentEditableWarning
        />
      )}
    </div>
  );
}
