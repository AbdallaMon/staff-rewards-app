import React, {useState} from "react";
import {
    Button,
    TextField,
    Box,
    Typography,
    Snackbar,
    Grid,
    Paper,
    Alert,
} from "@mui/material";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const CreateOrEditAssignment = ({initialAssignment, setData, onClose, isEdit = false}) => {
    const [assignmentTitle, setAssignmentTitle] = useState(
          initialAssignment?.title || ""
    );
    const {setLoading} = useToastContext()
    const [questions, setQuestions] = useState(
          initialAssignment?.questions || []
    );
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // Function to add a new question
    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                title: "",
                totalPoints: 0,
                choices: [{text: "", points: 0, isArchived: false}],
                isArchived: false,
            },
        ]);
    };

    // Function to add a new choice for a question
    const addChoice = (questionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].choices.push({
            text: "",
            points: 0,
            isArchived: false,
        });
        setQuestions(newQuestions);
    };

    // Function to handle question title change
    const handleQuestionTitleChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].title = value;
        setQuestions(newQuestions);
    };

    // Function to handle question total points change
    const handleQuestionPointsChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].totalPoints = parseInt(value, 10) || 0;
        setQuestions(newQuestions);
    };

    // Function to handle choice text or points change
    const handleChoiceChange = (questionIndex, choiceIndex, field, value) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].choices[choiceIndex][field] =
              field === "points" ? parseInt(value, 10) || 0 : value;
        setQuestions(newQuestions);
    };

    // Function to archive/delete a choice
    const handleDeleteChoice = (questionIndex, choiceIndex) => {
        const newQuestions = [...questions];
        if (newQuestions[questionIndex].choices[choiceIndex].id) {
            newQuestions[questionIndex].choices[choiceIndex].isArchived = true;
        } else {
            newQuestions[questionIndex].choices.splice(choiceIndex, 1);
        }
        setQuestions(newQuestions);
    };

    const handleDeleteQuestion = (qIndex) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].id) {
            newQuestions[qIndex].isArchived = true;
        } else {
            newQuestions.splice(qIndex, 1);
        }
        setQuestions(newQuestions);
    };

    // Validate that all questions and choices are filled
    const validateAssignment = () => {
        if (!assignmentTitle) {
            setAlertMessage("Assignment title cannot be empty.");
            setAlertOpen(true);
            return false;
        }

        for (let question of questions.filter((q) => !q.isArchived)) {
            if (!question.title || question.totalPoints <= 0) {
                setAlertMessage("Each question must have a title and total points.");
                setAlertOpen(true);
                return false;
            }
            if (question.choices.length === 0) {
                setAlertMessage("Each question must have at least one choice.");
                setAlertOpen(true);
                return false;
            }
            for (let choice of question.choices.filter((c) => !c.isArchived)) {
                if (!choice.text || choice.points < 0) {
                    setAlertMessage("All choices must have text and points.");
                    setAlertOpen(true);
                    return false;
                }
            }
        }
        return true;
    };

    // Submit the assignment
    const handleSubmit = async () => {
        if (validateAssignment()) {
            const assignmentData = {
                title: assignmentTitle,
                questions: questions.map((q) => ({
                    id: q.id ? q.id : null,
                    title: q.title,
                    totalPoints: q.totalPoints,
                    choices: q.choices.map((c) => ({
                        id: c.id ? c.id : null,
                        text: c.text,
                        points: c.points,
                        isArchived: c.isArchived,
                    })),
                    isArchived: q.isArchived,
                })),
            };


            const request = await handleRequestSubmit(assignmentData, setLoading, isEdit && initialAssignment ? `admin/assignments/${initialAssignment.id}` : "admin/assignments", false, isEdit ? "Saving" : "Creating", false, isEdit ? "PUT" : "POST")
            if (request.status === 200) {
                if (!isEdit) {
                    const newAssigment = {
                        id: request.data.id,
                        title: assignmentTitle,
                    }
                    setData((old) => ([...old, newAssigment]))
                }
                if (onClose) onClose()
            }
        }
    };

    // Handle Snackbar close
    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    return (
          <Box sx={{maxWidth: "1000px", margin: "auto", mt: 4}}>
              <Typography variant="h4" gutterBottom>
                  {initialAssignment ? "Edit Assessment" : "Create Assessment"}
              </Typography>

              <TextField
                    fullWidth
                    label="Assessment Title"
                    variant="outlined"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    margin="normal"
              />
              {questions
                    .map((question, qIndex) => (
                          <Paper key={qIndex}
                                 sx={{padding: 2, marginTop: 2, display: question.isArchived ? "none" : "block"}}>
                              <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                      <TextField
                                            fullWidth
                                            label="Question Title"
                                            variant="outlined"
                                            value={question.title}
                                            onChange={(e) =>
                                                  handleQuestionTitleChange(qIndex, e.target.value)
                                            }
                                      />
                                  </Grid>
                                  <Grid item xs={6}>
                                      <TextField
                                            fullWidth
                                            label="Total Points"
                                            variant="outlined"
                                            type="number"
                                            value={question.totalPoints}
                                            onChange={(e) =>
                                                  handleQuestionPointsChange(qIndex, e.target.value)
                                            }
                                      />
                                  </Grid>

                                  {question.choices
                                        .filter((choice) => !choice.isArchived) // Do not show archived choices in the UI
                                        .map((choice, cIndex) => (
                                              <Grid key={cIndex} item xs={12} md={6}>
                                                  <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                                                      <TextField
                                                            fullWidth
                                                            label={`Choice ${cIndex + 1} Text`}
                                                            variant="outlined"
                                                            value={choice.text}
                                                            onChange={(e) =>
                                                                  handleChoiceChange(qIndex, cIndex, "text", e.target.value)
                                                            }
                                                      />
                                                      <TextField
                                                            fullWidth
                                                            label={`Choice ${cIndex + 1} Points`}
                                                            variant="outlined"
                                                            type="number"
                                                            value={choice.points}
                                                            onChange={(e) => {
                                                                if (+e.target.value > +question.totalPoints) return
                                                                handleChoiceChange(qIndex, cIndex, "points", e.target.value)
                                                            }
                                                            }
                                                      />
                                                      <Button
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => handleDeleteChoice(qIndex, cIndex)}
                                                      >
                                                          {choice.id ? "Archive" : "Delete"}
                                                      </Button>
                                                  </Box>
                                              </Grid>
                                        ))}

                                  <Grid item xs={12}>
                                      <Button variant="outlined" onClick={() => addChoice(qIndex)}>
                                          Add Choice
                                      </Button>
                                  </Grid>

                                  <Grid item xs={12}>
                                      <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleDeleteQuestion(qIndex)}
                                      >
                                          {question.id ? "Archive Question" : "Delete Question"}
                                      </Button>
                                  </Grid>
                              </Grid>
                          </Paper>
                    ))}

              <Button
                    variant="contained"
                    onClick={addQuestion}
                    sx={{mt: 2, display: "block"}}
              >
                  Add new question
              </Button>

              <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{mt: 4}}
              >
                  Save Assignment
              </Button>

              <Snackbar
                    open={alertOpen}
                    autoHideDuration={4000}
                    onClose={handleAlertClose}

              >
                  <Alert severity="error" sx={{width: "100%"}}>
                      {alertMessage}
                  </Alert>
              </Snackbar>
          </Box>
    );
};

export default CreateOrEditAssignment;
