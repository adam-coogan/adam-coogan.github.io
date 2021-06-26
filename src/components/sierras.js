import styled from "styled-components";
import Photo from "../images/sierras.jpg";

const Sierras = styled.div`
  background-image: url("${Photo}");
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  height: 150px;
  background-position: left;
`;

export default Sierras
