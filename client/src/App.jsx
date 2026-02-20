import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Chat from "./Chat";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4f8cff",
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Chat />
    </ThemeProvider>
  );
}

export default App;
