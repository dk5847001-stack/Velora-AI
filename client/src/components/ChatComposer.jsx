import { SendHorizontal } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ChatComposer({
  disabled,
  isSending,
  maxLength = 4000,
  onChange,
  onSubmit,
  value,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
  }, [value]);

  useEffect(() => {
    if (disabled || !textareaRef.current) {
      return;
    }

    textareaRef.current.focus();
  }, [disabled]);

  const handleSubmit = () => {
    const trimmed = value.trim();

    if (disabled || !trimmed || trimmed.length > maxLength) {
      return;
    }

    onSubmit(trimmed);
  };

  return (
    <div className="composer-shell">
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder="Message Velora..."
          aria-label="Type your message"
          enterKeyHint="send"
          autoComplete="off"
          autoCapitalize="sentences"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          disabled={disabled}
          rows={1}
        />

        <button
          className="primary-button composer-submit"
          disabled={disabled || !value.trim() || value.trim().length > maxLength}
          type="submit"
        >
          <SendHorizontal size={16} />
          {isSending ? "Thinking..." : "Send"}
        </button>
      </form>

      <div className="composer-caption">
        <p>Press Enter to send. Shift + Enter adds a new line.</p>
        <p className={value.length > maxLength ? "composer-counter is-over-limit" : "composer-counter"}>
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}
