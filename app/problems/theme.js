import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors:{
    mainBg: "#0f172a",
    whiteText: "#04c63e",
    subtleText: "#ffffff",
    columnBg: "#1e293b",
    columnHeaderBg: "#334155",
    cardBg: "#1e293b",
    cardBorder: "#ffffff",
    workspaceBg: "#020617",
    workspaceBorder:"#334155"
  },

  fonts:{
    heading:"Poppins, sans-serif",
    body: "Poppins, sans-serif",
  },

  styles:{
    global:{
      body:{
        bg: "mainBg",
        color:"subtleText",
      },
    },
  },

  /*
  components: {
    WorkspaceContainer: {
      baseStyle: {
        bg: "gray.500",
        w: "15%",
        h: "78%",
        m: "0 auto",
        position: "absolute",
        bottom: "0",
        border: "5px solid black",
        zIndex: "1000",
      },
    },
  },
  */
});

export default theme;

/*
const colors = {
  "main-bg": "#0f172a", //This is the MAIN CSS file that affects the customization of the WorkSpace's Page//

  "white-text": "#04c63e", //Affects the text color of the code statements in the code bank and workspace//
  "subtle-text": "#ffffff", //Affects the text color of the Title "words" and the problem prompt//

  "column-bg": "#1e293b", 
  "column-header-bg": "#334155", //This affects the code blocks-Title//

  "card-bg": "#1e293b", //Affects the code blocks themselves//
  "card-border": "#ffffff",

  "workspace-bg": "#020617",
  "workspace-border":"#334155"
};

const fonts = { //Jayla - Makes EVERYTHING "Poppins" Font//
  heading: "Poppins",
  body: "Poppins",
};

const container1 = {
  "background-color": "gray",
  "width":"15%",
  "height":"78%",
  "margin":"0 auto",
  "position":"absolute",
  "bottom": "0",
  "background-size":"5px solid black",
  "z-index":"1000"
};


export default extendTheme({
  ...theme,
  colors,
  fonts,
  container1
});
*/


/* Purpose:
  colors = defines the color scheme for the problem page, including background colors, text colors, and colors for different elements like columns and cards.
  fonts = sets the font family for headings and body text to "Poppins".
  container1 = defines a specific style for a container element, which includes properties like background color, width, height, margin, position, and z-index. This could be used for a specific component on the page.
*/


