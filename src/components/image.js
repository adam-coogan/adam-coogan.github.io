import styled from "styled-components";

const Image = styled.div`
  background-image: url("${(props) => props.src}");
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
  min-height: 300px;
  background-position: center;
`;

export default Image;
