import React, {useRef} from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Button,
    Divider,
    Checkbox
} from '@mui/material';
import {styled} from '@mui/system';
import {useReactToPrint} from 'react-to-print';

const StyledContainer = styled(Box)`
  padding: 20px;
  background-color: #fff;
  color: #000;
  max-width: 800px;
  margin: 20px auto;
  border: 1px solid #ccc;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled(Typography)`
  text-align: center;
  margin: 20px 0;
  font-size: 24px;
  font-weight: bold;
`;

const SignatureTable = styled(Table)`
  margin-top: 20px;
  table-layout: fixed;
`;

const BankDetailsTemplate = React.forwardRef(({user}, ref) => (
      <StyledContainer ref={ref}>
          <Header>
              <img src="/path/to/leftLogo.png" alt="Left Logo" width={100}/>
              <img src="/path/to/middleLogo.png" alt="Middle Logo" width={100}/>
              <img src="/path/to/rightLogo.png" alt="Right Logo" width={100}/>
          </Header>
          <Title>EmSAT Staff Addition Form</Title>

          <Typography variant="h6">Personal Information</Typography>
          <TableContainer component={Paper}>
              <Table>
                  <TableBody>
                      <TableRow>
                          <TableCell style={{border: '1px solid #000'}}>Name:</TableCell>
                          <TableCell style={{border: '1px solid #000'}}>{user.name}</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell style={{border: '1px solid #000'}}>Contact Number (mobile):</TableCell>
                          <TableCell style={{border: '1px solid #000'}}>{user.phone}</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell style={{border: '1px solid #000'}}>Email:</TableCell>
                          <TableCell style={{border: '1px solid #000'}}>{user.email}</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell style={{border: '1px solid #000'}}>Emirate (Address Line):</TableCell>
                          <TableCell style={{border: '1px solid #000'}}>{user.zone}</TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
          </TableContainer>

          <Typography variant="h6" mt={2}>Banking Details</Typography>
          <TableContainer component={Paper}>
              <Table>
                  <TableBody>
                      <TableRow>
                          <TableCell style={{border: '1px solid #000'}}>Emirates ID:</TableCell>
                          <TableCell style={{border: '1px solid #000'}}>{user.emiratesId}</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell style={{border: '1px solid #000'}}>Passport Number:</TableCell>
                          <TableCell style={{border: '1px solid #000'}}>{user.passportNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell style={{border: '1px solid #000'}}>Name as registered with the bank:</TableCell>
                          <TableCell style={{border: '1px solid #000'}}>{user.bankUserName}</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell style={{border: '1px solid #000'}}>IBAN:</TableCell>
                          <TableCell style={{border: '1px solid #000'}}>{user.ibanBank}</TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
          </TableContainer>

          <Box mt={2} p={2} color="red">
              <Typography>ID copy and screenshot of bank details (name, IBAN, etc.) must be attached along with this
                  form.</Typography>
              <Typography>*Name should be exactly as mentioned in the ID selected.</Typography>
              <Typography>SIGNATURE:</Typography>
          </Box>

          <Typography variant="h6" mt={2}>FOR OFFICE USE ONLY</Typography>
          <Divider/>
          <Typography>System Update Information and Comments:</Typography>
          <Box display="flex" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                  <Checkbox/> Updated on System
              </Box>
              <Typography>Entered by: ...................................</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                  <Checkbox/> Not Updated on System
              </Box>
              <Typography>Date: .......................................</Typography>
          </Box>
          <Box mt={2} border={1} p={3}>
              <Typography>Comments:</Typography>
          </Box>
      </StyledContainer>
));
BankDetailsTemplate.displayName = "BankDetailsTemplate"

const PrintBankDetailsButton = ({user}) => {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
          <>
              <Button onClick={handlePrint} variant="contained" color="primary">
                  Download Bank Details Template
              </Button>
              <div style={{display: 'none'}}>
                  <BankDetailsTemplate ref={componentRef} user={user}/>
              </div>
          </>
    );
};

export default PrintBankDetailsButton;
