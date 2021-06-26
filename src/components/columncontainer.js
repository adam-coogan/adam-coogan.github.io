import styled from "styled-components";

const ColumnContainer = styled.div`
  display: flex;
  flexdirection: row;
  flexwrap: wrap;
  background-color: white;
  @media (max-width: 750px) {
    flex-direction: column;
  }
`;

export default ColumnContainer;
