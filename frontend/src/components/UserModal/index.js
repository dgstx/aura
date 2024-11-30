import React, { useState, useEffect, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Select,
  InputLabel,
  makeStyles,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { green } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    borderRadius: 13,
  },
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  textField: {
    width: "100%",
  },
  buttonWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  gridContainer: {
    marginBottom: theme.spacing(2),
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email").required("Required"),
});

const UserModal = ({ open, onClose, userId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    email: "",
    password: "",
    profile: "user",
    startWork: "",
    endWork: "",
    isTricked: "enabled",
  };

  const { user: loggedInUser } = useContext(AuthContext);

  const [user, setUser] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [whatsappId, setWhatsappId] = useState("");
  const { loading, whatsApps } = useWhatsApps();
  const startWorkRef = useRef();
  const endWorkRef = useRef();
  const history = useHistory();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const { data } = await api.get(`/users/${userId}`);
        setUser((prevState) => ({ ...prevState, ...data }));
        const userQueueIds = data.queues?.map((queue) => queue.id) || [];
        setSelectedQueueIds(userQueueIds);
        setWhatsappId(data.whatsappId || "");
      } catch (err) {
        toastError(err);
      }
    };

    fetchUser();
  }, [userId, open]);

  const handleClose = () => {
    onClose();
    setUser(initialState);
  };

  const handleSaveUser = async (values) => {
    const userData = { ...values, whatsappId, queueIds: selectedQueueIds };
    try {
      if (userId) {
        await api.put(`/users/${userId}`, userData);
      } else {
        await api.post("/users", userData);
      }
      toast.success(i18n.t("userModal.success"));
      history.go(0);
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      scroll="paper"
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle>
        {userId
          ? i18n.t("userModal.title.edit")
          : i18n.t("userModal.title.add")}
      </DialogTitle>
      <Formik
        initialValues={user}
        enableReinitialize
        validationSchema={UserSchema}
        onSubmit={(values, actions) => {
          handleSaveUser(values);
          actions.setSubmitting(false);
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <DialogContent dividers>
              <Grid container spacing={2} className={classes.gridContainer}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label={i18n.t("userModal.form.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label={i18n.t("userModal.form.password")}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Field
                as={TextField}
                label={i18n.t("userModal.form.email")}
                name="email"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <Can
                role={loggedInUser.profile}
                perform="user-modal:editQueues"
                yes={() => (
                  <QueueSelect
                    selectedQueueIds={selectedQueueIds}
                    onChange={(values) => setSelectedQueueIds(values)}
                  />
                )}
              />
              <Can
                role={loggedInUser.profile}
                perform="user-modal:editQueues"
                yes={() => (
                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                  >
                    <InputLabel>
                      {i18n.t("userModal.form.whatsapp")}
                    </InputLabel>
                    <Field
                      as={Select}
                      value={whatsappId}
                      onChange={(e) => setWhatsappId(e.target.value)}
                      label={i18n.t("userModal.form.whatsapp")}
                    >
                      <MenuItem value="">
                        <em>{i18n.t("userModal.form.none")}</em>
                      </MenuItem>
                      {whatsApps.map((whatsapp) => (
                        <MenuItem key={whatsapp.id} value={whatsapp.id}>
                          {whatsapp.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                disabled={isSubmitting}
                variant="outlined"
              >
                {i18n.t("userModal.buttons.cancel")}
              </Button>
              <div className={classes.buttonWrapper}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {userId
                    ? i18n.t("userModal.buttons.okEdit")
                    : i18n.t("userModal.buttons.okAdd")}
                </Button>
                {isSubmitting && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </div>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UserModal;
