import React, {useState, useEffect} from "react";
import {
    Box,
    Button,
    Grid,
    Typography,
    Paper,
    Radio,
    RadioGroup,
    FormControlLabel,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import {getData} from "@/helpers/functions/getData";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import dayjs from "dayjs";

const AssignmentAnswers = ({dayAttendanceId, admin = false, isEdit = false, userAssignmentId, setData, onClose}) => {
    const [questions, setQuestions] = useState([]);
    const [questionAnswers, setQuestionAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const {setLoading: setSubmitLoading} = useToastContext();
    const [userTotalRating, setUserTotalRating] = useState(0);
    const [lastRatingDate, setLastRatingDate] = useState("");
    const [assignment, setAssignment] = useState();
    const [oldTotals, setOldTotals] = useState();

    useEffect(() => {
        const fetchAssignmentData = async () => {
            try {
                setLoading(true);
                const extraParam = isEdit ? "?isArchive=true&" : "";
                const url = admin ? `admin/attendance/${dayAttendanceId}/assignments${extraParam}` : `center/attendance/${dayAttendanceId}/assignments${extraParam}`
                const assignmentRequest = await getData({
                    url,
                    setLoading,
                });

                const assignmentQuestions = assignmentRequest.data;
                setAssignment(assignmentRequest.data);
                setLastRatingDate(assignmentRequest.data.lastRatingDate && dayjs(assignmentRequest.data.lastRatingDate).format("DD-MM-YYYY"));
                setUserTotalRating(assignmentRequest.data.totalRating);

                let formattedAnswers = [];
                if (isEdit && userAssignmentId) {
                    const url = admin ? `admin/assignments/user/${userAssignmentId}` : `center/assignments/${userAssignmentId}`
                    const userAssignmentRequest = await getData({
                        url,
                        setLoading,
                    });
                    const userAssignmentAnswers = userAssignmentRequest.data.questionAnswers;
                    formattedAnswers = assignmentQuestions.questions.map((question) => {
                        const matchedAnswer = userAssignmentAnswers.find((answer) => answer.questionId === question.id);
                        return matchedAnswer
                              ? {
                                  questionId: question.id,
                                  selectedChoice: matchedAnswer.choice,
                                  comment: matchedAnswer.comment || "",
                                  questionPoint: question.totalPoints,
                                  choicePoints: matchedAnswer.choice.points,
                              }
                              : null;
                    });
                } else {
                    formattedAnswers = assignmentQuestions.questions.map((question) => ({
                        questionId: question.id,
                        selectedChoice: null,
                        comment: "",
                        questionPoint: question.totalPoints,
                        choicePoints: 0,
                    }));
                }
                const oldTotals = calculateTotals(formattedAnswers, true);
                setOldTotals(oldTotals);
                setQuestions(assignmentQuestions.questions);
                setQuestionAnswers(formattedAnswers);
            } catch (error) {
                console.error("Error fetching assignment data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignmentData();
    }, [dayAttendanceId, isEdit, userAssignmentId]);

    const handleChoiceChange = (questionIndex, choice) => {
        const newAnswers = [...questionAnswers];
        newAnswers[questionIndex].selectedChoice = choice;
        newAnswers[questionIndex].choicePoints = choice.points;
        setQuestionAnswers(newAnswers);
    };

    const handleCommentChange = (questionIndex, comment) => {
        const newAnswers = [...questionAnswers];
        newAnswers[questionIndex].comment = comment;
        setQuestionAnswers(newAnswers);
    };

    const calculateTotals = (dataAnswers, checkFromData = false) => {
        let totalPoints = 0;
        let totalScore = 0;
        if (checkFromData) {
            dataAnswers.forEach((answer) => {
                if (answer !== null) {
                    totalPoints += answer.questionPoint;
                    totalScore += answer.choicePoints;
                }
            });
            return {totalPoints, totalScore};
        }
        questionAnswers.forEach((answer) => {
            if (answer !== null) {
                totalPoints += answer.questionPoint;
                totalScore += answer.choicePoints;
            }
        });
        return {totalPoints, totalScore};
    };

    const handleSubmit = async () => {
        const {totalPoints, totalScore} = calculateTotals();

        try {
            const dataToSubmit = questionAnswers.filter((question) => question !== null)
            const data = {
                dayAttendanceId,
                questionAnswers: dataToSubmit.map((answer) => ({
                    questionId: answer.questionId,
                    choiceId: answer.selectedChoice?.id,
                    comment: answer.comment,
                    questionPoint: answer.questionPoint,
                    choicePoints: answer.choicePoints,
                })),
                totalPoints,
                totalScore,
                userId: assignment.userId,
                oldTotals,
            };
            const request = await handleRequestSubmit(
                  data,
                  setSubmitLoading,
                  isEdit ? `center/assignments/${userAssignmentId}` : `center/attendance/${dayAttendanceId}/assignments`,
                  false,
                  "جاري الحفظ",
                  null,
                  isEdit ? "PUT" : "POST"
            );
            if (request.status === 200) {
                if (!isEdit) {
                    if (setData) {
                        setData((items) =>
                              items.map((item) => {
                                  if (item.id === dayAttendanceId) {
                                      item.userAssignment = request.data;
                                  }
                                  return item;
                              })
                        );
                    }
                }
                if (onClose) {
                    onClose();
                }
                setUserTotalRating(request.data.userTotalRating)
            }
        } catch (error) {
            console.error(error);
            setAlertMessage("Error saving assignment");
            setAlertOpen(true);
        }
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    if (loading) {
        return (
              <Box display="flex" justifyContent="center" alignItems="center" my={5}>
                  <CircularProgress/>
              </Box>
        );
    }
    if (!assignment) return <Alert severity="info">No assignment for this duty</Alert>;
    const totalAssignmentRating = calculateTotals().totalPoints;
    return (
          <Box sx={{
              maxWidth: "800px",
              margin: "auto",
              mt: 4,
              p: 3,
              bgcolor: '#f9f9f9',
              borderRadius: '8px',
              boxShadow: 1
          }}>
              <Typography variant="h4" gutterBottom sx={{fontWeight: 'bold', color: '#333'}}>
                  {assignment?.title}
              </Typography>
              <Typography variant="h6" sx={{color: '#555'}}>
                  Assessment Score: {totalAssignmentRating}
              </Typography>
              <Typography variant="body1" sx={{color: '#777'}}>
                  Current Score: {calculateTotals().totalScore}
              </Typography>
              {questions.map((question, index) => (
                    questionAnswers[index] && (
                          <Paper key={question.id} sx={{padding: 3, marginTop: 2, borderRadius: '8px', boxShadow: 2}}>
                              <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                      <Typography variant="h6" sx={{fontWeight: 'bold', color: '#333'}}>
                                          {question.title}
                                      </Typography>
                                  </Grid>

                                  <Grid item xs={12}>
                                      {!admin ? (
                                            <RadioGroup
                                                  value={questionAnswers[index].selectedChoice ? questionAnswers[index].selectedChoice.id : null}
                                                  onChange={(e) =>
                                                        handleChoiceChange(
                                                              index,
                                                              question.choices.find((choice) => choice.id === parseInt(e.target.value))
                                                        )
                                                  }
                                            >
                                                {question.choices.map((choice) => (
                                                      <FormControlLabel
                                                            key={choice.id}
                                                            value={choice.id}
                                                            control={<Radio/>}
                                                            label={`${choice.text}`}
                                                            sx={{marginBottom: 1, color: '#555'}}
                                                      />
                                                ))}
                                            </RadioGroup>
                                      ) : (
                                            <Typography variant="body1" sx={{color: '#555', marginBottom: 1}}>
                                                Selected: {questionAnswers[index].selectedChoice?.text || "N/A"}
                                            </Typography>
                                      )}
                                  </Grid>

                                  <Grid item xs={12}>
                                      {admin ? (
                                            <Typography variant="body2" sx={{color: '#777', marginTop: 2}}>
                                                Comment: {questionAnswers[index].comment || "No comment"}
                                            </Typography>
                                      ) : (
                                            <TextField
                                                  label="Comment (Optional)"
                                                  fullWidth
                                                  multiline
                                                  rows={3}
                                                  value={questionAnswers[index].comment}
                                                  onChange={(e) => handleCommentChange(index, e.target.value)}
                                                  sx={{marginTop: 2}}
                                                  variant="outlined"
                                            />
                                      )}
                                  </Grid>
                              </Grid>
                          </Paper>
                    )
              ))}

              <Typography variant="body2" sx={{marginTop: 2, color: '#555'}}>
                  Last Rating Date: {lastRatingDate || "N/A"}
              </Typography>
              <Typography
                    variant="h6"
                    gutterBottom
                    sx={{marginTop: 2, fontWeight: 'bold', color: '#3f51b5'}}
              >
                  Total Rating: {userTotalRating ? `${userTotalRating}%` : "N/A"}
              </Typography>

              {!admin && (
                    <Button variant="contained" color="primary" onClick={handleSubmit} sx={{marginTop: 4}}>
                        Save Assignment
                    </Button>
              )}

              <Snackbar open={alertOpen} autoHideDuration={4000} onClose={handleAlertClose}>
                  <Alert onClose={handleAlertClose} severity="error" sx={{width: "100%"}}>
                      {alertMessage}
                  </Alert>
              </Snackbar>
          </Box>
    );
};

export default AssignmentAnswers;
