import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

export interface LogoutConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      sx={{
        "& .MuiDialog-paper": {
          padding: "16px",
          borderRadius: "16px",
          minWidth: 360,
          boxShadow:
            "0px 8px 20px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.05)",
          backgroundColor: "white",
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "20px",
          fontWeight: 600,
          textAlign: "center",
          color: "#0f172a",
          paddingBottom: "8px",
        }}
      >
        Confirmar Logout
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", paddingX: 3 }}>
        <DialogContentText
          sx={{
            fontSize: "14px",
            color: "#475569",
            lineHeight: 1.5,
          }}
        >
          Tem certeza que deseja fazer logout?
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{
          paddingTop: 2,
          justifyContent: "center",
          display: "flex",
          gap: 1.5,
        }}
      >
        <Button
          onClick={onCancel}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            borderColor: "#cbd5e1",
            color: "#475569",
            "&:hover": {
              borderColor: "#94a3b8",
              backgroundColor: "#f8fafc",
            },
          }}
        >
          Não
        </Button>

        <Button
          onClick={onConfirm}
          size="small"
          variant="contained"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            backgroundColor: "#0284c7",
            "&:hover": {
              backgroundColor: "#0369a1",
            },
          }}
        >
          Sim
        </Button>
      </DialogActions>
    </Dialog>
  );
}
