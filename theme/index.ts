import { extendTheme } from "@chakra-ui/react";

import Modal from "./modal";
import Badge from "./badge";
import Tooltip from "./tooltip";
import Text from "./text";
import Button from "./button";
import Tabs from "./tabs";
import Input from "./input";
import NumberInput from "./numberInput";
import Textarea from "./textarea";
import Menu from "./menu";
import Drawer from "./drawer";

export default extendTheme({
  styles: {
    global: {
      body: {
        background: "#191919"
      },
      // "#chakra-toast-manager-bottom-right": {
      //   right: "32px!important",
      //   bottom: "32px!important",
      // },
    }
  },
  fonts: {
    heading:
      "Lato,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji",
    body: "Lato,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji",
    mono: "Menlo, monospace",
  },
  components: {
    Modal,
    Tooltip,
    Drawer,
    Text,
    Badge,
    Button,
    Input,
    NumberInput,
    Textarea,
    Tabs,
    Menu,
  },
  colors: {
    // green: { 500: "#5ECFD1" },
    // red: { 500: "#ED7470" },
    // white: { 500: "white" },
    // brand: {
    //   100: "rgba(255,255,255,0.15)",
    //   200: "rgba(255,255,255,0.5)",
    //   500: "#3CCD64",
    //   600: "#35364F",
    //   700: "#25273C",
    //   800: "#303348",
    //   900: "#252525",
    // },
    brand: {
      "50" : "#ffffff80",
      "100": "#B4FAB3",
      "200": "#8AF092",
      "300": "#69E17E",
      "400": "#3ccd65",
      "500": "#3CCD64",
      "600": "#2BB05D",
      "700": "#1E9355",
      "800": "#13764B",
      "900": "#0B6245"
    }
  },
});