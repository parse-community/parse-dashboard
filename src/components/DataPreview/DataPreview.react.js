import React, { useEffect, useState } from "react";
import PropTypes from "lib/PropTypes";
import Popover from "components/Popover/Popover.react";
import StringDataHandler from "./StringDataHandler";
import PointerDataHandler from "./PointerDataHandler";
import ObjectDataHandler from "./ObjectDataHandler";

const DATA_HANDLERS = {
  String: StringDataHandler,
  Pointer: PointerDataHandler,
  Object: ObjectDataHandler,
};

function DataPreview({ data }) {
  const [dataComponent, setDataComponent] = useState();

  async function handleData(type, value) {
    const dataHandler = DATA_HANDLERS[type];
    if (!dataHandler) {
      return;
    }
    const dataComponent = await dataHandler(value);
    setDataComponent(dataComponent);
  }

  useEffect(() => {
    dataComponent && setDataComponent();
    if (!data) {
      return;
    }

    handleData(data.type, data.value);
  }, [JSON.stringify(data)]);

  if (!dataComponent) {
    return null;
  }

  return (
    <Popover
      fadeIn={true}
      fixed={true}
      position={{
        x: data?.pageX,
        y: data?.pageY,
      }}
      color="rgba(17,13,17,0.8)"
      style={{ pointerEvents: "none" }}
    >
      {dataComponent}
    </Popover>
  );
}

DataPreview.propTypes = {
  data: PropTypes.shape({
    value: PropTypes.any.isRequired,
    type: PropTypes.string.isRequired,
    pageX: PropTypes.number,
    pageY: PropTypes.number,
  }),
};

export default DataPreview;
