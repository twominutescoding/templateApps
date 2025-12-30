import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
} from '@mui/material';

interface FormStep {
  label: string;
  fields: FormField[];
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

interface MultiStepFormProps {
  title: string;
  steps: FormStep[];
  onSubmit: (data: Record<string, string>) => void;
}

const MultiStepForm = ({ title, steps, onSubmit }: MultiStepFormProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onSubmit(formData);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const currentStep = steps[activeStep];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 3 }}>
        {currentStep.fields.map((field) => (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            type={field.type}
            required={field.required}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            sx={{ mb: 2 }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Button onClick={handleNext} variant="contained">
          {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Box>
    </Paper>
  );
};

export default MultiStepForm;
