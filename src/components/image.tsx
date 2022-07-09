import styled from "styled-components";

interface ImageProps {
  src: string;
}

const Image = styled.div<ImageProps>`
  background-image: url("${(props) => props.src}");
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
  min-height: 900px;
  background-position: top;
`;

export default Image;
