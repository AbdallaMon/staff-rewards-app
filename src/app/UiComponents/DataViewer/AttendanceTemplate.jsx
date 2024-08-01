import React, {useRef} from 'react';
import {
    Container,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Checkbox
} from '@mui/material';
import {styled} from '@mui/system';
import {useReactToPrint} from 'react-to-print';

const StyledContainer = styled(Container)`
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

const AttendanceTemplate = React.forwardRef(({user, dayAttendance, duties, shifts}, ref) => (
      <StyledContainer ref={ref}>
          <Header>
              <img src="/certLogo.png" alt="CERT Logo" width={100}/>
              <img src="/examLogo.png" alt="Exam Logo" width={100}/>
          </Header>
          <Title>EmSAT/PLD Exam Claim Form</Title>
          <Box display="flex" justifyContent="space-between" mt={1}>

              <Box>
                  <Typography>FullName: {user.name || "No name found"}</Typography>
                  <Typography>Duty: {user.duty?.name || "No duty found"}</Typography>
              </Box>

              <Box>
                  <Typography>Test date: {new Date(dayAttendance.date).toLocaleDateString()}</Typography>
              </Box>
          </Box>

          <Box display="flex" mt={2} gap={2}>
              <Box flexGrow={1} display="flex" flexDirection="column" gap={2}>
                  <TableContainer component={Paper}>
                      <Table>
                          <TableHead>
                              <TableRow>
                                  <TableCell
                                        style={{backgroundColor: '#f0f0f0', border: '1px solid #ccc'}}>Shift</TableCell>
                                  <TableCell style={{backgroundColor: '#f0f0f0', border: '1px solid #ccc'}}>Duration
                                      (hours)</TableCell>
                                  <TableCell style={{
                                      backgroundColor: '#f0f0f0',
                                      border: '1px solid #ccc'
                                  }}>Reward</TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {dayAttendance.attendances.map((attendance, index) => (
                                    <TableRow key={index}>
                                        <TableCell
                                              style={{border: '1px solid #ccc'}}>{attendance.shift.name}</TableCell>
                                        <TableCell
                                              style={{border: '1px solid #ccc'}}>{attendance.shift.duration}</TableCell>
                                        <TableCell
                                              style={{border: '1px solid #ccc'}}>{attendance.dutyRewards.reduce((acc, reward) => acc + reward.amount, 0)}</TableCell>
                                    </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
                  <TableContainer component={Paper}>
                      <Table>
                          <TableHead>
                              <TableRow>
                                  <TableCell style={{
                                      backgroundColor: '#f0f0f0',
                                      border: '1px solid #ccc'
                                  }}>Duties</TableCell>
                                  <TableCell style={{backgroundColor: '#f0f0f0', border: '1px solid #ccc'}}>Reward per
                                      shift</TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {duties.map((duty, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{border: '1px solid #ccc'}}>{duty.name}</TableCell>
                                        <TableCell style={{border: '1px solid #ccc'}}>{duty.amount}</TableCell>
                                    </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
              </Box>
              <Box flexGrow={0.4}>
                  <TableContainer component={Paper}>
                      <Table>
                          <TableHead>
                              <TableRow>
                                  <TableCell
                                        style={{backgroundColor: '#f0f0f0', border: '1px solid #ccc'}}>Shift</TableCell>
                                  <TableCell style={{backgroundColor: '#f0f0f0', border: '1px solid #ccc'}}>Timing
                                      (hours)</TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {shifts.map((shift, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{border: '1px solid #ccc'}}>{shift.name}</TableCell>
                                        <TableCell style={{border: '1px solid #ccc'}}>{shift.duration}</TableCell>
                                    </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
              </Box>
          </Box>

          <Box mt={3}>
              <label>
                  <Checkbox/> I confirm that the information provided above is accurate. I understand
                  that failing to do will result in delaying/holding the payment.
              </label>
          </Box>

          <SignatureTable>
              <TableBody>
                  <TableRow>
                      <TableCell style={{border: '1px solid #ccc'}}>
                          <Typography>Employee Signature:</Typography>
                          <Box mt={2} borderBottom="1px solid #000"></Box>
                      </TableCell>
                      <TableCell colSpan={2} style={{border: '1px solid #ccc'}}>
                          <Typography>Site Supervisor Name:</Typography>
                          <Box mt={2} borderBottom="1px solid #000"></Box>
                          <Typography mt={2}>Site Supervisor Signature:</Typography>
                          <Box mt={2} borderBottom="1px solid #000"></Box>
                      </TableCell>
                      <TableCell style={{border: '1px solid #ccc'}}>
                          <Typography>Date:</Typography>
                          <Box mt={2} borderBottom="1px solid #000"></Box>
                      </TableCell>
                  </TableRow>
              </TableBody>
          </SignatureTable>

          <Box mt={3}>
              <Typography variant="h6">For CERT use only</Typography>
              <TableContainer component={Paper}>
                  <Table>
                      <TableHead>
                          <TableRow>
                              <TableCell style={{backgroundColor: '#f0f0f0', border: '1px solid #ccc'}}>Centre
                                  Manager</TableCell>
                              <TableCell
                                    style={{backgroundColor: '#f0f0f0', border: '1px solid #ccc'}}>Signature</TableCell>
                              <TableCell style={{backgroundColor: '#f0f0f0', border: '1px solid #ccc'}}>Date</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          <TableRow>
                              <TableCell style={{border: '1px solid #ccc'}}>Director</TableCell>
                              <TableCell style={{border: '1px solid #ccc'}}></TableCell>
                              <TableCell style={{border: '1px solid #ccc'}}></TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell style={{border: '1px solid #ccc'}}>Signature</TableCell>
                              <TableCell style={{border: '1px solid #ccc'}}></TableCell>
                              <TableCell style={{border: '1px solid #ccc'}}></TableCell>
                          </TableRow>
                      </TableBody>
                  </Table>
              </TableContainer>
          </Box>
      </StyledContainer>
));

const PrintButton = ({user, dayAttendance, duties, shifts}) => {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
          <>
              <Button onClick={handlePrint} variant="contained" color="primary">
                  Print Attendance Template
              </Button>
              <div style={{display: 'none'}}>
                  <AttendanceTemplate ref={componentRef} user={user} dayAttendance={dayAttendance} duties={duties}
                                      shifts={shifts}/>
              </div>
          </>
    );
};

export default PrintButton;
