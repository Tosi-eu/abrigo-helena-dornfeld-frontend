import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { DeletePopUpProps } from "@/interfaces/interfaces";

export default function DeletePopUp({
  open,
  onCancel,
  onConfirm,
  message = "Tem certeza que deseja remover este item da tabela?",
}: DeletePopUpProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      sx={{
        "& .MuiDialog-paper": {
          padding: 2,
          minWidth: 300,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <DialogTitle sx={{ fontSize: 18 }}>Confirmar Exclusão</DialogTitle>
      <DialogContent sx={{ py: 1 }}>
        <DialogContentText sx={{ fontSize: 14 }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 1 }}>
        <Button onClick={onCancel} color="inherit" size="small">
          Não
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          size="small"
          variant="contained"
        >
          Sim
        </Button>
      </DialogActions>
    </Dialog>
  );
}
