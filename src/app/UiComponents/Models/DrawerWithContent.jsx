import {useState} from "react";
import {Button, Container, Drawer, IconButton} from "@mui/material";
import {FaTimes} from "react-icons/fa";

export default function DrawerWithContent({component, item, extraData, variant = "outlined"}) {
    const [open, setOpen] = useState(false)
    const Component = component

    function onClose() {
        setOpen(false)
    }

    if (!open) {
        return (<Button onClick={() => setOpen(true)} variant={variant}>
            {extraData.label}
        </Button>)
    }
    return (
          <Drawer anchor="bottom" open={open} onClose={onClose}>
              <Container maxWidth="xl"
                         sx={{p: 2, height: '100vh', overflow: 'auto', position: 'relative', zIndex: 1}}>
                  <IconButton onClick={onClose} sx={{position: 'absolute', right: 16, top: 16}}>
                      <FaTimes/>
                  </IconButton>
                  <Component item={item} onClose={onClose} {...extraData} />
              </Container>
          </Drawer>
    )
}