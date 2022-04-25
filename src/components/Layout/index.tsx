import { FunctionComponent } from "react";
import styled from "styled-components";

const Layout: FunctionComponent = ({ children }) => (
  <LayoutStyled>
    <main>{children}</main>
  </LayoutStyled>
);

const LayoutStyled = styled.div`
  color: black;
`;

export default Layout;
