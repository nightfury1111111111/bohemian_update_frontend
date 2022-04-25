import styled from "styled-components";

const Button = ({
  children,
  onClick,
  disabled = false,
  secondary = false,
}: {
  children: any;
  onClick: any;
  disabled?: boolean;
  secondary?: boolean;
}) => {
  return (
    <ButtonStyled disabled={disabled} secondary={secondary} onClick={onClick}>
      {children}
    </ButtonStyled>
  );
};

export const ButtonStyled = styled.button<{ secondary: boolean }>``;

export default Button;
