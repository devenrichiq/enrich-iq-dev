import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { accordionData } from "../constant/constants";
import { createTheme, ThemeProvider } from "@mui/material";

function CustomAccordion() {

      // Theme configuration for MUI Accordion
  const theme = createTheme({
    components: {
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: "#28282A",
            color: "white",
            opacity: "0.95",
            border: "1px solid #373636",
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            padding: "16px",
            margin: "0 0 0 0",
          },
        },
      },
    },
  });

  
  return (
    <div className="w-[30vw]" id="accordion-collapse" data-accordion="collapse">
    <h1 className="text-2xl font-medium mb-4 text-gray-900 dark:text-white">FAQs</h1>
    <div className="bg-[#2E2E2E] rounded-2xl">
      {accordionData.map((item, index) => (
        <ThemeProvider theme={theme} key={index}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              {item.title}
            </AccordionSummary>
            <AccordionDetails>{item.content}</AccordionDetails>
          </Accordion>
        </ThemeProvider>
      ))}
    </div>
  </div>
  )
}

export default CustomAccordion