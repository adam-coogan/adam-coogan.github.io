import React from "react";
import ReactTooltip from "react-tooltip";
import Button from "./button";

const ChangeResButton = ({
  label,
  id,
  resolution,
  setRes,
  activeID,
  setActiveID,
  description,
}) => (
  <>
    <Button
      id={id}
      selected={id === activeID}
      onClick={() => {
        setActiveID(id);
        setRes(resolution);
      }}
      data-tip
      data-for={id}
    >
      {label}
    </Button>
    <ReactTooltip id={id}>{description}</ReactTooltip>
  </>
);

export default ChangeResButton;
