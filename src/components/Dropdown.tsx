import { useState } from "react";

type Props = Readonly<{
  emptyText: string;
  options: ReadonlyArray<string>;
  selectedOption: string | null;
  onSelect: (option: string) => void;
}>;

export const Dropdown = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className={`select ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(prev => !prev)}>
        {props.selectedOption ?? props.emptyText}
      </div>
      {isOpen && (
        <ul className="options">
          {props.options.map((option) => (
            <li
              key={option}
              style={{ display: "block" }}
              className={`option ${props.selectedOption === option ? "selected" : ""}`}
              onClick={() => {
                setIsOpen(false);
                props.onSelect(option);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
