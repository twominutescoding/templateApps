import { Box, Typography } from '@mui/material';
import MultiStepForm from '../../components/forms/MultiStepForm';
import SearchFilter from '../../components/forms/SearchFilter';
import FormValidator from '../../components/forms/FormValidator';

const FormComponents = () => {
  const handleMultiStepSubmit = (data: Record<string, string>) => {
    console.log('Multi-step form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  const handleSearch = (query: string, filters: Record<string, string>) => {
    console.log('Search query:', query);
    console.log('Active filters:', filters);
    alert(`Searching for "${query}" with filters applied. Check console for details.`);
  };

  const handleValidatedSubmit = (data: Record<string, string>) => {
    console.log('Validated form submitted:', data);
  };

  const multiStepConfig = [
    {
      label: 'Personal Info',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
      ],
    },
    {
      label: 'Address',
      fields: [
        { name: 'street', label: 'Street Address', type: 'text', required: true },
        { name: 'city', label: 'City', type: 'text', required: true },
        { name: 'zipCode', label: 'Zip Code', type: 'text', required: true },
      ],
    },
    {
      label: 'Confirmation',
      fields: [
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'notes', label: 'Additional Notes', type: 'text', required: false },
      ],
    },
  ];

  const filterConfig = [
    {
      name: 'category',
      label: 'Category',
      options: [
        { label: 'Electronics', value: 'electronics' },
        { label: 'Clothing', value: 'clothing' },
        { label: 'Books', value: 'books' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
      ],
    },
    {
      name: 'price',
      label: 'Price Range',
      options: [
        { label: 'Under $50', value: 'under50' },
        { label: '$50 - $100', value: '50-100' },
        { label: 'Over $100', value: 'over100' },
      ],
    },
  ];

  const validationConfig = [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      rules: {
        required: true,
        minLength: 3,
        maxLength: 20,
      },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      rules: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      rules: {
        required: true,
        minLength: 8,
        custom: (value: string) => {
          if (!/[A-Z]/.test(value)) {
            return 'Password must contain at least one uppercase letter';
          }
          if (!/[0-9]/.test(value)) {
            return 'Password must contain at least one number';
          }
          return null;
        },
      },
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
        Form Components
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Reusable form components for data collection and validation
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <MultiStepForm
          title="Multi-Step Registration Form"
          steps={multiStepConfig}
          onSubmit={handleMultiStepSubmit}
        />

        <SearchFilter
          title="Advanced Search & Filter"
          searchPlaceholder="Search products..."
          filters={filterConfig}
          onSearch={handleSearch}
        />

        <FormValidator
          title="Form with Validation"
          fields={validationConfig}
          onSubmit={handleValidatedSubmit}
        />
      </Box>
    </Box>
  );
};

export default FormComponents;
