import styled from "styled-components";

interface Button {
  selected?: boolean;
}

const LensingButton = styled.button<Button>`
  background-color: ${({ selected }) => (selected ? "#6c757d" : "#ffffff")};
  border-color: ${({ selected }) => (selected ? "#ffffff" : "#6c757d")};
  color: ${({ selected }) => (selected ? "#ffffff" : "#6c757d")};
  margin: 0.2em;
  padding: 0.5em 1em;
  border: 2px solid;
  border-radius: 4px;
  &:hover {
    background-color: #a6acb1;
    border-color: #ffffff;
    color: #ffffff;
  }
  &:active {
    background-color: #6c757d;
    border-color: #ffffff;
    color: #ffffff;
  }
`;

export default LensingButton;
