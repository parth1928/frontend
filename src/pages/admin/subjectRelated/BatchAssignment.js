import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Typography, Button, Grid, Switch, FormControlLabel, TextField, CircularProgress } from "@mui/material";
import { updateSubjectBatches } from '../../../api/batchApi';

const BatchAssignment = () => {
  const { classID, subjectID } = useParams();
  const { studentsList } = useSelector((state) => state.student);
  const [batchCount, setBatchCount] = useState(2);
  const [batches, setBatches] = useState([[], []]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Initialize batches if batchCount changes
  React.useEffect(() => {
    setBatches((prev) => {
      const newBatches = [...prev];
      while (newBatches.length < batchCount) newBatches.push([]);
      while (newBatches.length > batchCount) newBatches.pop();
      return newBatches;
    });
  }, [batchCount]);

  const handleToggle = (studentId) => {
    setBatches((prev) => {
      const batch = prev[currentBatch];
      const exists = batch.includes(studentId);
      const newBatch = exists ? batch.filter((id) => id !== studentId) : [...batch, studentId];
      const newBatches = [...prev];
      newBatches[currentBatch] = newBatch;
      return newBatches;
    });
  };

  const handleNext = () => {
    if (currentBatch < batchCount - 1) setCurrentBatch(currentBatch + 1);
  };
  const handlePrev = () => {
    if (currentBatch > 0) setCurrentBatch(currentBatch - 1);
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      // Prepare batch objects with names
      const batchData = batches.map((studentIds, idx) => ({
        batchName: `Batch-${idx + 1}`,
        students: studentIds
      }));
      await updateSubjectBatches(subjectID, batchData);
      navigate("/Admin/subjects");
    } catch (err) {
      setError("Failed to save batches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Batch Assignment for Lab Subject</Typography>
      <Box mb={2}>
        <TextField
          label="Number of Batches"
          type="number"
          value={batchCount}
          onChange={(e) => setBatchCount(Math.max(1, parseInt(e.target.value) || 1))}
          inputProps={{ min: 1 }}
        />
      </Box>
      <Typography variant="h6" mb={1}>Batch {currentBatch + 1}</Typography>
      <Grid container spacing={2}>
        {studentsList && studentsList.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student._id}>
            <FormControlLabel
              control={
                <Switch
                  checked={batches[currentBatch].includes(student._id)}
                  onChange={() => handleToggle(student._id)}
                  color="primary"
                />
              }
              label={`${student.name} (${student.rollNum || student.email || student._id})`}
            />
          </Grid>
        ))}
      </Grid>
      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="outlined" onClick={handlePrev} disabled={currentBatch === 0}>Previous Batch</Button>
        {error && <Typography color="error" ml={2}>{error}</Typography>}
        {currentBatch < batchCount - 1 ? (
          <Button variant="contained" onClick={handleNext}>Next Batch</Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Save Batches'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BatchAssignment;
