import React from "react";
import styled from "styled-components";

const Title = ({ children, ...props }: { children: any }) => (
  <TitleStyled {...props}>{children}</TitleStyled>
);

export default Title;

export const TitleStyled = styled.h1`
  font-weight: 600;
  font-size: 30px;
  line-height: 1;
  margin-bottom: 45px;
  margin-top: 75px;
  text-align: center;
`;
