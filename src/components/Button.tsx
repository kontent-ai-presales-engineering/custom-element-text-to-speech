type Props = Readonly<{
  children: string;
  onClick: () => void;
  isDisabled?: boolean;
  type: "primary" | "secondary";
}>;

export const Button = (props: Props) => (
  <button
    type="button"
    style={{ cursor: "pointer" }}
    className={`button primary ${props.type}`}
    disabled={props.isDisabled}
    onClick={props.onClick}
  >
    {props.children}
  </button>
);
