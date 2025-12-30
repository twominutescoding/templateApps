import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ValidationRule {
  name: string;
  label: string;
  type: string;
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
}

interface FormValidatorProps {
  title: string;
  fields: ValidationRule[];
  onSubmit: (data: Record<string, string>) => void;
}

const FormValidator = ({ title, fields, onSubmit }: FormValidatorProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (field: ValidationRule, value: string): string | null => {
    if (field.rules.required && !value) {
      return `${field.label} is required`;
    }

    if (field.rules.minLength && value.length < field.rules.minLength) {
      return `${field.label} must be at least ${field.rules.minLength} characters`;
    }

    if (field.rules.maxLength && value.length > field.rules.maxLength) {
      return `${field.label} must be at most ${field.rules.maxLength} characters`;
    }

    if (field.rules.pattern && !field.rules.pattern.test(value)) {
      return `${field.label} format is invalid`;
    }

    if (field.rules.custom) {
      return field.rules.custom(value);
    }

    return null;
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    const field = fields.find((f) => f.name === name);
    if (field) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error || '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const error = validateField(field, formData[field.name] || '');
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
      onSubmit(formData);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>

      {submitted && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          Form submitted successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          {fields.map((field) => (
            <TextField
              key={field.name}
              fullWidth
              label={field.label}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              error={!!errors[field.name]}
              helperText={errors[field.name]}
              required={field.rules.required}
              sx={{ mb: 2 }}
            />
          ))}
        </Box>

        <Button type="submit" variant="contained" fullWidth>
          Submit Form
        </Button>
      </form>
    </Paper>
  );
};

export default FormValidator;
