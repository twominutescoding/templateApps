import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import type { RoleAdmin } from '../../services/api';

interface CreateUserDialogProps {
  open: boolean;
  newUser: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    password: string;
  };
  onClose: () => void;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export const CreateUserDialog = ({ open, newUser, onClose, onChange, onSubmit }: CreateUserDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Username"
            value={newUser.username}
            onChange={(e) => onChange('username', e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="First Name"
            value={newUser.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Last Name"
            value={newUser.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => onChange('email', e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Company"
            value={newUser.company}
            onChange={(e) => onChange('company', e.target.value)}
            fullWidth
          />
          <TextField
            label="Password (optional - leave empty to auto-generate)"
            type="password"
            value={newUser.password}
            onChange={(e) => onChange('password', e.target.value)}
            fullWidth
            helperText="If empty, a random 12-character password will be generated"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Create User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface AddRoleDialogProps {
  open: boolean;
  username: string;
  availableRoles: RoleAdmin[];
  selectedRole: string;
  selectedEntity: string;
  onClose: () => void;
  onRoleChange: (role: string) => void;
  onEntityChange: (entity: string) => void;
  onSubmit: () => void;
}

export const AddRoleDialog = ({
  open,
  username,
  availableRoles,
  selectedRole,
  selectedEntity,
  onClose,
  onRoleChange,
  onEntityChange,
  onSubmit,
}: AddRoleDialogProps) => {
  // Get unique entities from available roles
  const uniqueEntities = Array.from(new Set(availableRoles.map((r) => r.entity)));

  // Filter roles by selected entity
  const filteredRoles = selectedEntity
    ? availableRoles.filter((r) => r.entity === selectedEntity)
    : availableRoles;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Role to {username}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Entity</InputLabel>
            <Select value={selectedEntity} onChange={(e) => onEntityChange(e.target.value)} label="Entity">
              {uniqueEntities.map((entity) => (
                <MenuItem key={entity} value={entity}>
                  {entity}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!selectedEntity}>
            <InputLabel>Role</InputLabel>
            <Select value={selectedRole} onChange={(e) => onRoleChange(e.target.value)} label="Role">
              {filteredRoles.map((role) => (
                <MenuItem key={`${role.role}-${role.entity}`} value={role.role}>
                  {role.role} - {role.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary" disabled={!selectedRole || !selectedEntity}>
          Add Role
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface ResetPasswordDialogProps {
  open: boolean;
  username: string;
  newPassword: string;
  onClose: () => void;
  onPasswordChange: (password: string) => void;
  onSubmit: () => void;
}

export const ResetPasswordDialog = ({
  open,
  username,
  newPassword,
  onClose,
  onPasswordChange,
  onSubmit,
}: ResetPasswordDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reset Password for {username}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="New Password (optional - leave empty to auto-generate)"
            type="password"
            value={newPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            fullWidth
            helperText="If empty, a random 12-character password will be generated and shown to you"
            autoFocus
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="warning">
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};
