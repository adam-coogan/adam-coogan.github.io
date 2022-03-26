import styled from "styled-components";
import Photo from "../images/horseshoe.jpg";

const Horseshoe = styled.div`
  background-image: url("${Photo}");
  background-repeat: no-repeat;
  background-size: cover;
  width: 250px;
  height: 250px;
  background-position: left;
`;

export default Horseshoe
