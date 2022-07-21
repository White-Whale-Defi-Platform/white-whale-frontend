import React from "react";
import { Flex } from "@chakra-ui/react";

const Loader = () => {
  return (
    <Flex w="10rem" h="10rem" justify="center" align="center">
      <svg
        version="1.1"
        id="eTw5qp7ydSE1"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 300.31 300.31"
      >
        <g>
          <path
            d="M221.89,257.1l-4.81-7.18c54.13-36.34,69.33-109.27,34.28-164.24l7.28-4.64
		C296.21,139.98,279.91,218.12,221.89,257.1z"
            fill="#3CCD40"
          />
          <path
            d="M30.08,150.27c-0.03,23.98,7.15,47.42,20.59,67.27l-7.15,4.84c-27.81-41.15-29.47-94.63-4.3-137.41
		c11.31-19.17,27.4-35.09,46.71-46.23l4.3,7.49C53.15,67.59,30.08,107.49,30.08,150.27z"
            fill="#3CCD40"
          />
          <animateTransform
            attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="-360 150 150"
            to="0 150 150"
            dur="5s"
            additive="sum"
            repeatCount="indefinite"
          />
        </g>

        <g>
          <path
            d="M104.39,243.65l-3.79,7.76c-55.75-27.4-78.72-94.77-51.31-150.52c2.07-4.17,4.37-8.23,6.91-12.13l7.21,4.74
		c-11.14,16.94-17.07,36.75-17.04,57C46.37,190.38,68.59,226.04,104.39,243.65z"
            fill="#3CCD40"
          />
          <path
            d="M262.54,150.51c0,9.65-1.22,19.27-3.66,28.59l-8.37-2.2c2.27-8.6,3.39-17.48,3.39-26.39
		c0-57.21-46.54-103.75-103.75-103.75v-8.64C212.21,38.13,262.54,88.46,262.54,150.51z"
            fill="#3CCD40"
          />
          <animateTransform
            attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="360 150 150"
            to="0 150 150"
            dur="5s"
            additive="sum"
            repeatCount="indefinite"
          />
        </g>
      </svg>
    </Flex>
  );
};

export default Loader;
